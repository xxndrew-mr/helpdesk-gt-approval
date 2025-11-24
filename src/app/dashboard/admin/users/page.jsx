'use client';

import { useState, useEffect, Fragment } from 'react';
import { useSession } from 'next-auth/react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  UserPlusIcon, 
  PencilSquareIcon, 
  MagnifyingGlassIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon
} from '@heroicons/react/24/outline';

// === UTILS: Komponen Kecil untuk UI ===
const Badge = ({ children, color }) => {
  const colors = {
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    red: 'bg-rose-50 text-rose-700 ring-rose-600/10',
    blue: 'bg-indigo-50 text-indigo-700 ring-indigo-600/15',
    gray: 'bg-slate-50 text-slate-600 ring-slate-500/15',
  };
  
  let selectedColor = colors[color] || colors.gray;

  if (!color) {
    if (children === 'Active') selectedColor = colors.green;
    else if (children === 'Inactive') selectedColor = colors.red;
    else selectedColor = colors.blue;
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${selectedColor}`}>
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-current/40 mr-1.5" />
      {children}
    </span>
  );
};

// === FORM CREATE & EDIT ===
function UserForm({ title, buttonText, initialData, roles, divisions, picOmis, onSubmit, onClose, isLoading }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    username: initialData?.username || '',
    email: initialData?.email || '',
    password: '',
    role_id: initialData?.role_id || '',
    division_id: initialData?.division_id || '',
    pic_omi_id: initialData?.pic_omi_id || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (e) => {
    setFormData(prev => ({ 
      ...prev, 
      role_id: e.target.value,
      division_id: '',
      pic_omi_id: '',
    }));
  };

  const roleName = roles.find(r => r.role_id.toString() == formData.role_id)?.role_name;

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }}
      className="space-y-6"
    >
      {/* Informasi dasar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Informasi Akun
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Data utama yang digunakan untuk login dan identifikasi user.
            </p>
          </div>
          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            {title || 'Form User'}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium leading-6 text-slate-900">
              Nama Lengkap / Toko
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          {/* USERNAME */}
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium leading-6 text-slate-900">
              Username (Login)
            </label>
            <div className="mt-1 relative rounded-xl shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-slate-400 text-sm">@</span>
              </div>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Username unik"
                className="block w-full rounded-xl border border-slate-200 bg-white py-2 pl-7 pr-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Username digunakan untuk login, pastikan unik dan mudah diingat.
            </p>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium leading-6 text-slate-900">
              Email (Opsional/Kontak)
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="user@example.com"
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium leading-6 text-slate-900">
              Password {initialData && (
                <span className="text-slate-500 font-normal"> (Opsional)</span>
              )}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required={!initialData}
              placeholder={initialData ? 'Kosongkan jika tidak diganti' : 'Min. 8 karakter'}
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
            {initialData && (
              <p className="mt-1 text-xs text-slate-500">
                Biarkan kosong jika tidak ingin mengubah password.
              </p>
            )}
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium leading-6 text-slate-900">
              Role
            </label>
            <select
              name="role_id"
              value={formData.role_id}
              onChange={handleRoleChange}
              required
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              <option value="">Pilih Role...</option>
              {roles.map((role) => (
                <option key={role.role_id} value={role.role_id}>
                  {role.role_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* INPUT KONDISIONAL */}
      {roleName && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Detail Role & Penugasan
              </h4>
              <p className="mt-1 text-xs text-slate-500">
                Sesuaikan divisi dan PIC OMI sesuai struktur organisasi.
              </p>
            </div>
            <Badge>{roleName}</Badge>
          </div>

          <div className="space-y-4">
            {['Salesman', 'Sales Manager', 'PIC OMI', 'Agen', 'Acting Manager', 'Acting PIC'].includes(roleName) && (
              <div>
                <label className="block text-sm font-medium leading-6 text-slate-900">
                  Divisi (Wajib)
                </label>
                <select
                  name="division_id"
                  value={formData.division_id}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  <option value="">Pilih Divisi...</option>
                  {divisions.map((div) => (
                    <option key={div.division_id} value={div.division_id}>
                      {div.division_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {['Salesman', 'Agen'].includes(roleName) && (
              <div>
                <label className="block text-sm font-medium leading-6 text-slate-900">
                  Ditangani oleh PIC OMI (Wajib)
                </label>
                <select
                  name="pic_omi_id"
                  value={formData.pic_omi_id}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  <option value="">Pilih PIC OMI...</option>
                  {picOmis.map((pic) => (
                    <option key={pic.user_id} value={pic.user_id}>
                      {pic.name} ({pic.division?.division_name || 'No Div'})
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-slate-500">
                  Pilih PIC OMI yang sesuai dengan Divisi di atas.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between gap-x-3 border-t border-dashed border-slate-200 pt-4">
        <p className="text-xs text-slate-400">
          Pastikan data sudah benar sebelum menyimpan.
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <>
                <span className="inline-block h-3 w-3 animate-spin rounded-full border-[2px] border-white/40 border-t-white" />
                Menyimpan...
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-4 w-4" />
                {buttonText}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

// === HALAMAN UTAMA ===
export default function AdminUsersPage() {
  const { data: session } = useSession();
  
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [picOmis, setPicOmis] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [modalState, setModalState] = useState({ isOpen: false, type: 'create', user: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterDivision, setFilterDivision] = useState('');
  const [notification, setNotification] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [masterRes, usersRes] = await Promise.all([
        fetch('/api/admin/master-data'),
        fetch('/api/admin/users'),
      ]);
      const masterData = await masterRes.json();
      const usersData = await usersRes.json();
      
      setRoles(masterData.roles);
      setDivisions(masterData.divisions);
      setUsers(usersData);

      const picRole = masterData.roles.find(r => r.role_name === 'PIC OMI');
      if (picRole) {
        setPicOmis(usersData.filter(u => u.role_id === picRole.role_id));
      }
    } catch (err) {
      console.error(err);
      showNotification('error', 'Gagal memuat data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreate = async (formData) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      showNotification('success', 'User berhasil dibuat!');
      setModalState({ isOpen: false, type: 'create', user: null });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdate = async (formData) => {
    try {
      const res = await fetch(`/api/admin/users/${modalState.user.user_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      showNotification('success', 'User berhasil diperbarui!');
      setModalState({ isOpen: false, type: 'create', user: null });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleStatus = async (userId, currentStatus, userName) => {
    const action = currentStatus === 'Active' ? 'Menonaktifkan' : 'Mengaktifkan';
    if (!confirm(`Apakah Anda yakin ingin ${action} user ${userName}?`)) return;

    try {
      const method = currentStatus === 'Active' ? 'DELETE' : 'PUT';
      const body = currentStatus === 'Active'
        ? undefined
        : JSON.stringify({ 
            status: 'Active', 
            ...users.find(u => u.user_id === userId),
          });

      const res = await fetch(`/api/admin/users/${userId}`, { 
        method: method,
        headers: method === 'PUT' ? { 'Content-Type': 'application/json' } : undefined,
        body: body
      });
      
      if (!res.ok) throw new Error('Gagal mengubah status');
      
      showNotification('success', `User berhasil di-${currentStatus === 'Active' ? 'nonaktifkan' : 'aktifkan'}.`);
      loadData();
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchRole = filterRole ? user.role?.role_name === filterRole : true;
    const matchDiv = filterDivision ? user.division?.division_name === filterDivision : true;
    return matchSearch && matchRole && matchDiv;
  });

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'Active').length;
  const inactiveUsers = totalUsers - activeUsers;

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">

        {/* NOTIFIKASI TOAST */}
        {notification && (
          <div className={`fixed top-5 right-5 px-4 py-2.5 rounded-xl shadow-xl text-sm font-medium text-white z-50 flex items-center gap-2 ${
            notification.type === 'success' ? 'bg-indigo-600' : 'bg-rose-600'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircleIcon className="h-4 w-4" />
            ) : (
              <XCircleIcon className="h-4 w-4" />
            )}
            {notification.message}
          </div>
        )}

        {/* HEADER — BIRU SAMA DENGAN HALAMAN LAIN */}
        <div className="relative overflow-hidden rounded-3xl bg-indigo-600 px-6 py-6 shadow-lg sm:flex sm:items-center sm:justify-between sm:px-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                <UserIcon className="h-5 w-5 text-white" />
              </span>
              Manajemen User
            </h1>
            <p className="mt-2 text-sm text-indigo-100 max-w-xl">
              Kelola akun, role, dan akses pengguna sistem Helpdesk dengan tampilan yang rapi dan konsisten.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-100">
                Total User: <span className="ml-1 font-semibold">{totalUsers}</span>
              </span>
              <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-100">
                Active: <span className="ml-1 font-semibold">{activeUsers}</span>
              </span>
              <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-100">
                Inactive: <span className="ml-1 font-semibold">{inactiveUsers}</span>
              </span>
            </div>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-6 sm:flex-none">
            <button
              type="button"
              onClick={() => setModalState({ isOpen: true, type: 'create', user: null })}
              className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-md shadow-black/10 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all"
            >
              <UserPlusIcon className="h-5 w-5" />
              Tambah User
            </button>
          </div>
          <div className="pointer-events-none absolute -right-10 -bottom-16 h-40 w-40 rounded-full border border-white/10 bg-white/5 blur-3xl" />
        </div>

        {/* FILTER BAR */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-800">
              Filter & Pencarian
            </h2>
            <span className="text-xs text-slate-400">
              {filteredUsers.length} user ditampilkan
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                placeholder="Cari nama, username, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              >
                <option value="">Semua Role</option>
                {roles.map(r => (
                  <option key={r.role_id} value={r.role_name}>
                    {r.role_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={filterDivision}
                onChange={(e) => setFilterDivision(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              >
                <option value="">Semua Divisi</option>
                {divisions.map(d => (
                  <option key={d.division_id} value={d.division_name}>
                    {d.division_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* TABEL USER */}
        <div className="mt-6 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider sm:pl-6"
                      >
                        User Info
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                      >
                        Role & Akses
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                      >
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {isLoading ? (
                      <tr>
                        <td colSpan="5" className="py-10">
                          <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                            <span className="inline-block h-5 w-5 animate-spin rounded-full border-[2px] border-slate-300 border-t-indigo-500" />
                            <span className="text-sm">Memuat data...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-10">
                          <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                            <NoSymbolIcon className="h-5 w-5" />
                            <span className="text-sm">Tidak ada user ditemukan.</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user, idx) => (
                        <tr
                          key={user.user_id}
                          className={`transition-colors duration-150 ${
                            idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'
                          } hover:bg-indigo-50/60`}
                        >
                          {/* Kolom Nama & Username & Email */}
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                            <div className="flex items-center">
                              <div className="relative h-10 w-10 flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-semibold shadow-sm">
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="absolute -bottom-1 -right-1 inline-flex items-center justify-center rounded-full bg-white p-0.5 shadow">
                                  <span className={`h-2 w-2 rounded-full ${
                                    user.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'
                                  }`} />
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="font-medium text-slate-900">
                                  {user.name}
                                </div>
                                <div className="text-indigo-600 text-xs font-semibold">
                                  @{user.username}
                                </div>
                                {user.email && (
                                  <div className="text-slate-400 text-xs">
                                    {user.email}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          
                          {/* Kolom Role & Divisi */}
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600">
                            <div className="flex flex-col items-start gap-1">
                              <Badge>
                                {user.role?.role_name}
                              </Badge>
                              {user.division && (
                                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                                  {user.division.division_name}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Kolom Status */}
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600">
                            <Badge color={user.status}>
                              {user.status === 'Active' ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>

                          {/* Kolom Aksi */}
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <div className="inline-flex items-center gap-2">
                              <button
                                onClick={() => setModalState({ isOpen: true, type: 'edit', user: user })}
                                className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-full transition-colors shadow-sm"
                                title="Edit User"
                              >
                                <PencilSquareIcon className="h-4 w-4" />
                              </button>
                              {session?.user?.id !== user.user_id && (
                                <button
                                  onClick={() => handleToggleStatus(user.user_id, user.status, user.name)}
                                  className={`p-2 rounded-full transition-colors shadow-sm ${
                                    user.status === 'Active'
                                      ? 'text-rose-600 bg-rose-50 hover:bg-rose-100 hover:text-rose-800'
                                      : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800'
                                  }`}
                                  title={user.status === 'Active' ? 'Nonaktifkan' : 'Aktifkan'}
                                >
                                  {user.status === 'Active' ? (
                                    <NoSymbolIcon className="h-4 w-4" />
                                  ) : (
                                    <CheckCircleIcon className="h-4 w-4" />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL POPUP */}
        <Transition appear show={modalState.isOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-50"
            onClose={() => setModalState({ ...modalState, isOpen: false })}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-2 scale-95"
                  enterTo="opacity-100 translate-y-0 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 scale-100"
                  leaveTo="opacity-0 translate-y-2 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white p-6 text-left align-middle shadow-2xl transition-all">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200">
                      <div>
                        <Dialog.Title
                          as="h3"
                          className="text-lg font-semibold leading-6 text-slate-900"
                        >
                          {modalState.type === 'create'
                            ? 'Tambah User Baru'
                            : 'Edit User'}
                        </Dialog.Title>
                        <p className="mt-1 text-xs text-slate-500">
                          Lengkapi data berikut untuk {modalState.type === 'create' ? 'menambahkan akun baru.' : 'memperbarui akun yang dipilih.'}
                        </p>
                      </div>
                      <button
                        onClick={() => setModalState({ ...modalState, isOpen: false })}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <XCircleIcon className="h-6 w-6" />
                      </button>
                    </div>
                    
                    <UserForm 
                      title={modalState.type === 'create' ? 'Buat User' : 'Simpan Perubahan'}
                      buttonText={modalState.type === 'create' ? 'Buat' : 'Simpan'}
                      initialData={modalState.user}
                      roles={roles}
                      divisions={divisions}
                      picOmis={picOmis}
                      isLoading={isLoading}
                      onClose={() => setModalState({ ...modalState, isOpen: false })}
                      onSubmit={modalState.type === 'create' ? handleCreate : handleUpdate}
                    />
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
    </div>
  );
}
