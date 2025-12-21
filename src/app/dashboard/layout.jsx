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
  ClockIcon,
  BookmarkIcon,
  ArchiveBoxIcon,
  KeyIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userRole = session?.user?.role;

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2 text-sm text-slate-500">
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-[2px] border-blue-300 border-t-blue-600" />
          Memuat sesi...
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        Mengarahkan...
      </div>
    );
  }

  const isActive = (path) => pathname === path;

  // ================= MENU (LOGIC BARU - TIDAK DIUBAH) =================
  const menuItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: HomeIcon,
      roles: [
        'Administrator',
        'Salesman',
        'Agen',
        'PIC OMI',
        'Sales Manager',
        'Acting Manager',
        'Acting PIC',
        'User Feedback',
      ],
    },
    {
      href: '/dashboard/submit',
      label: 'Submit Tiket Baru',
      icon: DocumentPlusIcon,
      roles: ['Salesman', 'Agen'],
    },
    {
      href: '/dashboard/my-tickets',
      label: 'Riwayat Tiket Saya',
      icon: TicketIcon,
      roles: ['Salesman', 'Agen'],
    },
    {
      href: '/dashboard/queue',
      label: 'Antrian Tugas Saya',
      icon: ClipboardDocumentListIcon,
      roles: ['PIC OMI', 'Sales Manager', 'Acting Manager', 'Acting PIC'],
    },
    {
      href: '/dashboard/history',
      label: 'Riwayat Aksi',
      icon: ClockIcon,
      roles: ['PIC OMI', 'Sales Manager', 'Acting Manager', 'Acting PIC'],
    },
    {
      href: '/dashboard/feedback',
      label: 'Antrian Feedback',
      icon: InboxStackIcon,
      roles: ['PIC OMI', 'Sales Manager', 'User Feedback'],
    },
    {
      href: '/dashboard/bookmarks',
      label: 'Bookmark Bersama',
      icon: BookmarkIcon,
      roles: ['PIC OMI', 'Sales Manager', 'User Feedback'],
    },
    {
      href: '/dashboard/archive',
      label: 'Arsip Saya',
      icon: ArchiveBoxIcon,
      roles: ['PIC OMI', 'Sales Manager', 'User Feedback'],
    },
    {
      href: '/dashboard/admin/users',
      label: 'Manajemen User',
      icon: UsersIcon,
      roles: ['Administrator'],
    },
    {
      href: '/dashboard/admin/analytics',
      label: 'Analisis Data',
      icon: ChartBarIcon,
      roles: ['Administrator'],
    },
    {
      href: '/dashboard/change-password',
      label: 'Ganti Password',
      icon: KeyIcon,
      roles: [
        'Administrator',
        'Salesman',
        'Agen',
        'PIC OMI',
        'Sales Manager',
        'Acting Manager',
        'Acting PIC',
        'User Feedback',
      ],
    },
  ];

  let filteredMenu = menuItems.filter((item) =>
    item.roles.includes(userRole)
  );

  if (userRole === 'PIC OMI') {
    filteredMenu = filteredMenu.map((item) =>
      item.href === '/dashboard/queue'
        ? { ...item, label: 'Antrian Triase' }
        : item
    );
  }

  const handleLogout = () => signOut({ callbackUrl: '/login' });

  // ========================= UI =========================
  return (
    <div className="min-h-screen bg-slate-50">
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-40 bg-blue-800/95 backdrop-blur shadow-md">
        <div className="flex w-full items-center justify-between gap-3 px-4 py-3 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg bg-white/15 p-2 text-white transition hover:bg-white/25 md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="h-5 w-5" />
            </button>

            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-white">
                Helpdesk GT
              </span>
              <span className="text-[11px] tracking-wide text-white/80">
                PT. ONDA MEGA INTEGRA
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-white">
            <div className="hidden sm:flex flex-col text-right text-sm">
              <span className="truncate font-medium">
                {session?.user?.name}
              </span>
              <span className="text-xs opacity-80">
                {session?.user?.role}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-medium hover:bg-red-500"
            >
              <ArrowLeftOnRectangleIcon className="h-4 w-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* ================= DESKTOP NAV ================= */}
        <div className="hidden md:flex justify-center bg-blue-800 px-4 py-2">
          <nav className="flex flex-wrap gap-1">
            {filteredMenu.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
                    active
                      ? 'bg-blue-600 text-white shadow ring-1 ring-blue-300/60'
                      : 'text-white/80 hover:bg-blue-700 hover:text-white',
                  ].join(' ')}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* ================= MOBILE SIDEBAR ================= */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50 md:hidden"
          onClose={setSidebarOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="transform transition ease-in-out duration-300"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transform transition ease-in-out duration-300"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="fixed inset-y-0 left-0 flex w-72 flex-col bg-blue-900 p-4 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Helpdesk GT
                  </p>
                  <p className="text-xs text-blue-100">
                    {session?.user?.role}
                  </p>
                </div>

                <button onClick={() => setSidebarOpen(false)}>
                  <XMarkIcon className="h-6 w-6 text-white" />
                </button>
              </div>

              <nav className="flex-1 space-y-1">
                {filteredMenu.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={[
                        'flex items-center rounded-lg px-3 py-2 text-sm font-medium',
                        active
                          ? 'bg-blue-600 text-white shadow'
                          : 'text-white/80 hover:bg-blue-700 hover:text-white',
                      ].join(' ')}
                    >
                      <item.icon className="mr-2 h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <button
                onClick={handleLogout}
                className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500"
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                Logout
              </button>
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition.Root>

      {/* ================= CONTENT ================= */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        {children}
      </main>
    </div>
  );
}
