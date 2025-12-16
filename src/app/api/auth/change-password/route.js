import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: 'Semua field wajib diisi' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ message: 'Password baru minimal 8 karakter' }, { status: 400 });
    }

    // Ambil user dari database untuk mendapatkan password hash saat ini
    const user = await prisma.user.findUnique({
      where: { user_id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ message: 'User tidak ditemukan' }, { status: 404 });
    }

    // Verifikasi password lama
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Password lama salah' }, { status: 400 });
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password di database
    await prisma.user.update({
      where: { user_id: session.user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: 'Password berhasil diubah' }, { status: 200 });

  } catch (error) {
    console.error('Gagal ganti password:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}