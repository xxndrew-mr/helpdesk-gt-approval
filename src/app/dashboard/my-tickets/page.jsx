// Lokasi: src/app/dashboard/my-tickets/page.jsx

'use client'; // WAJIB, untuk fetch data dan state

import { useState, useEffect } from 'react';

// Fungsi kecil untuk memberi warna pada status
const getStatusClass = (status) => {
  switch (status) {
    case 'Open':
      return 'bg-blue-100 text-blue-800';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'Done':
      return 'bg-green-100 text-green-800';
    case 'Rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fungsi untuk memuat data riwayat
  const loadHistory = async () => {
    setError(null);
    try {
      const res = await fetch('/api/tickets/my-history');
      if (!res.ok) {
        throw new Error('Gagal mengambil data riwayat tiket');
      }
      const data = await res.json();
      setTickets(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Muat data saat halaman dibuka
  useEffect(() => {
    loadHistory();
  }, []);

  if (isLoading) return <div>Memuat riwayat tiket Anda...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Riwayat Tiket Saya</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        {tickets.length === 0 ? (
          <p className="text-gray-700">
            Anda belum pernah submit tiket apapun.
          </p>
        ) : (
          <div className="space-y-8">
            {/* Kita akan 'map' (looping) semua tiket di sini */}
            {tickets.map((ticket) => (
              <div
                key={ticket.ticket_id}
                className="p-4 border rounded-lg"
              >
                {/* Bagian Header Tiket */}
                <div className="flex justify-between items-start">
                  <h2 className="text-2xl font-semibold text-blue-700">
                    {ticket.title}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(
                      ticket.status
                    )}`}
                  >
                    Status: {ticket.status}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  <span>
                    Tipe: <strong>{ticket.type}</strong>
                  </span>
                  <span className="mx-2">|</span>
                  <span>
                    Dibuat: {new Date(ticket.createdAt).toLocaleString('id-ID')}
                  </span>
                </div>

                {/* Deskripsi */}
                <p className="mt-4 text-gray-800">
                  {ticket.detail?.description || '(Tidak ada deskripsi)'}
                </p>

                {/* PIC Saat Ini */}
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-700">PIC Saat Ini:</h4>
                  {ticket.assignments.length > 0 ? (
                    <p className="text-gray-800">
                      {ticket.assignments[0].user.name} (
                      {/* === PERBAIKAN DI SINI === */}
                      {/* Kita render .role_name, bukan objek .role */}
                      {ticket.assignments[0].user.role.role_name}
                      {/* ======================= */}
                      )
                    </p>
                  ) : (
                    <p className="text-gray-500 italic">
                      (Tiket Selesai / Ditolak / Diarsipkan)
                    </p>
                  )}
                </div>

                {/* Riwayat Log */}
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-700">Riwayat Aksi:</h4>
                  <ul className="list-disc list-inside space-y-2 mt-2">
                    {ticket.logs.map((log) => (
                      <li key={log.log_id} className="text-sm">
                        <span className="font-medium text-gray-900">
                          {log.actor.name}
                        </span>
                        <span className="text-gray-700">
                          {' '}
                          ({log.action_type}):
                        </span>
                        <span className="text-gray-600 italic">
                          {' '}
                          "{log.notes}"
                        </span>
                        <span className="text-xs text-gray-400 block">
                          {new Date(log.timestamp).toLocaleString('id-ID')}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}