import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import bcrypt from 'bcryptjs';

// FUNGSI: Mengedit (UPDATE) user
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
      username, // <-- BARU
      email,
      password,
      role_id,
      division_id,
      pic_omi_id, // <-- BARU
      status // Opsional (untuk aktifkan kembali)
    } = body;

    // Cek data dasar
    if (!name || !username || !role_id) {
      return NextResponse.json(
        { message: 'Nama, username, dan role wajib diisi' },
        { status: 400 }
      );
    }

    // Siapkan data untuk di-update
    let dataToUpdate = {
      name,
      username,
      email: email || null,
      role_id: parseInt(role_id, 10),
      division_id: division_id ? parseInt(division_id, 10) : null,
      pic_omi_id: pic_omi_id ? parseInt(pic_omi_id, 10) : null,
    };

    // Jika status dikirim (misal untuk mengaktifkan kembali)
    if (status) {
        dataToUpdate.status = status;
    }

    // --- Logika Ganti Password (HANYA JIKA DIISI) ---
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
        picOmi: { select: { name: true } }
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    // Tangani error username/email duplikat
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

// FUNGSI: Menonaktifkan (DELETE) user
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
        picOmi: { select: { name: true } }
      }
    });

    return NextResponse.json(
      { message: 'User berhasil dinonaktifkan', user: updatedUser },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Gagal menonaktifkan user:', error);
    return NextResponse.json(
      { message: 'Gagal menonaktifkan user', error: error.message },
      { status: 500 }
    );
  }
}