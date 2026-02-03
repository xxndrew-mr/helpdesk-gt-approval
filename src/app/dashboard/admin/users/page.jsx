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
  UserIcon,
  IdentificationIcon,
  BriefcaseIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  FunnelIcon,
  ArrowPathIcon, // ✅ INI YANG KURANG
} from '@heroicons/react/24/outline';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// Badge Component yang diperbarui
const Badge = ({ children, color }) => {
  const colors = {
    Active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    Inactive: 'bg-rose-50 text-rose-700 ring-rose-600/10',
    blue: 'bg-blue-50 text-blue-700 ring-blue-600/15',
    gray: 'bg-slate-50 text-slate-600 ring-slate-500/15',
  };

  let selectedColor = colors[children] || colors[color] || colors.blue;

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ring-1 ring-inset ${selectedColor}`}>
      <span className="mr-1.5 inline-block h-1 w-1 rounded-full bg-current" />
      {children}
    </span>
  );
};

function UserForm({ title, buttonText, initialData, roles, divisions, picOmis, onSubmit, onClose, isLoading }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    username: initialData?.username || '',
    email: initialData?.email || '',
    password: '',
    role_id: initialData?.role_id || '',
    division_id: initialData?.division_id || '',
    pic_omi_id: initialData?.pic_omi_id || '',
  });

  const [viewerDivisions, setViewerDivisions] = useState(initialData?.viewer_division_ids || []);

  const toggleViewerDivision = (divisionId) => {
    setViewerDivisions((prev) =>
      prev.includes(divisionId) ? prev.filter((id) => id !== divisionId) : [...prev, divisionId]
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      role_id: e.target.value,
      division_id: '',
      pic_omi_id: '',
    }));
  };

  const roleName = roles.find((r) => r.role_id.toString() === formData.role_id)?.role_name;

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...formData, viewer_division_ids: roleName === 'Viewer' ? viewerDivisions : [] };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Kolom Kiri: Informasi Login */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-blue-600">
            <IdentificationIcon className="h-5 w-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Akses Akun</h3>
          </div>
          <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-500">Nama Lengkap / Toko</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
            </div>
            <div>
  <label className="text-[11px] font-bold uppercase text-slate-500">
    No Telepon / WhatsApp
  </label>
  <input
    type="text"
    name="phone"
    value={formData.phone}
    onChange={handleChange}
    required
    placeholder="08xxxxxxxxxx"
    className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
  />
</div>

            <div>
              <label className="text-[11px] font-bold uppercase text-slate-500">Username</label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">@</span>
                <input type="text" name="username" value={formData.username} onChange={handleChange} required className="block w-full rounded-xl border border-slate-200 bg-white py-2 pl-8 pr-3 text-sm focus:border-blue-500 outline-none transition-all" />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-500">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 outline-none transition-all" />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-500">Password {initialData && "(Opsional)"}</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required={!initialData} placeholder={initialData ? '••••••••' : 'Min. 8 karakter'} className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 outline-none transition-all" />
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Peran & Struktur */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-blue-600">
            <BriefcaseIcon className="h-5 w-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Peran & Struktur</h3>
          </div>
          <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-500">Pilih Role</label>
              <select name="role_id" value={formData.role_id} onChange={handleRoleChange} required className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 outline-none appearance-none cursor-pointer transition-all">
                <option value="">Pilih Role...</option>
                {roles.map((role) => <option key={role.role_id} value={role.role_id}>{role.role_name}</option>)}
              </select>
            </div>

            {roleName && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
                {['Salesman', 'Sales Manager', 'PIC OMI', 'Agen', 'Acting Manager', 'Acting PIC'].includes(roleName) && (
                  <div>
                    <label className="text-[11px] font-bold uppercase text-slate-500">Divisi</label>
                    <select name="division_id" value={formData.division_id} onChange={handleChange} required className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-blue-500 outline-none appearance-none transition-all">
                      <option value="">Pilih Divisi...</option>
                      {divisions.map((div) => <option key={div.division_id} value={div.division_id}>{div.division_name}</option>)}
                    </select>
                  </div>
                )}

                {roleName === 'Viewer' && (
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase text-slate-500">Akses Divisi Viewer</label>
                    <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto p-1 border rounded-xl border-slate-100">
                      {divisions.map((div) => (
                        <label key={div.division_id} className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium cursor-pointer hover:bg-slate-50 transition-colors">
                          <input type="checkbox" checked={viewerDivisions.includes(div.division_id)} onChange={() => toggleViewerDivision(div.division_id)} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                          {div.division_name}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {['Salesman', 'Agen'].includes(roleName) && (
                  <div>
                    <label className="text-[11px] font-bold uppercase text-slate-500">PIC OMI Penanggung Jawab</label>
                    <select name="pic_omi_id" value={formData.pic_omi_id} onChange={handleChange} required className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-blue-500 outline-none appearance-none transition-all">
                      <option value="">Pilih PIC OMI...</option>
                      {picOmis.map((pic) => (
                        <option key={pic.user_id} value={pic.user_id}>
                          {pic.name} ({pic.division?.division_name || 'No Div'})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">Batal</button>
        <button type="submit" disabled={isLoading} className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-95 disabled:opacity-50 transition-all">
          {isLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <CheckCircleIcon className="h-5 w-5" />}
          {buttonText}
        </button>
      </div>
    </form>
  );
}

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

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

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
      const picRole = masterData.roles.find((r) => r.role_name === 'PIC OMI');
      if (picRole) setPicOmis(usersData.filter((u) => u.role_id === picRole.role_id));
    } catch (err) {
      showNotification('error', 'Gagal memuat data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

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
    } catch (err) { showNotification('error', err.message); }
  };

  const handleUpdate = async (formData) => {
    try {
      const res = await fetch(`/api/admin/users/${modalState.user.user_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Gagal update");
      showNotification('success', 'User berhasil diperbarui!');
      setModalState({ isOpen: false, type: 'create', user: null });
      loadData();
    } catch (err) { showNotification('error', err.message); }
  };

  const handleToggleStatus = async (userId, currentStatus, userName) => {
    const action = currentStatus === 'Active' ? 'Menonaktifkan' : 'Mengaktifkan';
    if (!confirm(`Apakah Anda yakin ingin ${action} user ${userName}?`)) return;
    try {
      const method = currentStatus === 'Active' ? 'DELETE' : 'PUT';
      const body = currentStatus === 'Active' ? undefined : JSON.stringify({ status: 'Active', ...users.find((u) => u.user_id === userId) });
      const res = await fetch(`/api/admin/users/${userId}`, {
        method,
        headers: method === 'PUT' ? { 'Content-Type': 'application/json' } : undefined,
        body,
      });
      if (!res.ok) throw new Error('Gagal mengubah status');
      showNotification('success', `Status user berhasil diperbarui.`);
      loadData();
    } catch (err) { showNotification('error', err.message); }
  };

  const filteredUsers = users.filter((user) => {
    const keyword = searchTerm.toLowerCase();
    const matchSearch = user.name.toLowerCase().includes(keyword) || (user.email && user.email.toLowerCase().includes(keyword)) || (user.username && user.username.toLowerCase().includes(keyword));
    const matchRole = filterRole ? user.role?.role_name === filterRole : true;
    const matchDiv = filterDivision ? user.division?.division_name === filterDivision : true;
    return matchSearch && matchRole && matchDiv;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 pb-12 animate-in fade-in duration-700">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed right-5 top-5 z-[60] flex items-center gap-3 rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-2xl animate-in slide-in-from-right-10 duration-300 ${notification.type === 'success' ? 'bg-blue-600' : 'bg-red-600'}`}>
          {notification.type === 'success' ? <CheckCircleIcon className="h-5 w-5" /> : <XCircleIcon className="h-5 w-5" />}
          {notification.message}
        </div>
      )}

      {/* Header / Hero */}
      <Card className="overflow-hidden border-none bg-blue-800 text-white shadow-xl shadow-blue-900/20">
        <CardContent className="p-8 relative">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-blue-200 mb-2">
                <ShieldCheckIcon className="h-5 w-5" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Onda Care Admin</span>
              </div>
              <CardTitle className="text-3xl font-black">Manajemen User</CardTitle>
              <CardDescription className="text-blue-100/70 max-w-md">
                Kelola hak akses, divisi, dan status akun seluruh anggota tim Onda Care.
              </CardDescription>
            </div>
            
            <button onClick={() => setModalState({ isOpen: true, type: 'create', user: null })} className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-900 shadow-lg transition-all hover:scale-105 active:scale-95">
              <UserPlusIcon className="h-5 w-5" />
              Tambah User
            </button>
          </div>
          {/* Decorative Circles */}
          <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        </CardContent>
      </Card>

      {/* Filter Bar */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4 grid grid-cols-1 gap-4 sm:grid-cols-4 lg:grid-cols-12">
          <div className="sm:col-span-2 lg:col-span-6 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Cari nama, username, email..." className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm focus:bg-white focus:border-blue-500 transition-all outline-none shadow-inner" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="lg:col-span-3">
            <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:bg-white focus:border-blue-500 transition-all cursor-pointer">
              <option value="">Semua Role</option>
              {roles.map((r) => <option key={r.role_id} value={r.role_name}>{r.role_name}</option>)}
            </select>
          </div>
          <div className="lg:col-span-3">
            <select value={filterDivision} onChange={(e) => setFilterDivision(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:bg-white focus:border-blue-500 transition-all cursor-pointer">
              <option value="">Semua Divisi</option>
              {divisions.map((d) => <option key={d.division_id} value={d.division_name}>{d.division_name}</option>)}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* ===================== */}
{/* DESKTOP / WEB VIEW */}
{/* ===================== */}
<div className="hidden md:block overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
  <table className="min-w-full divide-y divide-slate-100">
    <thead className="bg-slate-50/50">
      <tr>
        <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">Pengguna</th>
        <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">Akses & Role</th>
        <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
        <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">Aksi</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-50">
      {isLoading ? (
        <tr>
          <td colSpan={4} className="py-20 text-center text-blue-600">
            <ArrowPathIcon className="h-8 w-8 animate-spin mx-auto mb-2 opacity-50" />
            Memuat Data...
          </td>
        </tr>
      ) : filteredUsers.length === 0 ? (
        <tr>
          <td colSpan={4} className="py-20 text-center text-slate-400">
            <NoSymbolIcon className="h-10 w-10 mx-auto mb-3 opacity-20" />
            Tidak ada user ditemukan.
          </td>
        </tr>
      ) : (
        filteredUsers.map((user) => (
          <tr key={user.user_id} className="group hover:bg-slate-50 transition-colors">
            <td className="px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-600/20 uppercase">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">{user.name}</div>
                  <div className="text-xs font-medium text-blue-600">@{user.username}</div>
                </div>
              </div>
            </td>

            <td className="px-6 py-4">
              <div className="flex flex-col gap-1">
                <Badge>{user.role?.role_name}</Badge>
                <span className="text-[10px] font-bold text-slate-400 italic">
                  {user.division?.division_name || 'Tanpa Divisi'}
                </span>
              </div>
            </td>

            <td className="px-6 py-4">
              <Badge color={user.status === 'Active' ? 'green' : 'red'}>
                {user.status}
              </Badge>
            </td>

            <td className="px-6 py-4 text-right">
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setModalState({ isOpen: true, type: 'edit', user })}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl"
                >
                  <PencilSquareIcon className="h-5 w-5" />
                </button>

                {session?.user?.id !== user.user_id && (
                  <button
                    onClick={() =>
                      handleToggleStatus(user.user_id, user.status, user.name)
                    }
                    className={`p-2 rounded-xl ${
                      user.status === 'Active'
                        ? 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                        : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                    }`}
                  >
                    {user.status === 'Active' ? (
                      <NoSymbolIcon className="h-5 w-5" />
                    ) : (
                      <CheckCircleIcon className="h-5 w-5" />
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

{/* ===================== */}
{/* MOBILE VIEW */}
{/* ===================== */}
  <div className="md:hidden divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
  {isLoading ? (
    <div className="py-20 text-center text-blue-600">
      <ArrowPathIcon className="h-8 w-8 animate-spin mx-auto mb-2 opacity-50" />
      Memuat Data...
    </div>
  ) : filteredUsers.length === 0 ? (
    <div className="py-20 text-center text-slate-400">
      <NoSymbolIcon className="h-10 w-10 mx-auto mb-3 opacity-20" />
      Tidak ada user ditemukan.
    </div>
  ) : (
    filteredUsers.map((user) => (
      <div
        key={user.user_id}
        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50"
      >
        {/* Avatar */}
        <div className="h-9 w-9 flex-shrink-0 rounded-full bg-blue-600 flex items-center justify-center text-white font-black uppercase">
          {user.name.charAt(0)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900 truncate">
              {user.name}
            </span>
            <Badge
              color={user.status === 'Active' ? 'green' : 'red'}
              className="text-[10px]"
            >
              {user.status}
            </Badge>
          </div>

          <div className="text-xs text-slate-500 truncate">
            {user.role?.role_name} • {user.division?.division_name || 'Tanpa Divisi'}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setModalState({ isOpen: true, type: 'edit', user })}
            className="p-2 text-slate-400 hover:text-blue-600 rounded-xl"
          >
            <PencilSquareIcon className="h-5 w-5" />
          </button>

          {session?.user?.id !== user.user_id && (
            <button
              onClick={() =>
                handleToggleStatus(user.user_id, user.status, user.name)
              }
              className={`p-2 rounded-xl ${
                user.status === 'Active'
                  ? 'text-slate-400 hover:text-red-600'
                  : 'text-slate-400 hover:text-emerald-600'
              }`}
            >
              {user.status === 'Active' ? (
                <NoSymbolIcon className="h-5 w-5" />
              ) : (
                <CheckCircleIcon className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
      </div>
    ))
  )}
</div>



      {/* Modal View */}
      <Transition appear show={modalState.isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[100]" onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="translate-y-4 opacity-0 scale-95" enterTo="translate-y-0 opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="translate-y-0 opacity-100 scale-100" leaveTo="translate-y-4 opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-[32px] bg-white p-8 shadow-2xl transition-all">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <Dialog.Title className="text-xl font-black text-slate-900">{modalState.type === 'create' ? 'Tambah User Baru' : 'Perbarui Akun'}</Dialog.Title>
                      <p className="text-sm text-slate-400">Atur kredensial dan hak akses pengguna.</p>
                    </div>
                    <button onClick={() => setModalState({ ...modalState, isOpen: false })} className="rounded-full p-2 text-slate-300 hover:bg-slate-50 hover:text-slate-500 transition-all"><XCircleIcon className="h-6 w-6" /></button>
                  </div>

                  <UserForm
                    title={modalState.type === 'create' ? 'Buat Akun' : 'Edit Akun'}
                    buttonText={modalState.type === 'create' ? 'Buat Sekarang' : 'Simpan Perubahan'}
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
  );
}