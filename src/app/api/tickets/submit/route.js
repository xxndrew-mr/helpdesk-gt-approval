// Lokasi File: src/app/api/tickets/submit/route.js

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';

// FUNGSI: Salesman atau Agen submit tiket baru.
export async function POST(request) {
  // 1. Ambil session
  const session = await getServerSession(authOptions);
  
  // 2. Verifikasi Role (Salesman ATAU Agen)
  if (!session || !['Salesman', 'Agen'].includes(session.user.role)) {
    return NextResponse.json(
      { message: 'Hanya Salesman atau Agen yang bisa submit tiket.' },
      { status: 403 }
    );
  }
  
  const user = session.user; // User yang sedang login

  // 3. Validasi
  const { 
    title, 
    description, 
    kategori, 
    sub_kategori,
    jabatan,
    toko
  } = await request.json();

  if (!title || !description || !kategori || !sub_kategori) {
    return NextResponse.json(
      { message: 'Semua field (Judul, Deskripsi, Kategori, Sub Kategori) wajib diisi' },
      { status: 400 }
    );
  }

  // --- PERUBAHAN LOGIKA ROUTING ---
  // 4. Cari PIC OMI yang DIVISI-nya SAMA dengan si pengirim
  
  // Ambil divisionId dari si pengirim (Salesman/Agen)
  const submitterDivisionId = user.divisionId;
  
  if (!submitterDivisionId) {
     return NextResponse.json(
      { message: 'Gagal submit: Akun Anda tidak memiliki Divisi.' },
      { status: 500 }
    );
  }

  // Cari PIC OMI yang matching
  const picOmiUser = await prisma.user.findFirst({
    where: { 
      role: { role_name: 'PIC OMI' },
      division_id: submitterDivisionId // <-- KUNCI LOGIKA BARU
    },
  });
  
  if (!picOmiUser) {
    return NextResponse.json(
      { message: `Gagal submit: Tidak ada PIC OMI yang ditemukan untuk Divisi Anda.` },
      { status: 500 }
    );
  }
  // --- AKHIR PERUBAHAN LOGIKA ---

  // 5. Gunakan Database Transaction (agar aman)
  try {
    const newTicket = await prisma.$transaction(async (tx) => {
      // a. Buat data di tabel `tickets`
      const ticket = await tx.ticket.create({
        data: {
          title: title,
          submitted_by_user_id: user.id,
          type: 'Pending', // Status awal 'Pending' untuk di-triase
          status: 'Open',
          kategori: kategori,
          sub_kategori: sub_kategori,
          jabatan: jabatan || null, 
          toko: toko || null,       
        },
      });

      // b. Buat data di tabel `ticket_details`
      await tx.ticketDetail.create({
        data: {
          ticket_id: ticket.ticket_id,
          description: description,
        },
      });

      // c. Buat log pertama: "Submitted"
      await tx.ticketLog.create({
        data: {
          ticket_id: ticket.ticket_id,
          actor_user_id: user.id,
          action_type: 'Submit',
          notes: `Tiket berhasil dibuat oleh ${user.role} (${user.name}).`,
        },
      });

      // d. Buat penugasan (assignment) untuk PIC OMI (yang sudah di-filter)
      await tx.ticketAssignment.create({
        data: {
          ticket_id: ticket.ticket_id,
          user_id: picOmiUser.user_id, // <-- Ini adalah ID PIC OMI Divisi A
          assignment_type: 'Active', 
          status: 'Pending',
        },
      });
      
      return ticket;
    });

    // 6. Kirim response sukses
    return NextResponse.json(
      {
        message: 'Tiket berhasil disubmit. Menunggu triase oleh PIC OMI.',
        ticket: newTicket,
      },
      { status: 201 }
    );
  } catch (error) {
    // 7. Rollback jika ada error
    console.error('Gagal submit tiket:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat submit tiket.', error: error.message },
      { status: 500 }
    );
  }
}