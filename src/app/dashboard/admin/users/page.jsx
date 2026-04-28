'use client';

import { useState, useEffect, Fragment, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { Dialog, Transition } from '@headlessui/react';
import {
  UserPlusIcon,
  PencilSquareIcon,
  MagnifyingGlassIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  XCircleIcon,
  IdentificationIcon,
  BriefcaseIcon,
  ShieldCheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UsersIcon,
  FunnelIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const ROWS_PER_PAGE = 10;

const INPUT_CLASSES = "block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder-slate-300 transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none";
const SELECT_CLASSES = `${INPUT_CLASSES} cursor-pointer appearance-none`;

const Badge = ({ children, color }) => {
  const variants = {
    Active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    Inactive: 'bg-rose-50 text-rose-700 ring-rose-600/10',
    blue: 'bg-blue-50 text-blue-700 ring-blue-600/15',
    gray: 'bg-slate-50 text-slate-600 ring-slate-500/15',
  };

  const selectedStyle = variants[children] || variants[color] || variants.blue;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${selectedStyle}`}>
      <span className="h-1 w-1 rounded-full bg-current" />
      {children}
    </span>
  );
};

const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-slate-200" />
        <div className="space-y-1.5">
          <div className="h-3 w-28 rounded bg-slate-200" />
          <div className="h-2.5 w-16 rounded bg-slate-100" />
        </div>
      </div>
    </td>
    <td className="px-6 py-4"><div className="h-5 w-20 rounded-full bg-slate-200" /></td>
    <td className="px-6 py-4"><div className="h-2.5 w-24 rounded bg-slate-100" /></td>
    <td className="px-6 py-4"><div className="h-5 w-16 rounded-full bg-slate-200" /></td>
    <td className="px-6 py-4">
      <div className="flex justify-end gap-2">
        <div className="h-8 w-8 rounded-xl bg-slate-200" />
        <div className="h-8 w-8 rounded-xl bg-slate-200" />
      </div>
    </td>
  </tr>
);

const SkeletonMobile = () => (
  <div className="flex items-center gap-3 px-4 py-3 animate-pulse">
    <div className="h-10 w-10 rounded-full bg-slate-200 shrink-0" />
    <div className="flex-1 space-y-1.5">
      <div className="h-3 w-32 rounded bg-slate-200" />
      <div className="h-2.5 w-24 rounded bg-slate-100" />
    </div>
    <div className="h-5 w-14 rounded-full bg-slate-200" />
  </div>
);

const FormField = ({ label, children }) => (
  <div>
    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
      {label}
    </label>
    {children}
  </div>
);

function UserForm({ 
  buttonText, 
  initialData, 
  roles, 
  divisions, 
  picOmis, 
  onSubmit, 
  onClose, 
  isLoading 
}) {
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

  const selectedRoleName = roles.find(r => r.role_id.toString() === formData.role_id.toString())?.role_name;
  const isDivisionRequired = ['Salesman', 'Sales Manager', 'PIC OMI', 'Agen', 'Acting Manager', 'Acting PIC'].includes(selectedRoleName);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (e) => {
    setFormData(prev => ({ 
      ...prev, 
      role_id: e.target.value, 
      division_id: '', 
      pic_omi_id: '' 
    }));
  };

  const toggleViewerDivision = (id) => {
    setViewerDivisions(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ 
      ...formData, 
      viewer_division_ids: selectedRoleName === 'Viewer' ? viewerDivisions : [] 
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <IdentificationIcon className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Akses Akun</span>
          </div>
          
          <FormField label="Nama Lengkap / Toko">
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className={INPUT_CLASSES} placeholder="John Doe" />
          </FormField>
          
          <FormField label="No. Telepon / WhatsApp">
            <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} required placeholder="08xxxxxxxxxx" className={INPUT_CLASSES} />
          </FormField>
          
          <FormField label="Username">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">@</span>
              <input type="text" name="username" value={formData.username} onChange={handleInputChange} required className={`${INPUT_CLASSES} pl-7`} />
            </div>
          </FormField>
          
          <FormField label="Email">
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={INPUT_CLASSES} placeholder="email@domain.com" />
          </FormField>
          
          <FormField label={`Password${initialData ? ' (Opsional)' : ''}`}>
            <input type="password" name="password" value={formData.password} onChange={handleInputChange} required={!initialData} placeholder={initialData ? '••••••••' : 'Min. 8 karakter'} className={INPUT_CLASSES} />
          </FormField>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <BriefcaseIcon className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Peran & Struktur</span>
          </div>
          
          <FormField label="Pilih Role">
            <select name="role_id" value={formData.role_id} onChange={handleRoleChange} required className={SELECT_CLASSES}>
              <option value="">Pilih Role...</option>
              {roles.map(role => (
                <option key={role.role_id} value={role.role_id}>{role.role_name}</option>
              ))}
            </select>
          </FormField>

          {selectedRoleName && (
            <div className="animate-in fade-in slide-in-from-top-1 duration-200 space-y-3">
              {isDivisionRequired && (
                <FormField label="Divisi">
                  <select name="division_id" value={formData.division_id} onChange={handleInputChange} required className={SELECT_CLASSES}>
                    <option value="">Pilih Divisi...</option>
                    {divisions.map(div => (
                      <option key={div.division_id} value={div.division_id}>{div.division_name}</option>
                    ))}
                  </select>
                </FormField>
              )}

              {selectedRoleName === 'Viewer' && (
                <FormField label="Akses Divisi Viewer">
                  <div className="mt-1 max-h-36 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-50">
                    {divisions.map(div => (
                      <label key={div.division_id} className="flex items-center gap-3 px-3 py-2 text-xs font-medium cursor-pointer hover:bg-slate-50 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={viewerDivisions.includes(div.division_id)} 
                          onChange={() => toggleViewerDivision(div.division_id)} 
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                        />
                        {div.division_name}
                      </label>
                    ))}
                  </div>
                </FormField>
              )}

              {['Salesman', 'Agen'].includes(selectedRoleName) && (
                <FormField label="PIC OMI Penanggung Jawab">
                  <select name="pic_omi_id" value={formData.pic_omi_id} onChange={handleInputChange} required className={SELECT_CLASSES}>
                    <option value="">Pilih PIC OMI...</option>
                    {picOmis.map(pic => (
                      <option key={pic.user_id} value={pic.user_id}>
                        {pic.name} ({pic.division?.division_name || 'No Div'})
                      </option>
                    ))}
                  </select>
                </FormField>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
        <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 transition-colors">
          Batal
        </button>
        <button 
          type="submit" 
          disabled={isLoading} 
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 active:scale-95 disabled:opacity-50 transition-all"
        >
          {isLoading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <CheckCircleIcon className="h-4 w-4" />
          )}
          {buttonText}
        </button>
      </div>
    </form>
  );
}

function Pagination({ currentPage, totalPages, onPageChange, totalItems, rowsPerPage }) {
  if (totalPages <= 1) return null;

  const startRange = (currentPage - 1) * rowsPerPage + 1;
  const endRange = Math.min(currentPage * rowsPerPage, totalItems);

  const pages = useMemo(() => {
    const items = [];
    const delta = 1;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        items.push(i);
      } else if (items[items.length - 1] !== '...') {
        items.push('...');
      }
    }
    return items;
  }, [currentPage, totalPages]);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 bg-white px-5 py-3.5 sm:flex-row rounded-b-2xl">
      <p className="text-xs text-slate-400 font-medium">
        Menampilkan <span className="font-bold text-slate-600">{startRange}–{endRange}</span> dari <span className="font-bold text-slate-600">{totalItems}</span> pengguna
      </p>
      
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-all hover:border-blue-300 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>

        {pages.map((page, idx) => (
          page === '...' ? (
            <span key={`ellipsis-${idx}`} className="flex h-8 w-8 items-center justify-center text-xs text-slate-400">…</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                currentPage === page
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              {page}
            </button>
          )
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-all hover:border-blue-300 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
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
  const [notification, setNotification] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterDiv, setFilterDiv] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const triggerNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const loadInitialData = async () => {
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
    } catch {
      triggerNotification('error', 'Gagal memuat data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRole, filterDiv]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const query = searchTerm.toLowerCase();
      const matchesSearch = 
        user.name.toLowerCase().includes(query) || 
        user.email?.toLowerCase().includes(query) || 
        user.username?.toLowerCase().includes(query);
      
      const matchesRole = filterRole ? user.role?.role_name === filterRole : true;
      const matchesDiv = filterDiv ? user.division?.division_name === filterDiv : true;
      
      return matchesSearch && matchesRole && matchesDiv;
    });
  }, [users, searchTerm, filterRole, filterDiv]);

  const pagedUsers = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    return filteredUsers.slice(start, start + ROWS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const activeUsersCount = users.filter(u => u.status === 'Active').length;
  const hasActiveFilters = searchTerm || filterRole || filterDiv;
  const totalPagesCount = Math.max(1, Math.ceil(filteredUsers.length / ROWS_PER_PAGE));

  const handleImportCsv = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/import-salesman', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      triggerNotification('success', `Berhasil import ${data.inserted} user`);
      loadInitialData();
    } catch (err) {
      triggerNotification('error', err.message);
    }
  };

  const handleCreateUser = async (payload) => {
    try {
      const res = await fetch('/api/admin/users', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      triggerNotification('success', 'User berhasil dibuat!');
      setModalState({ isOpen: false, type: 'create', user: null });
      loadInitialData();
    } catch (err) {
      triggerNotification('error', err.message);
    }
  };

  const handleUpdateUser = async (payload) => {
    try {
      const res = await fetch(`/api/admin/users/${modalState.user.user_id}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      });
      if (!res.ok) throw new Error('Gagal update');
      
      triggerNotification('success', 'User berhasil diperbarui!');
      setModalState({ isOpen: false, type: 'create', user: null });
      loadInitialData();
    } catch (err) {
      triggerNotification('error', err.message);
    }
  };

  const handleToggleStatus = async (userId, currentStatus, userName) => {
    const actionLabel = currentStatus === 'Active' ? 'Menonaktifkan' : 'Mengaktifkan';
    if (!confirm(`Apakah Anda yakin ingin ${actionLabel} user ${userName}?`)) return;

    try {
      const method = currentStatus === 'Active' ? 'DELETE' : 'PUT';
      const body = currentStatus === 'Active' 
        ? undefined 
        : JSON.stringify({ status: 'Active', ...users.find(u => u.user_id === userId) });

      const res = await fetch(`/api/admin/users/${userId}`, { 
        method, 
        headers: method === 'PUT' ? { 'Content-Type': 'application/json' } : undefined, 
        body 
      });

      if (!res.ok) throw new Error('Gagal mengubah status');
      triggerNotification('success', 'Status user berhasil diperbarui.');
      loadInitialData();
    } catch (err) {
      triggerNotification('error', err.message);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterRole('');
    setFilterDiv('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pb-12 pt-6 space-y-5 animate-in fade-in duration-500">
      
      <Transition
        show={!!notification}
        as={Fragment}
        enter="transition ease-out duration-300"
        enterFrom="opacity-0 translate-x-4"
        enterTo="opacity-100 translate-x-0"
        leave="transition ease-in duration-200"
        leaveFrom="opacity-100 translate-x-0"
        leaveTo="opacity-0 translate-x-4"
      >
        <div className={`fixed right-5 top-5 z-[60] flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-2xl ${notification?.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
          {notification?.type === 'success' ? <CheckCircleIcon className="h-4 w-4 shrink-0" /> : <XCircleIcon className="h-4 w-4 shrink-0" />}
          {notification?.message}
        </div>
      </Transition>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0d2444] via-[#133567] to-[#0a3d62] p-7 text-white shadow-xl shadow-blue-900/20">
        <div className="pointer-events-none absolute -right-12 -top-12 h-52 w-52 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 right-32 h-32 w-32 rounded-full bg-sky-300/10 blur-2xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-blue-300/70 mb-1">
              <ShieldCheckIcon className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Onda Care Admin</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">Manajemen User</h1>
            <p className="text-sm text-blue-100/60 max-w-md">
              Kelola hak akses, divisi, dan status akun seluruh anggota tim.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-white/10 border border-white/10 px-4 py-2.5">
              <UsersIcon className="h-4 w-4 text-blue-200" />
              <div>
                <p className="text-[10px] text-blue-200/60 font-medium uppercase tracking-wide">Total</p>
                <p className="text-lg font-black leading-none">{users.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-emerald-400/10 border border-emerald-400/20 px-4 py-2.5">
              <CheckCircleIcon className="h-4 w-4 text-emerald-300" />
              <div>
                <p className="text-[10px] text-emerald-200/60 font-medium uppercase tracking-wide">Aktif</p>
                <p className="text-lg font-black leading-none text-emerald-300">{activeUsersCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mt-5 flex flex-wrap gap-2.5 border-t border-white/10 pt-5">
          <label className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-white/10 border border-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 transition-all active:scale-95">
            Import CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleImportCsv} />
          </label>
          <button
            onClick={() => setModalState({ isOpen: true, type: 'create', user: null })}
            className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-bold text-[#0d2444] shadow-lg hover:shadow-white/20 transition-all hover:scale-[1.02] active:scale-95"
          >
            <UserPlusIcon className="h-4 w-4" />
            Tambah User
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm px-4 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama, username, atau email..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-4 text-sm focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className={`${SELECT_CLASSES} py-2 pl-9 pr-8 sm:w-44 bg-slate-50/70 border-slate-200`}>
              <option value="">Semua Role</option>
              {roles.map(role => <option key={role.role_id} value={role.role_name}>{role.role_name}</option>)}
            </select>
          </div>

          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select value={filterDiv} onChange={(e) => setFilterDiv(e.target.value)} className={`${SELECT_CLASSES} py-2 pl-9 pr-8 sm:w-44 bg-slate-50/70 border-slate-200`}>
              <option value="">Semua Divisi</option>
              {divisions.map(div => <option key={div.division_id} value={div.division_name}>{div.division_name}</option>)}
            </select>
          </div>

          {hasActiveFilters && (
            <button onClick={resetFilters} className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-all whitespace-nowrap">
              <XMarkIcon className="h-3.5 w-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60">
              {['Pengguna', 'Role', 'Divisi', 'Status', ''].map((header, idx) => (
                <th key={idx} className={`px-6 py-3.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 ${idx === 4 ? 'text-right' : 'text-left'}`}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              Array.from({ length: ROWS_PER_PAGE }).map((_, i) => <SkeletonRow key={i} />)
            ) : pagedUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <UsersIcon className="h-10 w-10 opacity-20" />
                    <p className="text-sm font-medium">Tidak ada user ditemukan</p>
                    {hasActiveFilters && <button onClick={resetFilters} className="text-xs text-blue-500 hover:underline mt-1">Reset filter</button>}
                  </div>
                </td>
              </tr>
            ) : (
              pagedUsers.map((user) => (
                <tr key={user.user_id} className="group hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-xs font-black uppercase text-white shadow-md shadow-blue-600/20">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{user.name}</p>
                        <p className="text-xs text-blue-500 font-medium">@{user.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <Badge color="blue">{user.role?.role_name}</Badge>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="text-xs text-slate-500 font-medium">
                      {user.division?.division_name || <span className="italic text-slate-300">—</span>}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <Badge>{user.status}</Badge>
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setModalState({ isOpen: true, type: 'edit', user })}
                        className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                      </button>
                      {session?.user?.id !== user.user_id && (
                        <button
                          onClick={() => handleToggleStatus(user.user_id, user.status, user.name)}
                          className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
                            user.status === 'Active'
                              ? 'text-slate-400 hover:bg-red-50 hover:text-red-500'
                              : 'text-slate-400 hover:bg-emerald-50 hover:text-emerald-600'
                          }`}
                        >
                          {user.status === 'Active' ? <NoSymbolIcon className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!isLoading && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPagesCount}
            onPageChange={setCurrentPage}
            totalItems={filteredUsers.length}
            rowsPerPage={ROWS_PER_PAGE}
          />
        )}
      </div>

      <div className="md:hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm divide-y divide-slate-50">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonMobile key={i} />)
        ) : pagedUsers.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-slate-400">
            <UsersIcon className="h-8 w-8 opacity-20" />
            <p className="text-sm font-medium">Tidak ada user ditemukan</p>
          </div>
        ) : (
          pagedUsers.map((user) => (
            <div key={user.user_id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-xs font-black uppercase text-white shadow-md shadow-blue-500/20">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800 truncate">{user.name}</span>
                  <Badge>{user.status}</Badge>
                </div>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {user.role?.role_name} · {user.division?.division_name || 'Tanpa Divisi'}
                </p>
              </div>
              <div className="flex items-center gap-0.5">
                <button onClick={() => setModalState({ isOpen: true, type: 'edit', user })} className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                  <PencilSquareIcon className="h-4 w-4" />
                </button>
                {session?.user?.id !== user.user_id && (
                  <button
                    onClick={() => handleToggleStatus(user.user_id, user.status, user.name)}
                    className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
                      user.status === 'Active' ? 'text-slate-400 hover:text-red-500 hover:bg-red-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                    }`}
                  >
                    {user.status === 'Active' ? <NoSymbolIcon className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
        {!isLoading && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPagesCount}
            onPageChange={setCurrentPage}
            totalItems={filteredUsers.length}
            rowsPerPage={ROWS_PER_PAGE}
          />
        )}
      </div>

      <Transition appear show={modalState.isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[100]" onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
            leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300" enterFrom="opacity-0 scale-95 translate-y-3" enterTo="opacity-100 scale-100 translate-y-0"
                leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95 translate-y-2"
              >
                <Dialog.Panel className="w-full max-w-2xl transform rounded-3xl bg-white shadow-2xl transition-all overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-100 px-7 py-5">
                    <div>
                      <Dialog.Title className="text-lg font-black text-slate-900">
                        {modalState.type === 'create' ? 'Tambah User Baru' : 'Perbarui Akun'}
                      </Dialog.Title>
                      <p className="text-xs text-slate-400 mt-0.5">Atur kredensial dan hak akses pengguna.</p>
                    </div>
                    <button onClick={() => setModalState(prev => ({ ...prev, isOpen: false }))} className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-300 hover:bg-slate-100 hover:text-slate-500 transition-colors">
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="px-7 py-6">
                    <UserForm
                      buttonText={modalState.type === 'create' ? 'Buat Sekarang' : 'Simpan Perubahan'}
                      initialData={modalState.user}
                      roles={roles}
                      divisions={divisions}
                      picOmis={picOmis}
                      isLoading={isLoading}
                      onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
                      onSubmit={modalState.type === 'create' ? handleCreateUser : handleUpdateUser}
                    />
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}