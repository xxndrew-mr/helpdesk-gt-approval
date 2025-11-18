// Lokasi File: src/app/dashboard/submit/page.jsx

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
  
  // --- STATE BARU UNTUK PROFIL SUBMITTER ---
  const [jabatan, setJabatan] = useState('');
  const [toko, setToko] = useState('');
  // ----------------------------------------
  
  // State untuk UI
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Daftar sub-kategori yang dinamis
  const subKategoriOptions = selectedKategori ? categories[selectedKategori] : [];

  // Handler untuk submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    // Validasi kondisional
    if (session.user.role === 'Agen' && !jabatan) {
      setError('Agen wajib mengisi Jabatan.');
      setIsLoading(false);
      return;
    }
    if (session.user.role === 'Salesman' && !toko) {
      setError('Salesman wajib mengisi Toko.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/tickets/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          kategori: selectedKategori,
          sub_kategori: selectedSubKategori,
          jabatan: jabatan || null, // Kirim jabatan jika ada
          toko: toko || null,       // Kirim toko jika ada
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Gagal submit tiket');
      }

      setSuccess('Tiket berhasil disubmit!');
      // Reset form
      setTitle('');
      setDescription('');
      setSelectedKategori('');
      setSelectedSubKategori('');
      setJabatan('');
      setToko('');
      
      // Arahkan ke riwayat tiket setelah 2 detik
      setTimeout(() => {
        router.push('/dashboard/my-tickets'); 
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Cek role (jika tidak ada sesi atau role tidak sesuai)
  if (!session) {
    return <div>Memuat...</div>
  }
  if (!['Salesman', 'Agen'].includes(session.user.role)) {
    return (
      <div className="text-red-500">
        Hanya Salesman atau Agen yang dapat mengakses halaman ini.
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Buat Tiket Baru</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {error && <div className="p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
          {success && <div className="p-3 bg-green-100 text-green-700 rounded-md">{success}</div>}
          
          {/* --- BAGIAN INFO SUBMITTER BARU --- */}
          <fieldset className="border p-4 rounded-md">
            <legend className="text-lg font-semibold text-gray-800 px-2">
              Info Submitter
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nama</label>
                <input
                  type="text"
                  value={session.user.name}
                  disabled
                  className="w-full px-3 py-2 mt-1 text-gray-500 bg-gray-100 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={session.user.email}
                  disabled
                  className="w-full px-3 py-2 mt-1 text-gray-500 bg-gray-100 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Posisi</label>
                <input
                  type="text"
                  value={session.user.role}
                  disabled
                  className="w-full px-3 py-2 mt-1 text-gray-500 bg-gray-100 border border-gray-300 rounded-md"
                />
              </div>
              
              {/* Input Kondisional untuk Jabatan/Toko */}
              {session.user.role === 'Agen' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Jabatan (Wajib)
                  </label>
                  <input
                    type="text"
                    value={jabatan}
                    onChange={(e) => setJabatan(e.target.value)}
                    required
                    className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md"
                  />
                </div>
              )}
              {session.user.role === 'Salesman' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Toko (Wajib)
                  </label>
                  <input
                    type="text"
                    value={toko}
                    onChange={(e) => setToko(e.target.value)}
                    required
                    className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md"
                  />
                </div>
              )}
            </div>
          </fieldset>
          {/* ------------------------------------- */}
          
          {/* --- BAGIAN INFO TIKET --- */}
          <fieldset className="border p-4 rounded-md">
            <legend className="text-lg font-semibold text-gray-800 px-2">
              Info Tiket
            </legend>
            <div className="space-y-6 mt-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Judul / Ringkasan Masalah
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Kategori (Wajib)
                  </label>
                  <select
                    value={selectedKategori}
                    onChange={(e) => {
                      setSelectedKategori(e.target.value);
                      setSelectedSubKategori('');
                    }}
                    required
                    className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md"
                  >
                    <option value="">Pilih Kategori...</option>
                    {Object.keys(categories).map((kat) => (
                      <option key={kat} value={kat}>{kat}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Sub Kategori (Wajib)
                  </label>
                  <select
                    value={selectedSubKategori}
                    onChange={(e) => setSelectedSubKategori(e.target.value)}
                    required
                    disabled={!selectedKategori}
                    className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md disabled:bg-gray-100"
                  >
                    <option value="">Pilih Sub Kategori...</option>
                    {subKategoriOptions.map((subKat) => (
                      <option key={subKat} value={subKat}>{subKat}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Notes / Deskripsi Lengkap
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows="5"
                  className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md"
                  placeholder="Jelaskan detail request atau feedback Anda di sini..."
                />
              </div>
            </div>
          </fieldset>
          {/* --------------------------- */}
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isLoading ? 'Mengirim...' : 'Submit Tiket'}
          </button>
        </form>
      </div>
    </div>
  );
}