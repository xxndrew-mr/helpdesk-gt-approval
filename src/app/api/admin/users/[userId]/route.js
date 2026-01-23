import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import bcrypt from 'bcryptjs';

// ================================
// UPDATE USER (ADMIN)
// ================================
export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'Administrator') {
    return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 403 });
  }

  try {
    const { userId } = await params;
    const id = parseInt(userId, 10);

    if (!id) {
      return NextResponse.json(
        { message: 'User ID tidak valid' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const {
      name,
      username,
      email,
      phone, // ✅ TAMBAHAN
      password,
      role_id,
      division_id,
      pic_omi_id,
      status
    } = body;

    if (!name || !username || !role_id) {
      return NextResponse.json(
        { message: 'Nama, username, dan role wajib diisi' },
        { status: 400 }
      );
    }

    const dataToUpdate = {
      name,
      username,
      email: email || null,
      phone: phone || null, // ✅ SIMPAN NO TELP
      role_id: parseInt(role_id, 10),
      division_id: division_id ? parseInt(division_id, 10) : null,
      pic_omi_id: pic_omi_id ? parseInt(pic_omi_id, 10) : null,
      ...(status && { status })
    };

    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { user_id: id },
      data: dataToUpdate,
      include: {
        role: true,
        division: true,
        picOmi: { select: { name: true } }
      }
    });

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error('Gagal update user:', error);
    return NextResponse.json(
      { message: 'Gagal update user', error: error.message },
      { status: 500 }
    );
  }
}
