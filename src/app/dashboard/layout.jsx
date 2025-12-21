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
  ClockIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
  NavigationMenuViewport,
} from '@/components/ui/navigation-menu';

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
      label: 'Submit Request Baru',
      icon: DocumentPlusIcon,
      roles: ['Salesman', 'Agen'],
    },
    {
      href: '/dashboard/my-tickets',
      label: 'Riwayat Request Saya',
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
      href: '/dashboard/admin/users',
      label: 'Manajemen User',
      icon: UsersIcon,
      roles: ['Administrator'],
    },
    {
      href: '/dashboard/change-password',
      label: 'Ganti Password',
      icon: UsersIcon,
      roles: ['PIC OMI', 'Sales Manager', 'Acting Manager', 'Acting PIC','Salesman', 'Agen'],
    },
    {
      href: '/dashboard/admin/analytics',
      label: 'Dashboard Analitik',
      icon: ChartBarIcon,
      roles:['Administrator'],
    },
  ];

  const FEEDBACK_ALLOWED = ['Sales Manager', 'User Feedback'];
  const FEEDBACK_ROUTES = [
    '/dashboard/feedback',
    '/dashboard/bookmarks',
    '/dashboard/archive',
  ];

  let filteredMenu = menuItems.filter((i) => i.roles.includes(userRole));

  if (userRole === 'PIC OMI') {
    filteredMenu = filteredMenu.map((i) =>
      i.href === '/dashboard/queue' ? { ...i, label: 'Antrian Triase' } : i
    );
  }

  const NavItemsMobile = ({ onNavigate }) => {
    const [feedbackOpen, setFeedbackOpen] = useState(
      FEEDBACK_ROUTES.includes(pathname)
    );
    const feedbackActive = FEEDBACK_ROUTES.includes(pathname);

    return (
      <nav className="space-y-1">
        {filteredMenu.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onNavigate?.()}
              className={[
                'flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-300/60'
                  : 'text-white/80 hover:bg-blue-700 hover:text-white',
              ].join(' ')}
            >
              <item.icon className="mr-2 h-5 w-5" />
              {item.label}
            </Link>
          );
        })}

        {FEEDBACK_ALLOWED.includes(userRole) && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setFeedbackOpen(!feedbackOpen)}
              className={[
                'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                feedbackActive
                  ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-300/60'
                  : 'text-white/80 hover:bg-blue-700 hover:text-white',
              ].join(' ')}
            >
              <span className="flex items-center">
                <InboxStackIcon className="mr-2 h-5 w-5" />
                Feedback
              </span>
              <span
                className={`text-xs transition-transform ${
                  feedbackOpen ? 'rotate-90' : ''
                }`}
              >
                ▸
              </span>
            </button>

            {feedbackOpen && (
              <div className="ml-6 mt-2 space-y-1">
                <Link
                  href="/dashboard/feedback"
                  onClick={() => onNavigate?.()}
                  className="block rounded-lg px-4 py-2 text-sm text-white/85 hover:bg-blue-700 hover:text-white"
                >
                  Antrian Feedback
                </Link>
                <Link
                  href="/dashboard/bookmarks"
                  onClick={() => onNavigate?.()}
                  className="block rounded-lg px-4 py-2 text-sm text-white/85 hover:bg-blue-700 hover:text-white"
                >
                  Bookmark Bersama
                </Link>
                <Link
                  href="/dashboard/archive"
                  onClick={() => onNavigate?.()}
                  className="block rounded-lg px-4 py-2 text-sm text-white/85 hover:bg-blue-700 hover:text-white"
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

  const NavDesktop = () => {
  const feedbackActive = FEEDBACK_ROUTES.includes(pathname);

  return (
    <NavigationMenu>
      <NavigationMenuList className="flex flex-wrap gap-1">
        {filteredMenu.map((item) => {
          const active = isActive(item.href);
          return (
            <NavigationMenuItem key={item.href}>
              <NavigationMenuLink
                asChild
                className={[
                  navigationMenuTriggerStyle(),
                  'bg-transparent text-xs sm:text-sm flex items-center gap-2',
                  active
                    ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-300/60'
                    : 'text-white/80 hover:bg-blue-700 hover:text-white',
                ].join(' ')}
              >
                <Link href={item.href}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          );
        })}

        {FEEDBACK_ALLOWED.includes(userRole) && (
          <NavigationMenuItem>
            <NavigationMenuTrigger
              className={[
                navigationMenuTriggerStyle(),
                'bg-transparent text-xs sm:text-sm flex items-center gap-2',
                feedbackActive
                  ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-300/60'
                  : 'text-white/80 hover:bg-blue-700 hover:text-white',
              ].join(' ')}
            >
              <InboxStackIcon className="h-4 w-4" />
              Feedback
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[260px] gap-1 p-2 text-sm">
                <NavListItem href="/dashboard/feedback" title="Antrian Feedback">
                  Daftar feedback yang menunggu penanganan.
                </NavListItem>
                <NavListItem href="/dashboard/bookmarks" title="Bookmark Bersama">
                  Catatan penting yang dibagikan bersama tim.
                </NavListItem>
                <NavListItem href="/dashboard/archive" title="Arsip Saya">
                  Arsip pribadi Request dan feedback Anda.
                </NavListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        )}
      </NavigationMenuList>

      {/* ⬇️ Ini penting supaya dropdown Feedback kelihatan */}
      <NavigationMenuViewport />
    </NavigationMenu>
  );
};


  const handleLogout = () => signOut({ callbackUrl: '/login' });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 bg-blue-800/95 backdrop-blur shadow-md">
        <div className="flex w-full items-center justify-between gap-3 px-4 py-3 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg bg-white/15 p-2 text-white transition hover:bg-white/25 md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="h-5 w-5" />
            </button>

            <div className="hidden h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-white md:flex">
              <Image
                src="/logo-login.png"
                alt="Logo"
                width={36}
                height={36}
                className="object-cover"
              />
            </div>

            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-white">Helpdesk GT</span>
              <span className="text-[11px] tracking-wide text-white/80">
                PT. ONDA MEGA INTEGRA
              </span>
            </div>
          </div>

          <div className="hidden md:flex">
            <NavDesktop />
          </div>

          <div className="flex items-center gap-3 text-white">
            <div className="hidden max-w-[180px] flex-col text-right leading-tight sm:flex">
              <span className="truncate text-sm font-medium">
                {session?.user?.name}
              </span>
              <span className="text-xs opacity-80">{session?.user?.role}</span>
            </div>

            <Button
              onClick={handleLogout}
              size="sm"
              className="flex items-center rounded-lg px-2.5 py-1.5 text-xs font-medium text-white shadow-sm transition bg-red-600 hover:bg-red-500"
            >
              <ArrowLeftOnRectangleIcon className="h-4 w-4 md:mr-1" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

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
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-white">
                    <Image
                      src="/logo-login.png"
                      alt="Logo"
                      width={28}
                      height={28}
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white">
                      Helpdesk GT
                    </span>
                    <span className="text-[11px] text-blue-100">
                      PT. ONDA MEGA INTEGRA
                    </span>
                  </div>
                </div>

                <button
                  className="text-white hover:text-blue-100"
                  onClick={() => setSidebarOpen(false)}
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <NavItemsMobile onNavigate={() => setSidebarOpen(false)} />
              </div>

              <Button
                onClick={handleLogout}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-500"
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                Logout
              </Button>
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition.Root>

      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}

function NavListItem({ title, children, href }) {
  return (
    <li className="rounded-md px-2 py-1.5 hover:bg-blue-50">
      <NavigationMenuLink asChild>
        <Link href={href}>
          <div className="text-sm font-medium text-slate-900">{title}</div>
          <p className="line-clamp-2 text-xs leading-snug text-slate-500">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
