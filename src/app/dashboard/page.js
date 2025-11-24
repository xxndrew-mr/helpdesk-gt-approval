'use client';

import { useSession } from 'next-auth/react';

export default function DashboardPage() {
  const { data: session } = useSession();

  if (!session || !session.user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-500 text-sm">
        Memuat data pengguna...
      </div>
    );
  }

  const user = session.user;

  return (
    <div className="space-y-8 px-1">

      {/* ===== Header Dashboard ===== */}
      <div className="relative overflow-hidden rounded-3xl bg-indigo-600 px-6 py-6 shadow-lg shadow-indigo-300/30">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Selamat Datang, {user.name}
        </h1>
        <p className="mt-1 text-sm text-indigo-100">
          Anda login sebagai <span className="font-medium">{user.role}</span>
        </p>

        {user.division && (
          <p className="text-sm text-indigo-100 mt-0.5">
            Divisi: <span className="font-medium">{user.division}</span>
          </p>
        )}

        {/* Accent gradient bubble */}
        <div className="pointer-events-none absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      </div>

      {/* ===== Card Body ===== */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">
          Overview Dashboard
        </h2>

        <p className="mt-3 text-slate-600 leading-relaxed">
          Selamat datang di panel Helpdesk GT. Dari sini, Anda dapat mengakses
          berbagai fitur sesuai dengan role yang Anda miliki.
        </p>

        <p className="mt-2 text-slate-600 leading-relaxed">
          Gunakan menu navigasi di sebelah kiri untuk membuka halaman Request,
          antrian tugas, riwayat Request, ataupun membuat Request baru.
        </p>

        <p className="mt-4 text-slate-500 text-sm">
          Jika Anda menemukan kendala, silakan hubungi Tim Support OMI.
        </p>
      </div>

    </div>
  );
}
