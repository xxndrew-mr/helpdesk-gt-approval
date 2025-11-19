// Lokasi File: src/app/api/tickets/submit/route.js

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';

export async function POST(request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !['Salesman', 'Agen'].includes(session.user.role)) {
    return NextResponse.json({ message: 'Akses ditolak.' }, { status: 403 });
  }
  
  const user = session.user;
  const { title, description, kategori, sub_kategori, nama_pengisi, jabatan, toko } = await request.json();

  if (!title || !description || !kategori || !sub_kategori) {
    return NextResponse.json({ message: 'Data tidak lengkap.' }, { status: 400 });
  }
  
  // --- VALIDASI BARU SESUAI PERMINTAAN ---
  if (user.role === 'Agen' && (!nama_pengisi || !jabatan)) {
    return NextResponse.json({ message: 'Agen wajib mengisi Nama Pengisi dan Jabatan.' }, { status: 400 });
  }
  
  // Salesman sekarang WAJIB mengisi nama_pengisi (Nama Sales) dan toko
  if (user.role === 'Salesman' && (!nama_pengisi || !toko)) {
    return NextResponse.json({ message: 'Salesman wajib mengisi Nama Sales dan Toko.' }, { status: 400 });
  }
  // ---------------------------------------

  // Cari data user untuk routing (cek pic_omi_id)
  const submitterData = await prisma.user.findUnique({ where: { user_id: user.id } });
  const assignedPicOmiId = submitterData.pic_omi_id;

  if (!assignedPicOmiId) {
    return NextResponse.json(
      { message: 'Akun ini belum dihubungkan ke PIC OMI. Hubungi Admin.' },
      { status: 500 }
    );
  }

  try {
    const newTicket = await prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.create({
        data: {
          title,
          submitted_by_user_id: user.id,
          type: 'Pending',
          status: 'Open',
          kategori,
          sub_kategori,
          // Simpan data sesuai role
          nama_pengisi: nama_pengisi || null, // Disimpan untuk Agen & Salesman
          jabatan: jabatan || null,         // Hanya Agen
          toko: toko || null,               // Hanya Salesman
        },
      });

      await tx.ticketDetail.create({
        data: { ticket_id: ticket.ticket_id, description },
      });

      await tx.ticketLog.create({
        data: {
          ticket_id: ticket.ticket_id,
          actor_user_id: user.id,
          action_type: 'Submit',
          // Log diperjelas
          notes: user.role === 'Salesman' 
            ? `Tiket dibuat oleh Sales ${nama_pengisi} untuk ${toko}.` 
            : `Tiket dibuat oleh ${nama_pengisi} (${jabatan}).`,
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
      
      return ticket;
    });

    return NextResponse.json({ message: 'Sukses', ticket: newTicket }, { status: 201 });
  } catch (error) {
    console.error('Gagal submit tiket:', error);
    return NextResponse.json({ message: 'Error server.', error: error.message }, { status: 500 });
  }
}