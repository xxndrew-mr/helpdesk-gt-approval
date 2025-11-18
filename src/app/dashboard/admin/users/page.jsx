// Lokasi: src/app/dashboard/admin/users/page.jsx

'use client';

import { useState, useEffect, Fragment } from 'react';
import { useSession } from 'next-auth/react';
import { Dialog, Transition } from '@headlessui/react'; // Kita pakai HeadlessUI untuk modal

// === Komponen Form Pembuatan User ===
// (Tidak ada perubahan pada Form 'Create', kodenya sama persis)
function CreateUserForm({ roles, divisions, onUserCreated }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setSelectedRole('');
    setSelectedDivision('');
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const roleName = roles.find(r => r.role_id.toString() === selectedRole)?.role_name;
    const needsDivision = ['Salesman', 'Sales Manager', 'PIC OMI'].includes(roleName);
    
    if (needsDivision && !selectedDivision) {
      setError(`${roleName} wajib memilih Divisi.`);
      setIsLoading(false);
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

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Gagal membuat user');
      }

      setSuccess('User berhasil dibuat!');
      onUserCreated(data); 
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderConditionalInputs = () => {
    const roleName = roles.find(r => r.role_id.toString() === selectedRole)?.role_name;

    if (['Salesman', 'Sales Manager', 'PIC OMI'].includes(roleName)) {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Divisi (Wajib untuk {roleName})
          </label>
          <select
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
            required
            className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md"
          >
            <option value="">Pilih Divisi...</option>
            {divisions.map((div) => (
              <option key={div.division_id} value={div.division_id}>
                {div.division_name}
              </option>
            ))}
          </select>
        </div>
      );
    }
    return null; 
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-2xl font-bold mb-4">Buat User Baru</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
        {success && <div className="p-3 bg-green-100 text-green-700 rounded-md">{success}</div>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ... (Isi form 'Create' tidak berubah) ... */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Nama</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Minimal 8 karakter"
              className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Role (Wajib)</label>
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setSelectedDivision('');
              }}
              required
              className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md"
            >
              <option value="">Pilih Role...</option>
              {roles.map((role) => (
                <option key={role.role_id} value={role.role_id}>
                  {role.role_name}
                </option>
              ))}
            </select>
          </div>
          
          {renderConditionalInputs()}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2 font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isLoading ? 'Membuat...' : 'Buat User'}
        </button>
      </form>
    </div>
  );
}
// ===============================


