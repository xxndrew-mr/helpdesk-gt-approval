// Lokasi: src/app/api/tickets/[ticketId]/sm-process/route.js
// Ini adalah KODE ASLI (BUKAN TES)

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';

// FUNGSI: Sales Manager memproses tiket (Approve, Reject, Complete).
// === PERBAIKAN DI SINI (Parameter kedua adalah 'context') ===
export async function POST(request, context) {
  // 1. Ambil session
  const session = await getServerSession(authOptions);

  // 2. Cek otorisasi (Hanya Sales Manager)
  if (!session || session.user.role !== 'Sales Manager') {
    return NextResponse.json(
      { message: 'Anda tidak diizinkan.' },
      { status: 403 }
    );
  }

  // 3. Ambil data
  const salesManagerUser = session.user;
  
  // === PERBAIKAN DI SINI (Ambil 'params' dari 'context') ===
  const { params } = context;
  const { ticketId } = params; // Ambil ticketId dari URL
  
  const { action, notes } = await request.json(); // approve, reject, complete

  // 4. Validasi input
  if (!['approve', 'reject', 'complete'].includes(action)) {
    return NextResponse.json(
      { message: 'Aksi tidak valid.' },
      { status: 400 }
    );
  }
  if (!notes || notes.trim() === '') {
    return NextResponse.json(
      { message: 'Catatan wajib diisi.' },
      { status: 400 }
    );
  }
  
  // === PENJAGA (SAFE-GUARD) UNTUK CRASH BIGINT ===
  if (!ticketId) {
    console.error("FATAL: 'ticketId' adalah undefined. Gagal membaca params dari URL.");
    return NextResponse.json(
      { message: "Server Error: Gagal membaca ID tiket dari URL." },
      { status: 500 }
    );
  }
  // ===============================================

  // 5. Verifikasi penugasan
  const currentAssignment = await prisma.ticketAssignment.findFirst({
    where: {
      ticket_id: BigInt(ticketId), // Baris ini sekarang AMAN
      user_id: salesManagerUser.id,
      assignment_type: 'Active',
      status: 'Pending',
    },
  });

  if (!currentAssignment) {
    return NextResponse.json(
      { message: 'Anda tidak ditugaskan untuk tiket ini.' },
      { status: 403 }
    );
  }

  // 6. Mulai Transaksi Database
  try {
    await prisma.$transaction(async (tx) => {
      // a. Hapus penugasan Sales Manager
      await tx.ticketAssignment.delete({
        where: { assignment_id: currentAssignment.assignment_id },
      });

      // b. Buat Log Aksi
      await tx.ticketLog.create({
        data: {
          ticket_id: BigInt(ticketId),
          actor_user_id: salesManagerUser.id,
          action_type: `sm_${action}`, // sm_approve, sm_reject, ...
          notes: notes,
        },
      });

      // --- c. Eksekusi Aksi ---

      if (action === 'approve') {
        // Aksi: Teruskan ke Acting Manager
        const actingManagerUser = await tx.user.findFirst({
          where: { role: { role_name: 'Acting Manager' } },
        });

        if (!actingManagerUser) {
          throw new Error('User Acting Manager tidak ditemukan.');
        }

        await tx.ticketAssignment.create({
          data: {
            ticket_id: BigInt(ticketId),
            user_id: actingManagerUser.user_id,
            assignment_type: 'Active',
            status: 'Pending',
          },
        });
      } else if (action === 'reject') {
        // Aksi: Tolak tiket
        await tx.ticket.update({
          where: { ticket_id: BigInt(ticketId) },
          data: { status: 'Rejected' },
        });
      } else if (action === 'complete') {
        // Aksi: Selesaikan tiket
        await tx.ticket.update({
          where: { ticket_id: BigInt(ticketId) },
          data: { status: 'Done' },
        });
      }
    }); // Transaksi selesai (commit)

    // 7. Kirim response sukses
    return NextResponse.json(
      { message: `Aksi '${action}' berhasil dieksekusi.` },
      { status: 200 }
    );
  } catch (error) {
    // 8. Rollback jika ada error
    console.error('Gagal memproses tiket (SM):', error);
    return NextResponse.json(
      { message: 'Gagal memproses tiket.', error: error.message },
      { status: 500 }
    );
  }
}