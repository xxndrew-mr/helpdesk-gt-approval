'use client'; // Komponen klien untuk menggunakan hook

import { useSession } from 'next-auth/react';

export default function DashboardPage() {
  const { data: session } = useSession();

  // Pastikan session ada sebelum menampilkan data
  if (!session || !session.user) {
    return <div>Loading data user...</div>;
  }

  const user = session.user;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800">
        Selamat Datang, {user.name}!
      </h1>
      <p className="mt-2 text-xl text-gray-600">
        Anda login sebagai: <strong>{user.role}</strong>
      </p>
      {user.division && (
        <p className="mt-1 text-lg text-gray-600">
          Divisi: <strong>{user.division}</strong>
        </p>
      )}

      <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Dashboard Anda</h2>
        <p className="text-gray-700">
          Ini adalah halaman utama dashboard Anda.
        </p>
        <p className="mt-2 text-gray-700">
          Silakan gunakan menu navigasi di sebelah kiri untuk mengakses fitur
          sesuai dengan role Anda.
        </p>
      </div>
    </div>
  );
}