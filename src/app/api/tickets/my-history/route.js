// Lokasi: src/app/api/tickets/my-history/route.js

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';

// FUNGSI: Mengambil riwayat tiket yang di-submit oleh user yang login
export async function GET(request) {
  // 1. Ambil session
  const session = await getServerSession(authOptions);

  // 2. Cek otorisasi (Salesman ATAU Agen)
  if (!session || !['Salesman', 'Agen'].includes(session.user.role)) {
    return NextResponse.json(
      { message: 'Anda tidak diizinkan.' },
      { status: 403 }
    );
  }

  try {
    // 3. Ambil data tiket dari database
    const tickets = await prisma.ticket.findMany({
      where: {
        // HANYA ambil tiket yang di-submit oleh user ini
        submitted_by_user_id: session.user.id,
      },
      include: {
        // 🔴 TADI MASALAH: hanya select description
        // ✅ SOLUSI: tambahkan attachments_json juga
        detail: {
          select: {
            description: true,
            attachments_json: true, // <-- penting supaya muncul di MyTicketsPage
          },
        },

        // Ambil SEMUA log riwayat, urutkan dari yang terlama
        logs: {
          include: {
            actor: { select: { name: true } }, // Siapa yang melakukan aksi
          },
          orderBy: {
            timestamp: 'asc',
          },
        },

        // Ambil penugasan yang masih 'Pending' (untuk tahu siapa PIC saat ini)
        assignments: {
          where: { status: 'Pending' },
          include: {
            user: {
              select: {
                name: true,
                role: {
                  select: {
                    role_name: true,
                  },
                },
              },
            },
          },
        },
      },
      // Urutkan tiket, tampilkan yang terbaru di atas
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 4. Kirim response sukses
    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Gagal mengambil riwayat tiket:', error);
    return NextResponse.json(
      { message: 'Gagal mengambil riwayat tiket.', error: error.message },
      { status: 500 }
    );
  }
}
