// Lokasi: src/app/api/assignments/[assignmentId]/feedback-process/route.js

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';

// FUNGSI: Memproses aksi Feedback (Bookmark / Archive)
// Berdasarkan ID penugasan (assignmentId)
export async function POST(request, context) {
  // 1. Ambil session
  const session = await getServerSession(authOptions);

  // 2. Cek otorisasi (Semua user yang login)
  if (!session) {
    return NextResponse.json(
      { message: 'Anda tidak diizinkan.' },
      { status: 403 }
    );
  }

  // 3. Ambil data
  const loggedInUser = session.user;
  const { assignmentId } = await context.params; // ✅ FIX UNTUK NEXT.JS 14+
  const { action } = await request.json(); // 'bookmark' atau 'archive'

  // 4. Validasi input
  if (!['bookmark', 'archive'].includes(action)) {
    return NextResponse.json(
      { message: 'Aksi tidak valid.' },
      { status: 400 }
    );
  }

  // 5. Verifikasi penugasan
  const currentAssignment = await prisma.ticketAssignment.findUnique({
    where: {
      assignment_id: BigInt(assignmentId),
    },
  });

  // Cek apakah penugasan ada dan dimiliki oleh user yang login
  if (!currentAssignment || currentAssignment.user_id !== loggedInUser.id) {
    return NextResponse.json(
      { message: 'Anda tidak ditugaskan untuk feedback ini.' },
      { status: 403 }
    );
  }

  // 6. Mulai Transaksi Database
  try {
    let newStatus =
      action === 'bookmark' ? 'Bookmarked' : 'Archived';

    // Update status penugasan (misal: 'Pending' -> 'Bookmarked')
    await prisma.ticketAssignment.update({
      where: {
        assignment_id: BigInt(assignmentId),
      },
      data: {
        status: newStatus,
      },
    });

    // 7. Kirim response sukses
    return NextResponse.json(
      { message: `Aksi '${action}' berhasil dieksekusi.` },
      { status: 200 }
    );
  } catch (error) {
    // 8. Rollback jika ada error
    console.error('Gagal memproses feedback:', error);
    return NextResponse.json(
      { message: 'Gagal memproses feedback.', error: error.message },
      { status: 500 }
    );
  }
}