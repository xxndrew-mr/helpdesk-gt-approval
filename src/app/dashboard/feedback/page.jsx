// Lokasi: src/app/dashboard/feedback/page.jsx

'use client'; // WAJIB, untuk fetch data dan state

import { useState, useEffect } from 'react';

// === Komponen Aksi Feedback ===
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
          body: JSON.stringify({
            action: actionType, // 'bookmark' atau 'archive'
          }),
        }
      );

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
    <div className="mt-4 p-4 bg-gray-50 rounded-md border">
      <h3 className="font-semibold text-gray-800">Aksi Feedback</h3>
      <p className="text-sm text-gray-600">
        Status Anda Saat Ini: <strong>{assignment.status}</strong>
      </p>
      <div className="flex flex-wrap gap-3 mt-3">
        {assignment.status === 'Pending' && (
          <button
            onClick={() => handleSubmit('bookmark')}
            disabled={isLoading}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:bg-gray-400"
          >
            {isLoading ? 'Loading...' : 'Bookmark'}
          </button>
        )}
        
        {assignment.status !== 'Archived' && (
          <button
            onClick={() => handleSubmit('archive')}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400"
          >
            {isLoading ? 'Loading...' : 'Archive'}
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

  // Fungsi untuk memuat data antrian
  const loadQueue = async () => {
    setError(null);
    setActionError(null);
    try {
      // Panggil API kita dengan parameter type=Feedback_Review
      const res = await fetch('/api/queue/my-queue?type=Feedback_Review');
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
    loadQueue();
  }, []);

  if (isLoading) return <div>Memuat antrian feedback...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Antrian Feedback</h1>

      {actionError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          Error Aksi: {actionError}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        {assignments.length === 0 ? (
          <p className="text-gray-700">
            Tidak ada feedback di antrian Anda saat ini.
          </p>
        ) : (
          <div className="space-y-6">
            {assignments.map((assignment) => (
              <div
                key={assignment.assignment_id}
                className="p-4 border rounded-lg"
              >
                <h2 className="text-xl font-semibold text-gray-800">
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
                  <FeedbackActions
                    assignment={assignment}
                    onSuccess={loadQueue}
                    onError={setActionError}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}