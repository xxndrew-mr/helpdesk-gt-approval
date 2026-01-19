'use client';

import { useState, useEffect, useMemo } from 'react';
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

  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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

  const kategoriOptions = useMemo(() => {
    const setCat = new Set(
      tickets
        .map((t) => t.kategori)
        .filter(Boolean)
    );
    return Array.from(setCat);
  }, [tickets]);

  const visibleTickets = tickets.filter((ticket) => {
    const d = new Date(ticket.createdAt);
    if (isNaN(d.getTime())) return false;

    if (selectedMonth) {
      const monthStr =
        d.getFullYear().toString() +
        '-' +
        String(d.getMonth() + 1).padStart(2, '0');

      if (monthStr !== selectedMonth) return false;
    }

    if (selectedCategory && ticket.kategori !== selectedCategory) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();

      const title = ticket.title || '';
      const desc = ticket.detail?.description || '';
      const namaPengisi = ticket.nama_pengisi || '';
      const noTelepon = ticket.no_telepon || '';
      const toko = ticket.toko || '';
      const kategori = ticket.kategori || '';
      const type = ticket.type || '';
      const status = ticket.status || '';

      const combined =
        `${title} ${desc} ${namaPengisi} ${noTelepon} ${toko} ${kategori} ${type} ${status}`.toLowerCase();

      if (!combined.includes(q)) return false;
    }

    return true;
  });

  return (
    <div className="space-y-8">
      {/* HERO / HEADER */}
      <section className="rounded-3xl bg-blue-800 text-white px-6 py-6 sm:py-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md shadow-blue-900/30">
        <div className="space-y-1.5">
          <p className="inline-flex items-center text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-100/90">
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Onda Care · Riwayat Request
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

      {/* ERROR */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Error: {error}
        </div>
      )}

      {/* BODY */}
      <section className="rounded-2xl border border-slate-200 bg-white px-4 py-4 sm:px-6 sm:py-5 shadow-sm space-y-4">
        {/* BAR FILTER */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              Riwayat Request
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              {[
                selectedMonth ? `Bulan: ${selectedMonth}` : null,
                selectedCategory ? `Kategori: ${selectedCategory}` : null,
                searchQuery ? `Pencarian: "${searchQuery}"` : null,
              ]
                .filter(Boolean)
                .join(' · ') ||
                'Anda dapat memfilter riwayat berdasarkan bulan, kategori, dan kata kunci.'}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end sm:flex-wrap">
    
          <div className="relative w-full sm:w-60">
            <input
              type="text"
              placeholder="Cari judul, toko, pengirim..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pl-9 text-sm text-slate-900 shadow-sm
                        focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              🔍
            </span>
          </div>

          {/* KATEGORI */}
          <div className="w-full sm:w-44">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm
                        focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              <option value="">Semua Kategori</option>
              {kategoriOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* BULAN */}
          <div className="w-full sm:w-40">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm
                        focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          {/* RESET */}
          {(selectedMonth || selectedCategory || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedMonth('');
                setSelectedCategory('');
                setSearchQuery('');
              }}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600
                        transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
            >
              Reset
            </button>
          )}
        </div>

        </div>

        {/* LIST */}
        {isLoading ? (
          <div className="flex items-center justify-center py-10 text-sm text-slate-500">
            <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-[2px] border-slate-300 border-t-indigo-500" />
            Memuat riwayat Request Anda...
          </div>
        ) : visibleTickets.length === 0 ? (
          <p className="py-4 text-sm text-slate-600">
            {selectedMonth || selectedCategory || searchQuery
              ? 'Tidak ada Request yang cocok dengan filter.'
              : 'Anda belum pernah submit Request apapun.'}
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {visibleTickets.map((ticket) => {
              const namaPengisi = ticket.nama_pengisi || '-';
              const noTelepon = ticket.no_telepon || '-';
              const toko = ticket.toko || '-';

              return (
                <div
                  key={ticket.ticket_id}
                  className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-sm font-semibold text-slate-900 line-clamp-2">
                        {ticket.title}
                      </h2>

                      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                        <span className="font-medium text-indigo-600">
                          {ticket.type}
                        </span>
                        {ticket.kategori && (
                          <>
                            <span>•</span>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                              {ticket.kategori}
                            </span>
                          </>
                        )}
                        <span>•</span>
                        <span>
                          {new Date(ticket.createdAt).toLocaleString('id-ID')}
                        </span>
                      </div>

                      <div className="mt-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          Informasi Pengirim
                        </p>

                        <div className="grid gap-3 sm:grid-cols-3">
                          <div>
                            <p className="text-[10px] text-slate-500">Nama Pengirim</p>
                            <p className="mt-0.5 text-sm font-semibold text-slate-900">
                              {namaPengisi}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] text-slate-500">Nomor HP</p>
                            <p className="mt-0.5 text-sm font-semibold text-slate-900">
                              {noTelepon}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] text-slate-500">Nama Toko</p>
                            <p className="mt-0.5 text-sm font-semibold text-slate-900">
                              {toko}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ================= DETAIL PERMINTAAN ================= */}
                  <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Detail Permintaan
                      </p>

                      {ticket.detail?.attachments_json?.length > 0 && (
                        <span className="text-[10px] text-slate-400">
                          {ticket.detail.attachments_json.length} lampiran
                        </span>
                      )}
                    </div>

                    {/* Deskripsi */}
                    {ticket.detail?.description ? (
                      <p className="text-sm leading-relaxed text-slate-800">
                        {ticket.detail.description}
                      </p>
                    ) : (
                      <p className="text-sm italic text-slate-400">
                        Tidak ada keterangan tambahan dari pengirim.
                      </p>
                    )}

                    {/* Lampiran */}
                    {ticket.detail?.attachments_json &&
                      Array.isArray(ticket.detail.attachments_json) &&
                      ticket.detail.attachments_json.length > 0 && (
                        <div className="pt-3 border-t border-slate-100">
                          <p className="mb-2 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            <PaperClipIcon className="h-3 w-3" />
                            Lampiran
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {ticket.detail.attachments_json.map((file, idx) => (
                              <a
                                key={idx}
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                              >
                                <PaperClipIcon className="h-4 w-4 text-slate-400 group-hover:text-indigo-600" />
                                <span className="max-w-[160px] truncate">
                                  {file.name}
                                </span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>


                  <div className="mt-3 border-top border-slate-100 pt-2">
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

                  {ticket.logs && ticket.logs.length > 0 && (
                    <details className="group mt-4 rounded-xl border border-slate-200 bg-white">
                      <summary className="flex cursor-pointer select-none items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-2 w-2 rounded-full bg-indigo-500" />
                          <span className="text-sm font-semibold text-slate-900">
                            Riwayat Aktivitas
                          </span>
                          <span className="text-xs text-slate-500">
                            ({ticket.logs.length})
                          </span>
                        </div>

                        <span className="text-[10px] text-slate-400 transition-transform group-open:rotate-180">
                          ▼
                        </span>
                      </summary>

                      <div className="border-t border-slate-100 px-4 py-3">
                        <ul className="relative space-y-4 max-h-56 overflow-y-auto pr-2">
                          {ticket.logs.map((log, index) => (
                            <li key={log.log_id} className="relative pl-6">
                              {index !== ticket.logs.length - 1 && (
                                <span className="absolute left-[6px] top-6 h-full w-px bg-slate-200" />
                              )}

                              <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full border-2 border-indigo-500 bg-white" />

                              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-semibold text-slate-900">
                                    {log.actor.name}
                                  </span>
                                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
                                    {log.action_type}
                                  </span>
                                </div>

                                {log.notes && (
                                  <p className="mt-1 text-xs text-slate-700 leading-relaxed">
                                    {log.notes}
                                  </p>
                                )}

                                <p className="mt-1 text-[10px] text-slate-400">
                                  {new Date(log.timestamp).toLocaleString('id-ID')}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </details>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
