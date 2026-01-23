import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { sendTicketAssignedEmail } from '@/lib/email';
import { getRoutingTarget } from '@/lib/smartRouting';

const serialize = (data) =>
  JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );

const REQUIRED_ATTACHMENT_RULES = ['PRODUK'];

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session || !['Salesman', 'Agen'].includes(session.user.role)) {
    return NextResponse.json({ message: 'Akses ditolak.' }, { status: 403 });
  }

  const user = session.user;

  const {
    title,
    description,
    kategori,
    jabatan,
    toko,
    attachments,
  } = await request.json();

  // ===============================
  // VALIDASI DASAR
  // ===============================
  if (!title || !description || !kategori) {
    return NextResponse.json({ message: 'Data tidak lengkap.' }, { status: 400 });
  }

  // ===============================
  // AMBIL DATA USER (SUMBER UTAMA)
  // ===============================
  const submitter = await prisma.user.findUnique({
    where: { user_id: user.id },
    select: {
      name: true,
      phone: true,
      pic_omi_id: true,
    },
  });

  if (!submitter) {
    return NextResponse.json(
      { message: 'User tidak ditemukan.' },
      { status: 404 }
    );
  }

  if (!submitter.phone) {
    return NextResponse.json(
      { message: 'Nomor telepon belum diisi oleh Admin.' },
      { status: 400 }
    );
  }

  const nama_pengisi = submitter.name;
  const no_telepon = submitter.phone;

  // ===============================
  // VALIDASI KHUSUS ROLE
  // ===============================
  if (user.role === 'Agen' && !jabatan) {
    return NextResponse.json(
      { message: 'Agen wajib mengisi Jabatan.' },
      { status: 400 }
    );
  }

  // ===============================
  // VALIDASI LAMPIRAN
  // ===============================
  const isAttachmentRequired = REQUIRED_ATTACHMENT_RULES.includes(kategori);

  if (isAttachmentRequired && (!attachments || attachments.length === 0)) {
    return NextResponse.json(
      { message: 'Lampiran wajib diisi untuk kategori PRODUK.' },
      { status: 400 }
    );
  }

  // ===============================
  // SMART ROUTING
  // ===============================
  const routing = getRoutingTarget(kategori);

  if (!routing) {
    return NextResponse.json(
      { message: 'Routing kategori belum tersedia.' },
      { status: 400 }
    );
  }

  const assignedPicOmiId = submitter.pic_omi_id;

  if (!assignedPicOmiId) {
    return NextResponse.json(
      { message: 'Akun belum dihubungkan ke PIC OMI. Hubungi Admin.' },
      { status: 500 }
    );
  }

  try {
    const { ticket, picOmiUser } = await prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.create({
        data: {
          title,
          type: 'Pending',
          status: 'Open',
          kategori,
          sub_kategori: null,

          nama_pengisi,
          jabatan: jabatan || null,
          toko: toko || null,
          no_telepon,

          submittedBy: {
            connect: { user_id: user.id },
          },
        },
      });

      await tx.ticketDetail.create({
        data: {
          ticket_id: ticket.ticket_id,
          description,
          attachments_json: attachments || [],
        },
      });

      await tx.ticketLog.create({
        data: {
          ticket_id: ticket.ticket_id,
          actor_user_id: user.id,
          action_type: 'Submit',
          notes:
            user.role === 'Salesman'
              ? `Tiket dibuat oleh Sales ${nama_pengisi} (${no_telepon}) untuk ${toko}.`
              : `Tiket dibuat oleh ${nama_pengisi} (${jabatan}) (${no_telepon}).`,
        },
      });

      await tx.ticketAssignment.create({
        data: {
          ticket_id: ticket.ticket_id,
          user_id: assignedPicOmiId,
          assignment_type: 'Active',
          status: 'Pending',
        },
      });

      const picOmiUser = await tx.user.findUnique({
        where: { user_id: assignedPicOmiId },
        select: { email: true, name: true },
      });

      return { ticket, picOmiUser };
    });

    // ===============================
    // EMAIL
    // ===============================
    if (picOmiUser?.email) {
      sendTicketAssignedEmail({
        to: picOmiUser.email,
        subject: `Request Pending Baru`,
        ticket,
        extraText: `Anda ditugaskan sebagai PIC untuk request ini.`,
      }).catch((err) => console.error('Gagal kirim email PIC OMI:', err));
    }

    return NextResponse.json(
      { message: 'Sukses', ticket: serialize(ticket) },
      { status: 201 }
    );
  } catch (error) {
    console.error('Gagal submit tiket:', error);
    return NextResponse.json(
      { message: 'Error server.', error: error.message },
      { status: 500 }
    );
  }
}
