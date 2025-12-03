// Lokasi: src/app/login/page.jsx

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
import { Eye, EyeOff } from 'lucide-react';

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
    //mobile: putih, desktop: gelap
    <div className="relative flex min-h-screen bg-white lg:bg-slate-950">
      <div className="pointer-events-none absolute inset-0 hidden lg:block">
        <div className="absolute inset-y-0 left-0 w-1/2">
          <div className="absolute inset-0 bg-blue-900/100" />
        </div>

        {/* Gradient overlay global */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.25),_transparent_55%),_radial-gradient(circle_at_bottom,_rgba(15,23,42,0.9),_rgba(15,23,42,1))]" />
      </div>

      {/* Grid layout responsif */}
      <div className="relative z-10 flex w-full flex-col lg:flex-row">
        {/* Panel kiri (branding & tagline) – hanya desktop */}
        <div className="hidden lg:flex w-1/2 items-center justify-center px-12">
          <div className="max-w-md text-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-white/10 backdrop-blur">
                <Image
                  src="/logo-login.png"
                  alt="Logo"
                  fill
                  className="object-contain p-1.5"
                />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-indigo-200/80">
                  Helpdesk GT
                </p>
                <p className="text-sm font-semibold text-indigo-50">
                  PT Onda Mega Integra
                </p>
              </div>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-50">
              Satu portal untuk semua{' '}
              <span className="bg-gradient-to-r from-indigo-300 to-sky-300 bg-clip-text text-transparent">
                request &amp; feedback
              </span>
              .
            </h1>

            <p className="mt-4 text-sm leading-relaxed text-slate-300/90">
              Pantau request, feedback, dan tingkatkan kolaborasi antar
              tim di lingkungan PT Onda Mega Integra.
            </p>      
          </div>
        </div>

        {/* Panel kanan (form login) – cerah */}
    <div className="flex w-full lg:w-1/2 items-center justify-center px-4 py-10 sm:px-6 lg:px-10 bg-white min-h-screen lg:min-h-0">

          <div className="w-full max-w-md">
            {/* Logo & heading (mobile) */}
            <div className="mb-6 flex flex-col items-center text-center lg:hidden">
              <div className="relative mb-3 h-14 w-14 overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-slate-200">
                <Image
                  src="/logo-login.png"
                  alt="Logo"
                  fill
                  className="object-contain p-2"
                />
              </div>
              <p className="text-xs uppercase tracking-[0.20em] text-indigo-600 font-medium">
                Helpdesk GT
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                PT Onda Mega Integra
              </p>
            </div>

            <Card className="border-slate-200 bg-white shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-slate-900">
                  Masuk ke Helpdesk GT
                </CardTitle>
                <CardDescription className="text-xs text-slate-600">
                  Gunakan kredensial yang diberikan oleh admin untuk mengakses dashboard.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {error && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">
                    <span className="mt-1 inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Username */}
                <div className="space-y-1.5">
                  <Label htmlFor="username" className="text-xs text-slate-700">
                    Username
                  </Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xs text-slate-400">
                      @
                    </span>
                    <Input
                      id="username"
                      type="text"
                      autoComplete="username"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-7 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-indigo-500"
                      placeholder="Masukkan username Anda"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs text-slate-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-9 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-indigo-500"
                      placeholder="Masukkan password Anda"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Hint kecil */}
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Hubungi admin IT jika Anda lupa password.</span>
                </div>

                {/* Tombol Login */}
                <Button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="mt-2 w-full rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow-md hover:bg-indigo-500 disabled:bg-slate-400"
                >
                  {isLoading ? (
                    <>
                      <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-[2px] border-white/40 border-t-white" />
                      Memproses...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>
              </CardContent>
            </Card>

            <p className="mt-4 text-center text-[11px] text-slate-500">
              © {new Date().getFullYear()} PT Onda Mega Integra · Helpdesk GT
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
