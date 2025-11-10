'use client'; // WAJIB, ini halaman interaktif

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SubmitTicketPage() {
  const { data: session } = useSession();
  const router = useRouter();

  // State untuk form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fungsi untuk menangani submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/tickets/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Gagal submit tiket');
      }

      // Jika berhasil
      setSuccess(data.message);
      setTitle('');
      setDescription('');
      // Opsional: arahkan ke halaman riwayat tiket
      // router.push('/dashboard/my-tickets');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Proteksi Halaman Sisi Klien
  // Jika session masih loading
  if (!session) {
    return <div>Loading...</div>;
  }
  // Jika role BUKAN Salesman
  if (session.user.role !== 'Salesman') {
    return (
      <div className="text-red-500">
        Hanya Salesman yang dapat mengakses halaman ini.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Buat Tiket Baru</h1>
      
      <div className="bg-white p-8 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tampilkan pesan Error atau Sukses */}
          {error && <div className="p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
          {success && <div className="p-3 bg-green-100 text-green-700 rounded-md">{success}</div>}

          <div>
            <label htmlFor="title" className="block text-gray-700 mb-2 font-medium">
              Judul Tiket
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-gray-700 mb-2 font-medium">
              Deskripsi Lengkap
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="6"
              className="w-full px-3 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              minLength="10"
            ></textarea>
            <p className="text-sm text-gray-500 mt-1">Minimal 10 karakter.</p>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300 disabled:bg-gray-400"
            >
              {isLoading ? 'Mengirim...' : 'Submit Tiket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}