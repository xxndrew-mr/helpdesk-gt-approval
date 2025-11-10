import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';

// FUNGSI: Salesman submit tiket baru
export async function POST(request) {
  // 1. Ambil session user yang login
  const session = await getServerSession(authOptions);

  // 2. Verifikasi Role (Hanya Salesman)
  if (!session || session.user.role !== 'Salesman') {
    return NextResponse.json(
      { message: 'Hanya Salesman yang bisa submit tiket.' },
      { status: 403 }
    );
  }

  // 3. Ambil data form
  const body = await request.json();
  const { title, description } = body;
  const salesman = session.user; // Data user Salesman

  // 4. Validasi input
  if (!title || !description) {
    return NextResponse.json(
      { message: 'Judul dan Deskripsi wajib diisi.' },
      { status: 400 }
    );
  }
  if (description.length < 10) {
    return NextResponse.json(
      { message: 'Deskripsi minimal 10 karakter.' },
      { status: 400 }
    );
  }

  // 5. Cari PIC OMI yang akan menerima tiket ini
  const picOmiUser = await prisma.user.findFirst({
    where: { role: { role_name: 'PIC OMI' } },
  });

  if (!picOmiUser) {
    return NextResponse.json(
      { message: 'Gagal submit: User PIC OMI tidak ditemukan.' },
      { status: 500 }
    );
  }

  // 6. Gunakan Database Transaction (agar aman)
  try {
    const newTicket = await prisma.$transaction(async (tx) => {
      // a. Buat data di tabel `Ticket`
      const ticket = await tx.ticket.create({
        data: {
          title: title,
          submitted_by_user_id: salesman.id, // Ambil 'id' dari session
          type: 'Pending', // Status awal 'Pending' untuk di-triase
          status: 'Open',
        },
      });

      // b. Buat data di tabel `TicketDetail`
      // === PERBAIKAN DI SINI ===
      // Kita hanya mengirim field yang kita miliki.
      // `attachments_json` akan otomatis null karena opsional (Json?)
      await tx.ticketDetail.create({
        data: {
          ticket_id: ticket.ticket_id, // Gunakan ID dari tiket yang baru dibuat
          description: description,
        },
      });
      // ========================

      // c. Buat log pertama: "Submitted"
      await tx.ticketLog.create({
        data: {
          ticket_id: ticket.ticket_id,
          actor_user_id: salesman.id,
          action_type: 'Submit',
          notes: 'Tiket berhasil dibuat oleh Salesman.',
        },
      });

      // d. Buat penugasan (assignment) untuk PIC OMI
      await tx.ticketAssignment.create({
        data: {
          ticket_id: ticket.ticket_id,
          user_id: picOmiUser.user_id,
          assignment_type: 'Active', // Tugas aktif untuk triase
          status: 'Pending',
        },
      });

      return ticket;
    });

    // 7. Kirim response sukses
    return NextResponse.json(
      {
        message: 'Tiket berhasil disubmit. Menunggu triase oleh PIC OMI.',
        ticket: newTicket,
      },
      { status: 201 }
    );
  } catch (error) {
    // 8. Rollback jika ada error
    console.error('Gagal submit tiket:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat submit tiket.' },
      { status: 500 }
    );
  }
}