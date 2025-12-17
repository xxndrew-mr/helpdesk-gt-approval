// Lokasi: src/app/api/tickets/history/route.js
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';

const serialize = (data) =>
  JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );

// FUNGSI: Mengambil tiket yang PERNAH diproses oleh user yang login
export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const tickets = await prisma.ticket.findMany({
      where: {
        // tiket di mana user ini pernah membuat log (pernah proses sesuatu)
        logs: {
          some: {
            actor_user_id: userId,
          },
        },
      },
      include: {
        // ⛔ tadinya cuma { description: true }
        // ✅ sekarang kirim juga attachments_json
        detail: {
          select: {
            description: true,
            attachments_json: true, // <--- ini kuncinya
          },
        },
        submittedBy: {
          select: {
            name: true,
            role: {
              select: { role_name: true },
            },
          },
        },
        // log terakhir (kalau nanti mau dipakai buat info tambahan)
        logs: {
          orderBy: { timestamp: 'desc' },
          take: 1,
          include: {
            actor: { select: { name: true } },
          },
        },
        // penugasan saat ini (siapa yang pegang “bola”)
        assignments: {
          where: { status: 'Pending' },
          include: {
            user: {
              select: {
                name: true,
                role: { select: { role_name: true } },
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc', // yang terbaru di atas
      },
    });

    return NextResponse.json(serialize(tickets));

  } catch (error) {
    console.error('Gagal mengambil riwayat aksi:', error);
    return NextResponse.json(
      { message: 'Gagal mengambil data.', error: error.message },
      { status: 500 }
    );
  }
}
