import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { getRoutingTarget } from '@/lib/smartRouting';
import { sendTicketAssignedEmail } from '@/lib/email';

export async function POST(request, context) {
  const params = await context.params;
  const rawId = params.ticketId;

  // ===== VALIDASI =====
  if (!rawId || isNaN(Number(rawId))) {
    return NextResponse.json({ message: 'Ticket ID tidak valid.' }, { status: 400 });
  }

  const ticketId = BigInt(rawId);

  // ===== SESSION =====
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const role = session.user.role;
  const isSS = role === 'PIC OMI (SS)';

  if (!['PIC OMI', 'PIC OMI (SS)'].includes(role)) {
    return NextResponse.json({ message: 'Anda tidak diizinkan.' }, { status: 403 });
  }

  const { type, notes } = await request.json();

  if (!['Request', 'Feedback'].includes(type)) {
    return NextResponse.json(
      { message: "Tipe harus 'Request' atau 'Feedback'." },
      { status: 400 }
    );
  }

  // ============================================
  // 🔥 CEK ASSIGNMENT (BEDA LOGIC!)
  // ============================================
  let currentAssignment;

  if (isSS) {
    // PIC OMI (SS) = GLOBAL TRIAGER
    currentAssignment = await prisma.ticketAssignment.findFirst({
      where: {
        ticket_id: ticketId,
        status: 'Pending',
        assignment_type: 'Active',
      },
      include: {
        ticket: { include: { submittedBy: true } },
      },
    });
  } else {
    // PIC OMI biasa = HARUS assigned
    currentAssignment = await prisma.ticketAssignment.findFirst({
      where: {
        ticket_id: ticketId,
        user_id: Number(session.user.id),
        status: 'Pending',
        assignment_type: 'Active',
      },
      include: {
        ticket: { include: { submittedBy: true } },
      },
    });
  }

  if (!currentAssignment) {
    return NextResponse.json(
      { message: 'Ticket sudah diproses atau tidak valid.' },
      { status: 403 }
    );
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // ===== UPDATE TICKET =====
      const updatedTicket = await tx.ticket.update({
        where: { ticket_id: ticketId },
        data: {
          type,
          status: 'Open',
        },
      });

      // ===== TUTUP SEMUA ACTIVE ASSIGNMENT =====
      await tx.ticketAssignment.updateMany({
        where: {
          ticket_id: ticketId,
          assignment_type: 'Active',
          status: 'Pending',
        },
        data: { status: 'Done' },
      });

      // ===== LOG =====
      await tx.ticketLog.create({
        data: {
          ticket_id: ticketId,
          actor_user_id: session.user.id,
          action_type: 'Triase',
          notes: `Triase oleh ${role}: ${type}. Catatan: ${notes || '-'}`,
        },
      });

      const submitter = currentAssignment.ticket.submittedBy;
      const submitterDivisionId = submitter.division_id;
      const subKategori = currentAssignment.ticket.sub_kategori;

      let salesManagerUser = null;
      let feedbackUsers = [];

      if (type === 'Request') {
        // ===== SALES MANAGER =====
        salesManagerUser = await tx.user.findFirst({
          where: {
            role: { role_name: 'Sales Manager' },
            status: 'Active',
            division_id: submitterDivisionId,
          },
          select: { user_id: true, email: true, name: true },
        });

        if (salesManagerUser) {
          await tx.ticketAssignment.create({
            data: {
              ticket_id: ticketId,
              user_id: salesManagerUser.user_id,
              assignment_type: 'Active',
              status: 'Pending',
            },
          });
        }
      } else {
        // ===== FEEDBACK FLOW =====
        salesManagerUser = await tx.user.findFirst({
          where: {
            role: { role_name: 'Sales Manager' },
            status: 'Active',
            division_id: submitterDivisionId,
          },
          select: { user_id: true, email: true, name: true },
        });

        if (salesManagerUser) {
          await tx.ticketAssignment.create({
            data: {
              ticket_id: ticketId,
              user_id: salesManagerUser.user_id,
              assignment_type: 'Feedback_Review',
              status: 'Pending',
            },
          });
        }

        const target = getRoutingTarget(subKategori);

        const feedbackWhere = target?.ap_division
          ? {
              role: { role_name: 'User Feedback' },
              division: { division_name: target.ap_division },
            }
          : { role: { role_name: 'User Feedback' } };

        feedbackUsers = await tx.user.findMany({
          where: feedbackWhere,
          select: { user_id: true, email: true, name: true },
        });

        if (feedbackUsers.length > 0) {
          await tx.ticketAssignment.createMany({
            data: feedbackUsers.map((fb) => ({
              ticket_id: ticketId,
              user_id: fb.user_id,
              assignment_type: 'Feedback_Review',
              status: 'Pending',
            })),
          });
        }
      }

      return { updatedTicket, salesManagerUser, feedbackUsers };
    });

    // ===== EMAIL =====
    const ticketNumber = rawId;

    if (result.salesManagerUser?.email) {
      sendTicketAssignedEmail({
        to: result.salesManagerUser.email,
        subject: `${type} baru (#${ticketNumber})`,
        ticket: result.updatedTicket,
        extraText: `Anda mendapatkan tugas baru dari PIC OMI.`,
      });
    }

    if (type === 'Feedback') {
      for (const fbUser of result.feedbackUsers) {
        if (!fbUser.email) continue;

        sendTicketAssignedEmail({
          to: fbUser.email,
          subject: `Feedback baru (#${ticketNumber})`,
          ticket: result.updatedTicket,
          extraText: `Anda mendapatkan tugas review feedback.`,
        });
      }
    }

    return NextResponse.json(
      { message: `Tiket berhasil di-triase sebagai ${type}.` },
      { status: 200 }
    );
  } catch (error) {
    console.error('Gagal triase:', error);
    return NextResponse.json(
      { message: 'Gagal melakukan triase.', error: error.message },
      { status: 500 }
    );
  }
}
