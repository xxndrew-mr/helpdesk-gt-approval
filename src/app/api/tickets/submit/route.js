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

  // ⬇️ TAMBAH no_telepon DI DESTRUCTURING
  const { 
    title, 
    description, 
    kategori, 
    sub_kategori, 
    nama_pengisi, 
    jabatan, 
    toko, 
    no_telepon,      // <-- FIELD BARU DARI FRONTEND
    attachments 
  } = await request.json();

  if (!title || !description || !kategori || !sub_kategori) {
    return NextResponse.json({ message: 'Data tidak lengkap.' }, { status: 400 });
  }

  // ✅ VALIDASI NOMOR TELEPON (WAJIB)
  if (!no_telepon) {
    return NextResponse.json(
      { message: 'Nomor Telepon/WA wajib diisi.' },
      { status: 400 }
    );
  }
  
  // --- VALIDASI SESUAI ROLE ---
  if (user.role === 'Agen' && (!nama_pengisi || !jabatan)) {
    return NextResponse.json({ message: 'Agen wajib mengisi Nama Pengisi dan Jabatan.' }, { status: 400 });
  }
  
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
          nama_pengisi: nama_pengisi || null,
          jabatan: jabatan || null,
          toko: toko || null,
          no_telepon: no_telepon,  // <-- SIMPAN KE KOLOM DI TABLE TICKET
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
          // Log sekalian mencatat nomor telepon
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
      
      return ticket;
    });

    return NextResponse.json({ message: 'Sukses', ticket: newTicket }, { status: 201 });
  } catch (error) {
    console.error('Gagal submit tiket:', error);
    return NextResponse.json({ message: 'Error server.', error: error.message }, { status: 500 });
  }
}
