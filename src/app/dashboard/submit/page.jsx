// Lokasi: src/app/dashboard/submit/page.jsx

'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  CloudArrowUpIcon,
  PaperClipIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

// === KATEGORI BARU (UPDATE SAJA BAGIAN INI) ===
// === KATEGORI ===
const categories = {
  PRODUK: [
    'IDE PRODUK BARU',
    'KUALITAS PRODUK',
    'ISI/PACKAGING',
  ],
  STOK: ['STOK', 'KIRIMAN', 'RETURAN'],
  PROGRAM: ['INSENTIF', 'HADIAH PROGRAM', 'SKEMA PROGRAM'],
  'TOOLS/LAINNYA': ['FLYER PROGRAM', 'PERALATAN', 'LAINNYA'],
};

// === RULE LAMPIRAN WAJIB (INI YANG KEMARIN BELUM ADA) ===
const REQUIRED_ATTACHMENT_RULES = {
  PRODUK: ['KUALITAS PRODUK', 'ISI/PACKAGING', 'IDE PRODUK BARU', 'PRODUK KOMPETITOR'],
};

// ===================================

export default function SubmitTicketPage() {
  const { data: session } = useSession();
  const router = useRouter();

  // State untuk form
  const [description, setDescription] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('');
  const [selectedSubKategori, setSelectedSubKategori] = useState('');

  // --- STATE PROFIL SUBMITTER ---
  const [namaPengisi, setNamaPengisi] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [toko, setToko] = useState('');
  const [noTelepon, setNoTelepon] = useState(''); // <-- STATE NOMOR TELEPON
  // ------------------------------

  // --- STATE LAMPIRAN ---
  const [file, setFile] = useState(null);

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
  // ----------------------

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const userRole = session?.user?.role;
  const isAttachmentRequired =
  REQUIRED_ATTACHMENT_RULES[selectedKategori]?.includes(selectedSubKategori);


  // Sub kategori: filter KIRIMAN & RETURAN untuk Salesman (hanya di kategori STOK)
  const rawSubKategoriOptions = selectedKategori ? categories[selectedKategori] : [];
  const subKategoriOptions = rawSubKategoriOptions.filter((subKat) => {
    if (userRole === 'Salesman' && selectedKategori === 'STOK') {
      return subKat !== 'KIRIMAN' && subKat !== 'RETURAN';
    }
    return true;
  });

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

    // --- VALIDASI KONDISIONAL (LOGIKA TETAP SAMA) ---
    if (session.user.role === 'Agen' && (!namaPengisi || !jabatan)) {
      setError('Agen wajib mengisi Nama Pengisi dan Jabatan.');
      setIsLoading(false);
      return;
    }
    // VALIDASI NOMOR TELEPON (WAJIB, SAMA DENGAN BACKEND)
    if (!noTelepon) {
      setError('Nomor Telepon/WA wajib diisi.');
      setIsLoading(false);
      return;
    }
    // VALIDASI LAMPIRAN WAJIB (SAMA DENGAN BACKEND)
if (isAttachmentRequired && !file) {
  setError('Lampiran / foto wajib diisi untuk kategori dan sub kategori ini.');
  setIsLoading(false);
  return;
}

    // ---------------------------------------

    try {
      let attachments = null;

      // === LANGKAH 1: kalau ada file, upload dulu ke /api/upload ===
      if (file) {
        const formData = new FormData();
        formData.append('file', file);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) {
          throw new Error(uploadData.message || 'Gagal mengupload lampiran');
        }

        attachments = [
          {
            url: uploadData.fileUrl,
            name: file.name,
            type: file.type,
            fileId: uploadData.fileId, // optional
          },
        ];
      }

      // === AUTO-GENERATE TITLE SESUAI KATEGORI ===
      const autoTitle =
        selectedKategori && selectedSubKategori
          ? `${selectedKategori} - ${selectedSubKategori}`
          : selectedKategori ||
            selectedSubKategori ||
            (description ? description.slice(0, 50) : 'Request');

      // === LANGKAH 2: submit tiket ke /api/tickets/submit ===
      const res = await fetch('/api/tickets/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: autoTitle,
          description,
          kategori: selectedKategori,
          sub_kategori: selectedSubKategori,
          nama_pengisi: namaPengisi || null,
          jabatan: jabatan || null,
          toko: toko || null,
          no_telepon: noTelepon, // <-- KIRIM KE BACKEND
          attachments,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Gagal submit Request');
      }

      setSuccess('Request berhasil disubmit!');
      setDescription('');
      setSelectedKategori('');
      setSelectedSubKategori('');
      setNamaPengisi('');
      setJabatan('');
      setToko('');
      setNoTelepon(''); // <-- RESET NOMOR TELEPON
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

  // State loading & guard role (logika tetap)
  if (!session)
    return (
      <div className="flex justify-center py-10 text-sm text-slate-500">
        Memuat...
      </div>
    );

  if (!['Salesman', 'Agen'].includes(session.user.role)) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        Akses Ditolak.
      </div>
    );
  }

  const effectiveUserRole = session.user.role;

  return (
    <div className="px-4 py-6">
      {/* CARD FORM */}
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Alert error / success */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
              {success}
            </div>
          )}

          {/* Identitas Pengirim */}
              <fieldset className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <legend className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
        Data Pengirim ({effectiveUserRole})
      </legend>

      <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* INFO LOGIN */}
        <div className="md:col-span-2 rounded-lg bg-white px-3 py-2 text-xs text-slate-600">
          Anda login sebagai{' '}
          <span className="font-semibold text-slate-900">
            {session.user.name}
          </span>{' '}
          <span className="text-slate-400">({session.user.email})</span>
        </div>

        {/* SALES */}
        {effectiveUserRole === 'Salesman' && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-800">
                Nama Sales
                <span className="ml-1 text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={namaPengisi}
                onChange={(e) => setNamaPengisi(e.target.value)}
                required
                placeholder="Nama Anda"
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900
                          shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-800">
                Nama Toko/Wilayah
                
              </label>
              <input
                type="text"
                value={toko}
                onChange={(e) => setToko(e.target.value)}
                placeholder="Nama toko atau wilayah yang dikunjungi"
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900
                          shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          </>
        )}

        {/* AGEN */}
        {effectiveUserRole === 'Agen' && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-800">
                Nama Pengisi
                <span className="ml-1 text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={namaPengisi}
                onChange={(e) => setNamaPengisi(e.target.value)}
                required
                placeholder="Nama Anda"
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900
                          shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-800">
                Peran di Toko
                <span className="ml-1 text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={jabatan}
                onChange={(e) => setJabatan(e.target.value)}
                required
                placeholder="Contoh: Pemilik, Karyawan"
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900
                          shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          </>
        )}

        {/* NOMOR HP */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-800">
            Nomor Telepon / WhatsApp
            <span className="ml-1 text-rose-500">*</span>
          </label>
          <input
            type="tel"
            value={noTelepon}
            onChange={(e) => setNoTelepon(e.target.value)}
            required
            placeholder="Contoh: 0812 3456 7890"
            className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900
                      shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
          <p className="mt-1 text-[11px] text-slate-500">
            Nomor ini akan digunakan jika kami perlu menghubungi Anda.
          </p>
        </div>
      </div>
    </fieldset>


          {/* Detail  */}
          <fieldset className="rounded-2xl border border-slate-200 bg-white p-5">
  <legend className="rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-semibold text-slate-700">
    Detail Permintaan
  </legend>

  <div className="mt-4 space-y-6">
    {/* KATEGORI */}
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        <label className="block text-sm font-medium text-slate-800">
          Kategori Permintaan <span className="text-rose-500">*</span>
        </label>
        <p className="mt-0.5 text-xs text-slate-500">
          Pilih jenis kendala utama yang ingin Anda laporkan
        </p>
        <select
          value={selectedKategori}
          onChange={(e) => {
            setSelectedKategori(e.target.value);
            setSelectedSubKategori('');
          }}
          required
          className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        >
          <option value="">Pilih kategori...</option>
          {Object.keys(categories).map((kat) => (
            <option key={kat} value={kat}>
              {kat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-800">
          Sub Kategori <span className="text-rose-500">*</span>
        </label>
        <p className="mt-0.5 text-xs text-slate-500">
          Detail spesifik dari kategori yang dipilih
        </p>
        <select
          value={selectedSubKategori}
          onChange={(e) => setSelectedSubKategori(e.target.value)}
          required
          disabled={!selectedKategori}
          className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm disabled:bg-slate-50 disabled:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        >
          <option value="">Pilih sub kategori...</option>
          {subKategoriOptions.map((subKat) => (
            <option key={subKat} value={subKat}>
              {subKat}
            </option>
          ))}
        </select>
      </div>
    </div>

    {/* DESKRIPSI */}
    <div>
      <label className="block text-sm font-medium text-slate-800">
        Deskripsi Lengkap <span className="text-rose-500">*</span>
      </label>
      <p className="mt-0.5 text-xs text-slate-500">
        Jelaskan kondisi di lapangan agar tim dapat memproses lebih cepat
      </p>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        rows={5}
        placeholder="Contoh: Lokasi toko, kondisi saat ini, kendala yang terjadi, serta kebutuhan atau harapan Anda."
        className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
      />
    </div>

    {/* LAMPIRAN */}
    <div>
      <label className="block text-sm font-medium text-slate-800 mb-1">
        Lampiran Pendukung
        {isAttachmentRequired && (
          <span className="text-rose-500"> *</span>
        )}
      </label>
      <p className="text-xs text-slate-500 mb-3">
        Unggah foto atau dokumen pendukung untuk memperjelas kondisi
      </p>

      {!file ? (
        <label
          htmlFor="dropzone-file"
          className="flex flex-col items-center justify-center w-full h-36 cursor-pointer rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <CloudArrowUpIcon className="h-8 w-8 text-slate-400 mb-2" />
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-indigo-600">
              Klik untuk upload
            </span>{' '}
            atau drag & drop file
          </p>
          <p className="mt-1 text-xs text-slate-500">
            PNG, JPG, atau PDF • Maksimal 5MB
          </p>
          <input
            id="dropzone-file"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept="image/*,application/pdf"
          />
        </label>
      ) : (
        <div className="flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <PaperClipIcon className="h-5 w-5 text-indigo-600 flex-shrink-0" />
            <span className="truncate text-sm font-medium text-indigo-900 max-w-[220px]">
              {file.name}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setFile(null)}
            className="text-rose-500 hover:text-rose-700"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  </div>
</fieldset>

          {/* Tombol Submit */}
          <button
  type="submit"
  disabled={isLoading}
  className="
    flex w-full items-center justify-center gap-2
    rounded-xl
    bg-indigo-600
    px-4 py-3
    text-sm font-semibold text-white
    shadow-sm
    transition
    hover:bg-indigo-700
    active:scale-[0.98]
    focus:outline-none
    focus:ring-2 focus:ring-indigo-500/40
    disabled:cursor-not-allowed
    disabled:bg-slate-400
  "
>
  {isLoading ? (
    <>
      <svg
        className="h-4 w-4 animate-spin text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
      <span>Mengirim...</span>
    </>
  ) : (
    <span>Kirim</span>
  )}
</button>


        </form>
      </div>
    </div>
  );
}
