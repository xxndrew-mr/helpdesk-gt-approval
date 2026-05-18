'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  CloudArrowUpIcon,
  PaperClipIcon,
  XMarkIcon,
  UserIcon,
  BuildingStorefrontIcon,
  PhoneIcon,
  DocumentTextIcon,
  TagIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const categories = [
  { value: 'PRODUK', label: 'Produk', desc: 'Masalah seputar produk' },
  { value: 'PROGRAM PENJUALAN', label: 'Program Penjualan', desc: 'Promo & program aktif' },
  { value: 'KOMISI', label: 'Komisi', desc: 'Pertanyaan komisi' },
  { value: 'TOOLS PENJUALAN', label: 'Tools Penjualan', desc: 'Alat bantu penjualan' },
  { value: 'LAINNYA', label: 'Lainnya', desc: 'Pertanyaan lainnya' },
];

// ─── Field wrapper ────────────────────────────────────────────────────────────
const Field = ({ label, required, icon: Icon, hint, children }) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {label}
      {required && <span className="text-red-400 ml-0.5">*</span>}
      {hint && <span className="ml-auto text-[10px] font-semibold text-amber-500 normal-case tracking-normal">{hint}</span>}
    </label>
    {children}
  </div>
);

const inputCls = "block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-300 transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none";

