'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  PaperClipIcon, 
  ChevronDownIcon, 
  ArrowPathIcon,
  InformationCircleIcon,
  ExclamationCircleIcon,
  UserIcon,
  PhoneIcon,
  BuildingStorefrontIcon,
  ClipboardDocumentCheckIcon,
  CheckBadgeIcon,
  ArrowRightCircleIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

// === Komponen Aksi Tindak Lanjut (PIC OMI) ===
function TriageActions({ ticketId, onSuccess, onError }) {
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (actionType) => {
    setIsLoading(true);
    onError(null);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/triage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: actionType, notes: notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal melakukan aksi');
      onSuccess();
    } catch (err) {
      onError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/30 p-5 shadow-inner animate-in slide-in-from-top-2 duration-300" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-2 mb-4">
        <ArrowRightCircleIcon className="h-5 w-5 text-blue-600" />
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Tindak Lanjut PIC OMI</h3>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Berikan catatan penanganan..."
        rows={3}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
      />
      <div className="mt-4 flex flex-wrap gap-3">
        <button onClick={() => handleSubmit('Request')} disabled={isLoading} className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all disabled:bg-slate-300">
          {isLoading ? 'Memproses...' : 'Diteruskan (Request)'}
        </button>
        <button onClick={() => handleSubmit('Feedback')} disabled={isLoading} className="rounded-xl bg-white border border-blue-200 px-5 py-2.5 text-xs font-bold text-blue-600 hover:bg-blue-50 transition-all">
          {isLoading ? 'Memproses...' : 'Hanya Informasi (Feedback)'}
        </button>
      </div>
    </div>
  );
}

// === Komponen Aksi Sales Manager ===
function SalesManagerActions({ ticketId, onSuccess, onError }) {
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (actionType) => {
    if (notes.trim() === '') {
      onError('Catatan wajib diisi untuk aksi ini.');
      return;
    }
    setIsLoading(true);
    onError(null);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/sm-process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionType, notes: notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal melakukan aksi');
      onSuccess();
    } catch (err) {
      onError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5 shadow-inner" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-2 mb-4 text-indigo-700">
        <CheckBadgeIcon className="h-5 w-5" />
        <h3 className="text-sm font-bold uppercase tracking-tight">Keputusan Sales Manager</h3>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Berikan catatan keputusan (wajib)..."
        rows={3}
        className="w-full rounded-xl border border-indigo-200 bg-white px-4 py-3 text-sm focus:border-indigo-500 transition-all outline-none"
      />
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button onClick={() => handleSubmit('approve')} disabled={isLoading} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-all">Approve</button>
        <button onClick={() => handleSubmit('reject')} disabled={isLoading} className="rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-rose-700 transition-all">Reject</button>
        <button onClick={() => handleSubmit('complete')} disabled={isLoading} className="rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-900 transition-all">Selesaikan</button>
      </div>
    </div>
  );
}

// === Komponen Aksi Acting Manager ===
function ActingManagerActions({ ticketId, onSuccess, onError }) {
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (actionType) => {
    if (notes.trim() === '') {
      onError('Catatan wajib diisi untuk aksi ini.');
      return;
    }
    setIsLoading(true);
    onError(null);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/am-process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionType, notes: notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal melakukan aksi');
      onSuccess();
    } catch (err) {
      onError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5 shadow-inner" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-2 mb-4 text-emerald-700">
        <ClipboardDocumentCheckIcon className="h-5 w-5" />
        <h3 className="text-sm font-bold uppercase tracking-tight">Persetujuan Acting Manager</h3>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Alasan keputusan (wajib)..."
        rows={3}
        className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm focus:border-emerald-500 outline-none"
      />
      <div className="mt-4 flex gap-3">
        <button onClick={() => handleSubmit('approve')} disabled={isLoading} className="flex-1 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white hover:bg-emerald-700">Approve</button>
        <button onClick={() => handleSubmit('reject')} disabled={isLoading} className="flex-1 rounded-xl bg-rose-600 py-3 text-xs font-bold text-white hover:bg-rose-700">Reject</button>
      </div>
    </div>
  );
}

