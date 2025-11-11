// Lokasi: src/app/api/tickets/[ticketId]/am-process/route.js

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';

// FUNGSI: Acting Manager memproses tiket (Approve, Reject).
export async function POST(request, context) {
  // 1. Ambil session
  const session = await getServerSession(authOptions);

  // 2. Cek otorisasi (Hanya Acting Manager)
  if (!session || session.user.role !== 'Acting Manager') {
    return NextResponse.json(
      { message: 'Anda tidak diizinkan.' },
      { status: 403 }
    );
  }

  // 3. Ambil data
  const actingManagerUser = session.user;
  const { ticketId } = await context.params; // ✅ FIX UNTUK NEXT.JS 14+
  const { action, notes } = await request.json(); // 'approve' atau 'reject'

  // 4. Validasi input
  if (!['approve', 'reject'].includes(action)) {
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
      user_id: actingManagerUser.id,
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
      // a. Hapus penugasan Acting Manager
      await tx.ticketAssignment.delete({
        where: { assignment_id: currentAssignment.assignment_id },
      });

      // b. Buat Log Aksi
      await tx.ticketLog.create({
        data: {
          ticket_id: BigInt(ticketId),
          actor_user_id: actingManagerUser.id,
          action_type: `am_${action}`, // am_approve, am_reject
          notes: notes,
        },
      });

      // --- c. Eksekusi Aksi ---

      if (action === 'approve') {
        // Aksi: Teruskan ke Acting PIC
        const actingPicUser = await tx.user.findFirst({
          where: { role: { role_name: 'Acting PIC' } },
        });
        
        if (!actingPicUser) {
          throw new Error('User Acting PIC tidak ditemukan.');
        }

        await tx.ticketAssignment.create({
          data: {
            ticket_id: BigInt(ticketId),
            user_id: actingPicUser.user_id,
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
      }
    }); // Transaksi selesai (commit)

    // 7. Kirim response sukses
    return NextResponse.json(
      { message: `Aksi '${action}' berhasil dieksekusi.` },
      { status: 200 }
    );

  } catch (error) {
    // 8. Rollback jika ada error
    console.error('Gagal memproses tiket (AM):', error);
    return NextResponse.json(
      { message: 'Gagal memproses tiket.', error: error.message },
      { status: 500 }
    );
  }
}