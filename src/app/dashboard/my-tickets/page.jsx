'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  PaperClipIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  CalendarIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  UserIcon,
  BuildingStorefrontIcon,
  PhoneIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { LayoutDashboard, History, Ticket } from 'lucide-react';

const getStatusClass = (status) => {
  switch (status) {
    case 'Open':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Pending':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Done':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Rejected':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
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
    const setCat = new Set(tickets.map((t) => t.kategori).filter(Boolean));
    return Array.from(setCat);
  }, [tickets]);

  const visibleTickets = tickets.filter((ticket) => {
    const d = new Date(ticket.createdAt);
    if (isNaN(d.getTime())) return false;
    if (selectedMonth) {
      const monthStr = d.getFullYear().toString() + '-' + String(d.getMonth() + 1).padStart(2, '0');
      if (monthStr !== selectedMonth) return false;
    }
    if (selectedCategory && ticket.kategori !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const combined = `${ticket.title} ${ticket.detail?.description || ''} ${ticket.nama_pengisi || ''} ${ticket.toko || ''} ${ticket.kategori || ''} ${ticket.status || ''}`.toLowerCase();
      if (!combined.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 pb-12 animate-in fade-in duration-700">
      
      {/* HEADER HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-blue-800 p-6 text-white shadow-xl shadow-blue-900/20 sm:p-8">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-200">
              <History className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Onda Care Workspace</span>
            </div>
            <h1 className="text-2xl font-extrabold sm:text-3xl">Riwayat Request Saya</h1>
            <p className="text-sm text-blue-100/80 max-w-xl">
              Pantau status laporan dan tinjau kembali data yang telah Anda kirimkan sebelumnya.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-md ring-1 ring-white/20">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase text-blue-200">Total Laporan</p>
              <p className="text-2xl font-black">{tickets.length}</p>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <Ticket className="h-8 w-8 text-blue-300 opacity-50" />
          </div>
        </div>
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-400/10 blur-3xl" />
      </section>

      {/* FILTER BAR */}
      <section className="sticky top-20 z-30 rounded-2xl border border-slate-200 bg-white/80 p-4 backdrop-blur-md shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari laporan, toko, atau kata kunci..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex items-center">
              <TagIcon className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white pl-9 pr-8 py-2 text-sm focus:border-blue-500 outline-none transition-all appearance-none"
              >
                <option value="">Semua Kategori</option>
                {kategoriOptions.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <ChevronDownIcon className="absolute right-3 h-3 w-3 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative flex items-center">
              <CalendarIcon className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-sm focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {(selectedMonth || selectedCategory || searchQuery) && (
              <button
                onClick={() => { setSelectedMonth(''); setSelectedCategory(''); setSearchQuery(''); }}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 px-2 underline-offset-4 hover:underline"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>
      </section>

      {/* LIST CONTENT */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium text-slate-500">Menyusun riwayat Anda...</p>
        </div>
      ) : visibleTickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50">
          <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
             <Ticket className="h-8 w-8 text-slate-300" />
          </div>
          <p className="text-slate-600 font-medium text-sm">Tidak ada request yang ditemukan.</p>
          <p className="text-slate-400 text-xs">Coba ubah kata kunci atau filter Anda.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {visibleTickets.map((ticket) => (
            <div
              key={ticket.ticket_id}
              className="group flex flex-col rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/5 overflow-hidden"
            >
              {/* Card Header & Status */}
              <div className="p-5 sm:p-6 border-b border-slate-100">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusClass(ticket.status)}`}>
                      {ticket.status}
                    </span>
                    <h2 className="text-base font-bold text-slate-900 line-clamp-2 pt-1 group-hover:text-blue-700 transition-colors">
                      {ticket.title}
                    </h2>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="font-bold text-blue-600">{ticket.ticket_id}</span>
                      <span>•</span>
                      <span>{new Date(ticket.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Body - Info Grid */}
              <div className="p-5 sm:p-6 bg-slate-50/50 flex-grow space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><UserIcon className="h-3 w-3" /> Pelapor</p>
                    <p className="text-xs font-semibold text-slate-700 truncate">{ticket.nama_pengisi || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><BuildingStorefrontIcon className="h-3 w-3" /> Toko</p>
                    <p className="text-xs font-semibold text-slate-700 truncate">{ticket.toko || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><PhoneIcon className="h-3 w-3" /> WhatsApp</p>
                    <p className="text-xs font-semibold text-slate-700 truncate">{ticket.no_telepon || '-'}</p>
                  </div>
                </div>

                <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Detail Permintaan</p>
                  <p className="text-sm leading-relaxed text-slate-600 italic sm:not-italic">
                    {ticket.detail?.description || 'Tidak ada deskripsi tambahan.'}
                  </p>
                  
                  {ticket.detail?.attachments_json?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                      {ticket.detail.attachments_json.map((file, idx) => (
                        <a
                          key={idx}
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/10 hover:bg-blue-100 transition-colors"
                        >
                          <PaperClipIcon className="h-3.5 w-3.5" />
                          <span className="max-w-[120px] truncate">{file.name}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer - Timeline & PIC */}
              <div className="px-5 py-4 bg-white border-t border-slate-100">
                {/* <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                        <UserIcon className="h-4 w-4 text-slate-500" />
                      </div>
                      <div className="text-[11px]">
                        <p className="text-slate-400 font-medium">PIC Saat Ini</p>
                        <p className="font-bold text-slate-700">
                          {ticket.assignments?.length > 0 ? ticket.assignments[0].user.name : 'Permintaan Selesai'}
                        </p>
                      </div>
                   </div>
                </div> */}

                {ticket.logs?.length > 0 && (
                  <details className="group border-t border-slate-50 pt-2">
                    <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                      <span>Riwayat Aktivitas ({ticket.logs.length})</span>
                      <ChevronDownIcon className="h-4 w-4 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="mt-3 space-y-4 max-h-48 overflow-y-auto pr-2 pb-2">
                      {ticket.logs.map((log) => (
                        <div key={log.log_id} className="relative pl-4 border-l border-slate-200">
                          <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-blue-500 ring-4 ring-white" />
                          <div className="flex items-center justify-between gap-2">
                             <p className="text-[11px] font-bold text-slate-900">{log.actor.name}</p>
                             <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase leading-none">
                                {log.action_type}
                             </span>
                          </div>
                          {log.notes && <p className="mt-0.5 text-xs text-slate-500 leading-snug">{log.notes}</p>}
                          <p className="mt-1 text-[9px] text-slate-400 font-medium uppercase tracking-tighter">
                            {new Date(log.timestamp).toLocaleString('id-ID')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}