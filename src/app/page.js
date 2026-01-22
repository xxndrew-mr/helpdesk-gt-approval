'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';
import { Loader2, ShieldCheck } from 'lucide-react';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    // Logika pengalihan tetap sama
    if (session) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [session, status, router]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white">
      
      {/* 1. BACKGROUND DECORATION (Sesuai tema Dashboard) */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -left-[10%] -top-[10%] h-[40%] w-[40%] rounded-full bg-blue-50 blur-[120px]" />
        <div className="absolute -right-[10%] -bottom-[10%] h-[40%] w-[40%] rounded-full bg-indigo-50 blur-[120px]" />
      </div>

      {/* 2. LOADING CARD */}
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center px-8 animate-in fade-in zoom-in-95 duration-1000">
        
        {/* Logo Container with Pulse Effect */}
        <div className="relative mb-8 flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-3xl bg-blue-100 opacity-20 duration-[2000ms]" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-white p-4 shadow-2xl shadow-blue-200/50 ring-1 ring-slate-100">
            <Image
              src="/logo-login.png"
              alt="Onda Logo"
              width={60}
              height={60}
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Brand Text */}
        <div className="mb-10 text-center">
          <h1 className="text-xl font-black uppercase tracking-[0.3em] text-blue-900">
            Onda Care
          </h1>
          <div className="mt-1 flex items-center justify-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-blue-400" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              PT Onda Mega Integra
            </p>
            <span className="h-1 w-1 rounded-full bg-blue-400" />
          </div>
        </div>

        {/* Loader & Status */}
        <div className="flex w-full flex-col items-center rounded-[32px] border border-slate-100 bg-white/50 p-6 backdrop-blur-sm shadow-xl shadow-slate-200/40">
          <div className="mb-4 flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-sm font-bold text-slate-700">Verifikasi Sesi...</span>
          </div>
          
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-1/2 animate-[loading_1.5s_ease-in-out_infinite] rounded-full bg-blue-600" />
          </div>

          <div className="mt-4 flex items-center gap-2 text-[10px] font-medium text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            Terhubung dengan Protokol Keamanan OMI
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-12 text-[10px] font-bold uppercase tracking-widest text-slate-300">
          Version 2.0.4 • Workspace
        </p>
      </div>

      {/* Custom Styles for the progress bar animation */}
      <style jsx>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}