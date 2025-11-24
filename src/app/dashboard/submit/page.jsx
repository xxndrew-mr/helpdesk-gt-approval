// Lokasi: src/app/dashboard/submit/page.jsx

'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// === Data Master untuk Dropdown ===
const categories = {
  STOK: ['PRODUK KOMPETITOR', 'PRODUK ONDA', 'STOCK', 'KIRIMAN', 'RETURAN'],
  PROGRAM: ['INSENTIF', 'HADIAH PROGRAM', 'SKEMA PROGRAM'],
  TOOLS: ['FLYER PROGRAM', 'PERALATAN', 'OTHERS'],
};
// ===================================

export default function SubmitTicketPage() {
  const { data: session } = useSession();
  const router = useRouter();

  // State untuk form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('');
  const [selectedSubKategori, setSelectedSubKategori] = useState('');

  // --- STATE PROFIL SUBMITTER ---
  const [namaPengisi, setNamaPengisi] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [toko, setToko] = useState('');
  // ------------------------------

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const subKategoriOptions = selectedKategori ? categories[selectedKategori] : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

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
    // ---------------------------------------

    try {
      const res = await fetch('/api/tickets/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          kategori: selectedKategori,
          sub_kategori: selectedSubKategori,
          nama_pengisi: namaPengisi || null,
          jabatan: jabatan || null,
          toko: toko || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Gagal submit Request');
      }

      setSuccess('Request berhasil disubmit!');
      setTitle('');
      setDescription('');
      setSelectedKategori('');
      setSelectedSubKategori('');
      setNamaPengisi('');
      setJabatan('');
      setToko('');

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
      {/* HEADER */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-indigo-600 px-6 py-6 shadow-lg">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Buat Request Baru
        </h1>
        <p className="mt-1 text-sm text-indigo-100">
          Kirim permintaan atau feedback Anda untuk diproses oleh tim OMI.
        </p>
        <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      </div>

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
            </div>
          </fieldset>

          {/* Detail Request */}
          <fieldset className="rounded-2xl border border-slate-200 bg-white p-4">
            <legend className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
              Detail Request
            </legend>

            <div className="mt-3 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-800">
                  Judul / Ringkasan
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  placeholder="Contoh: Display program kurang lengkap, stok kosong, dsb."
                />
              </div>

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
