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
  const [selectedMonth, setSelectedMonth] = useState(''); // filter bulan (YYYY-MM)

  const loadHistory = async () => {
    setError(null);
    try {
      const res = await fetch('/api/tickets/my-history');
      if (!res.ok) throw new Error('Gagal mengambil data riwayat');
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
        Memuat riwayat Request Anda...
      </div>
    );

  if (error)
    return (
      <div className="text-red-500 bg-red-50 border border-red-200 p-3 rounded-xl">
        Error: {error}
      </div>
    );

  // === FILTER BY BULAN ===
  const visibleTickets = tickets.filter((ticket) => {
    if (!selectedMonth) return true; // tidak ada filter -> semua tampil

    const d = new Date(ticket.createdAt);
    if (isNaN(d.getTime())) return false;

    const monthStr =
      d.getFullYear().toString() +
      '-' +
      String(d.getMonth() + 1).padStart(2, '0'); // YYYY-MM

    return monthStr === selectedMonth;
  });
  // =======================

  return (
    <div className="px-4 py-6">
      {/* HEADER */}
      <div className="relative overflow-hidden rounded-3xl bg-indigo-600 px-6 py-6 shadow-lg mb-8">
        <h1 className="text-2xl font-semibold text-white tracking-tight">
          Riwayat Request Saya
        </h1>
        <p className="text-indigo-100 mt-1 text-sm">
          Semua laporan, request, serta update status ada di sini.
        </p>

        <div className="mt-4 inline-flex items-center gap-2 text-xs text-indigo-100/90 bg-indigo-500/30 px-3 py-1 rounded-full">
          <span>Total Request:</span>
          <span className="font-semibold">{tickets.length}</span>
        </div>

        <div className="absolute -bottom-10 -right-10 h-36 w-36 bg-white/10 rounded-full blur-2xl" />
      </div>

      {/* CONTENT WRAPPER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
        {/* FILTER BAR BULAN */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            {' '}
            {selectedMonth
              ? `Filter bulan: ${selectedMonth}`
              : 'Anda dapat memfilter berdasarkan bulan.'}
          </p>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-600">
              Filter bulan:
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
            {selectedMonth && (
              <button
                type="button"
                onClick={() => setSelectedMonth('')}
                className="text-[11px] text-slate-500 hover:text-slate-700"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {visibleTickets.length === 0 ? (
          <p className="text-gray-600 text-sm">
            {selectedMonth
              ? 'Tidak ada Request pada bulan yang dipilih.'
              : 'Anda belum pernah submit Request apapun.'}
          </p>
        ) : (
          <>
            {/* LIST / GRID CARD KECIL */}
            <div className="grid gap-4 md:grid-cols-2">
              {visibleTickets.map((ticket) => (
                <div
                  key={ticket.ticket_id}
                  className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 hover:shadow-md hover:border-indigo-200 transition"
                >
                  {/* Header: judul + status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-sm font-semibold text-slate-900 line-clamp-2">
                        {ticket.title}
                      </h2>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                        <span className="font-medium text-indigo-600">
                          {ticket.type}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(ticket.createdAt).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center rounded-full ring-1 px-2.5 py-1 text-[11px] font-semibold ${getStatusClass(
                        ticket.status
                      )}`}
                    >
                      {ticket.status}
                    </span>
                  </div>

                  {/* Deskripsi singkat */}
                  <p className="mt-3 text-xs text-slate-700 leading-relaxed">
                    {ticket.detail?.description || '(Tidak ada deskripsi)'}
                  </p>

                  {/* PIC saat ini */}
                  <div className="mt-3 border-t border-slate-100 pt-2">
                    <p className="text-[11px] font-semibold text-slate-600">
                      PIC Saat Ini
                    </p>
                    {ticket.assignments.length > 0 ? (
                      <p className="mt-0.5 text-xs text-slate-800">
                        {ticket.assignments[0].user.name} •{' '}
                        {ticket.assignments[0].user.role.role_name}
                      </p>
                    ) : (
                      <p className="mt-0.5 text-[11px] text-slate-400 italic">
                        (Request selesai)
                      </p>
                    )}
                  </div>

                  {/* Riwayat aksi: collapsible */}
                  {ticket.logs && ticket.logs.length > 0 && (
                    <details className="mt-3 group">
                      <summary className="text-[11px] text-indigo-600 cursor-pointer select-none flex items-center gap-1">
                        <span className="underline-offset-2 group-open:underline">
                          Lihat riwayat aksi ({ticket.logs.length})
                        </span>
                        <span className="text-[9px] text-slate-400 group-open:rotate-90 transition-transform">
                          ▶
                        </span>
                      </summary>
                      <ul className="mt-2 space-y-2 max-h-32 overflow-y-auto pr-1">
                        {ticket.logs.map((log) => (
                          <li
                            key={log.log_id}
                            className="rounded-lg bg-slate-50 border border-slate-200 p-2"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-medium text-slate-900">
                                {log.actor.name}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {log.action_type}
                              </span>
                            </div>
                            <div className="mt-0.5 text-[11px] text-slate-700 italic">
                              "{log.notes}"
                            </div>
                            <div className="mt-0.5 text-[10px] text-slate-400">
                              {new Date(log.timestamp).toLocaleString('id-ID')}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
