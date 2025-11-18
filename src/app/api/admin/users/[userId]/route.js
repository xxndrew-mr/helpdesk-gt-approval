// Lokasi: app/api/admin/users/[userId]/route.js

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import bcrypt from 'bcryptjs';

// FUNGSI: Mengedit (UPDATE) user
// (Fungsi PUT tidak berubah, masih sama)
export async function PUT(request, context) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'Administrator') {
    return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 403 });
  }

  try {
    const { userId } = await context.params;
    const body = await request.json();
    const {
      name,
      email,
      password, // Password baru (opsional)
      role_id,
      division_id,
      jabatan,
      toko,
    } = body;

    // Cek data dasar
    if (!name || !email || !role_id) {
      return NextResponse.json(
        { message: 'Nama, email, dan role wajib diisi' },
        { status: 400 }
      );
    }

    // Siapkan data untuk di-update
    let dataToUpdate = {
      name,
      email,
      role_id: parseInt(role_id, 10),
      division_id: division_id ? parseInt(division_id, 10) : null,
      jabatan: jabatan || null,
      toko: toko || null,
    };

    if (password && password.length > 0) {
      const hashedPassword = await bcrypt.hash(password, 10);
      dataToUpdate.password = hashedPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { user_id: parseInt(userId, 10) },
      data: dataToUpdate,
      include: {
        role: true,
        division: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return NextResponse.json(
        { message: 'Email ini sudah digunakan oleh akun lain.' },
        { status: 409 } // 409 Conflict
      );
    }
    console.error('Gagal mengupdate user:', error);
    return NextResponse.json(
      { message: 'Gagal mengupdate user', error: error.message },
      { status: 500 }
    );
  }
}

// FUNGSI: Menonaktifkan (DELETE) user
// === PERUBAHAN LOGIKA INTI DI SINI ===
export async function DELETE(request, context) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'Administrator') {
    return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 403 });
  }

  try {
    const { userId } = await context.params;
    const userIdNum = parseInt(userId, 10);

    // Keamanan: Cek agar admin tidak bisa menghapus akunnya sendiri
    if (session.user.id === userIdNum) {
      return NextResponse.json(
        { message: 'Anda tidak bisa menonaktifkan akun Anda sendiri.' },
        { status: 400 }
      );
    }

    // BUKAN MENGHAPUS, TAPI MENG-UPDATE STATUS
    const updatedUser = await prisma.user.update({
      where: { user_id: userIdNum },
      data: {
        status: 'Inactive', // Set status menjadi Inactive
      },
      include: {
        role: true,
        division: true,
      }
    });

    // Kirim kembali data user yang sudah di-update
    return NextResponse.json(
      { message: 'User berhasil dinonaktifkan', user: updatedUser },
      { status: 200 }
    );
    
  } catch (error) {
    // Error P2003 (Foreign Key) seharusnya tidak terjadi lagi,
    // tapi kita tangani jika ada error lain
    console.error('Gagal menonaktifkan user:', error);
    return NextResponse.json(
      { message: 'Gagal menonaktifkan user', error: error.message },
      { status: 500 }
    );
  }
}