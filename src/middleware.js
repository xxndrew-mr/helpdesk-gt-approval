import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  // `withAuth` akan menangani logika otentikasi
  function middleware(req) {
    // Fungsi ini dipanggil HANYA jika user SUDAH terotentikasi
    // Kita bisa menambahkan logika role di sini nanti
    
    // Contoh: Dapatkan data session
    const { token } = req.nextauth;
    
    // Jika user adalah admin dan mencoba mengakses halaman non-admin (contoh)
    // if (req.nextUrl.pathname.startsWith('/user') && token.role !== 'User') {
    //   return NextResponse.redirect(new URL('/unauthorized', req.url));
    // }

    // Jika lolos, lanjutkan
    return NextResponse.next();
  },
  {
    callbacks: {
      // Tentukan apakah user diizinkan mengakses (cukup cek token)
      authorized: ({ token }) => !!token,
    },
    pages: {
      // Jika 'authorized' gagal, arahkan user ke halaman login
      signIn: '/login',
    },
  }
);

// Konfigurasi: Tentukan halaman mana yang harus dilindungi
export const config = {
  matcher: [
    // Lindungi semua rute di bawah /dashboard
    '/dashboard/:path*',
    // Anda bisa tambahkan rute lain di sini
  ],
};