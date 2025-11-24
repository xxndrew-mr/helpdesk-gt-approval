'use client';

import { useState, useEffect } from 'react';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

// Helper: Format tanggal
const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('id-ID', {
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

  // filter bulan
  const [selectedMonth, setSelectedMonth] = useState('all');
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

  // Build opsi bulan dari updatedAt / createdAt
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

  // Filter tiket per bulan
  const filteredTickets =
    selectedMonth === 'all'
      ? tickets
      : tickets.filter((t) => {
          const baseDate = t.updatedAt || t.createdAt;
          if (!baseDate) return false;
          return getMonthKey(baseDate) === selectedMonth;
        });

  return (
    <div className="px-4 py-6">
      {/* HEADER */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-indigo-600 px-6 py-6 shadow-lg">
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

      {/* BAR FILTER */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-slate-500">
          Menampilkan{' '}
          <span className="font-semibold text-slate-700">
            {filteredTickets.length}
          </span>{' '}
          dari{' '}
          <span className="font-semibold text-slate-700">{tickets.length}</span>{' '}
          tiket yang pernah Anda proses.
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Filter bulan:</span>
          <select
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              setExpandedId(null); // reset expand saat ganti bulan
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
      </div>

      {/* STATE TANPA DATA */}
      {tickets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-10 text-center text-sm text-slate-500">
          Anda belum pernah memproses tiket apapun.
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-10 text-center text-sm text-slate-500">
          Tidak ada tiket pada bulan yang dipilih.
        </div>
      ) : (
        // GRID CARD KECIL + EXPAND DETAIL
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTickets.map((ticket) => {
            const baseDate = ticket.updatedAt || ticket.createdAt;
            const isExpanded = expandedId === ticket.ticket_id;

            return (
              <div
                key={ticket.ticket_id}
                className={`group relative flex flex-col rounded-2xl border bg-white p-4 text-xs shadow-sm transition hover:shadow-md cursor-pointer ${
                  isExpanded
                    ? 'border-indigo-500 bg-indigo-50/70'
                    : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40'
                }`}
                onClick={() =>
                  setExpandedId(
                    isExpanded ? null : ticket.ticket_id
                  )
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
                  <div className="flex-shrink-0">{getStatusBadge(ticket.status)}</div>
                </div>

                {/* INFO RINGKAS DI BAWAH HEADER */}
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                  <span>{formatDate(baseDate)}</span>
                  <span className="truncate max-w-[120px] text-right">
                    Pengirim: {ticket.submittedBy.name}
                  </span>
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
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1 text-[10px] font-medium text-slate-500">
                          Tiket ditutup
                        </span>
                      ) : (
                        <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-[10px] font-medium text-amber-800">
                          <ArrowPathIcon className="h-3 w-3" />
                          <span>
                            Menunggu:{' '}
                            {ticket.assignments[0]?.user?.name || 'Sistem'}{' '}
                            {ticket.assignments[0]?.user?.role?.role_name
                              ? `(${ticket.assignments[0].user.role.role_name})`
                              : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Indikator klik */}
                <div className="mt-2 flex items-center justify-end text-[10px] text-slate-400">
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
