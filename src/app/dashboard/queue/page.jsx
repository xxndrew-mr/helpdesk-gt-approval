// Lokasi: src/app/dashboard/queue/page.jsx

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { PaperClipIcon } from '@heroicons/react/24/outline';

// === Komponen Aksi Kirim (dulu: Triase) – Hanya untuk PIC OMI ===
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
  <div
    className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    onClick={(e) => e.stopPropagation()}
  >
    {/* Header */}
    <div className="mb-3">
      <h3 className="text-sm font-semibold text-slate-900">
        Aksi Tindak Lanjut
      </h3>
      <p className="mt-0.5 text-[11px] text-slate-500">
        Gunakan aksi di bawah ini untuk menindaklanjuti atau mengubah jenis permintaan.
      </p>
    </div>

    {/* Notes */}
    <div>
      <label className="mb-1 block text-[11px] font-medium text-slate-600">
        Catatan (opsional)
      </label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Contoh: Request diteruskan ke tim terkait / perlu klarifikasi tambahan..."
        rows={3}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 shadow-sm transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
      />
    </div>

    {/* Action Buttons */}
    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
      <button
        onClick={() => handleSubmit('Request')}
        disabled={isLoading}
        className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isLoading ? 'Memproses...' : 'Perlu Ditindaklanjuti'}
      </button>

      <button
        onClick={() => handleSubmit('Feedback')}
        disabled={isLoading}
        className="inline-flex items-center justify-center rounded-xl border border-sky-200 bg-sky-50 px-4 py-2 text-xs font-semibold text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? 'Memproses...' : 'Hanya Informasi'}
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
  <div
    className="mt-4 rounded-2xl border border-indigo-200 bg-white p-4 shadow-sm"
    onClick={(e) => e.stopPropagation()}
  >
    {/* Header */}
    <div className="mb-3">
      <h3 className="text-sm font-semibold text-slate-900">
        Aksi Persetujuan Sales Manager
      </h3>
      <p className="mt-0.5 text-[11px] text-slate-500">
        Tentukan keputusan akhir untuk request ini dengan menyertakan catatan.
      </p>
    </div>

    {/* Notes */}
    <div>
      <label className="mb-1 block text-[11px] font-medium text-slate-600">
        Catatan Keputusan <span className="text-rose-500">*</span>
      </label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Contoh: Disetujui untuk diteruskan ke Acting Manager / Ditolak karena data belum lengkap"
        rows={3}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 shadow-sm transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
      />
      <p className="mt-1 text-[10px] text-slate-400">
        * Catatan wajib diisi untuk setiap keputusan.
      </p>
    </div>

    {/* Action Buttons */}
    <div className="mt-4 grid gap-2 sm:grid-cols-3">
      {/* Approve */}
      <button
        onClick={() => handleSubmit('approve')}
        disabled={isLoading}
        className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isLoading ? 'Memproses...' : 'Approve'}
      </button>

      {/* Reject */}
      <button
        onClick={() => handleSubmit('reject')}
        disabled={isLoading}
        className="inline-flex items-center justify-center rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isLoading ? 'Memproses...' : 'Reject'}
      </button>

      {/* Complete */}
      <button
        onClick={() => handleSubmit('complete')}
        disabled={isLoading}
        className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? 'Memproses...' : 'Selesaikan'}
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
  <div
    className="mt-4 rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm"
    onClick={(e) => e.stopPropagation()}
  >
    {/* Header */}
    <div className="mb-3">
      <h3 className="text-sm font-semibold text-slate-900">
        Aksi Persetujuan Acting Manager
      </h3>
      <p className="mt-0.5 text-[11px] text-slate-500">
        Berikan keputusan lanjutan sebelum request diteruskan atau ditolak.
      </p>
    </div>

    {/* Notes */}
    <div>
      <label className="mb-1 block text-[11px] font-medium text-slate-600">
        Catatan Keputusan <span className="text-rose-500">*</span>
      </label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Contoh: Disetujui untuk diteruskan ke Acting PIC / Ditolak karena informasi belum valid"
        rows={3}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 shadow-sm transition focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
      />
      <p className="mt-1 text-[10px] text-slate-400">
        * Catatan wajib diisi sebagai dasar keputusan.
      </p>
    </div>

    {/* Action Buttons */}
    <div className="mt-4 grid gap-2 sm:grid-cols-2">
      {/* Approve */}
      <button
        onClick={() => handleSubmit('approve')}
        disabled={isLoading}
        className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isLoading ? 'Memproses...' : 'Approve'}
      </button>

      {/* Reject */}
      <button
        onClick={() => handleSubmit('reject')}
        disabled={isLoading}
        className="inline-flex items-center justify-center rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isLoading ? 'Memproses...' : 'Reject'}
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
  <div
    className="mt-4 rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-4 shadow-sm"
    onClick={(e) => e.stopPropagation()}
  >
    {/* Header */}
    <div className="flex items-start justify-between">
      <div>
        <h3 className="text-xs font-semibold text-slate-900">
          Tindakan Acting PIC
        </h3>
        <p className="mt-0.5 text-[11px] text-slate-500">
          Catatan wajib diisi sebagai dokumentasi sebelum mengambil keputusan
        </p>
      </div>
    </div>

    {/* Notes */}
    <div className="mt-3">
      <label className="mb-1 block text-[11px] font-medium text-slate-700">
        Catatan Tindakan
      </label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Contoh: Permintaan telah diverifikasi dan siap diproses / Dikembalikan karena data belum lengkap"
        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
        rows={3}
      />
    </div>

    {/* Actions */}
    <div className="mt-4 flex flex-wrap gap-2">
      <button
        onClick={() => handleSubmit("complete")}
        disabled={isLoading}
        className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-4 py-2 text-[11px] font-semibold text-white shadow-sm shadow-violet-200 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isLoading ? "Memproses..." : "Selesaikan Permintaan"}
      </button>

      <button
        onClick={() => handleSubmit("return")}
        disabled={isLoading}
        className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-2 text-[11px] font-semibold text-white shadow-sm shadow-amber-200 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isLoading ? "Memproses..." : "Kembalikan ke Pengirim"}
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
  const [selectedId, setSelectedId] = useState(null);

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
    <div className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-800 to-blue-900 px-6 py-5 shadow-lg">
      <h1 className="text-xl font-semibold tracking-tight text-white">
        Antrian Tugas Aktif
      </h1>
      <p className="mt-1 text-xs text-indigo-100">
        Pilih kartu tugas untuk melihat detail dan melakukan tindakan lanjutan.
      </p>

      <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] text-indigo-50 backdrop-blur">
        <span>Total antrian</span>
        <span className="font-semibold">{assignments.length}</span>
      </div>

      <div className="pointer-events-none absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
    </div>

    {actionError && (
      <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
        <span className="font-semibold">Gagal memproses aksi:</span>{' '}
        {actionError}
      </div>
    )}

    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {assignments.length === 0 ? (
        <p className="text-sm text-slate-500">
          Tidak ada tugas yang perlu ditindaklanjuti saat ini.
        </p>
      ) : (
        <div className="flex flex-col gap-4">

          {assignments.map((assignment) => {
            const isSelected = selectedId === assignment.assignment_id;

            const pengirim = assignment.ticket.nama_pengisi || '-';
            const noTelepon = assignment.ticket.no_telepon || '-';

            return (
              <div
                key={assignment.assignment_id}
                onClick={() =>
                  setSelectedId(
                    isSelected ? null : assignment.assignment_id
                  )
                }
                className={`group relative cursor-pointer rounded-2xl border p-4 transition-all ${
                  isSelected
                    ? 'border-indigo-400 bg-indigo-50/60 ring-2 ring-indigo-200'
                    : 'border-slate-200 bg-white hover:border-indigo-200 hover:shadow-md'
                }`}
              >
                {/* Status */}
                {isSelected && (
                  <span className="absolute right-4 top-4 rounded-full bg-indigo-600 px-2.5 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                    Dipilih
                  </span>
                )}

                {/* Title */}
                <div className="pr-16">
                  <h2 className="text-sm font-semibold text-slate-900 line-clamp-2">
                    {assignment.ticket.title}
                  </h2>
                  <p className="mt-0.5 text-[10px] text-slate-500">
                    Ticket ID • {assignment.ticket.ticket_id}
                  </p>
                </div>

                {/* Meta Chips */}
                <div className="mt-3 flex flex-wrap gap-1.5 text-[10px]">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                    Agen: {assignment.ticket.submittedBy?.name || '-'}
                  </span>

                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 font-medium text-indigo-700">
                    {assignment.ticket.kategori} • {assignment.ticket.sub_kategori}
                  </span>

                  {assignment.ticket.toko && (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-800">
                      Toko: {assignment.ticket.toko}
                    </span>
                  )}

                  {assignment.ticket.jabatan && (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-800">
                      Jabatan: {assignment.ticket.jabatan}
                    </span>
                  )}
                </div>

                {!isSelected && (
                  <p className="mt-3 text-[10px] text-slate-400">
                    Klik kartu untuk melihat detail lengkap dan aksi.
                  </p>
                )}

                            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out transform
                ${isSelected ? 'max-h-[2000px] opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-2'}
              `}
            >
              <div className="mt-4 border-t border-slate-200 pt-4">

                {/* Meta Detail */}
                <div className="mb-3 grid gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:grid-cols-2">
                  {/* Pengirim */}
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-slate-500">
                      Pengirim
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-900">
                      {pengirim}
                    </p>
                  </div>

                  {/* No HP */}
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-slate-500">
                      Nomor HP
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-900">
                      {noTelepon}
                    </p>
                  </div>
                </div>

                {/* Keterangan Permintaan */}
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Keterangan Permintaan
                  </p>

                  {assignment.ticket.detail?.description ? (
                    <p className="text-sm leading-relaxed text-slate-800 whitespace-pre-line">
                      {assignment.ticket.detail.description}
                    </p>
                  ) : (
                    <p className="text-sm italic text-slate-400">
                      Pengirim belum menuliskan keterangan tambahan.
                    </p>
                  )}
                </div>

                {/* Lampiran */}
                {Array.isArray(assignment.ticket.detail?.attachments_json) &&
                  assignment.ticket.detail.attachments_json.length > 0 && (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                      <div className="mb-2 flex items-center gap-2">
                        <PaperClipIcon className="h-4 w-4 text-indigo-500" />
                        <h4 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          Lampiran Pendukung
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          ({assignment.ticket.detail.attachments_json.length})
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {assignment.ticket.detail.attachments_json.map((file, idx) => (
                          <a
                            key={idx}
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-700 shadow-sm transition-all hover:border-indigo-300 hover:bg-indigo-100"
                          >
                            <PaperClipIcon className="h-4 w-4 shrink-0" />
                            <span className="max-w-[160px] truncate">
                              {file.name}
                            </span>
                            <span className="ml-auto text-[10px] text-indigo-400 opacity-0 transition group-hover:opacity-100">
                              Buka
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Actions */}
                <div className="mt-4">
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
            </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  </div>
);

}