// === Komponen Aksi Acting PIC ===
function ActingPicActions({ ticketId, onSuccess, onError }) {
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (actionType) => {
    if (notes.trim() === '') {
      onError('Catatan wajib diisi untuk aksi ini.');
      return;
    }
    setIsLoading(true);
    onError(null);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/ap-process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionType, notes: notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal melakukan aksi');
      onSuccess();
    } catch (err) {
      onError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-6 rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-2 mb-4 text-violet-700">
        <ChatBubbleLeftRightIcon className="h-5 w-5" />
        <h3 className="text-sm font-bold uppercase tracking-tight">Finalisasi Acting PIC</h3>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Tuliskan catatan penyelesaian..."
        rows={3}
        className="w-full rounded-xl border border-violet-200 bg-white px-4 py-3 text-sm focus:border-violet-500 transition-all outline-none"
      />
      <div className="mt-4 flex gap-3">
        <button onClick={() => handleSubmit("complete")} disabled={isLoading} className="flex-1 rounded-xl bg-violet-600 py-3 text-xs font-bold text-white shadow-lg shadow-violet-200 hover:bg-violet-700">Selesaikan Permintaan</button>
        <button onClick={() => handleSubmit("return")} disabled={isLoading} className="flex-1 rounded-xl bg-amber-500 py-3 text-xs font-bold text-white hover:bg-amber-600">Kembalikan ke Pengirim</button>
      </div>
    </div>
  );
}

