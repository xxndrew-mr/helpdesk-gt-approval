import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import bcrypt from 'bcryptjs';

// FUNGSI: Mengambil semua user
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'Administrator') {
    return NextResponse.json(
      { message: 'Anda tidak diizinkan.' },
      { status: 403 }
    );
  }

  try {
    const users = await prisma.user.findMany({
      // Ambil juga relasi role dan division
      include: {
        role: true,
        division: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { message: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}

// FUNGSI: Membuat user baru
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'Administrator') {
    return NextResponse.json(
      { message: 'Anda tidak diizinkan.' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { name, email, password, role_id, division_id } = body;

    // Validasi input
    if (!name || !email || !password || !role_id) {
      return NextResponse.json(
        { message: 'Semua field wajib diisi (kecuali divisi).' },
        { status: 400 }
      );
    }

    // Cek jika email sudah ada
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email sudah terdaftar.' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user baru
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role_id: parseInt(role_id, 10),
        // Set divisi HANYA jika diisi (bisa null)
        division_id: division_id ? parseInt(division_id, 10) : null,
      },
      include: {
        role: true,
        division: true,
      },
    });

    return NextResponse.json(newUser, { status: 201 }); // 201 = Created
  } catch (error) {
    console.error('Gagal membuat user:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}