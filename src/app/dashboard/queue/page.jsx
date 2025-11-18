// Lokasi: src/app/dashboard/queue/page.jsx

'use client'; 

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

// (Komponen TriageActions, SalesManagerActions, ActingManagerActions, ActingPicActions... 
// ...semua kode komponen aksi Anda di atas sini tetap sama persis)

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
    <div className="mt-4 p-4 bg-gray-50 rounded-md border">
      <h3 className="font-semibold text-gray-800">Aksi Triase (PIC OMI)</h3>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Tambahkan catatan triase (opsional)..."
        className="w-full px-3 py-2 mt-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows="2"
      />
      <div className="flex space-x-3 mt-3">
        <button
          onClick={() => handleSubmit('Request')}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isLoading ? 'Loading...' : 'Triase sebagai Request'}
        </button>
        <button
          onClick={() => handleSubmit('Feedback')}
          disabled={isLoading}
          className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:bg-gray-400"
        >
          {isLoading ? 'Loading...' : 'Triase sebagai Feedback'}
        </button>
      </div>
    </div>
  );
}
// ===================================================

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
      onSuccess(); // Refresh list
    } catch (err) {
      console.error(err);
      onError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-200">
      <h3 className="font-semibold text-gray-800">Aksi Sales Manager</h3>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Tambahkan catatan (wajib)..."
        className="w-full px-3 py-2 mt-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows="2"
      />
      <div className="flex flex-wrap gap-3 mt-3">
        <button
          onClick={() => handleSubmit('approve')}
          disabled={isLoading}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
        >
          {isLoading ? 'Loading...' : 'Approve (ke Acting Mgr)'}
        </button>
        <button
          onClick={() => handleSubmit('reject')}
          disabled={isLoading}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
        >
          {isLoading ? 'Loading...' : 'Reject Tiket'}
        </button>
        <button
          onClick={() => handleSubmit('complete')}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400"
        >
          {isLoading ? 'Loading...' : 'Selesaikan (Complete)'}
        </button>
      </div>
    </div>
  );
}
// ===================================================

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
          action: actionType, // 'approve', 'reject'
          notes: notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Gagal melakukan aksi');
      }
      onSuccess(); // Refresh list
    } catch (err) {
      console.error(err);
      onError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4 p-4 bg-green-50 rounded-md border border-green-200">
      <h3 className="font-semibold text-gray-800">Aksi Acting Manager</h3>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Tambahkan catatan (wajib)..."
        className="w-full px-3 py-2 mt-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
        rows="2"
      />
      <div className="flex flex-wrap gap-3 mt-3">
        <button
          onClick={() => handleSubmit('approve')}
          disabled={isLoading}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
        >
          {isLoading ? 'Loading...' : 'Approve (ke Acting PIC)'}
        </button>
        <button
          onClick={() => handleSubmit('reject')}
          disabled={isLoading}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
        >
          {isLoading ? 'Loading...' : 'Reject Tiket'}
        </button>
      </div>
    </div>
  );
}
// ===================================================

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
          action: actionType, // 'complete', 'return'
          notes: notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Gagal melakukan aksi');
      }
      onSuccess(); // Refresh list
    } catch (err) {
      console.error(err);
      onError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4 p-4 bg-purple-50 rounded-md border border-purple-200">
      <h3 className="font-semibold text-gray-800">Aksi Acting PIC</h3>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Tambahkan catatan (wajib)..."
        className="w-full px-3 py-2 mt-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
        rows="2"
      />
      <div className="flex flex-wrap gap-3 mt-3">
        <button
          onClick={() => handleSubmit('complete')}
          disabled={isLoading}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400"
        >
          {isLoading ? 'Loading...' : 'Selesaikan Tiket (Complete)'}
        </button>
        <button
          onClick={() => handleSubmit('return')}
          disabled={isLoading}
          className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:bg-gray-400"
        >
          {isLoading ? 'Loading...' : 'Kembalikan (ke Acting Mgr)'}
        </button>
      </div>
    </div>
  );
}
// ===================================================


export default function QueuePage() {
  const { data: session } = useSession();
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Fungsi untuk memuat data antrian
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
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Muat data saat halaman dibuka
  useEffect(() => {
    if (session) {
      loadQueue();
    }
  }, [session]);

  if (isLoading) return <div>Memuat antrian...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Antrian Tugas Aktif</h1>

      {actionError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          Error Aksi: {actionError}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        {assignments.length === 0 ? (
          <p className="text-gray-700">
            Tidak ada tugas di antrian Anda saat ini.
          </p>
        ) : (
          <div className="space-y-6">
            {assignments.map((assignment) => (
              <div
                key={assignment.assignment_id}
                className="p-4 border rounded-lg"
              >
                <h2 className="text-xl font-semibold text-blue-700">
                  {assignment.ticket.title}
                </h2>
                
                {/* --- PERUBAHAN DI SINI --- */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md">
                    Oleh: {assignment.ticket.submittedBy.name}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-md">
                    Kategori: {assignment.ticket.kategori}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-md">
                    Sub: {assignment.ticket.sub_kategori}
                  </span>
                  {/* Tampilkan Toko/Jabatan jika ada */}
                  {assignment.ticket.toko && (
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-md">
                      Toko: {assignment.ticket.toko}
                    </span>
                  )}
                  {assignment.ticket.jabatan && (
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-md">
                      Jabatan: {assignment.ticket.jabatan}
                    </span>
                  )}
                </div>
                {/* ------------------------- */}
                
                <p className="mt-4 text-gray-800">
                  {assignment.ticket.detail?.description ||
                    '(Tidak ada deskripsi)'}
                </p>

                {/* === Area Tombol Aksi === */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  {/* (Semua logika tombol aksi Anda di sini tetap sama) */}
                  
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}