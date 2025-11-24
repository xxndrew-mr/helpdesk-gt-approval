'use client';

import { useState, useEffect } from 'react';
import {
  BookmarkIcon,
  ArchiveBoxIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

// === ACTION BUTTONS ===
function FeedbackActions({ assignment, onSuccess, onError }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (actionType) => {
    setIsLoading(true);
    onError(null);

    try {
      const res = await fetch(
        `/api/assignments/${assignment.assignment_id}/feedback-process`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: actionType }),
        }
      );

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
    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
      <h3 className="text-sm font-semibold text-slate-800">Aksi Feedback</h3>

      <div className="mt-3 flex flex-wrap gap-3">
        {assignment.status === 'Pending' && (
          <button
            onClick={() => handleSubmit('bookmark')}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-yellow-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-yellow-200 hover:bg-yellow-500 disabled:bg-slate-400"
          >
            <BookmarkIcon className="h-4 w-4" />
            {isLoading ? 'Memproses...' : 'Bookmark'}
          </button>
        )}

        {assignment.status !== 'Archived' && (
          <button
            onClick={() => handleSubmit('archive')}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-700 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-slate-300 hover:bg-slate-600 disabled:bg-slate-400"
          >
            <ArchiveBoxIcon className="h-4 w-4" />
            {isLoading ? 'Memproses...' : 'Archive'}
          </button>
        )}
      </div>
    </div>
  );
}

// ===================================================

export default function FeedbackQueuePage() {
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);

  const [expandedId, setExpandedId] = useState(null);

  const loadQueue = async () => {
    setError(null);
    setActionError(null);
    try {
      const res = await fetch('/api/queue/my-queue?type=Feedback_Review');
      if (!res.ok) throw new Error('Gagal mengambil data antrian');
      const data = await res.json();
      setAssignments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  if (isLoading)
    return (
      <div className="flex justify-center py-10 text-slate-500 text-sm">
        Memuat antrian feedback...
      </div>
    );

  if (error)
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-red-700">
        Error: {error}
      </div>
    );

  return (
    <div className="px-4 py-6">
      {/* HEADER */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-blue-600 px-6 py-6 shadow-lg">
        <h1 className="text-2xl font-semibold text-white tracking-tight">
          Antrian Feedback
        </h1>
        <p className="text-blue-100 mt-1 text-sm">
          Semua feedback yang masuk menunggu tindak lanjut Anda.
        </p>
        <div className="absolute -bottom-10 -right-10 h-32 w-32 bg-white/10 rounded-full blur-2xl" />
      </div>

      {/* NOTIF ERROR AKSI */}
      {actionError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          Error Aksi: {actionError}
        </div>
      )}

      {/* LIST */}
      <div>
        {assignments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white py-10 text-center text-sm text-slate-500">
            Tidak ada feedback untuk diproses.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {assignments.map((assignment) => {
              const isExpanded = expandedId === assignment.assignment_id;
              const ticket = assignment.ticket;

              return (
                <div
                  key={assignment.assignment_id}
                  className={`group cursor-pointer rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md ${
                    isExpanded
                      ? 'border-blue-500 bg-blue-50/70'
                      : 'border-slate-200 hover:border-blue-300'
                  }`}
                  onClick={() =>
                    setExpandedId(
                      isExpanded ? null : assignment.assignment_id
                    )
                  }
                >
                  {/* HEADER CARD */}
                  <div className="flex justify-between items-start">
                    <h2 className="text-[12px] font-semibold text-slate-900 line-clamp-2">
                      {ticket.title}
                    </h2>
                    <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700">
                      {assignment.status}
                    </span>
                  </div>

                  {/* Chips */}
                  <div className="mt-2 flex flex-wrap gap-1 text-[10px]">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">
                      {ticket.submittedBy.name}
                    </span>
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-700">
                      {ticket.kategori}
                    </span>
                    {ticket.sub_kategori && (
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-700">
                        {ticket.sub_kategori}
                      </span>
                    )}
                    {ticket.toko && (
                      <span className="rounded-full bg-yellow-50 px-2 py-0.5 text-yellow-700">
                        {ticket.toko}
                      </span>
                    )}
                    {ticket.jabatan && (
                      <span className="rounded-full bg-yellow-50 px-2 py-0.5 text-yellow-700">
                        {ticket.jabatan}
                      </span>
                    )}
                  </div>

                  {/* EXPAND DETAIL */}
                  {isExpanded && (
                    <div className="mt-3 space-y-3 rounded-xl border border-slate-200 bg-white p-3 text-[11px] text-slate-700">
                      <div>
                        <div className="text-[10px] font-semibold text-slate-500 uppercase mb-1">
                          Deskripsi
                        </div>
                        <p>
                          {ticket.detail?.description ||
                            '(Tidak ada deskripsi)'}
                        </p>
                      </div>

                      <div className="border-t border-slate-100 pt-3">
                        <FeedbackActions
                          assignment={assignment}
                          onSuccess={loadQueue}
                          onError={setActionError}
                        />
                      </div>
                    </div>
                  )}

                  {/* Footer indikator */}
                  <div className="mt-2 flex justify-end text-[10px] text-slate-400">
                    <span className="mr-1">
                      {isExpanded ? 'Sembunyikan' : 'Lihat detail'}
                    </span>
                    <ChevronDownIcon
                      className={`h-3 w-3 transition ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
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
