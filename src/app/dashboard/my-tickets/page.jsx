'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  PaperClipIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  UserIcon,
  BuildingStorefrontIcon,
  PhoneIcon,
  TagIcon,
  XMarkIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { History, Ticket } from 'lucide-react';

// ─── Status styling ───────────────────────────────────────────────────────────
const STATUS_STYLES = {
  Open:     'bg-blue-50   text-blue-700   border-blue-200   ring-blue-600/10',
  Pending:  'bg-amber-50  text-amber-700  border-amber-200  ring-amber-600/10',
  Done:     'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/10',
  Rejected: 'bg-rose-50   text-rose-700   border-rose-200   ring-rose-600/10',
};

const STATUS_DOT = {
  Open:     'bg-blue-500',
  Pending:  'bg-amber-500',
  Done:     'bg-emerald-500',
  Rejected: 'bg-rose-500',
};

const getStatusStyle = (status) =>
  STATUS_STYLES[status] ?? 'bg-slate-50 text-slate-700 border-slate-200 ring-slate-500/10';

const getStatusDot = (status) =>
  STATUS_DOT[status] ?? 'bg-slate-400';

// ─── Small reusable components ────────────────────────────────────────────────
const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(status)}`}>
    <span className={`h-1.5 w-1.5 rounded-full ${getStatusDot(status)}`} />
    {status}
  </span>
);

const InfoCell = ({ icon: Icon, label, value }) => (
  <div className="space-y-0.5">
    <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
      <Icon className="h-3 w-3" /> {label}
    </p>
    <p className="text-xs font-semibold text-slate-700 truncate">{value || '—'}</p>
  </div>
);

const SkeletonCard = () => (
  <div className="animate-pulse rounded-2xl border border-slate-100 bg-white overflow-hidden">
    <div className="p-5 space-y-3">
      <div className="h-5 w-20 rounded-full bg-slate-200" />
      <div className="h-4 w-3/4 rounded bg-slate-200" />
      <div className="h-3 w-1/2 rounded bg-slate-100" />
    </div>
    <div className="px-5 pb-5 space-y-2">
      <div className="h-16 w-full rounded-xl bg-slate-100" />
      <div className="h-10 w-full rounded-xl bg-slate-50" />
    </div>
  </div>
);

// ─── Ticket Card ──────────────────────────────────────────────────────────────
const TicketCard = ({ ticket }) => (
  <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-900/5">

    {/* Header */}
    <div className="p-5 border-b border-slate-100">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 min-w-0">
          <StatusBadge status={ticket.status} />
          <h2 className="text-sm font-bold text-slate-900 line-clamp-2 group-hover:text-blue-700 transition-colors leading-snug">
            {ticket.title}
          </h2>
          <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
            <span className="font-bold text-blue-600">{ticket.ticket_id}</span>
            <span>·</span>
            <span>
              {new Date(ticket.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
          </div>
        </div>
      </div>
    </div>

    {/* Body */}
    <div className="flex-1 space-y-4 bg-slate-50/40 p-5">
      <div className="grid grid-cols-3 gap-3">
        <InfoCell icon={UserIcon}             label="Pelapor"   value={ticket.nama_pengisi} />
        <InfoCell icon={BuildingStorefrontIcon} label="Toko"    value={ticket.toko} />
        <InfoCell icon={PhoneIcon}            label="WhatsApp"  value={ticket.no_telepon} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Detail Permintaan</p>
        <p className="text-xs leading-relaxed text-slate-600">
          {ticket.detail?.description || 'Tidak ada deskripsi tambahan.'}
        </p>

        {ticket.detail?.attachments_json?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3">
            {ticket.detail.attachments_json.map((f, idx) => (
              <a
                key={idx}
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 ring-1 ring-inset ring-blue-600/10 transition-colors hover:bg-blue-100"
              >
                <PaperClipIcon className="h-3 w-3 shrink-0" />
                <span className="max-w-[100px] truncate">{f.name}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>

    {/* Footer: Activity log */}
    {ticket.logs?.length > 0 && (
      <div className="border-t border-slate-100 bg-white px-5 py-3.5">
        <details className="group/details">
          <summary className="flex cursor-pointer list-none items-center justify-between text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors select-none">
            <span>Riwayat Aktivitas ({ticket.logs.length})</span>
            <ChevronDownIcon className="h-3.5 w-3.5 transition-transform group-open/details:rotate-180" />
          </summary>

          <div className="mt-3 max-h-44 space-y-3 overflow-y-auto pr-1 pb-1">
            {ticket.logs.map((log) => (
              <div key={log.log_id} className="relative pl-4 border-l-2 border-slate-100">
                <span className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-white" />
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-bold text-slate-800">{log.actor.name}</p>
                  <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold uppercase text-blue-600 tracking-wide">
                    {log.action_type}
                  </span>
                </div>
                {log.notes && <p className="mt-0.5 text-[11px] text-slate-500 leading-snug">{log.notes}</p>}
                <p className="mt-1 text-[9px] font-medium uppercase tracking-wider text-slate-300">
                  {new Date(log.timestamp).toLocaleString('id-ID')}
                </p>
              </div>
            ))}
          </div>
        </details>
      </div>
    )}
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MyTicketsPage() {
  const [tickets,          setTickets]          = useState([]);
  const [isLoading,        setIsLoading]        = useState(true);
  const [error,            setError]            = useState(null);
  const [selectedMonth,    setSelectedMonth]    = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery,      setSearchQuery]      = useState('');

  const loadHistory = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch('/api/tickets/my-history');
      if (!res.ok) throw new Error('Gagal mengambil data riwayat');
      setTickets(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadHistory(); }, []);

  const kategoriOptions = useMemo(
    () => Array.from(new Set(tickets.map((t) => t.kategori).filter(Boolean))),
    [tickets]
  );

  const visibleTickets = tickets.filter((ticket) => {
    const d = new Date(ticket.createdAt);
    if (isNaN(d.getTime())) return false;

    if (selectedMonth) {
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthStr !== selectedMonth) return false;
    }
    if (selectedCategory && ticket.kategori !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q        = searchQuery.toLowerCase();
      const haystack = `${ticket.title} ${ticket.detail?.description ?? ''} ${ticket.nama_pengisi ?? ''} ${ticket.toko ?? ''} ${ticket.kategori ?? ''} ${ticket.status ?? ''}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const hasFilters  = selectedMonth || selectedCategory || searchQuery;
  const clearFilter = () => { setSelectedMonth(''); setSelectedCategory(''); setSearchQuery(''); };

  const doneCount     = tickets.filter((t) => t.status === 'Done').length;
  const pendingCount  = tickets.filter((t) => t.status === 'Pending' || t.status === 'Open').length;

  return (
    <div className="min-h-screen bg-slate-50/60">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0d2444] via-[#133567] to-[#0a3d62] px-6 py-8 text-white">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-sky-300/10 blur-2xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-blue-300/60 mb-1">
                <ShieldCheckIcon className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Onda Care · Workspace</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight">Riwayat Request Saya</h1>
              <p className="text-sm text-blue-100/60 max-w-md">
                Pantau status laporan dan tinjau kembali data yang telah Anda kirimkan.
              </p>
            </div>

            {/* Stat chips */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-2.5 rounded-xl bg-white/10 border border-white/10 px-4 py-2.5">
                <Ticket className="h-4 w-4 text-blue-200" />
                <div>
                  <p className="text-[10px] text-blue-200/60 font-medium uppercase tracking-wide leading-none">Total</p>
                  <p className="text-lg font-black leading-tight">{tickets.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl bg-emerald-400/10 border border-emerald-400/20 px-4 py-2.5">
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                <div>
                  <p className="text-[10px] text-emerald-200/60 font-medium uppercase tracking-wide leading-none">Selesai</p>
                  <p className="text-lg font-black text-emerald-300 leading-tight">{doneCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl bg-amber-400/10 border border-amber-400/20 px-4 py-2.5">
                <div className="h-2 w-2 rounded-full bg-amber-400" />
                <div>
                  <p className="text-[10px] text-amber-200/60 font-medium uppercase tracking-wide leading-none">Proses</p>
                  <p className="text-lg font-black text-amber-300 leading-tight">{pendingCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 space-y-5 animate-in fade-in duration-500">

        {/* ── Filter Bar ────────────────────────────────────────────────── */}
        <div className="sticky top-[60px] z-30 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-md shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari laporan, toko, atau kata kunci..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-4 text-sm outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <TagIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-7 text-sm outline-none transition-all focus:border-blue-400 focus:bg-white cursor-pointer"
                >
                  <option value="">Semua Kategori</option>
                  {kategoriOptions.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="relative">
                <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-3 text-sm outline-none transition-all focus:border-blue-400 focus:bg-white"
                />
              </div>

              {hasFilters && (
                <button
                  onClick={clearFilter}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                >
                  <XMarkIcon className="h-3.5 w-3.5" />
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Error ─────────────────────────────────────────────────────── */}
        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* ── Content ───────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : visibleTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-20 gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <Ticket className="h-7 w-7 text-slate-300" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-600">Tidak ada request ditemukan</p>
              <p className="text-xs text-slate-400 mt-0.5">Coba ubah kata kunci atau filter Anda.</p>
            </div>
            {hasFilters && (
              <button onClick={clearFilter} className="text-xs font-bold text-blue-500 hover:underline mt-1">
                Reset filter
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-xs font-medium text-slate-400">
              Menampilkan <span className="font-bold text-slate-600">{visibleTickets.length}</span> dari{' '}
              <span className="font-bold text-slate-600">{tickets.length}</span> laporan
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {visibleTickets.map((ticket) => (
                <TicketCard key={ticket.ticket_id} ticket={ticket} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}