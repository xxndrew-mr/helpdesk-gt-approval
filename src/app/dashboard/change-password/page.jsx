'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  KeyIcon, 
  LockClosedIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // State untuk show/hide password
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
    <div className="mx-auto max-w-xl px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="mb-8 flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm border border-blue-100">
          <KeyIcon className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Pengaturan Keamanan
          </h1>
          <p className="text-sm text-slate-500">
            Ganti kata sandi Anda secara berkala untuk menjaga keamanan akun.
          </p>
        </div>
      </div>

      {/* Main Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
        <div className="bg-slate-50/50 border-b border-slate-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-slate-700">Formulir Perubahan Password</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Status Messages */}
          {error && (
            <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 animate-in zoom-in-95 duration-300">
              <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 animate-in zoom-in-95 duration-300">
              <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
              <p className="font-medium">{success}</p>
            </div>
          )}

          {/* Password Saat Ini */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Password Saat Ini
            </label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                <LockClosedIcon className="h-5 w-5" />
              </div>
              <input
                type={showCurrent ? "text" : "password"}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                required
                placeholder="Masukkan password lama"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/30 pl-10 pr-12 py-3 text-sm transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                {showCurrent ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="h-px bg-slate-100 w-full" />

          {/* Password Baru */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Password Baru
            </label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                <KeyIcon className="h-5 w-5" />
              </div>
              <input
                type={showNew ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                required
                minLength={8}
                placeholder="Minimal 8 karakter"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/30 pl-10 pr-12 py-3 text-sm transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                {showNew ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 px-1">
              Tips: Gunakan kombinasi huruf besar, kecil, dan angka.
            </p>
          </div>

          {/* Konfirmasi Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Konfirmasi Password Baru
            </label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                <CheckCircleIcon className="h-5 w-5" />
              </div>
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Ulangi password baru"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/30 pl-10 pr-12 py-3 text-sm transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                {showConfirm ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="
                relative flex w-full items-center justify-center gap-3
                rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white
                shadow-lg shadow-blue-200 transition-all duration-200
                hover:bg-blue-700 hover:shadow-blue-300
                active:scale-[0.98]
                disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none
              "
            >
              {isLoading ? (
                <>
                  <ArrowPathIcon className="h-5 w-5 animate-spin" />
                  Memproses...
                </>
              ) : (
                'Simpan Perubahan Password'
              )}
            </button>
            
            <button
              type="button"
              onClick={() => router.back()}
              className="mt-3 w-full text-center text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
            >
              Batal dan Kembali
            </button>
          </div>
        </form>
      </div>

      {/* Footer Info */}
      <div className="mt-8 rounded-xl bg-amber-50 border border-amber-100 p-4">
        <div className="flex gap-3">
          <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <p className="text-xs leading-relaxed text-amber-800">
            <span className="font-bold uppercase">Catatan Penting:</span> Setelah mengganti password, sesi aktif Anda di perangkat lain mungkin akan berakhir. Simpan password baru Anda di tempat yang aman.
          </p>
        </div>
      </div>
    </div>
  );
}