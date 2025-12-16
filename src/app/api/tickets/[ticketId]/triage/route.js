import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { getRoutingTarget } from '@/lib/smartRouting';
import { sendTicketAssignedEmail } from '@/lib/email';

export async function POST(request, context) {

  // =====================================
  // FIX WAJIB: params harus di-await lewat context.params
  // =====================================
  const params = await context.params;
  const rawId = params.ticketId;

  // ===== VALIDASI ticketId =====
  if (!rawId || isNaN(Number(rawId))) {
    return NextResponse.json(
      { message: 'Ticket ID tidak valid.' },
      { status: 400 }
    );
  }

  const ticketId = BigInt(rawId);

  // ===== SESSION =====
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'PIC OMI') {
    return NextResponse.json({ message: 'Anda tidak diizinkan.' }, { status: 403 });
  }

  const picOmiUser = session.user;

  const { type, notes } = await request.json();

  if (!['Request', 'Feedback'].includes(type)) {
    return NextResponse.json(
      { message: "Tipe harus 'Request' atau 'Feedback'." },
      { status: 400 }
    );
  }

  // ===== CEK ASSIGNMENT =====
  const currentAssignment = await prisma.ticketAssignment.findFirst({
    where: {
      ticket_id: ticketId,
      user_id: picOmiUser.id,
      assignment_type: 'Active',
      status: 'Pending',
    },
    include: {
      ticket: {
        include: { submittedBy: true },
      },
    },
  });

  if (!currentAssignment) {
    return NextResponse.json(
      { message: 'Anda tidak ditugaskan untuk tiket ini.' },
      { status: 403 }
    );
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const updatedTicket = await tx.ticket.update({
        where: { ticket_id: ticketId },
        data: {
          type: type,
          status: 'Open',
        },
      });

      await tx.ticketAssignment.delete({
        where: { assignment_id: currentAssignment.assignment_id },
      });

      await tx.ticketLog.create({
        data: {
          ticket_id: ticketId,
          actor_user_id: picOmiUser.id,
          action_type: 'Triase',
          notes: `Triase sebagai: ${type}. Catatan: ${notes || '-'}`,
        },
      });

      const submitter = currentAssignment.ticket.submittedBy;
      const submitterDivisionId = submitter.division_id;
      const subKategori = currentAssignment.ticket.sub_kategori;

      let salesManagerUser = null;
      let feedbackUsers = [];

      if (type === 'Request') {
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
        salesManagerUser = await tx.user.findFirst({
          where: {
            role: { role_name: 'Sales Manager' },
            division_id: submitterDivisionId,
            status: 'Active',
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

    const ticketNumber = rawId;

    if (result.salesManagerUser?.email) {
      sendTicketAssignedEmail({
        to: result.salesManagerUser.email,
        subject: `${type} baru (#${ticketNumber})`,
        ticket: result.updatedTicket,
        extraText: `Anda mendapatkan tugas baru dari Sales Regional.`,
      });
    }

    if (type === 'Feedback') {
      for (const fbUser of result.feedbackUsers) {
        if (!fbUser.email) continue;

        sendTicketAssignedEmail({
          to: fbUser.email,
          subject: `Feedback baru (#${ticketNumber})`,
          ticket: result.updatedTicket,
          extraText: `Anda mendapatkan tugas untuk review feedback.`,
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
