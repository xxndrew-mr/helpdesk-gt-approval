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
        user_id: Number(session.user.id),   // pastikan numeric
        assignment_type: assignmentType,
        status: 'Pending',
      },
      include: {
        ticket: {
          select: {
            // FIELD SCALAR TICKET
            ticket_id: true,
            title: true,
            type: true,
            status: true,
            createdAt: true,
            kategori: true,
            sub_kategori: true,
            jabatan: true,
            toko: true,
            nama_pengisi: true,
            no_telepon: true,

            // RELASI SUBMITTER (AGEN)
            submittedBy: {
              select: {
                name: true,
              },
            },

            // DETAIL (DESKRIPSI + LAMPIRAN)
            detail: {
              select: {
                description: true,
                attachments_json: true,
              },
            },
          },
        },
      },
      // urutkan berdasarkan waktu assignment dibuat (TicketAssignment.createdAt)
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
