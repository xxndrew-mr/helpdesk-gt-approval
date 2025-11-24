'use client';

import { useState, Fragment } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Dialog, Transition } from '@headlessui/react';
import Image from 'next/image';

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
  ClockIcon,
} from '@heroicons/react/24/outline';

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userRole = session?.user?.role;

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-2 text-slate-500 text-sm">
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-[2px] border-blue-300 border-t-blue-600" />
          Memuat sesi...
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        Mengarahkan...
      </div>
    );
  }

  const isActive = (path) => pathname === path;

  // === MENU UTAMA ===
  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: HomeIcon,
      roles: ['Administrator','Salesman','Agen','PIC OMI','Sales Manager','Acting Manager','Acting PIC','User Feedback'] },

    { href: '/dashboard/submit', label: 'Submit Tiket Baru', icon: DocumentPlusIcon,
      roles: ['Salesman','Agen'] },

    { href: '/dashboard/my-tickets', label: 'Riwayat Tiket Saya', icon: TicketIcon,
      roles: ['Salesman','Agen'] },

    { href: '/dashboard/queue', label: 'Antrian Tugas Saya', icon: ClipboardDocumentListIcon,
      roles: ['PIC OMI','Sales Manager','Acting Manager','Acting PIC'] },

    { href: '/dashboard/history', label: 'Riwayat Aksi', icon: ClockIcon,
      roles: ['PIC OMI','Sales Manager','Acting Manager','Acting PIC'] },

    { href: '/dashboard/admin/users', label: 'Manajemen User', icon: UsersIcon,
      roles: ['Administrator'] },
  ];

  const FEEDBACK_ALLOWED = ['PIC OMI','Sales Manager','User Feedback'];
  const FEEDBACK_ROUTES = ['/dashboard/feedback','/dashboard/bookmarks','/dashboard/archive'];

  let filteredMenu = menuItems.filter((i) => i.roles.includes(userRole));

  if (userRole === 'PIC OMI') {
    filteredMenu = filteredMenu.map(i =>
      i.href === '/dashboard/queue'
        ? { ...i, label: 'Antrian Triase' }
        : i
    );
  }

  // ====================== NAV ITEMS ======================
  const NavItems = ({ variant = 'horizontal', onNavigate }) => {
    const [feedbackOpen, setFeedbackOpen] = useState(
      FEEDBACK_ROUTES.includes(pathname)
    );
    const feedbackActive = FEEDBACK_ROUTES.includes(pathname);
    const horizontal = variant === 'horizontal';

    return (
      <nav className={horizontal ? "flex items-center gap-2" : "space-y-2"}>
        {filteredMenu.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onNavigate?.()}
              className={`
                ${horizontal ? "px-3 py-2" : "px-3 py-2 w-full"}
                flex items-center text-sm rounded-lg transition
                ${active
                  ? "bg-blue-600 text-white"
                  : "text-white/80 hover:bg-blue-700 hover:text-white"}
              `}
            >
              <item.icon className="w-5 h-5 mr-2" />
              {item.label}
            </Link>
          );
        })}

        {/* MENU FEEDBACK */}
        {FEEDBACK_ALLOWED.includes(userRole) && (
          <div className="relative">
            <button
              onClick={() => setFeedbackOpen(!feedbackOpen)}
              className={`
                px-3 py-2 flex items-center justify-between text-sm rounded-lg w-full
                ${feedbackActive ? "bg-blue-600 text-white" : "text-white/80 hover:bg-blue-700 hover:text-white"}
              `}
            >
              <span className="flex items-center">
                <InboxStackIcon className="w-5 h-5 mr-2" />
                Feedback
              </span>
              <span className={`text-xs transition ${feedbackOpen ? "rotate-90" : ""}`}>▸</span>
            </button>

            {feedbackOpen && (
              <div className={
                horizontal
                  ? "absolute mt-1 bg-blue-900 border border-blue-700 rounded-lg shadow-lg w-52"
                  : "ml-6 mt-2 space-y-1"
              }>
                <Link
                  href="/dashboard/feedback"
                  onClick={() => onNavigate?.()}
                  className="block px-4 py-2 text-sm text-white/80 hover:bg-blue-700 hover:text-white rounded-lg"
                >
                  Antrian Feedback
                </Link>

                <Link
                  href="/dashboard/bookmarks"
                  onClick={() => onNavigate?.()}
                  className="block px-4 py-2 text-sm text-white/80 hover:bg-blue-700 hover:text-white rounded-lg"
                >
                  Bookmark Bersama
                </Link>

                <Link
                  href="/dashboard/archive"
                  onClick={() => onNavigate?.()}
                  className="block px-4 py-2 text-sm text-white/80 hover:bg-blue-700 hover:text-white rounded-lg"
                >
                  Arsip Saya
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    );
  };

  const handleLogout = () => signOut({ callbackUrl: "/login" });

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ========== NAVBAR DESKTOP ========== */}
      <header className="sticky top-0 z-40 bg-indigo-600 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          
          {/* LEFT */}
          <div className="flex items-center gap-3">
            <button
              className="md:hidden bg-white/20 p-2 rounded-lg text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="w-6 h-6" />
            </button>

            <div className="hidden md:flex h-9 w-9 items-center justify-center rounded-lg bg-white overflow-hidden">
            <Image
              src="/logo-login.png"  
              alt="Logo"
              width={36}
              height={36}
              className="object-cover"
                            />
              </div>
            <div className="flex flex-col">
              <span className="text-white font-semibold text-sm">Helpdesk GT</span>
              <span className="text-[11px] text-white/80">PT.ONDA MEGA INTEGRA</span>
            </div>
          </div>

          {/* CENTER NAV */}
          <div className="hidden md:flex">
            <NavItems variant="horizontal" />
          </div>

          {/* RIGHT USER + LOGOUT */}
          <div className="flex items-center gap-3 text-white">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-medium">{session?.user?.name}</span>
              <span className="text-xs opacity-80">{session?.user?.role}</span>
            </div>

            <button
              onClick={handleLogout}
              className="hidden md:flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded-lg text-xs font-medium"
            >
              <ArrowLeftOnRectangleIcon className="w-4 h-4 mr-1" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* ========== MOBILE NAV (SLIDEOVER) ========== */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 md:hidden" onClose={setSidebarOpen}>
          <Transition.Child as={Fragment}>
            <div className="fixed inset-0 bg-black/50" />
          </Transition.Child>

          <Dialog.Panel className="fixed inset-y-0 left-0 w-72 bg-blue-900 p-4 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <span className="text-white font-bold">Helpdesk GT</span>
              <button className="text-white" onClick={() => setSidebarOpen(false)}>
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <NavItems variant="vertical" onNavigate={() => setSidebarOpen(false)} />

            <button
              onClick={handleLogout}
              className="mt-6 w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg"
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5" />
              Logout
            </button>
          </Dialog.Panel>
        </Dialog>
      </Transition.Root>

      {/* CONTENT */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
