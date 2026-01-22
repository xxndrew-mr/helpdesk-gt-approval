'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const categories = [
  'PRODUK',
  'PROGRAM PENJUALAN',
  'KOMISI',
  'TOOLS PENJUALAN',
  'LAINNYA',
];

export default function SubmitTicketPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [description, setDescription] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('');
  const isAttachmentRequired = selectedKategori === 'PRODUK';

  const [namaPengisi, setNamaPengisi] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [toko, setToko] = useState('');
  const [noTelepon, setNoTelepon] = useState('');

  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (selectedFile.size > maxSize) {
      alert('Ukuran file maksimal 5MB');
      return;
    }
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (!session || !session.user) {
      setError('Session tidak ditemukan. Silakan login ulang.');
      setIsLoading(false);
      return;
    }

    if (session.user.role === 'Agen' && (!namaPengisi || !jabatan)) {
      setError('Agen wajib mengisi Nama Pengisi dan Jabatan.');
      setIsLoading(false);
      return;
    }
    if (!noTelepon) {
      setError('Nomor Telepon/WA wajib diisi.');
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
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.message || 'Gagal mengupload lampiran');
        attachments = [{ url: uploadData.fileUrl, name: file.name, type: file.type, fileId: uploadData.fileId }];
      }

      const autoTitle = selectedKategori || description.slice(0, 50);

      const res = await fetch('/api/tickets/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: autoTitle,
          description,
          kategori: selectedKategori,
          nama_pengisi: namaPengisi || null,
          jabatan: jabatan || null,
          toko: toko || null,
          no_telepon: noTelepon,
          attachments,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal submit Request');

      setSuccess('Laporan Anda berhasil dikirim ke sistem.');
      setDescription('');
      setSelectedKategori('');
      setNamaPengisi('');
      setJabatan('');
      setToko('');
      setNoTelepon('');
      setFile(null);

      setTimeout(() => {
        router.push('/dashboard/my-tickets');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) return <div className="flex justify-center py-20 animate-pulse text-blue-600 font-medium">Memuat formulir...</div>;

  if (!['Salesman', 'Agen'].includes(session.user.role)) {
    return (
      <div className="mx-auto max-w-2xl mt-10 p-6 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-4 text-red-700">
        <ExclamationCircleIcon className="h-8 w-8" />
        <div>
          <h3 className="font-bold">Akses Ditolak</h3>
          <p className="text-sm">Hanya Salesman atau Agen yang dapat membuat laporan baru.</p>
        </div>
      </div>
    );
  }

  const effectiveUserRole = session.user.role;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER SECTION */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Buat Laporan Baru</h1>
        <p className="mt-2 text-slate-600">Sampaikan kendala atau permintaan Anda kepada tim support Onda Care.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: MAIN FORM */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* STATUS MESSAGES */}
          {(error || success) && (
            <div className={`rounded-xl border p-4 flex items-start gap-3 animate-in zoom-in-95 duration-300 ${error ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
              {error ? <ExclamationCircleIcon className="h-5 w-5 mt-0.5" /> : <CheckCircleIcon className="h-5 w-5 mt-0.5" />}
              <span className="text-sm font-medium">{error || success}</span>
            </div>
          )}

          {/* SECTION 1: DATA PENGIRIM */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Identitas Pelapor ({effectiveUserRole})</h2>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                  {session.user.name?.charAt(0)}
                </div>
                <div className="text-xs">
                  <p className="font-bold text-blue-900">{session.user.name}</p>
                  <p className="text-blue-700 opacity-80">{session.user.email}</p>
                </div>
              </div>

              {/* Conditional Inputs Based on Role */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Nama Lengkap <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={namaPengisi}
                  onChange={(e) => setNamaPengisi(e.target.value)}
                  required
                  placeholder="Nama pengisi laporan"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                />
              </div>

              {effectiveUserRole === 'Salesman' ? (
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                    <BuildingStorefrontIcon className="h-4 w-4" /> Toko / Wilayah
                  </label>
                  <input
                    type="text"
                    value={toko}
                    onChange={(e) => setToko(e.target.value)}
                    placeholder="Nama toko yang dikunjungi"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Peran di Toko <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={jabatan}
                    onChange={(e) => setJabatan(e.target.value)}
                    required
                    placeholder="Contoh: Pemilik / Karyawan"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                  />
                </div>
              )}

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                  <PhoneIcon className="h-4 w-4" /> No. Telepon / WhatsApp <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={noTelepon}
                  onChange={(e) => setNoTelepon(e.target.value)}
                  required
                  placeholder="Contoh: 08123456789"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                />
              </div>
            </div>
          </section>

          {/* SECTION 2: DETAIL PERMINTAAN */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
              <DocumentTextIcon className="h-5 w-5 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Detail Laporan</h2>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                  <TagIcon className="h-4 w-4" /> Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedKategori}
                  onChange={(e) => setSelectedKategori(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none bg-white"
                >
                  <option value="">Pilih Kategori Permintaan...</option>
                  {categories.map((kat) => <option key={kat} value={kat}>{kat}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Deskripsi Lengkap <span className="text-red-500">*</span></label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={6}
                  placeholder="Ceritakan detail kendala, lokasi, atau bantuan yang dibutuhkan secara jelas..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none resize-none"
                />
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: ATTACHMENT & ACTION */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-800 flex items-center justify-between">
                <span>Lampiran Foto/File</span>
                {isAttachmentRequired && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase">Wajib</span>}
              </label>
              
              {!file ? (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="p-3 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                      <CloudArrowUpIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-slate-600">Klik untuk upload</p>
                    <p className="text-[11px] text-slate-400">PNG, JPG, PDF (Max 5MB)</p>
                  </div>
                  <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,application/pdf" />
                </label>
              ) : (
                <div className="relative group rounded-xl border border-blue-200 bg-blue-50 p-4 animate-in zoom-in-95 duration-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg text-white">
                      <PaperClipIcon className="h-5 w-5" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-blue-900 truncate">{file.name}</p>
                      <p className="text-[10px] text-blue-700">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="absolute -top-2 -right-2 bg-white border border-slate-200 rounded-full p-1 text-red-500 shadow-md hover:bg-red-50"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-start gap-2 text-[11px] text-slate-500 mb-6">
                <InformationCircleIcon className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <p>Pastikan data yang Anda isi sudah benar sebelum mengirimkan laporan.</p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 rounded-xl bg-blue-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] disabled:bg-slate-300 disabled:shadow-none transition-all"
              >
                {isLoading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <span>Kirim Laporan</span>
                )}
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
            <h4 className="text-xs font-bold text-blue-800 mb-1">Butuh Bantuan?</h4>
            <p className="text-[11px] text-blue-700 leading-relaxed">
              Jika mengalami kendala saat mengisi formulir, silakan hubungi Tim IT OMI via WhatsApp Group.
            </p>
          </div>
        </div>

      </form>
    </div>
  );
}