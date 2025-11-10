'use client'; // WAJIB, ini halaman interaktif

import { useState, useEffect } from 'react';

export default function ManageUsersPage() {
  // State untuk daftar data
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [formError, setFormError] = useState(null);

  // Fungsi untuk mengambil semua data saat halaman dimuat
  async function loadData() {
    setIsLoading(true);
    try {
      // Ambil data master (role & divisi)
      const masterRes = await fetch('/api/admin/master-data');
      if (!masterRes.ok) throw new Error('Gagal mengambil master data');
      const masterData = await masterRes.json();
      setRoles(masterData.roles);
      setDivisions(masterData.divisions);
      
      // Set default role (misal: Salesman)
      const salesmanRole = masterData.roles.find(r => r.role_name === 'Salesman');
      if (salesmanRole) setSelectedRole(salesmanRole.role_id);

      // Ambil data user
      const usersRes = await fetch('/api/admin/users');
      if (!usersRes.ok) throw new Error('Gagal mengambil daftar user');
      const usersData = await usersRes.json();
      setUsers(usersData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  // Panggil loadData() saat komponen pertama kali dimuat
  useEffect(() => {
    loadData();
  }, []);

  // Fungsi untuk menangani submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Validasi Sales Manager harus punya divisi
    const roleName = roles.find(r => r.role_id == selectedRole)?.role_name;
    if (roleName === 'Sales Manager' && !selectedDivision) {
      setFormError('Sales Manager wajib memilih Divisi.');
      return;
    }

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          role_id: selectedRole,
          division_id: selectedDivision || null,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Gagal membuat user');
      }

      // Jika berhasil, muat ulang data user dan reset form
      await loadData(); // Muat ulang semua user
      setName('');
      setEmail('');
      setPassword('');
      setFormError(null);
    } catch (err) {
      setFormError(err.message);
    }
  };

  if (isLoading) return <div>Loading data...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manajemen User</h1>

      {/* === Form Tambah User Baru === */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Buat User Baru</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kolom 1 */}
          <div>
            <label className="block text-gray-700 mb-2">Nama</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-gray-900"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-gray-900"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-gray-900"
              required
            />
          </div>
          {/* Kolom 2 */}
          <div>
            <label className="block text-gray-700 mb-2">Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-gray-900"
              required
            >
              <option value="">Pilih Role</option>
              {roles.map((role) => (
                <option key={role.role_id} value={role.role_id}>
                  {role.role_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Divisi</label>
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-gray-900"
              // Divisi opsional, tapi wajib untuk Sales Manager
              required={roles.find(r => r.role_id == selectedRole)?.role_name === 'Sales Manager'}
            >
              <option value="">Pilih Divisi (Opsional)</option>
              {divisions.map((div) => (
                <option key={div.division_id} value={div.division_id}>
                  {div.division_name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
            >
              Buat User
            </button>
            {formError && <p className="text-red-500 mt-2">{formError}</p>}
          </div>
        </form>
      </div>

      {/* === Daftar User yang Ada === */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Daftar User</h2>
        <table className="w-full min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Divisi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-gray-900">
            {users.map((user) => (
              <tr key={user.user_id}>
                <td className="px-6 py-4">{user.name}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">{user.role?.role_name || 'N/A'}</td>
                <td className="px-6 py-4">{user.division?.division_name || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}