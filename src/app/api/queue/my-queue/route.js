import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';

/**
 * API untuk mengambil antrian tugas untuk user yang sedang login.
 * Menggunakan query param 'type' untuk membedakan:
 * ?type=Active -> (Request/Triase)
 * ?type=Feedback_Review -> (Feedback)
 */
export async function GET(request) {
  const session = await getServerSession(authOptions);

  // 1. Cek otentikasi
  if (!session) {
    return NextResponse.json(
      { message: 'Anda harus login' },
      { status: 401 }
    );
  }

  // 2. Ambil query parameter 'type'
  const { searchParams } = new URL(request.url);
  const assignmentType = searchParams.get('type'); // 'Active' atau 'Feedback_Review'

  // 3. Validasi query parameter
  if (!assignmentType || !['Active', 'Feedback_Review'].includes(assignmentType)) {
    return NextResponse.json(
      { message: "Query parameter 'type' tidak valid." },
      { status: 400 }
    );
  }

  try {
    // 4. Ambil data penugasan dari database
    const assignments = await prisma.ticketAssignment.findMany({
      where: {
        user_id: session.user.id,        // Hanya untuk user yang login
        assignment_type: assignmentType, // Hanya tipe yang diminta
        status: 'Pending',               // Hanya yang masih 'Pending'
      },
      // Ambil juga data relasi (tiket, pengirim, detail)
      include: {
        ticket: {
          include: {
            submittedBy: {
              select: { name: true }, // Hanya ambil nama pengirim
            },
            detail: {
              select: { description: true }, // Hanya ambil deskripsi
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc', // Tampilkan yang paling lama di atas
      },
    });

    // 5. Kirim data
    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Gagal mengambil antrian:', error);
    return NextResponse.json(
      { message: 'Gagal mengambil antrian', error: error.message },
      { status: 500 }
    );
  }
}