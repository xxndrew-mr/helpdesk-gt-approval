// Lokasi: src/app/dashboard/queue/page.jsx

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

// === Komponen Aksi Triase (Hanya untuk PIC OMI) ===
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
        body: JSON.stringify({
          type: actionType,
          notes: notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Gagal melakukan aksi');
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      onError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
      <h3 className="text-xs font-semibold text-slate-800">
        Aksi Triase (PIC OMI)
      </h3>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Tambahkan catatan triase (opsional)..."
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        rows="2"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => handleSubmit('Request')}
          disabled={isLoading}
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isLoading ? 'Loading...' : 'Triase sebagai Request'}
        </button>
        <button
          onClick={() => handleSubmit('Feedback')}
          disabled={isLoading}
          className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm shadow-sky-200 transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isLoading ? 'Loading...' : 'Triase sebagai Feedback'}
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
        body: JSON.stringify({
          action: actionType,
          notes: notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Gagal melakukan aksi');
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      onError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-3 rounded-2xl border border-indigo-200 bg-indigo-50/70 p-3">
      <h3 className="text-xs font-semibold text-slate-800">
        Aksi Sales Manager
      </h3>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Tambahkan catatan (wajib)..."
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        rows="2"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => handleSubmit('approve')}
          disabled={isLoading}
          className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm shadow-emerald-200 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isLoading ? 'Loading...' : 'Approve (ke Acting Mgr)'}
        </button>
        <button
          onClick={() => handleSubmit('reject')}
          disabled={isLoading}
          className="inline-flex items-center justify-center rounded-xl bg-rose-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm shadow-rose-200 transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isLoading ? 'Loading...' : 'Reject Request'}
        </button>
        <button
          onClick={() => handleSubmit('complete')}
          disabled={isLoading}
          className="inline-flex items-center justify-center rounded-xl bg-slate-700 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm shadow-slate-300 transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isLoading ? 'Loading...' : 'Selesaikan (Complete)'}
        </button>
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
        body: JSON.stringify({
          action: actionType,
          notes: notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Gagal melakukan aksi');
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      onError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3">
      <h3 className="text-xs font-semibold text-slate-800">
        Aksi Acting Manager
      </h3>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Tambahkan catatan (wajib)..."
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
        rows="2"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => handleSubmit('approve')}
          disabled={isLoading}
          className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm shadow-emerald-200 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isLoading ? 'Loading...' : 'Approve (ke Acting PIC)'}
        </button>
        <button
          onClick={() => handleSubmit('reject')}
          disabled={isLoading}
          className="inline-flex items-center justify-center rounded-xl bg-rose-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm shadow-rose-200 transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isLoading ? 'Loading...' : 'Reject Request'}
        </button>
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
        body: JSON.stringify({
          action: actionType,
          notes: notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Gagal melakukan aksi');
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      onError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-3 rounded-2xl border border-violet-200 bg-violet-50/70 p-3">
      <h3 className="text-xs font-semibold text-slate-800">
        Aksi Acting PIC
      </h3>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Tambahkan catatan (wajib)..."
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-gray-900 shadow-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
        rows="2"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => handleSubmit('complete')}
          disabled={isLoading}
          className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm shadow-violet-200 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isLoading ? 'Loading...' : 'Selesaikan Request'}
        </button>
        <button
          onClick={() => handleSubmit('return')}
          disabled={isLoading}
          className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm shadow-amber-200 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isLoading ? 'Loading...' : 'Kembalikan'}
        </button>
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
  const [selectedId, setSelectedId] = useState(null); // card yang dipilih

  const loadQueue = async () => {
    setError(null);
    setActionError(null);
    try {
      const res = await fetch('/api/queue/my-queue?type=Active');
      if (!res.ok) {
        throw new Error('Gagal mengambil data antrian');
      }
      const data = await res.json();
      setAssignments(data);
      if (selectedId && !data.find((a) => a.assignment_id === selectedId)) {
        setSelectedId(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      loadQueue();
    }
  }, [session]);

  if (isLoading)
    return (
      <div className="flex justify-center py-10 text-slate-500 text-sm">
        Memuat antrian...
      </div>
    );

  if (error)
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        Error: {error}
      </div>
    );

  return (
    <div className="px-4 py-6">
      {/* HEADER */}
      <div className="relative mb-6 overflow-hidden rounded-3xl bg-indigo-600 px-6 py-5 shadow-lg">
        <h1 className="text-xl font-semibold tracking-tight text-white">
          Antrian Tugas Aktif
        </h1>
        <p className="mt-1 text-xs text-indigo-100">
          Klik salah satu kartu untuk melihat detail dan melakukan aksi.
        </p>
        <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] text-indigo-50">
          <span>Total antrian:</span>
          <span className="font-semibold">{assignments.length}</span>
        </div>
        <div className="absolute -bottom-10 -right-10 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
      </div>

      {/* NOTIFIKASI ERROR AKSI */}
      {actionError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          Error Aksi: {actionError}
        </div>
      )}

      {/* WRAPPER KONTEN */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {assignments.length === 0 ? (
          <p className="text-sm text-gray-600">
            Tidak ada tugas di antrian Anda saat ini.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {assignments.map((assignment) => {
              const isSelected = selectedId === assignment.assignment_id;

              return (
                <div
                  key={assignment.assignment_id}
                  onClick={() =>
                    setSelectedId(
                      isSelected ? null : assignment.assignment_id
                    )
                  }
                  className={`group relative cursor-pointer rounded-2xl border bg-white p-3 shadow-sm transition-all ${
                    isSelected
                      ? 'border-indigo-400 ring-2 ring-indigo-200 bg-indigo-50/40'
                      : 'border-slate-200 hover:border-indigo-200 hover:shadow-md'
                  }`}
                >
                  {/* Badge dipilih */}
                  {isSelected && (
                    <span className="absolute right-3 top-3 rounded-full bg-indigo-600 px-2.5 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                      Sedang Dipilih
                    </span>
                  )}

                  {/* Header ringkas */}
                  <div className="flex flex-col gap-1 pr-16">
                    <h2 className="text-sm font-semibold text-slate-900 line-clamp-2">
                      {assignment.ticket.title}
                    </h2>
                    <p className="text-[10px] text-slate-500">
                      Ticket ID: {assignment.ticket.ticket_id}
                    </p>
                  </div>

                  {/* Meta chips (selalu terlihat) */}
                  <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                      Oleh: {assignment.ticket.submittedBy.name}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 font-medium text-indigo-700">
                      {assignment.ticket.kategori} • {assignment.ticket.sub_kategori}
                    </span>
                    {assignment.ticket.toko && (
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-800">
                        Toko: {assignment.ticket.toko}
                      </span>
                    )}
                    {assignment.ticket.jabatan && (
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-800">
                        Jabatan: {assignment.ticket.jabatan}
                      </span>
                    )}
                  </div>

                  {/* Hint kalau belum dipilih */}
                  {!isSelected && (
                    <p className="mt-2 text-[10px] text-slate-400">
                      Klik untuk melihat deskripsi dan aksi.
                    </p>
                  )}

                  {/* Detail hanya muncul kalau dipilih */}
                  {isSelected && (
                    <div className="mt-3 border-t border-slate-200 pt-3">
                      {/* Deskripsi */}
                      <p className="text-xs leading-relaxed text-gray-800">
                        {assignment.ticket.detail?.description ||
                          '(Tidak ada deskripsi)'}
                      </p>

                      {/* Area Aksi */}
                      <div className="mt-3">
                        {session?.user?.role === 'PIC OMI' &&
                          assignment.ticket.type === 'Pending' && (
                            <TriageActions
                              ticketId={assignment.ticket.ticket_id}
                              onSuccess={loadQueue}
                              onError={setActionError}
                            />
                          )}

                        {session?.user?.role === 'Sales Manager' &&
                          assignment.ticket.type === 'Request' && (
                            <SalesManagerActions
                              ticketId={assignment.ticket.ticket_id}
                              onSuccess={loadQueue}
                              onError={setActionError}
                            />
                          )}

                        {session?.user?.role === 'Acting Manager' &&
                          assignment.ticket.type === 'Request' && (
                            <ActingManagerActions
                              ticketId={assignment.ticket.ticket_id}
                              onSuccess={loadQueue}
                              onError={setActionError}
                            />
                          )}

                        {session?.user?.role === 'Acting PIC' &&
                          assignment.ticket.type === 'Request' && (
                            <ActingPicActions
                              ticketId={assignment.ticket.ticket_id}
                              onSuccess={loadQueue}
                              onError={setActionError}
                            />
                          )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
