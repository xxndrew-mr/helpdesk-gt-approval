import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';

// FUNGSI: Mengambil tiket yang PERNAH diproses oleh user yang login
export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // Logika: Cari semua Tiket di mana user ini pernah membuat Log
    // (artinya user ini pernah melakukan aksi pada tiket tersebut)
    const tickets = await prisma.ticket.findMany({
      where: {
        logs: {
          some: {
            actor_user_id: userId
          }
        }
      },
      include: {
        detail: {
          select: { description: true },
        },
        submittedBy: {
          select: { name: true, role: { select: { role_name: true } } }
        },
        // Ambil log terakhir untuk melihat status terkini
        logs: {
          orderBy: { timestamp: 'desc' },
          take: 1,
          include: {
            actor: { select: { name: true } }
          }
        },
        // Ambil penugasan saat ini (siapa yang sedang pegang bola)
        assignments: {
          where: { status: 'Pending' },
          include: {
            user: { 
              select: { 
                name: true, 
                role: { select: { role_name: true } } 
              } 
            }, 
          },
        },
      },
      orderBy: {
        updatedAt: 'desc', // Yang baru di-update paling atas
      },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Gagal mengambil riwayat aksi:', error);
    return NextResponse.json(
      { message: 'Gagal mengambil data.', error: error.message },
      { status: 500 }
    );
  }
}