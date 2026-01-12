'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (session) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [session, status, router]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#eef2ff,_transparent_60%)]" />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center rounded-2xl border border-slate-200 bg-white px-8 py-10 shadow-xl shadow-indigo-100">
        
        {/* Logo / Brand */}
        <div className="mb-5 flex flex-col items-center">
          <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-white/10 backdrop-blur">
                          <img
                            src="/logo-login.png"
                            alt="Logo"
                            className="object-contain p-1.5"
                          />
                        </div>
          <h1 className="mt-3 text-sm font-semibold tracking-wide text-slate-800">
            Helpdesk GT
          </h1>
          <p className="text-[11px] text-slate-500">
            PT Onda Mega Integra
          </p>
        </div>

        {/* Loader */}
        <div className="relative mb-4 h-10 w-10">
          <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-slate-200 border-t-indigo-600" />
        </div>

        {/* Status Text */}
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-800">
            Memverifikasi akun Anda
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Menghubungkan ke sistem Helpdesk…
          </p>
        </div>
      </div>
    </div>
  );
}
