import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';

// FUNGSI: Mengambil Arsip Pribadi
export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const assignments = await prisma.ticketAssignment.findMany({
      where: {
        user_id: session.user.id,      // Hanya milik user ini
        status: 'Archived',            // Hanya status Archived
        assignment_type: 'Feedback_Review',
      },
      include: {
        ticket: {
          include: {
            submittedBy: {
              select: { name: true },
            },
            detail: {
              select: {
                description: true,
                attachments_json: true, // ⬅️ tambahkan ini supaya lampiran ikut
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Error fetching archive:', error);
    return NextResponse.json({ message: 'Error server.' }, { status: 500 });
  }
}
