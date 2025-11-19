// Lokasi: src/app/api/admin/users/route.js

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import bcrypt from 'bcryptjs';

export async function GET() {
  // ... (Kode GET sama persis, tidak perlu diubah) ...
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'Administrator') { return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 403 }); }
  try {
    const users = await prisma.user.findMany({ include: { role: true, division: true } });
    return NextResponse.json(users);
  } catch (error) { return NextResponse.json({ message: 'Gagal', error: error.message }, { status: 500 }); }
}

// FUNGSI POST DIPERBARUI
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'Administrator') {
    return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 403 });
  }

  try {
    const body = await request.json();
    
    // --- TERIMA USERNAME ---
    const { 
      name, 
      username, // <-- BARU
      email,    // Opsional/Pelengkap
      password, 
      role_id, 
      division_id,
      pic_omi_id
    } = body;

    if (!name || !username || !password || !role_id) { // Username wajib
      return NextResponse.json({ message: 'Nama, Username, Password, Role wajib diisi' }, { status: 400 });
    }
    
    // Cek Username unik
    const userExists = await prisma.user.findUnique({
      where: { username: username },
    });
    if (userExists) {
      return NextResponse.json({ message: 'Username sudah digunakan' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        username, // <-- SIMPAN
        email: email || null, // Email jadi opsional
        password: hashedPassword,
        role_id: parseInt(role_id, 10),
        division_id: division_id ? parseInt(division_id, 10) : null,
        pic_omi_id: pic_omi_id ? parseInt(pic_omi_id, 10) : null,
      },
      include: { role: true, division: true },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Gagal membuat user', error: error.message }, { status: 500 });
  }
}