// === Komponen Modal Edit User ===
// (Tidak ada perubahan pada Modal 'Edit', kodenya sama persis)
function EditUserModal({ isOpen, onClose, user, roles, divisions, onUserUpdated }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Kosong = jangan ganti
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [toko, setToko] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setSelectedRole(user.role_id.toString());
      setSelectedDivision(user.division_id ? user.division_id.toString() : '');
      setJabatan(user.jabatan || '');
      setToko(user.toko || '');
      setPassword(''); 
      setError(null);
    }
  }, [user]);

  const renderConditionalInputs = () => {
    const roleName = roles.find(r => r.role_id.toString() === selectedRole)?.role_name;

    if (roleName === 'Agen') {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700">Jabatan (Wajib untuk Agen)</label>
          <input type="text" value={jabatan} onChange={(e) => setJabatan(e.target.value)}
            className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md" />
        </div>
      );
    }
    if (roleName === 'Salesman') {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700">Toko (Wajib untuk Salesman)</label>
          <input type="text" value={toko} onChange={(e) => setToko(e.target.value)}
            className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md" />
        </div>
      );
    }
    if (['Salesman', 'Sales Manager', 'PIC OMI'].includes(roleName)) {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700">Divisi (Wajib untuk {roleName})</label>
          <select value={selectedDivision} onChange={(e) => setSelectedDivision(e.target.value)} required
            className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md">
            <option value="">Pilih Divisi...</option>
            {divisions.map((div) => (
              <option key={div.division_id} value={div.division_id}>{div.division_name}</option>
            ))}
          </select>
        </div>
      );
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const roleName = roles.find(r => r.role_id.toString() === selectedRole)?.role_name;
    const needsDivision = ['Salesman', 'Sales Manager', 'PIC OMI'].includes(roleName);
    if (needsDivision && !selectedDivision) {
      setError(`${roleName} wajib memilih Divisi.`);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${user.user_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password: password || null,
          role_id: selectedRole,
          division_id: selectedDivision || null,
          jabatan: jabatan || null,
          toko: toko || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Gagal mengupdate user');
      }

      onUserUpdated(data); 
      onClose(); 
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        {/* ... (Isi Modal Edit tidak berubah) ... */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                  Edit User: {user?.name}
                </Dialog.Title>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  {error && <div className="p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nama</label>
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                        className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                        className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Password Baru (Opsional)</label>
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                        placeholder="Isi hanya jika ingin ganti password"
                        className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Role (Wajib)</label>
                      <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} required
                        className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md">
                        <option value="">Pilih Role...</option>
                        {roles.map((role) => (
                          <option key={role.role_id} value={role.role_id}>{role.role_name}</option>
                        ))}
                      </select>
                    </div>
                    
                    {renderConditionalInputs()}
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
// ===============================


// === Komponen Utama Halaman ===
export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiError, setApiError] = useState(null); 

  // State untuk Modal Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Fungsi untuk memuat semua data
  const loadData = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const [masterRes, usersRes] = await Promise.all([
        fetch('/api/admin/master-data'),
        fetch('/api/admin/users'),
      ]);

      if (!masterRes.ok) throw new Error('Gagal mengambil master data');
      const masterData = await masterRes.json();
      setRoles(masterData.roles);
      setDivisions(masterData.divisions);

      if (!usersRes.ok) throw new Error('Gagal mengambil data user');
      const usersData = await usersRes.json();
      setUsers(usersData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Callback untuk form 'Create'
  const handleUserCreated = (newUser) => {
    setUsers([newUser, ...users]); 
  };

  // Callback untuk modal 'Edit'
  const handleUserUpdated = (updatedUser) => {
    setUsers(users.map(u => u.user_id === updatedUser.user_id ? updatedUser : u));
  };
  
  // Handler untuk membuka modal edit
  const openEditModal = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };
  
  // Handler untuk Menonaktifkan User
  const handleDeactivateUser = async (userId, userName) => {
    setApiError(null);
    if (window.confirm(`Apakah Anda yakin ingin MENONAKTIFKAN user: ${userName}? \n\nUser ini tidak akan bisa login.`)) {
      try {
        // Panggil API DELETE (yang sekarang berarti 'Nonaktifkan')
        const res = await fetch(`/api/admin/users/${userId}`, {
          method: 'DELETE',
        });
        
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Gagal menonaktifkan user');
        }
        
        handleUserUpdated(data.user); // data.user adalah user yang di-return API

      } catch (err) {
        setApiError(err.message);
      }
    }
  };
  
  if (isLoading) return <div>Memuat data...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manajemen User</h1>
      
      {apiError && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">Error: {apiError}</div>}

      {/* Form Pembuatan User */}
      <CreateUserForm
        roles={roles}
        divisions={divisions}
        onUserCreated={handleUserCreated}
      />

      {/* Daftar User yang Sudah Ada */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Daftar User</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Divisi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th> 
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
              {/* ======================= */}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-gray-900">
              {users.map((user) => (
                <tr key={user.user_id}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                      {user.role?.role_name || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.division ? user.division.division_name : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.status === 'Active' ? (
                      <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                        Aktif
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">
                        Nonaktif
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => openEditModal(user)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                    {session?.user?.id !== user.user_id && user.status === 'Active' && (
                       <button
                         onClick={() => handleDeactivateUser(user.user_id, user.name)}
                         className="text-red-600 hover:text-red-900"
                       >
                         Nonaktifkan
                       </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modal Edit (tersembunyi secara default) */}
      {editingUser && (
         <EditUserModal
           isOpen={isModalOpen}
           onClose={() => setIsModalOpen(false)}
           user={editingUser}
           roles={roles}
           divisions={divisions}
           onUserUpdated={handleUserUpdated}
         />
      )}
    </div>
  );
}