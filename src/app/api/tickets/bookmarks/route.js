import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';

// FUNGSI: Mengambil SEMUA tiket yang di-Bookmark (Shared View)
export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  // Cek Role yang diizinkan
  const allowedRoles = ['PIC OMI', 'Sales Manager', 'User Feedback'];
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const tickets = await prisma.ticket.findMany({
      where: {
        // Cari tiket yang PUNYA assignment dengan status 'Bookmarked'
        assignments: {
          some: {
            status: 'Bookmarked',
            assignment_type: 'Feedback_Review',
          },
        },
      },
      include: {
        detail: {
          select: {
            description: true,
            attachments_json: true,   // ⬅️ penting: kirim lampiran ke frontend
          },
        },
        submittedBy: {
          select: { name: true },
        },
        // Ambil info SIAPA yang mem-bookmark
        assignments: {
          where: { status: 'Bookmarked' },
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
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return NextResponse.json({ message: 'Error server.' }, { status: 500 });
  }
}
