'use client';

import { useState, useEffect } from 'react';
import { PaperClipIcon } from '@heroicons/react/24/outline';
import { LayoutDashboard } from 'lucide-react';

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
  const [selectedMonth, setSelectedMonth] = useState(''); // YYYY-MM

  const loadHistory = async () => {
    setError(null);
    setIsLoading(true);
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

  const visibleTickets = tickets.filter((ticket) => {
    if (!selectedMonth) return true;

    const d = new Date(ticket.createdAt);
    if (isNaN(d.getTime())) return false;

    const monthStr =
      d.getFullYear().toString() +
      '-' +
      String(d.getMonth() + 1).padStart(2, '0'); // YYYY-MM

    return monthStr === selectedMonth;
  });

  return (
    <div className="space-y-8">
      {/* HERO / HEADER – disamakan gaya dengan dashboard */}
      <section className="rounded-3xl bg-blue-800 text-white px-6 py-6 sm:py-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md shadow-blue-900/30">

        <div className="space-y-1.5">
          <p className="inline-flex items-center text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-100/90">
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Helpdesk GT · Riwayat Request
          </p>

          <h1 className="text-2xl sm:text-3xl font-semibold leading-tight">
            Riwayat Request Saya
          </h1>

          <p className="text-sm sm:text-base text-indigo-100/95">
            Lihat kembali semua laporan, request, dan perubahan status yang pernah Anda buat.
          </p>
        </div>

        <div className="self-stretch sm:self-center flex sm:flex-col items-end justify-between sm:justify-center gap-2 text-[11px] sm:text-xs">
          <span className="inline-flex items-center rounded-full bg-blue-700/80 px-3 py-1 font-medium shadow-sm">
            Total Request
            <span className="ml-1 font-semibold">{tickets.length}</span>
          </span>
        </div>
      </section>

      {/* ERROR (kalau ada) */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Error: {error}
        </div>
      )}

      {/* BODY – kotak putih simpel, gaya sama kayak dashboard section kedua */}
      <section className="rounded-2xl border border-slate-200 bg-white px-4 py-4 sm:px-6 sm:py-5 shadow-sm space-y-4">
        {/* BAR FILTER */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              Riwayat Request
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              {selectedMonth
                ? `Filter bulan: ${selectedMonth}`
                : 'Anda dapat memfilter riwayat berdasarkan bulan.'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-medium text-slate-600">Filter bulan:</span>
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

        {/* LIST / KONTEN */}
        {isLoading ? (
          <div className="flex items-center justify-center py-10 text-sm text-slate-500">
            <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-[2px] border-slate-300 border-t-indigo-500" />
            Memuat riwayat Request Anda...
          </div>
        ) : visibleTickets.length === 0 ? (
          <p className="py-4 text-sm text-slate-600">
            {selectedMonth
              ? 'Tidak ada Request pada bulan yang dipilih.'
              : 'Anda belum pernah submit Request apapun.'}
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {visibleTickets.map((ticket) => (
              <div
                key={ticket.ticket_id}
                className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
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
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${getStatusClass(
                      ticket.status
                    )}`}
                  >
                    {ticket.status}
                  </span>
                </div>

                {/* Deskripsi */}
                <p className="mt-3 text-xs leading-relaxed text-slate-700">
                  {ticket.detail?.description || '(Tidak ada deskripsi)'}
                </p>

                {/* Lampiran */}
                {ticket.detail?.attachments_json &&
                  Array.isArray(ticket.detail.attachments_json) &&
                  ticket.detail.attachments_json.length > 0 && (
                    <div className="mt-4">
                      <h4 className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        <PaperClipIcon className="h-3 w-3" /> Lampiran
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {ticket.detail.attachments_json.map((file, idx) => (
                          <a
                            key={idx}
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-100"
                          >
                            <PaperClipIcon className="h-4 w-4" />
                            <span className="max-w-[150px] truncate">
                              {file.name}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                {/* PIC saat ini */}
                <div className="mt-3 border-t border-slate-100 pt-2">
                  <p className="text-[11px] font-semibold text-slate-600">
                    PIC Saat Ini
                  </p>
                  {ticket.assignments?.length > 0 ? (
                    <p className="mt-0.5 text-xs text-slate-800">
                      {ticket.assignments[0].user.name} •{' '}
                      {ticket.assignments[0].user.role.role_name}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-[11px] italic text-slate-400">
                      (Request selesai)
                    </p>
                  )}
                </div>

                {/* Riwayat aksi */}
                {ticket.logs && ticket.logs.length > 0 && (
                  <details className="group mt-3">
                    <summary className="flex cursor-pointer select-none items-center gap-1 text-[11px] text-indigo-600">
                      <span className="underline-offset-2 group-open:underline">
                        Lihat riwayat aksi ({ticket.logs.length})
                      </span>
                      <span className="text-[9px] text-slate-400 transition-transform group-open:rotate-90">
                        ▶
                      </span>
                    </summary>
                    <ul className="mt-2 max-h-32 space-y-2 overflow-y-auto pr-1">
                      {ticket.logs.map((log) => (
                        <li
                          key={log.log_id}
                          className="rounded-lg border border-slate-200 bg-slate-50 p-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-900">
                              {log.actor.name}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {log.action_type}
                            </span>
                          </div>
                          <div className="mt-0.5 text-[11px] italic text-slate-700">
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
        )}
      </section>
    </div>
  );
}
