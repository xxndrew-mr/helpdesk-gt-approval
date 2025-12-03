// Lokasi: src/app/api/queue/my-queue/route.js

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';

export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Anda harus login' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const assignmentType = searchParams.get('type');

  if (!assignmentType || !['Active', 'Feedback_Review'].includes(assignmentType)) {
    return NextResponse.json(
      { message: "Query parameter 'type' tidak valid." },
      { status: 400 }
    );
  }

  try {
    const assignments = await prisma.ticketAssignment.findMany({
      where: {
        user_id: session.user.id,        // kalau user_id di DB BigInt, id di session harus string numerik yg cocok
        assignment_type: assignmentType,
        status: 'Pending',
      },
      include: {
        ticket: {
          // pakai select untuk ambil field scalar dan relasi yang dibutuhkan
          select: {
            // Field scalar
            ticket_id: true,
            title: true,
            type: true,
            status: true,
            createdAt: true,
            kategori: true,
            sub_kategori: true,
            jabatan: true,
            toko: true,

            // Relasi
            submittedBy: {
              select: { name: true },
            },
            detail: {
              select: {
                description: true,
                attachments_json: true,   // <-- TAMBAHAN PENTING: kirim lampiran ke frontend
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Gagal mengambil antrian:', error);
    return NextResponse.json(
      { message: 'Gagal mengambil antrian', error: error.message },
      { status: 500 }
    );
  }
}
