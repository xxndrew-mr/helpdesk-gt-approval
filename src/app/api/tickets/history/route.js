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

// FUNGSI: Mengambil tiket riwayat
export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const userRole = session.user.role;

  // =========================
  // FILTER OTOMATIS BERDASARKAN ROLE
  // =========================
  let whereClause = {};

  // Role operasional → hanya tiket yang pernah dia proses
  if (userRole !== 'Viewer' && userRole !== 'Administrator') {
    whereClause = {
      logs: {
        some: {
          actor_user_id: userId,
        },
      },
    };
  }
  // Viewer & Administrator → lihat semua ticket (no filter)

  try {
    const tickets = await prisma.ticket.findMany({
      where: whereClause,
      include: {
        detail: {
          select: {
            description: true,
            attachments_json: true,
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
        logs: {
          orderBy: { timestamp: 'desc' },
          take: 1,
          include: {
            actor: { select: { name: true } },
          },
        },
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
        updatedAt: 'desc',
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
