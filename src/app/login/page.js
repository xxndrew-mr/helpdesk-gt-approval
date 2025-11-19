// Lokasi: src/app/login/page.jsx

'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
    <div
      className="relative flex min-h-screen items-center justify-center bg-slate-100"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/onda-office.jpg')" }}
      />
      <div className="absolute inset-0 bg-white/90 backdrop-blur-[2px]" />

      {/* Konten utama */}
      <div className="relative w-full max-w-md px-4">
        {/* Logo / Title */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex items-center justify-center mb-4">
            <img
              src="/logo-login.png"         // logo brand (letakkan di public/logo-login.png)
              alt="Logo"
              className="h-16 w-16 object-contain"
            />
          </div>

          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
            PT ONDA MEGA INTEGRA
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Masuk untuk mengelola Request &amp; Feedback Anda.
          </p>
        </div>

        {/* Card Login */}
        <div className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-lg shadow-slate-300/60 backdrop-blur">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-slate-800">
                Username
              </label>
              <div className="mt-1 relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-slate-400 text-sm">@</span>
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-8 pr-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  placeholder="Masukkan username Anda"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-800">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                placeholder="Masukkan password Anda"
              />
            </div>

            {/* Hint kecil */}
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Gunakan kredensial yang diberikan oleh admin.</span>
            </div>

            {/* Tombol Login */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-100 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isLoading ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-[2px] border-white/40 border-t-white mr-2" />
                    Memproses...
                  </>
                ) : (
                  'Login'
                )}
              </button>
            </div>
          </form>
        </div>

        <p className="mt-4 text-center text-[11px] text-slate-500">
          © {new Date().getFullYear()} PT Onda Mega Integra · Helpdesk GT
        </p>
      </div>
    </div>
  );
}
