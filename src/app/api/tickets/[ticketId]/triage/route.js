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

  // ===== CEK ASSIGNMENT =====
  let currentAssignment;
  if (isSS) {
    currentAssignment = await prisma.ticketAssignment.findFirst({
      where: { ticket_id: ticketId, status: 'Pending', assignment_type: 'Active' },
      include: { ticket: { include: { submittedBy: true } } },
    });
  } else {
    currentAssignment = await prisma.ticketAssignment.findFirst({
      where: { ticket_id: ticketId, user_id: Number(session.user.id), status: 'Pending', assignment_type: 'Active' },
      include: { ticket: { include: { submittedBy: true } } },
    });
  }

  if (!currentAssignment) {
    return NextResponse.json({ message: 'Ticket sudah diproses atau tidak valid.' }, { status: 403 });
  }

  // ===== TRANSACTION UTAMA: UPDATE TICKET & LOG =====
  let updatedTicket;
  try {
    await prisma.$transaction(async (tx) => {
      updatedTicket = await tx.ticket.update({
        where: { ticket_id: ticketId },
        data: { type, status: 'Open' },
      });

      await tx.ticketAssignment.updateMany({
        where: { ticket_id: ticketId, assignment_type: 'Active', status: 'Pending' },
        data: { status: 'Done' },
      });

      await tx.ticketLog.create({
        data: {
          ticket_id: ticketId,
          actor_user_id: session.user.id,
          action_type: 'Triase',
          notes: `Triase oleh ${role}: ${type}. Catatan: ${notes || '-'}`,
        },
      });
    });
  } catch (err) {
    console.error('Gagal triase:', err);
    return NextResponse.json({ message: 'Gagal melakukan triase.', error: err.message }, { status: 500 });
  }

  // ===== AMBIL SALES MANAGER & FEEDBACK USERS DI LUAR TRANSACTION =====
  const submitter = currentAssignment.ticket.submittedBy;
  const submitterDivisionId = submitter.division_id;
  const subKategori = currentAssignment.ticket.sub_kategori;

  let salesManagerUser = null;
  let feedbackUsers = [];

  try {
    salesManagerUser = await prisma.user.findFirst({
      where: { role: { role_name: 'Sales Manager' }, status: 'Active', division_id: submitterDivisionId },
      select: { user_id: true, email: true, name: true },
    });

    if (type === 'Feedback') {
      const target = getRoutingTarget(subKategori);

      const feedbackWhere = target?.ap_division
        ? { role: { role_name: 'User Feedback' }, division: { division_name: target.ap_division } }
        : { role: { role_name: 'User Feedback' } };

      feedbackUsers = await prisma.user.findMany({
        where: feedbackWhere,
        select: { user_id: true, email: true, name: true },
      });
    }
  } catch (err) {
    console.error('Gagal ambil Sales Manager / Feedback Users:', err);
  }

  // ===== CREATE ASSIGNMENTS NON-BLOCKING =====
  if (salesManagerUser) {
    prisma.ticketAssignment.create({
      data: {
        ticket_id: ticketId,
        user_id: salesManagerUser.user_id,
        assignment_type: type === 'Request' ? 'Active' : 'Feedback_Review',
        status: 'Pending',
      },
    }).catch(err => console.error('Gagal assign Sales Manager:', err));
  }

  if (feedbackUsers.length > 0) {
    prisma.ticketAssignment.createMany({
      data: feedbackUsers.map(fb => ({
        ticket_id: ticketId,
        user_id: fb.user_id,
        assignment_type: 'Feedback_Review',
        status: 'Pending',
      })),
    }).catch(err => console.error('Gagal assign Feedback Users:', err));
  }

  // ===== EMAIL NON-BLOCKING =====
  const ticketNumber = rawId;

  if (salesManagerUser?.email) {
    sendTicketAssignedEmail({
      to: salesManagerUser.email,
      subject: `${type} baru (#${ticketNumber})`,
      ticket: updatedTicket,
      extraText: `Anda mendapatkan tugas baru dari PIC OMI.`,
    }).catch(err => console.error('Gagal kirim email Sales Manager:', err));
  }

  if (type === 'Feedback') {
    for (const fbUser of feedbackUsers) {
      if (!fbUser.email) continue;
      sendTicketAssignedEmail({
        to: fbUser.email,
        subject: `Feedback baru (#${ticketNumber})`,
        ticket: updatedTicket,
        extraText: `Anda mendapatkan tugas review feedback.`,
      }).catch(err => console.error('Gagal kirim email Feedback User:', err));
    }
  }

  return NextResponse.json({ message: `Tiket berhasil di-triase sebagai ${type}.` }, { status: 200 });
}
