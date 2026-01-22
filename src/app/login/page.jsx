'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// shadcn/ui components
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// ikon lucide
import { Eye, EyeOff, User, Lock, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (result?.ok) {
        router.push('/dashboard');
      } else {
        setError('Login gagal. Periksa username dan password Anda.');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Terjadi kesalahan saat login.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white lg:bg-slate-50">
      {/* 
          PANEL KIRI: Branding (Hanya muncul di Desktop)
          Menggunakan Gradient yang konsisten dengan Dashboard Hero
      */}
      <div className="relative hidden lg:flex w-1/2 items-center justify-center bg-blue-900 overflow-hidden">
        {/* Dekorasi Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-900 to-indigo-950" />
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        
        {/* Konten Branding */}
        <div className="relative z-10 w-full max-w-lg px-12">
          <div className="flex items-center gap-4 mb-10 animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-white p-2 shadow-2xl ring-4 ring-white/10">
              <Image
                src="/logo-login.png"
                alt="Logo"
                fill
                className="object-contain p-2"
                priority
              />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-300">
                ONDA CARE
              </p>
              <p className="text-lg font-bold text-white">
                PT Onda Mega Integra
              </p>
            </div>
          </div>

          <div className="space-y-6 animate-in fade-in slide-in-from-left-6 duration-1000 delay-100">
            <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
              Aplikasi saran dan masukan{' '}
              <span className="bg-gradient-to-r from-blue-300 to-sky-300 bg-clip-text text-transparent">
                salesman produk ONDA
              </span>
              .
            </h1>

            <p className="text-lg leading-relaxed text-blue-100/80">
              Portal resmi bagi salesman untuk menyampaikan saran, kendala, dan ide
              pengembangan produk agar komunikasi dengan tim internal ONDA lebih cepat,
              terarah, dan terdokumentasi.
            </p>
          </div>
          
          <div className="mt-20 pt-10 border-t border-white/10 text-blue-200/50 text-xs">
            © {new Date().getFullYear()} PT Onda Mega Integra. All rights reserved.
          </div>
        </div>
      </div>

      {/* 
          PANEL KANAN: Form Login 
          Responsif: Full screen di mobile, center card di desktop
      */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12 lg:p-20">
        <div className="w-full max-w-[400px] animate-in fade-in zoom-in-95 duration-500">
          
          {/* Header Mobile Only */}
          <div className="mb-10 flex flex-col items-center text-center lg:hidden">
            <div className="relative mb-4 h-16 w-16 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-100">
              <Image
                src="/logo-login.png"
                alt="Logo"
                fill
                className="object-contain p-3"
              />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600">
              ONDA CARE
            </p>
            <p className="mt-1 text-base font-bold text-slate-900">
              PT Onda Mega Integra
            </p>
          </div>

          <Card className="border-none shadow-2xl shadow-slate-200/60 lg:shadow-none lg:bg-transparent">
            <CardHeader className="space-y-1 lg:p-0 lg:mb-8">
              <CardTitle className="text-2xl font-black tracking-tight text-slate-900">
                Masuk ke Onda Care
              </CardTitle>
              <CardDescription className="text-slate-500">
                Gunakan kredensial yang diberikan oleh admin untuk mengakses dashboard.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5 lg:p-0">
              {/* Alert Error */}
              {error && (
                <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-xs font-medium text-red-600 animate-in shake duration-300">
                  <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-xs font-bold uppercase tracking-wider text-slate-600 ml-1">
                    Username
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                      <User className="h-4 w-4" />
                    </div>
                    <Input
                      id="username"
                      type="text"
                      autoComplete="username"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="h-12 pl-11 rounded-xl border-slate-200 bg-slate-50 focus:bg-white transition-all focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none"
                      placeholder="Masukkan username"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-600 ml-1">
                    Password
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                      <Lock className="h-4 w-4" />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 pl-11 pr-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white transition-all focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-blue-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Tombol Login */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 mt-4 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:shadow-blue-600/30 active:scale-[0.98] transition-all disabled:bg-slate-300 disabled:shadow-none"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Memproses...
                    </div>
                  ) : (
                    'Masuk Sekarang'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <footer className="mt-10 text-center">
             <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300 lg:text-slate-400">
               © {new Date().getFullYear()} PT Onda Mega Integra · Onda Care 2.0
             </p>
          </footer>
        </div>
      </div>
    </div>
  );
}