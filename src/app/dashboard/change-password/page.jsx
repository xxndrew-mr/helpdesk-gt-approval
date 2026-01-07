'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyIcon, LockClosedIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Konfirmasi password baru tidak sesuai.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Gagal mengubah password');
      }

      setSuccess('Password berhasil diperbarui. Demi keamanan, silakan login ulang.');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
          <KeyIcon className="h-6 w-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Ganti Password
          </h1>
          <p className="text-sm text-slate-500">
            Pastikan password baru Anda kuat dan mudah diingat.
          </p>
        </div>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <CheckCircleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* Password Lama */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Password Saat Ini
            </label>
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                required
                placeholder="Masukkan password lama"
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          </div>

          {/* Password Baru */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Password Baru
            </label>
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                required
                minLength={8}
                placeholder="Minimal 8 karakter"
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Gunakan kombinasi huruf, angka, dan simbol untuk keamanan lebih baik.
            </p>
          </div>

          {/* Konfirmasi */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Konfirmasi Password Baru
            </label>
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Ulangi password baru"
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="
              group relative flex w-full items-center justify-center gap-2
              rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500
              px-4 py-3 text-sm font-semibold text-white
              shadow-lg shadow-indigo-200
              transition-all duration-200
              hover:from-indigo-500 hover:to-indigo-400
              active:scale-[0.98]
              focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-indigo-500
              focus-visible:ring-offset-2
              disabled:cursor-not-allowed
              disabled:from-slate-400 disabled:to-slate-400
              disabled:shadow-none
            "
          >
            {isLoading ? 'Memproses perubahan...' : 'Perbarui Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
