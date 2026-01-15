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

// ================================
// GET HISTORY TICKETS (ROLE AWARE + MULTI DIVISI)
// ================================
export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const userRole = session.user.role;

  const { searchParams } = new URL(request.url);
  const divisionIdsParam = searchParams.get('division_ids');

  // parse ?division_ids=1,2,3
  const divisionIds = divisionIdsParam
    ? divisionIdsParam.split(',').map((id) => parseInt(id, 10))
    : [];

  let whereClause = {};

  // =========================
  // ROLE OPERASIONAL (AGEN, SALES, DLL)
  // =========================
  if (userRole !== 'Viewer' && userRole !== 'Administrator') {
    whereClause = {
      logs: {
        some: {
          actor_user_id: userId,
        },
      },
    };
  }

  // =========================
  // VIEWER / ADMIN → BOLEH FILTER DIVISI
  // =========================
  if (
    (userRole === 'Viewer' || userRole === 'Administrator') &&
    divisionIds.length > 0
  ) {
    whereClause = {
      ...whereClause,
      division_id: {
        in: divisionIds,
      },
    };
  }

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
