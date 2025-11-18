// Lokasi File: src/app/api/admin/users/route.js

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import bcrypt from 'bcryptjs';

// FUNGSI: Mengambil daftar semua user
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'Administrator') {
    return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      include: {
        role: true,
        division: true,
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error('Gagal mengambil data user (API):', error);
    return NextResponse.json(
      { message: 'Gagal mengambil data user', error: error.message },
      { status: 500 }
    );
  }
}

// FUNGSI: Membuat user baru
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'Administrator') {
    return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 403 });
  }

  try {
    const body = await request.json();
    
    // --- PERUBAHAN DI SINI ---
    // Hapus 'jabatan' dan 'toko' dari data yang diterima
    const { 
      name, 
      email, 
      password, 
      role_id, 
      division_id,
    } = body;
    // -------------------------

    // Validasi dasar
    if (!name || !email || !password || !role_id) {
      return NextResponse.json(
        { message: 'Nama, email, password, dan role wajib diisi' },
        { status: 400 }
      );
    }
    
    // Cek jika user sudah ada
    const userExists = await prisma.user.findUnique({
      where: { email: email },
    });
    if (userExists) {
      return NextResponse.json(
        { message: 'Email sudah terdaftar' },
        { status: 400 }
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
        division_id: division_id ? parseInt(division_id, 10) : null,
        // --- PERUBAHAN DI SINI ---
        // 'jabatan' dan 'toko' DIHAPUS dari data pembuatan user
        // -------------------------
      },
      include: {
        role: true,
        division: true,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Gagal membuat user:', error);
    return NextResponse.json(
      { message: 'Gagal membuat user', error: error.message },
      { status: 500 }
    );
  }
}