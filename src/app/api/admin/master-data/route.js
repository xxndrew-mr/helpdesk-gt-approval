import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';

// FUNGSI: Mengambil semua Role dan Division
export async function GET() {
  // 1. Ambil session
  const session = await getServerSession(authOptions);

  // 2. Cek otorisasi (Hanya Admin)
  if (!session || session.user.role !== 'Administrator') {
    return NextResponse.json(
      { message: 'Anda tidak diizinkan.' },
      { status: 403 }
    );
  }

  try {
    // 3. Ambil data dari database
    const roles = await prisma.role.findMany();
    const divisions = await prisma.division.findMany();

    // 4. Kembalikan data
    return NextResponse.json({ roles, divisions });
  } catch (error) {
    console.error('Gagal mengambil master data:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}