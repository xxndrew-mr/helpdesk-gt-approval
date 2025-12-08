'use client';

import { useState, useEffect } from 'react';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  PaperClipIcon,
} from '@heroicons/react/24/outline';

// Helper: Format tanggal
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (isNaN(d)) return '-';
  return d.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Helper: Badge status
const getStatusBadge = (status) => {
  switch (status) {
    case 'Open':
      return (
        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700 ring-1 ring-inset ring-blue-500/20">
          Open
        </span>
      );
    case 'Pending':
      return (
        <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-500/20">
          Pending
        </span>
      );
    case 'Done':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-500/20">
          <CheckCircleIcon className="h-3 w-3" />
          Done
        </span>
      );
    case 'Rejected':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-semibold text-rose-700 ring-1 ring-inset ring-rose-500/20">
          <XCircleIcon className="h-3 w-3" />
          Rejected
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-700 ring-1 ring-inset ring-slate-400/20">
          {status}
        </span>
      );
  }
};

// Helper: key bulan (YYYY-MM)
const getMonthKey = (dateString) => {
  const d = new Date(dateString);
  if (isNaN(d)) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

// Label bulan (contoh: Januari 2025)
const getMonthLabel = (dateString) => {
  const d = new Date(dateString);
  if (isNaN(d)) return '-';
  return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
};

export default function ActionHistoryPage() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // filter bulan (LOGIC ASLI)
  const [selectedMonth, setSelectedMonth] = useState('all');
  // filter kategori (BARU)
  const [selectedCategory, setSelectedCategory] = useState('');
  // search bar (BARU)
  const [searchQuery, setSearchQuery] = useState('');
  // id tiket yang sedang di-expand
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/api/tickets/history');
        if (res.ok) {
          const data = await res.json();
          setTickets(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-10 text-slate-500 text-sm">
        <span className="mr-2 inline-block h-5 w-5 animate-spin rounded-full border-[2px] border-slate-300 border-t-indigo-500" />
        Memuat riwayat aksi...
      </div>
    );
  }

  // Build opsi bulan dari updatedAt / createdAt (LOGIC ASLI)
  const monthMap = new Map();
  tickets.forEach((t) => {
    const baseDate = t.updatedAt || t.createdAt;
    if (!baseDate) return;
    const key = getMonthKey(baseDate);
    if (!key) return;
    if (!monthMap.has(key)) {
      monthMap.set(key, {
        value: key,
        label: getMonthLabel(baseDate),
      });
    }
  });

  const monthOptions = Array.from(monthMap.values()).sort((a, b) =>
    a.value.localeCompare(b.value)
  );

  // Opsi kategori (BARU) – aman kalau kategori kosong
  const kategoriSet = new Set(
    tickets.map((t) => t.kategori).filter((k) => !!k)
  );
  const kategoriOptions = Array.from(kategoriSet);

  // Filter tiket: bulan (logic asli) + kategori + search (BARU)
  const filteredTickets = tickets.filter((t) => {
    const baseDate = t.updatedAt || t.createdAt;
    if (!baseDate) return false;

    // FILTER BULAN (ASLI)
    if (selectedMonth !== 'all') {
      if (getMonthKey(baseDate) !== selectedMonth) return false;
    }

    // FILTER KATEGORI (BARU)
    if (selectedCategory && t.kategori !== selectedCategory) {
      return false;
    }

    // FILTER SEARCH (BARU) – cari di judul, deskripsi, pengirim, agen, toko, dll
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();

      const title = t.title || '';
      const desc = t.detail?.description || '';
      const namaPengisi = t.nama_pengisi || '';
      const noTelepon = t.no_telepon || '';
      const toko = t.toko || '';
      const kategori = t.kategori || '';
      const type = t.type || '';
      const status = t.status || '';
      const agen = t.submittedBy?.name || '';

      const combined = (
        title +
        ' ' +
        desc +
        ' ' +
        namaPengisi +
        ' ' +
        noTelepon +
        ' ' +
        toko +
        ' ' +
        kategori +
        ' ' +
        type +
        ' ' +
        status +
        ' ' +
        agen
      ).toLowerCase();

      if (!combined.includes(q)) return false;
    }

    return true;
  });

  return (
    <div className="px-4 py-6">
      {/* HEADER */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-blue-800 px-6 py-6 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 text-white">
            <ClockIcon className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Riwayat Aksi Saya
            </h1>
            <p className="mt-1 text-sm text-indigo-100">
              Daftar Request yang pernah Anda proses, setujui, kembalikan, atau
              tolak.
            </p>
          </div>
        </div>
        <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      </div>

      {/* BAR FILTER – sekarang mirip MyTickets */}
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="text-xs text-slate-500">
          Menampilkan{' '}
          <span className="font-semibold text-slate-700">
            {filteredTickets.length}
          </span>{' '}
          dari{' '}
          <span className="font-semibold text-slate-700">{tickets.length}</span>{' '}
          Request yang pernah Anda proses.
          <div className="mt-1 text-[11px] text-slate-500">
            {[
              selectedMonth !== 'all' && selectedMonth
                ? `Bulan: ${selectedMonth}`
                : null,
              selectedCategory ? `Kategori: ${selectedCategory}` : null,
              searchQuery ? `Pencarian: "${searchQuery}"` : null,
            ]
              .filter(Boolean)
              .join(' · ') ||
              'Anda dapat memfilter riwayat berdasarkan bulan, kategori, dan kata kunci.'}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end sm:flex-wrap">
          {/* Search bar */}
          <div className="flex items-center gap-1">
            <span className="hidden sm:inline text-[11px] text-slate-500">
              Cari:
            </span>
            <input
              type="text"
              placeholder="Cari judul, pengirim, toko..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-52 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          {/* Filter kategori */}
          <div className="flex items-center gap-1">
            <span className="hidden sm:inline text-[11px] text-slate-500">
              Kategori:
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setExpandedId(null);
              }}
              className="w-full sm:w-40 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              <option value="">Semua</option>
              {kategoriOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Filter bulan (logic asli) */}
          <div className="flex items-center gap-1">
            <span className="hidden sm:inline text-[11px] text-slate-500">
              Bulan:
            </span>
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setExpandedId(null); // tetap seperti sebelumnya
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              <option value="all">Semua bulan</option>
              {monthOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reset filter */}
          {(selectedMonth !== 'all' || selectedCategory || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedMonth('all');
                setSelectedCategory('');
                setSearchQuery('');
                setExpandedId(null);
              }}
              className="text-[11px] text-slate-500 hover:text-slate-700"
            >
              Reset filter
            </button>
          )}
        </div>
      </div>

      {/* STATE TANPA DATA */}
      {tickets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-10 text-center text-sm text-slate-500">
          Anda belum pernah memproses Request apapun.
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-10 text-center text-sm text-slate-500">
          Tidak ada Request yang cocok dengan filter.
        </div>
      ) : (
        // GRID CARD KECIL + EXPAND DETAIL
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTickets.map((ticket) => {
            const baseDate = ticket.updatedAt || ticket.createdAt;
            const isExpanded = expandedId === ticket.ticket_id;

            const namaPengisi = ticket.nama_pengisi || '-';
            const noTelepon = ticket.no_telepon || '-';
            const toko = ticket.toko || '-';
            const agen = ticket.submittedBy?.name || '-';

            return (
              <div
                key={ticket.ticket_id}
                className={`group relative flex flex-col rounded-2xl border bg-white p-4 text-xs shadow-sm transition hover:shadow-md cursor-pointer ${
                  isExpanded
                    ? 'border-indigo-500 bg-indigo-50/70'
                    : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40'
                }`}
                onClick={() =>
                  setExpandedId(isExpanded ? null : ticket.ticket_id)
                }
              >
                {/* HEADER KECIL */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="line-clamp-2 text-[11px] font-semibold text-slate-900">
                      {ticket.title}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-1 text-[10px] text-slate-500">
                      <span className="rounded-full bg-slate-50 px-2 py-0.5 font-medium text-slate-700">
                        #{ticket.ticket_id}
                      </span>
                      <span>•</span>
                      <span className="rounded-full bg-indigo-50 px-2 py-0.5 font-medium text-indigo-700">
                        {ticket.kategori}
                      </span>
                      {ticket.sub_kategori && (
                        <>
                          <span>•</span>
                          <span className="rounded-full bg-indigo-50 px-2 py-0.5 font-medium text-indigo-700">
                            {ticket.sub_kategori}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {getStatusBadge(ticket.status)}
                  </div>
                </div>

                {/* META mirip MyTickets: tanggal + agen + pengirim/no hp/toko */}
                <div className="mt-2 text-[10px] text-slate-600 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span>{formatDate(baseDate)}</span>
                    <span className="truncate max-w-[140px] text-right">
                      Agen: {agen}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                    <span>
                      <span className="font-semibold text-slate-900">
                        Pengirim:
                      </span>{' '}
                      {namaPengisi}
                    </span>
                    <span>
                      <span className="font-semibold text-slate-900">
                        No. HP:
                      </span>{' '}
                      {noTelepon}
                    </span>
                    <span>
                      <span className="font-semibold text-slate-900">
                        Toko:
                      </span>{' '}
                      {toko}
                    </span>
                  </div>
                </div>

                {/* DETAIL MUNCUL SAAT DI-CLICK */}
                {isExpanded && (
                  <div className="mt-3 space-y-3 rounded-xl bg-white/70 p-3 text-[11px] text-slate-700 border border-slate-100">
                    {/* Deskripsi lengkap */}
                    <div>
                      <div className="mb-1 text-[10px] font-semibold text-slate-500 uppercase">
                        Deskripsi
                      </div>
                      <p className="leading-relaxed">
                        {ticket.detail?.description || '(Tidak ada deskripsi)'}
                      </p>
                    </div>

                    {/* Lampiran */}
                    {ticket.detail?.attachments_json &&
                      Array.isArray(ticket.detail.attachments_json) &&
                      ticket.detail.attachments_json.length > 0 && (
                        <div>
                          <div className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            <PaperClipIcon className="h-3 w-3" />
                            Lampiran
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {ticket.detail.attachments_json.map((file, idx) => (
                              <a
                                key={idx}
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-[11px] text-blue-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-100"
                              >
                                <PaperClipIcon className="h-4 w-4" />
                                <span className="max-w-[140px] truncate font-medium">
                                  {file.name}
                                </span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Posisi tiket saat ini */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2">
                      <div className="text-[10px] text-slate-500">
                        Terakhir diupdate:{' '}
                        <span className="font-medium text-slate-700">
                          {formatDate(baseDate)}
                        </span>
                      </div>

                      {ticket.status === 'Done' ||
                      ticket.status === 'Rejected' ? (
                        <span className="inline-flex items=center gap-1 rounded-full bg-slate-50 px-3 py-1 text-[10px] font-medium text-slate-500">
                          Request ditutup
                        </span>
                      ) : (
                        <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-[10px] font-medium text-amber-800">
                          <ArrowPathIcon className="h-3 w-3" />
                          <span>
                            Menunggu:{' '}
                            {ticket.assignments?.[0]?.user?.name || 'Sistem'}{' '}
                            {ticket.assignments?.[0]?.user?.role?.role_name
                              ? `(${ticket.assignments[0].user.role.role_name})`
                              : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Indikator klik */}
                <div className="mt-2 flex items=center justify-end text-[10px] text-slate-400">
                  <span className="mr-1">
                    {isExpanded ? 'Sembunyikan detail' : 'Lihat detail'}
                  </span>
                  <ClockIcon
                    className={`h-3 w-3 transition-transform ${
                      isExpanded ? 'rotate-90' : ''
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
