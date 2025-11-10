'use client'; // WAJIB, karena kita butuh hook (useSession, etc)

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // --- 1. Gerbang Keamanan (Perlindungan Sisi Klien) ---
  useEffect(() => {
    // Jika status BUKAN 'loading' DAN session-nya tidak ada (null)
    if (status !== 'loading' && !session) {
      // User tidak login, tendang ke halaman login
      router.replace('/login');
    }
  }, [session, status, router]);

  // --- 2. Tampilan Loading ---
  // Tampilkan ini saat session sedang diverifikasi
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Memverifikasi sesi...
      </div>
    );
  }

  // --- 3. Tampilan Halaman (Jika Sudah Login) ---
  // Jika status BUKAN 'loading' DAN user ADA
  if (status === 'authenticated' && session.user) {
    const user = session.user; // Data user (termasuk role & division)

    // Fungsi untuk Cek Link Aktif (untuk styling sidebar)
    const isActive = (path) => pathname === path;

    return (
      <div className="flex h-screen bg-gray-100">
        {/* === SIDEBAR (MENU KIRI) === */}
        <div className="hidden md:flex w-64 flex-col bg-gray-800 text-white">
          <div className="flex items-center justify-center h-16 bg-gray-900 shadow-md">
            <span className="text-xl font-bold">Helpdesk GT</span>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <Link
              href="/dashboard"
              className={`block px-4 py-2 rounded-md ${
                isActive('/dashboard')
                  ? 'bg-blue-600'
                  : 'hover:bg-gray-700'
              }`}
            >
              Dashboard
            </Link>

            {/* --- Menu Berdasarkan Role --- */}

            {/* Menu Salesman */}
            {user.role === 'Salesman' && (
              <>
                <Link
                  href="/dashboard/submit"
                  className={`block px-4 py-2 rounded-md ${
                    isActive('/dashboard/submit')
                      ? 'bg-blue-600'
                      : 'hover:bg-gray-700'
                  }`}
                >
                  Submit Tiket Baru
                </Link>
                <Link
                  href="/dashboard/my-tickets"
                  className={`block px-4 py-2 rounded-md ${
                    isActive('/dashboard/my-tickets')
                      ? 'bg-blue-600'
                      : 'hover:bg-gray-700'
                  }`}
                >
                  Riwayat Tiket Saya
                </Link>
              </>
            )}

            {/* Menu PIC OMI */}
            {(user.role === 'PIC OMI') && (
              <Link
                href="/dashboard/queue"
                className={`block px-4 py-2 rounded-md ${
                  isActive('/dashboard/queue')
                    ? 'bg-blue-600'
                    : 'hover:bg-gray-700'
                }`}
              >
                Antrian Triase
              </Link>
            )}

            {/* Menu Manajerial (SM, AM, AP) */}
            {(user.role === 'Sales Manager' ||
              user.role === 'Acting Manager' ||
              user.role === 'Acting PIC') && (
              <Link
                href="/dashboard/queue"
                className={`block px-4 py-2 rounded-md ${
                  isActive('/dashboard/queue')
                    ? 'bg-blue-600'
                    : 'hover:bg-gray-700'
                }`}
              >
                Antrian Tugas Saya
              </Link>
            )}
            
            {/* Menu User Feedback */}
            {(user.role === 'User Feedback' || user.role === 'PIC OMI' || user.role === 'Sales Manager') && (
              <Link
                href="/dashboard/feedback"
                className={`block px-4 py-2 rounded-md ${
                  isActive('/dashboard/feedback')
                    ? 'bg-blue-600'
                    : 'hover:bg-gray-700'
                }`}
              >
                Antrian Feedback
              </Link>
            )}

            {/* Menu Admin */}
            {user.role === 'Administrator' && (
              <Link
                href="/dashboard/admin/users"
                className={`block px-4 py-2 rounded-md ${
                  isActive('/dashboard/admin/users')
                    ? 'bg-blue-600'
                    : 'hover:bg-gray-700'
                }`}
              >
                Manajemen User
              </Link>
            )}
          </nav>
        </div>

        {/* === AREA KONTEN UTAMA (KANAN) === */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* --- HEADER (BILAH ATAS) --- */}
          <header className="flex justify-between items-center h-16 bg-white shadow-md px-6">
            <div className="text-gray-800">
              {/* Nanti bisa diisi judul halaman */}
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-gray-700 text-sm">
                Halo, <span className="font-semibold">{user.name}</span> (
                {user.role})
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </header>

          {/* --- KONTEN HALAMAN (CHILDREN) --- */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // Jika status BUKAN 'loading' dan BUKAN 'authenticated' (misal: error)
  // Ini akan ditangani oleh useEffect di atas, tapi sebagai fallback:
  return null;
}