// Lokasi: src/app/dashboard/layout.js

'use client';

import { useState, Fragment } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Dialog, Transition } from '@headlessui/react';

import { 
  HomeIcon, 
  ArrowLeftOnRectangleIcon, 
  DocumentPlusIcon, 
  TicketIcon, 
  ClipboardDocumentListIcon, 
  InboxStackIcon, 
  UsersIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Ambil role dari session
  const userRole = session?.user?.role;

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-2 text-slate-500 text-sm">
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-[2px] border-slate-300 border-t-indigo-500" />
          Memuat sesi...
        </div>
      </div>
    );
  }

  // Jika tidak ada sesi
  if (status === 'unauthenticated') {
    router.push('/login');
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        Mengarahkan...
      </div>
    );
  }

  // Fungsi untuk mengecek link aktif
  const isActive = (path) => pathname === path;

  // Daftar menu dinamis (TIDAK DIUBAH)
  const menuItems = [
    { 
      href: '/dashboard', 
      label: 'Dashboard', 
      icon: HomeIcon, 
      roles: ['Administrator', 'Salesman', 'Agen', 'PIC OMI', 'Sales Manager', 'Acting Manager', 'Acting PIC', 'User Feedback'] 
    },
    { 
      href: '/dashboard/submit', 
      label: 'Submit Tiket Baru', 
      icon: DocumentPlusIcon, 
      roles: ['Salesman', 'Agen'] 
    },
    { 
      href: '/dashboard/my-tickets', 
      label: 'Riwayat Tiket Saya', 
      icon: TicketIcon, 
      roles: ['Salesman', 'Agen']
    },
    { 
      href: '/dashboard/queue', 
      label: 'Antrian Tugas Saya',
      icon: ClipboardDocumentListIcon, 
      roles: ['PIC OMI', 'Sales Manager', 'Acting Manager', 'Acting PIC'] 
    },
    { 
      href: '/dashboard/feedback', 
      label: 'Antrian Feedback', 
      icon: InboxStackIcon, 
      roles: ['PIC OMI', 'Sales Manager', 'User Feedback'] 
    },
    { 
      href: '/dashboard/admin/users', 
      label: 'Manajemen User', 
      icon: UsersIcon, 
      roles: ['Administrator'] 
    },
  ];

  // 1. Filter menu berdasarkan role user
  let filteredMenu = menuItems.filter(item => item.roles.includes(userRole));
  
  // 2. Logika khusus label untuk PIC OMI (TIDAK DIUBAH)
  if (userRole === 'PIC OMI') {
    filteredMenu = filteredMenu.map(item => 
      item.href === '/dashboard/queue' ? { ...item, label: 'Antrian Triase' } : item
    );
  } else {
    if (userRole !== 'PIC OMI') {
      filteredMenu = filteredMenu.filter(item => item.label !== 'Antrian Triase');
    }
  }

  // Komponen item menu (supaya dipakai di mobile & desktop)
  const NavItems = ({ onNavigate }) => (
    <nav className="mt-4 flex-1 space-y-1">
      {filteredMenu.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => onNavigate && onNavigate()}
            className={`group flex items-center rounded-xl px-3 py-2 text-sm font-medium transition-colors
              ${active
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-200 hover:bg-slate-800 hover:text-white'
              }`}
          >
            <item.icon
              className={`mr-3 h-5 w-5 flex-shrink-0 ${
                active ? 'text-white' : 'text-slate-300 group-hover:text-white'
              }`}
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar Mobile (Slide-over) */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-40 lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-900/60" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-200 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-200 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex w-72 max-w-full flex-1 flex-col bg-slate-950">
                <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500 text-white text-sm font-bold">
                      GT
                    </span>
                    <div>
                      <Dialog.Title className="text-base font-semibold text-white">
                        Helpdesk GT
                      </Dialog.Title>
                      <p className="text-xs text-slate-400">
                        {session?.user?.role}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="rounded-full p-1 text-slate-400 hover:text-white hover:bg-slate-800"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-4 pt-3">
                  <NavItems onNavigate={() => setSidebarOpen(false)} />
                </div>

                <div className="border-t border-slate-800 px-4 py-3">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center rounded-xl px-3 py-2 text-sm font-medium text-slate-200 hover:bg-red-600 hover:text-white transition-colors"
                  >
                    <ArrowLeftOnRectangleIcon className="mr-3 h-5 w-5" />
                    Logout
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
            <div className="w-0 flex-1" aria-hidden="true" />
          </div>
        </Dialog>
      </Transition.Root>

      {/* Sidebar Desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:bg-slate-950 lg:text-white lg:border-r lg:border-slate-800">
        <div className="flex h-16 items-center border-b border-slate-800 px-5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-500 text-white text-base font-bold mr-2">
            GT
          </span>
          <div>
            <h1 className="text-lg font-semibold">Helpdesk GT</h1>
            <p className="text-xs text-slate-400">Ticketing & Monitoring</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 pt-3">
          <NavItems />
        </div>

        <div className="border-t border-slate-800 px-4 py-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center rounded-xl px-3 py-2 text-sm font-medium text-slate-200 hover:bg-red-600 hover:text-white transition-colors"
          >
            <ArrowLeftOnRectangleIcon className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Area utama (digeser di desktop karena sidebar fixed) */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Header Top (Mobile + Desktop) */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
            {/* Tombol menu mobile */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-2.5 py-2 text-slate-100 shadow-sm hover:bg-slate-800"
                onClick={() => setSidebarOpen(true)}
              >
                <Bars3Icon className="h-5 w-5" />
              </button>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-800">
                  Helpdesk GT
                </span>
                <span className="text-[11px] text-slate-500">
                  {session?.user?.role}
                </span>
              </div>
            </div>

            {/* Info user (mobile & desktop) */}
            <div className="ml-auto flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right text-sm text-slate-700">
                <div className="font-semibold flex items-center gap-1 justify-end">
                  <UserCircleIcon className="h-4 w-4 text-slate-400" />
                  <span>{session?.user?.name}</span>
                </div>
                <div className="text-xs text-slate-500">
                  ({session?.user?.role})
                </div>
              </div>
              <div className="sm:hidden flex items-center gap-2 text-xs text-slate-500">
                <UserCircleIcon className="h-4 w-4 text-slate-400" />
                <span className="max-w-[120px] truncate">
                  {session?.user?.name}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Konten */}
        <main className="flex-1 bg-slate-50">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
