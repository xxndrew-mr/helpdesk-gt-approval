import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import bcrypt from 'bcryptjs';

// ================================
// UPDATE USER
// ================================
export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'Administrator') {
    return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 403 });
  }

  try {
    const userId = parseInt(params.userId, 10);
    const body = await request.json();

    const {
      name,
      username,
      email,
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

    let dataToUpdate = {
      name,
      username,
      email: email || null,
      role_id: parseInt(role_id, 10),
      division_id: division_id ? parseInt(division_id, 10) : null,
      pic_omi_id: pic_omi_id ? parseInt(pic_omi_id, 10) : null,
    };

    if (status) {
      dataToUpdate.status = status;
    }

    if (password && password.length > 0) {
      const hashedPassword = await bcrypt.hash(password, 10);
      dataToUpdate.password = hashedPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { user_id: userId },
      data: dataToUpdate,
      include: {
        role: true,
        division: true,
        picOmi: { select: { name: true } }
      }
    });

    return NextResponse.json(updatedUser);

  } catch (error) {
    if (error.code === 'P2002') {
      const target = error.meta?.target?.[0] || 'Field';
      return NextResponse.json(
        { message: `${target} ini sudah digunakan oleh akun lain.` },
        { status: 409 }
      );
    }

    console.error('Gagal mengupdate user:', error);
    return NextResponse.json(
      { message: 'Gagal mengupdate user', error: error.message },
      { status: 500 }
    );
  }
}

// ================================
// SOFT DELETE (INACTIVE)
// ================================
export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'Administrator') {
    return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 403 });
  }

  try {
    const userId = parseInt(params.userId, 10);

    if (session.user.id === userId) {
      return NextResponse.json(
        { message: 'Anda tidak bisa menonaktifkan akun Anda sendiri.' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { user_id: userId },
      data: { status: 'Inactive' },
      include: {
        role: true,
        division: true,
        picOmi: { select: { name: true } }
      }
    });

    return NextResponse.json({
      message: 'User berhasil dinonaktifkan',
      user: updatedUser
    });

  } catch (error) {
    console.error('Gagal menonaktifkan user:', error);
    return NextResponse.json(
      { message: 'Gagal menonaktifkan user', error: error.message },
      { status: 500 }
    );
  }
}
