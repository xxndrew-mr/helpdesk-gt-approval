'use client'; // Ini adalah Komponen Klien

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Cek status otentikasi
    if (status === 'loading') {
      // 'loading' -> Masih mengecek session, jangan lakukan apa-apa
      return;
    }

    if (session) {
      // 'authenticated' -> User sudah login, arahkan ke dashboard
      router.replace('/dashboard');
    } else {
      // 'unauthenticated' -> User belum login, arahkan ke halaman login
      router.replace('/login');
    }
  }, [session, status, router]);

  // Tampilkan layar loading saat session sedang dicek
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-lg font-medium text-gray-700">
        Memuat aplikasi...
      </div>
    </div>
  );
}