// Lokasi: src/app/api/tickets/[ticketId]/ap-process/route.js

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';

// FUNGSI: Acting PIC memproses tiket (Complete, Return).
export async function POST(request, context) {
  // 1. Ambil session
  const session = await getServerSession(authOptions);

  // 2. Cek otorisasi (Hanya Acting PIC)
  if (!session || session.user.role !== 'Acting PIC') {
    return NextResponse.json(
      { message: 'Anda tidak diizinkan.' },
      { status: 403 }
    );
  }

  // 3. Ambil data
  const actingPicUser = session.user;
  const { ticketId } = await context.params; // ✅ FIX UNTUK NEXT.JS 14+
  const { action, notes } = await request.json(); // 'complete' atau 'return'

  // 4. Validasi input
  if (!['complete', 'return'].includes(action)) {
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

  // 5. Verifikasi penugasan
  const currentAssignment = await prisma.ticketAssignment.findFirst({
    where: {
      ticket_id: BigInt(ticketId),
      user_id: actingPicUser.id,
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
      // a. Hapus penugasan Acting PIC
      await tx.ticketAssignment.delete({
        where: { assignment_id: currentAssignment.assignment_id },
      });

      // b. Buat Log Aksi
      await tx.ticketLog.create({
        data: {
          ticket_id: BigInt(ticketId),
          actor_user_id: actingPicUser.id,
          action_type: `ap_${action}`, // ap_complete, ap_return
          notes: notes,
        },
      });

      // --- c. Eksekusi Aksi ---

      if (action === 'complete') {
        // Aksi: Selesaikan tiket
        await tx.ticket.update({
          where: { ticket_id: BigInt(ticketId) },
          data: { status: 'Done' },
        });
      } else if (action === 'return') {
        // Aksi: Kembalikan ke Acting Manager
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
      }
    }); // Transaksi selesai (commit)

    // 7. Kirim response sukses
    return NextResponse.json(
      { message: `Aksi '${action}' berhasil dieksekusi.` },
      { status: 200 }
    );
  } catch (error) {
    // 8. Rollback jika ada error
    console.error('Gagal memproses tiket (AP):', error);
    return NextResponse.json(
      { message: 'Gagal memproses tiket.', error: error.message },
      { status: 500 }
    );
  }
}