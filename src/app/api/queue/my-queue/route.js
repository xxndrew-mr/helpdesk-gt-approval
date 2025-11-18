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
        user_id: session.user.id,
        assignment_type: assignmentType,
        status: 'Pending',
      },
      // --- PERUBAHAN DI SINI ---
      include: {
        ticket: {
          // Kita tidak lagi pakai 'include' di dalam 'ticket',
          // kita pakai 'select' agar bisa mengambil
          // SEMUA field scalar (termasuk kategori) DAN relasi
          select: {
            // Semua field scalar dari Ticket
            ticket_id: true,
            title: true,
            type: true,
            status: true,
            createdAt: true,
            kategori: true,       // <-- INI DIA
            sub_kategori: true,  // <-- INI DIA
            jabatan: true,
            toko: true,
            
            // Relasi yang kita butuhkan
            submittedBy: {
              select: { name: true },
            },
            detail: {
              select: { description: true },
            },
          },
        },
      },
      // -------------------------
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