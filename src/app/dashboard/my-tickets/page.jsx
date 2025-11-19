'use client';

import { useState, useEffect } from 'react';

// Fungsi badge status (tanpa ubah logika)
const getStatusClass = (status) => {
  switch (status) {
    case 'Open':
      return 'bg-blue-100 text-blue-700 ring-blue-500/20';
    case 'Pending':
      return 'bg-amber-100 text-amber-700 ring-amber-500/20';
    case 'Done':
      return 'bg-emerald-100 text-emerald-700 ring-emerald-500/20';
    case 'Rejected':
      return 'bg-rose-100 text-rose-700 ring-rose-500/20';
    default:
      return 'bg-gray-100 text-gray-700 ring-gray-400/20';
  }
};

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadHistory = async () => {
    setError(null);
    try {
      const res = await fetch('/api/tickets/my-history');
      if (!res.ok) throw new Error('Gagal mengambil data riwayat tiket');
      const data = await res.json();
      setTickets(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  if (isLoading)
    return (
      <div className="flex justify-center py-10 text-slate-500 text-sm">
        Memuat riwayat tiket Anda...
      </div>
    );

  if (error)
    return (
      <div className="text-red-500 bg-red-50 border border-red-200 p-3 rounded-xl">
        Error: {error}
      </div>
    );

  return (
    <div className="px-4 py-6">
      {/* HEADER */}
      <div className="relative overflow-hidden rounded-3xl bg-indigo-600 px-6 py-6 shadow-lg mb-8">
        <h1 className="text-2xl font-semibold text-white tracking-tight">
          Riwayat Tiket Saya
        </h1>
        <p className="text-indigo-100 mt-1 text-sm">
          Semua laporan, request, serta update status ada di sini.
        </p>

        <div className="absolute -bottom-10 -right-10 h-36 w-36 bg-white/10 rounded-full blur-2xl" />
      </div>

      {/* CONTENT WRAPPER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        {tickets.length === 0 ? (
          <p className="text-gray-600 text-sm">
            Anda belum pernah submit tiket apapun.
          </p>
        ) : (
          <div className="space-y-6">
            {tickets.map((ticket) => (
              <div
                key={ticket.ticket_id}
                className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 hover:shadow-md transition"
              >
                {/* Header ticket */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-indigo-700">
                      {ticket.title}
                    </h2>
                    <div className="text-xs text-gray-500 mt-1">
                      <strong>{ticket.type}</strong> •{' '}
                      {new Date(ticket.createdAt).toLocaleString('id-ID')}
                    </div>
                  </div>

                  <span
                    className={`mt-3 sm:mt-0 inline-flex items-center rounded-full ring-1 px-3 py-1 text-xs font-semibold ${getStatusClass(
                      ticket.status
                    )}`}
                  >
                    {ticket.status}
                  </span>
                </div>

                {/* Deskripsi */}
                <p className="mt-4 text-gray-700 text-sm leading-relaxed">
                  {ticket.detail?.description || '(Tidak ada deskripsi)'}
                </p>

                {/* PIC */}
                <div className="mt-5">
                  <h4 className="text-sm font-semibold text-slate-700">
                    PIC Saat Ini
                  </h4>
                  {ticket.assignments.length > 0 ? (
                    <p className="mt-1 text-sm text-gray-800">
                      {ticket.assignments[0].user.name} •{' '}
                      {ticket.assignments[0].user.role.role_name}
                    </p>
                  ) : (
                    <p className="text-gray-400 text-xs italic mt-1">
                      (Tiket selesai / tidak ada PIC aktif)
                    </p>
                  )}
                </div>

                {/* Log activity */}
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-slate-700">
                    Riwayat Aksi
                  </h4>
                  <ul className="mt-2 space-y-3">
                    {ticket.logs.map((log) => (
                      <li
                        key={log.log_id}
                        className="relative rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm"
                      >
                        <div className="font-medium text-gray-900">
                          {log.actor.name}{' '}
                          <span className="text-slate-600 text-xs">
                            ({log.action_type})
                          </span>
                        </div>

                        <div className="text-gray-700 italic text-sm">
                          "{log.notes}"
                        </div>

                        <div className="text-[10px] text-gray-400 mt-1">
                          {new Date(log.timestamp).toLocaleString('id-ID')}
                        </div>
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