export default function QueuePage() {
  const { data: session } = useSession();
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const loadQueue = async () => {
    setError(null);
    setActionError(null);
    try {
      const res = await fetch('/api/queue/my-queue?type=Active');
      if (!res.ok) throw new Error('Gagal mengambil data antrian');
      const data = await res.json();
      setAssignments(data);
      if (selectedId && !data.find((a) => a.assignment_id === selectedId)) setSelectedId(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { if (session) loadQueue(); }, [session]);

  if (isLoading) return <div className="flex justify-center py-20 text-blue-600 font-medium animate-pulse">Memuat antrian tugas...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-in fade-in duration-700">
      
      {/* HERO HEADER */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-blue-800 p-8 text-white shadow-xl shadow-blue-900/20">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-blue-200 mb-2">
            <ClipboardDocumentCheckIcon className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Pusat Kendali Operasional</span>
          </div>
          <h1 className="text-3xl font-black">Antrian Tugas Aktif</h1>
          <p className="mt-2 text-blue-100/70 max-w-lg">Pilih laporan untuk meninjau detail dan memberikan keputusan atau penanganan teknis.</p>
          
          <div className="mt-6 inline-flex items-center gap-4 rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/10">
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/20">
              <ArrowPathIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-blue-200 opacity-70 tracking-wider">Laporan Menunggu</p>
              <p className="text-2xl font-black">{assignments.length}</p>
            </div>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
      </div>

      {/* ERROR MESSAGE */}
      {(error || actionError) && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-700 animate-in zoom-in-95 duration-300">
          <ExclamationCircleIcon className="h-6 w-6 flex-shrink-0" />
          <p className="text-sm font-medium">{error || actionError}</p>
        </div>
      )}

      {/* QUEUE LIST */}
      <div className="space-y-4">
        {assignments.length === 0 ? (
          <div className="text-center py-20 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400">
             <CheckBadgeIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
             <p className="font-medium italic">Bagus! Tidak ada tugas yang tertunda saat ini.</p>
          </div>
        ) : (
          assignments.map((assignment) => {
  const isSelected = selectedId === assignment.assignment_id;

  // ✅ TARO DI SINI
  const isActiveAssignment = assignment.assignment_type === 'Active';
  const isPicOmi = ['PIC OMI', 'PIC OMI (SS)'].includes(session?.user?.role);



            return (
              <div
                key={assignment.assignment_id}
                onClick={() => setSelectedId(isSelected ? null : assignment.assignment_id)}
                className={`group overflow-hidden rounded-3xl border transition-all duration-300 cursor-pointer ${
                  isSelected 
                    ? 'border-blue-500 bg-white shadow-xl ring-4 ring-blue-500/10' 
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg'
                }`}
              >
                {/* Header Kartu */}
                <div className="p-5 sm:p-6 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-tighter">
                        #{assignment.ticket.ticket_id}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400">•</span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{assignment.ticket.kategori}</span>
                    </div>
                    <h2 className={`text-base font-bold transition-colors ${isSelected ? 'text-blue-700' : 'text-slate-900'}`}>
                      {assignment.ticket.title}
                    </h2>
                    
                    {/* Metadata Chips */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                        <UserIcon className="h-3 w-3" /> {assignment.ticket.submittedBy?.name || '-'}
                      </div>
                      {assignment.ticket.toko && (
                        <div className="flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-3 py-1 rounded-lg">
                          <BuildingStorefrontIcon className="h-3 w-3" /> {assignment.ticket.toko}
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronDownIcon className={`h-6 w-6 text-slate-300 transition-transform duration-300 ${isSelected ? 'rotate-180 text-blue-500' : ''}`} />
                </div>

                {/* Detail Expanded */}
                <div className={`transition-all duration-500 ease-in-out ${isSelected ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                  <div className="p-6 border-t border-slate-50 bg-slate-50/50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      <div className="bg-white p-4 rounded-2xl border border-slate-200">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><UserIcon className="h-3 w-3" /> Nama Pengisi</p>
                        <p className="text-sm font-bold text-slate-800">{assignment.ticket.nama_pengisi || '-'}</p>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-slate-200">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><PhoneIcon className="h-3 w-3" /> No. Telepon</p>
                        <p className="text-sm font-bold text-slate-800">{assignment.ticket.no_telepon || '-'}</p>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 mb-6 shadow-sm">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Deskripsi Permintaan</p>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                        {assignment.ticket.detail?.description || "Tidak ada deskripsi tambahan."}
                      </p>
                    </div>

                    {/* Lampiran */}
                    {Array.isArray(assignment.ticket.detail?.attachments_json) && assignment.ticket.detail.attachments_json.length > 0 && (
                      <div className="mb-6">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                           <PaperClipIcon className="h-4 w-4" /> Lampiran Pendukung
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {assignment.ticket.detail.attachments_json.map((file, idx) => (
                            <a key={idx} href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl border border-blue-100 bg-white px-4 py-2 text-xs font-bold text-blue-600 shadow-sm hover:bg-blue-50 hover:border-blue-300 transition-all">
                              <PaperClipIcon className="h-4 w-4" />
                              <span className="truncate max-w-[120px]">{file.name}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ACTIONS BASED ON ROLE */}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2 mb-2">
                         <InformationCircleIcon className="h-4 w-4 text-slate-400" />
                         <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">Panel Keputusan</span>
                      </div>
                      
                      {isPicOmi && isActiveAssignment && (
  <TriageActions
    ticketId={assignment.ticket.ticket_id}
    onSuccess={loadQueue}
    onError={setActionError}
  />
)}

                      {session?.user?.role === 'Sales Manager' && assignment.ticket.type === 'Request' && (
                        <SalesManagerActions ticketId={assignment.ticket.ticket_id} onSuccess={loadQueue} onError={setActionError} />
                      )}
                      {session?.user?.role === 'Acting Manager' && assignment.ticket.type === 'Request' && (
                        <ActingManagerActions ticketId={assignment.ticket.ticket_id} onSuccess={loadQueue} onError={setActionError} />
                      )}
                      {session?.user?.role === 'Acting PIC' && assignment.ticket.type === 'Request' && (
                        <ActingPicActions ticketId={assignment.ticket.ticket_id} onSuccess={loadQueue} onError={setActionError} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}