// ─── Section wrapper ──────────────────────────────────────────────────────────
const Section = ({ icon: Icon, title, badge, children }) => (
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-3.5">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
          <Icon className="h-4 w-4 text-blue-600" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-600">{title}</span>
      </div>
      {badge && (
        <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-700">{badge}</span>
      )}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SubmitTicketPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [description, setDescription] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('');
  const [phone, setPhone] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [toko, setToko] = useState('');
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const isAttachmentRequired = selectedKategori === 'PRODUK';

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const allowedTypes = [
      'image/',
      'video/',
      'application/pdf',
    ];

    const isAllowed = allowedTypes.some((type) =>
      type.endsWith('/')
        ? f.type.startsWith(type)
        : f.type === type
    );

    if (!isAllowed) {
      alert('File harus berupa gambar, video, atau PDF');
      return;
    }

    if (f.size > 50 * 1024 * 1024) {
      alert('Ukuran file maksimal 50MB');
      return;
    }

    setFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (!session?.user) {
      setError('Session tidak ditemukan. Silakan login ulang.');
      setIsLoading(false);
      return;
    }
    if (isAttachmentRequired && !file) {
      setError('Lampiran / foto wajib diisi untuk kategori PRODUK.');
      setIsLoading(false);
      return;
    }

    try {
      let attachments = null;
      if (file) {
        const fd = new FormData();
        fd.append('file', file);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.message || 'Gagal mengupload lampiran');
        attachments = [{ url: uploadData.fileUrl, name: file.name, type: file.type, fileId: uploadData.fileId }];
      }

      const res = await fetch('/api/tickets/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedKategori || description.slice(0, 50),
          description,
          kategori: selectedKategori,
          jabatan: jabatan || null,
          toko: toko || null,
          attachments,
          phone,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal submit Request');

      setSuccess('Laporan Anda berhasil dikirim ke sistem.');
      setDescription(''); setSelectedKategori(''); setJabatan('');
      setToko(''); setFile(null); setPhone('');
      setTimeout(() => router.push('/dashboard/my-tickets'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Guards ──────────────────────────────────────────────────────────────────
  if (!session) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2 text-sm font-medium text-blue-500 animate-pulse">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-500" />
          Memuat formulir...
        </div>
      </div>
    );
  }

  if (!['Salesman', 'Agen'].includes(session.user.role)) {
    return (
      <div className="mx-auto max-w-lg mt-16 px-4">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 flex items-start gap-4 text-red-700">
          <ExclamationCircleIcon className="h-6 w-6 mt-0.5 shrink-0" />
          <div>
            <h3 className="font-bold">Akses Ditolak</h3>
            <p className="text-sm mt-0.5 text-red-600/80">Hanya Salesman atau Agen yang dapat membuat laporan baru.</p>
          </div>
        </div>
      </div>
    );
  }

  const effectiveUserRole = session.user.role;
  const charCount = description.length;
  const selectedCatObj = categories.find((c) => c.value === selectedKategori);

  return (
    <div className="min-h-screen bg-slate-50/60">

      {/* ── Hero banner ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0d2444] via-[#133567] to-[#0a3d62] px-6 py-8 text-white">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-sky-300/10 blur-2xl" />
        <div className="relative mx-auto max-w-4xl">
          <div className="flex items-center gap-2 text-blue-300/60 mb-2">
            <ShieldCheckIcon className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Onda Care · Support</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">Buat Laporan Baru</h1>
          <p className="mt-1 text-sm text-blue-100/60 max-w-md">
            Sampaikan kendala atau permintaan Anda kepada tim support Onda Care.
          </p>
        </div>
      </div>

      {/* ── Form ────────────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="mx-auto max-w-4xl px-4 py-7 animate-in fade-in slide-in-from-bottom-3 duration-500">

        {/* Status alerts */}
        {(error || success) && (
          <div className={`mb-5 flex items-start gap-3 rounded-2xl border p-4 text-sm font-medium animate-in zoom-in-95 duration-300 ${error ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'
            }`}>
            {error
              ? <ExclamationCircleIcon className="h-5 w-5 shrink-0 mt-0.5" />
              : <CheckCircleIcon className="h-5 w-5 shrink-0 mt-0.5" />}
            {error || success}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

          {/* ── Left / Main ─────────────────────────────────────────────── */}
          <div className="space-y-5 lg:col-span-2">

            {/* Identitas */}
            <Section icon={UserIcon} title={`Identitas Pelapor`} badge={effectiveUserRole}>
              {/* Session chip */}
              <div className="mb-4 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/70 px-3.5 py-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-sm font-black text-white shadow-md shadow-blue-500/30 uppercase">
                  {session.user.name?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-blue-900">{session.user.name}</p>
                  <p className="text-xs text-blue-500">{session.user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Nama Lengkap" required>
                  <input
                    type="text"
                    value={session.user.name || ''}
                    readOnly
                    className={`${inputCls} cursor-not-allowed bg-slate-50 text-slate-400`}
                  />
                </Field>

                {effectiveUserRole === 'Salesman' ? (
                  <Field label="Toko / Wilayah" icon={BuildingStorefrontIcon}>
                    <input
                      type="text"
                      value={toko}
                      onChange={(e) => setToko(e.target.value)}
                      placeholder="Nama toko yang dikunjungi"
                      className={inputCls}
                    />
                  </Field>
                ) : (
                  <Field label="Peran di Toko" required>
                    <input
                      type="text"
                      value={jabatan}
                      onChange={(e) => setJabatan(e.target.value)}
                      required
                      placeholder="Contoh: Pemilik / Karyawan"
                      className={inputCls}
                    />
                  </Field>
                )}

                <div className="sm:col-span-2">
                  <Field label="No. Telepon / WhatsApp" required icon={PhoneIcon}>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      required
                      className={inputCls}
                    />
                  </Field>
                </div>
              </div>
            </Section>

            {/* Detail Laporan */}
            <Section icon={DocumentTextIcon} title="Detail Laporan">
              <div className="space-y-4">

                {/* Category pills */}
                <Field label="Kategori" required icon={TagIcon}>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 mt-1">
                    {categories.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setSelectedKategori(cat.value)}
                        className={`group relative flex flex-col items-start rounded-xl border p-3 text-left transition-all ${selectedKategori === cat.value
                            ? 'border-blue-500 bg-blue-50 shadow-sm shadow-blue-100 ring-2 ring-blue-500/20'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                          }`}
                      >
                        <span className={`text-xs font-bold ${selectedKategori === cat.value ? 'text-blue-700' : 'text-slate-700'}`}>
                          {cat.label}
                        </span>
                        <span className="mt-0.5 text-[10px] text-slate-400 leading-tight">{cat.desc}</span>
                        {selectedKategori === cat.value && (
                          <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-white">
                            <CheckCircleIcon className="h-3 w-3" />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                  {/* Hidden required select for form validation */}
                  <select value={selectedKategori} onChange={() => { }} required className="sr-only" tabIndex={-1}>
                    <option value="" />
                    {categories.map((c) => <option key={c.value} value={c.value} />)}
                  </select>
                </Field>

                <Field label="Deskripsi Lengkap" required>
                  <div className="relative">
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      rows={5}
                      placeholder="Ceritakan detail kendala, lokasi, atau bantuan yang dibutuhkan secara jelas..."
                      className={`${inputCls} resize-none`}
                    />
                    <span className={`absolute bottom-2.5 right-3 text-[10px] font-medium ${charCount > 0 ? 'text-slate-400' : 'text-slate-300'}`}>
                      {charCount} karakter
                    </span>
                  </div>
                </Field>
              </div>
            </Section>
          </div>

          {/* ── Right / Sidebar ─────────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Attachment */}
            <Section
              icon={PaperClipIcon}
              title="Lampiran"
              badge={isAttachmentRequired ? 'Wajib' : 'Opsional'}
            >
              {!file ? (
                <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-all group ${isAttachmentRequired
                    ? 'border-amber-300 bg-amber-50/50 hover:bg-amber-50 hover:border-amber-400'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-blue-50 hover:border-blue-300'
                  }`}>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl mb-2 transition-transform group-hover:scale-110 ${isAttachmentRequired ? 'bg-amber-100' : 'bg-white shadow-sm'
                    }`}>
                    <CloudArrowUpIcon className={`h-5 w-5 ${isAttachmentRequired ? 'text-amber-600' : 'text-blue-600'}`} />
                  </div>
                  <p className="text-xs font-semibold text-slate-600">Klik untuk upload</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    PNG, JPG, PDF, Video · Max 50MB
                  </p>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*,video/*,application/pdf"
                  />
                </label>
              ) : (
                <div className="relative rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50 p-3.5 animate-in zoom-in-95 duration-200">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-500/30">
                      <PaperClipIcon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-blue-900 truncate">{file.name}</p>
                      <p className="text-[10px] text-blue-500 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-red-400 shadow-sm hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <XMarkIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </Section>

            {/* Summary card */}
            {selectedCatObj && (
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 animate-in fade-in zoom-in-95 duration-300 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Kategori dipilih</p>
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-bold text-white">{selectedCatObj.label}</span>
                </div>
                <p className="text-[11px] text-blue-600/70">{selectedCatObj.desc}</p>
              </div>
            )}

            {/* Submit */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="p-4 space-y-4">
                <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500">
                  <InformationCircleIcon className="h-4 w-4 shrink-0 text-blue-400 mt-0.5" />
                  Pastikan semua data yang Anda isi sudah benar sebelum mengirim laporan.
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-all hover:shadow-blue-600/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                >
                  <span className="relative flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Mengirim...
                      </>
                    ) : (
                      <>
                        Kirim Laporan
                        <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>

            {/* Help */}
            <div className="rounded-2xl border border-slate-100 bg-white p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Butuh Bantuan?</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Jika mengalami kendala saat mengisi formulir, silakan hubungi Tim IT OMI via WhatsApp Group.
              </p>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
}