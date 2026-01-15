import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { sendTicketAssignedEmail } from '@/lib/email';

const serialize = (data) =>
  JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );

  const REQUIRED_ATTACHMENT_RULES = {
  PRODUK: ['IDE PRODUK BARU', 'KUALITAS PRODUK', 'ISI PACKAGING',],
};



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
    sub_kategori, 
    nama_pengisi, 
    jabatan, 
    toko, 
    no_telepon,
    attachments 
  } = await request.json();

  // ----------------------------------------
// VALIDASI LAMPIRAN WAJIB UNTUK KATEGORI TERTENTU
// ----------------------------------------
const isAttachmentRequired =
  REQUIRED_ATTACHMENT_RULES[kategori]?.includes(sub_kategori);

if (isAttachmentRequired && (!attachments || attachments.length === 0)) {
  return NextResponse.json(
    {
      message: 'Lampiran/foto wajib diisi untuk kategori dan sub kategori ini.'
    },
    { status: 400 }
  );
}


  if (!title || !description || !kategori || !sub_kategori) {
    return NextResponse.json({ message: 'Data tidak lengkap.' }, { status: 400 });
  }

  if (!no_telepon) {
    return NextResponse.json(
      { message: 'Nomor Telepon/WA wajib diisi.' },
      { status: 400 }
    );
  }

  if (user.role === 'Agen' && (!nama_pengisi || !jabatan)) {
    return NextResponse.json({ message: 'Agen wajib mengisi Nama Pengisi dan Jabatan.' }, { status: 400 });
  }

  if (
    user.role === 'Salesman' &&
    ['KIRIMAN', 'RETURAN'].includes(sub_kategori)
  ) {
    return NextResponse.json(
      { message: 'Salesman tidak boleh memilih sub kategori KIRIMAN atau RETURAN. Sub kategori tersebut hanya untuk Agen.' },
      { status: 400 }
    );
  }

  const submitterData = await prisma.user.findUnique({
    where: { user_id: user.id },
  });

  const assignedPicOmiId = submitterData.pic_omi_id;

  if (!assignedPicOmiId) {
    return NextResponse.json(
      { message: 'Akun ini belum dihubungkan ke PIC OMI. Hubungi Admin.' },
      { status: 500 }
    );
  }

  try {
    // ----------------------------------------
    // TRANSAKSI: CREATE TICKET + GET PIC USER
    // ----------------------------------------
    const { ticket, picOmiUser } = await prisma.$transaction(async (tx) => {
      
      const ticket = await tx.ticket.create({
        data: {
          title,
          submitted_by_user_id: user.id,
          type: 'Pending',
          status: 'Open',
          kategori,
          sub_kategori,
          nama_pengisi: nama_pengisi || null,
          jabatan: jabatan || null,
          toko: toko || null,
          no_telepon,
        },
      });

      await tx.ticketDetail.create({
        data: { 
          ticket_id: ticket.ticket_id, 
          description, 
          attachments_json: attachments || [] 
        },
      });

      await tx.ticketLog.create({
        data: {
          ticket_id: ticket.ticket_id,
          actor_user_id: user.id,
          action_type: 'Submit',
          notes: user.role === 'Salesman' 
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

    // ----------------------------------------
    // EMAIL NOTIFICATION
    // ----------------------------------------
    if (picOmiUser?.email) {
      sendTicketAssignedEmail({
        to: picOmiUser.email,
        subject: `Request Pending Baru`,
        ticket,
        extraText: `Anda ditugaskan sebagai Sales Regional untuk request ini.`,
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
