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
const categories = {
  // Kategori Baru
  PRODUK: [
    'PRODUK KOMPETITOR',
    'PRODUK ONDA',
    'KUALITAS',
    'KUANTITAS', // Stok produk di level produk
  ],
  // Kategori Stok (lebih ke pergerakan stok)
  STOK: ['STOK', 'KIRIMAN', 'RETURAN'],
  PROGRAM: ['INSENTIF', 'HADIAH PROGRAM', 'SKEMA PROGRAM'],
  TOOLS: ['FLYER PROGRAM', 'PERALATAN', 'LAINNYA'],
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

  const subKategoriOptions = selectedKategori ? categories[selectedKategori] : [];

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

    if (session.user.role === 'Salesman' && (!namaPengisi || !toko)) {
      setError('Salesman wajib mengisi Nama Sales dan Nama Toko.');
      setIsLoading(false);
      return;
    }

    // VALIDASI NOMOR TELEPON (WAJIB, SAMA DENGAN BACKEND)
    if (!noTelepon) {
      setError('Nomor Telepon/WA wajib diisi.');
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
            url: uploadData.url,
            name: uploadData.name,
            type: uploadData.type,
          },
        ];
      }

      // === AUTO-GENERATE TITLE (karena field judul dihapus) ===
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
          // selected_pic_id: ???  // <-- backend kamu juga butuh ini, nanti kita isi saat PIC OMI ditambahkan
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

  const userRole = session.user.role;

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
          <fieldset className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <legend className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
              Identitas Pengirim ({userRole})
            </legend>

            <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2 text-xs text-slate-500">
                Login sebagai:{' '}
                <span className="font-medium text-slate-800">
                  {session.user.name}
                </span>{' '}
                <span className="text-slate-400">({session.user.email})</span>
              </div>

              {userRole === 'Salesman' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-800">
                      Nama Salesman <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={namaPengisi}
                      onChange={(e) => setNamaPengisi(e.target.value)}
                      required
                      placeholder="Masukkan nama Anda"
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-800">
                      Nama Toko <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={toko}
                      onChange={(e) => setToko(e.target.value)}
                      required
                      placeholder="Toko yang sedang dikunjungi"
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    />
                  </div>
                </>
              )}

              {userRole === 'Agen' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-800">
                      Nama Pengisi <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={namaPengisi}
                      onChange={(e) => setNamaPengisi(e.target.value)}
                      required
                      placeholder="Siapa yang mengisi form ini?"
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-800">
                      Jabatan <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={jabatan}
                      onChange={(e) => setJabatan(e.target.value)}
                      required
                      placeholder="Contoh: Owner, Staff, Istri Owner"
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    />
                  </div>
                </>
              )}

              {/* NOMOR TELEPON / WA (WAJIB UNTUK SEMUA ROLE) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-800">
                  Nomor Telepon / WA <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={noTelepon}
                  onChange={(e) => setNoTelepon(e.target.value)}
                  required
                  placeholder="Contoh: 0812xxxxxxx"
                  className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
            </div>
          </fieldset>

          {/* Detail  */}
          <fieldset className="rounded-2xl border border-slate-200 bg-white p-4">
            <legend className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
              Detail Request
            </legend>

            <div className="mt-3 space-y-5">
              {/* Field Judul DIHAPUS */}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-800">
                    Kategori
                  </label>
                  <select
                    value={selectedKategori}
                    onChange={(e) => {
                      setSelectedKategori(e.target.value);
                      setSelectedSubKategori('');
                    }}
                    required
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  >
                    <option value="">Pilih Kategori...</option>
                    {Object.keys(categories).map((kat) => (
                      <option key={kat} value={kat}>
                        {kat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-800">
                    Sub Kategori
                  </label>
                  <select
                    value={selectedSubKategori}
                    onChange={(e) => setSelectedSubKategori(e.target.value)}
                    required
                    disabled={!selectedKategori}
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm disabled:bg-slate-50 disabled:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  >
                    <option value="">Pilih Sub Kategori...</option>
                    {subKategoriOptions.map((subKat) => (
                      <option key={subKat} value={subKat}>
                        {subKat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-800">
                  Deskripsi Lengkap
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={5}
                  className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  placeholder="Jelaskan kondisi di lapangan, lokasi, detail kendala, dan kebutuhan Anda."
                />
              </div>

              {/* Lampiran / Foto (Opsional) */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Lampiran / Foto (Opsional)
                </label>
                {!file ? (
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="dropzone-file"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <CloudArrowUpIcon className="w-8 h-8 mb-2 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">
                            Klik untuk upload
                          </span>{' '}
                          atau drag file
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, PDF (Max. 5MB)
                        </p>
                      </div>
                      <input
                        id="dropzone-file"
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept="image/*,application/pdf"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <PaperClipIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-blue-900 truncate max-w-[200px]">
                        {file.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="text-red-500 hover:text-red-700"
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
            className="flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isLoading ? 'Mengirim...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
}
