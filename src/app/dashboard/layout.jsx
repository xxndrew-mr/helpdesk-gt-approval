'use client';

import { useState, Fragment, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Dialog, Transition, Menu } from '@headlessui/react';
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
  ChevronDownIcon,
  ChevronRightIcon,
  UserCircleIcon,
  KeyIcon,
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
} from '@/components/ui/navigation-menu';
import { cn } from "@/lib/utils"; // Pastikan utilitas cn ada (standar shadcn)

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userRole = session?.user?.role;

  // Menangani redirect jika unauthenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <div className="absolute h-full w-full animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
            <Image src="/logo-login.png" alt="Loading" width={30} height={30} className="opacity-50" />
          </div>
          <p className="text-sm font-medium text-slate-500 animate-pulse">Menyiapkan Workspace...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: HomeIcon, roles: ['Administrator', 'Salesman', 'Agen', 'PIC OMI', 'Sales Manager', 'Acting Manager', 'Acting PIC', 'User Feedback', 'Viewer', 'PIC OMI (SS)'] },
    { href: '/dashboard/submit', label: 'Submit Baru', icon: DocumentPlusIcon, roles: ['Salesman', 'Agen'] },
    { href: '/dashboard/my-tickets', label: 'Riwayat Saya', icon: TicketIcon, roles: ['Salesman', 'Agen'] },
    { href: '/dashboard/queue', label: userRole === 'PIC OMI' ? 'Antrian Triase' : 'Antrian Tugas', icon: ClipboardDocumentListIcon, roles: ['PIC OMI', 'PIC OMI (SS)', 'Sales Manager', 'Acting Manager', 'Acting PIC'] },
    { href: '/dashboard/history', label: 'Riwayat Aksi', icon: ClockIcon, roles: ['PIC OMI', 'PIC OMI (SS)', 'Sales Manager', 'Acting Manager', 'Acting PIC', 'Viewer'] },
    { href: '/dashboard/admin/users', label: 'User Management', icon: UsersIcon, roles: ['Administrator'] },
    { href: '/dashboard/admin/analytics', label: 'Analitik', icon: ChartBarIcon, roles: ['Administrator', 'Viewer'] },
  ];

  const FEEDBACK_ALLOWED = ['Sales Manager', 'User Feedback', 'Viewer'];
  const FEEDBACK_ROUTES = ['/dashboard/feedback', '/dashboard/bookmarks', '/dashboard/archive'];
  const filteredMenu = menuItems.filter((i) => i.roles.includes(userRole));
  const isFeedbackActive = FEEDBACK_ROUTES.includes(pathname);

  const handleLogout = () => signOut({ callbackUrl: '/login' });

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* --- DESKTOP & MOBILE HEADER --- */}
      <header className="sticky top-0 z-40 w-full border-b border-blue-700/20 bg-blue-800 text-white shadow-lg shadow-blue-900/10">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-4">
            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition-all hover:bg-white/20 active:scale-95 md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            <Link href="/dashboard" className="flex items-center gap-3 transition-opacity hover:opacity-90">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white p-1.5 shadow-inner">
                <Image src="/logo-login.png" alt="Onda Logo" width={32} height={32} priority />
              </div>
              <div className="hidden flex-col sm:flex">
                <span className="text-sm font-bold leading-none tracking-tight">Onda Care</span>
                <span className="mt-1 text-[10px] font-medium uppercase tracking-widest text-blue-200/70">Workspace</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <NavDesktop menu={filteredMenu} userRole={userRole} isFeedbackActive={isFeedbackActive} feedbackAllowed={FEEDBACK_ALLOWED} />
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden flex-col items-end sm:flex">
              <span className="text-xs font-semibold">{session?.user?.name}</span>
              <span className="text-[10px] font-medium text-blue-200">{session?.user?.role}</span>
            </div>

            <Menu as="div" className="relative">
              <Menu.Button className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/20 bg-blue-700 shadow-sm transition-all hover:bg-blue-600">
                <UserCircleIcon className="h-6 w-6" />
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white p-2 shadow-2xl ring-1 ring-black/5 focus:outline-none">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1 sm:hidden">
                     <p className="text-sm font-bold text-slate-900">{session?.user?.name}</p>
                     <p className="text-xs text-slate-500">{session?.user?.role}</p>
                  </div>
                  <Menu.Item>
                    {({ active }) => (
                      <Link href="/dashboard/change-password" className={cn("group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors", active ? "bg-slate-100 text-blue-700" : "text-slate-600")}>
                        <KeyIcon className="h-4 w-4" /> Ganti Password
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button onClick={handleLogout} className={cn("group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-red-600", active ? "bg-red-50" : "")}>
                        <ArrowLeftOnRectangleIcon className="h-4 w-4" /> Logout
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </header>

      {/* --- MOBILE SIDEBAR --- */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 md:hidden" onClose={setSidebarOpen}>
          <Transition.Child as={Fragment} enter="transition-opacity ease-linear duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="transition-opacity ease-linear duration-300" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child as={Fragment} enter="transition ease-in-out duration-300 transform" enterFrom="-translate-x-full" enterTo="translate-x-0" leave="transition ease-in-out duration-300 transform" leaveFrom="translate-x-0" leaveTo="-translate-x-full">
              <Dialog.Panel className="relative flex w-full max-w-xs flex-col bg-blue-900 shadow-2xl">
                <div className="flex h-16 items-center justify-between px-6 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <Image src="/logo-login.png" alt="Logo" width={28} height={28} className="brightness-0 invert" />
                    <span className="font-bold text-white">Onda Care</span>
                  </div>
                  <button onClick={() => setSidebarOpen(false)} className="text-white/70 hover:text-white">
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-6">
                  <NavMobile menu={filteredMenu} userRole={userRole} onNavigate={() => setSidebarOpen(false)} feedbackAllowed={FEEDBACK_ALLOWED} feedbackRoutes={FEEDBACK_ROUTES} />
                </div>

                <div className="border-t border-white/10 p-4">
                  <Button onClick={handleLogout} variant="destructive" className="w-full justify-start gap-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border-none shadow-none">
                    <ArrowLeftOnRectangleIcon className="h-5 w-5" /> Logout
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* --- MAIN CONTENT --- */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS FOR CLEANER CODE ---

function NavDesktop({ menu, userRole, isFeedbackActive, feedbackAllowed }) {
  const pathname = usePathname();
  
  return (
    <NavigationMenu>
      <NavigationMenuList className="gap-1">
        {menu.map((item) => (
          <NavigationMenuItem key={item.href}>
  <NavigationMenuLink asChild
    className={cn(
      navigationMenuTriggerStyle(),
      "h-9 px-3 text-sm font-medium transition-all bg-transparent",
      pathname === item.href 
        ? "bg-white/15 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)] ring-1 ring-white/20" 
        : "text-blue-100 hover:bg-white/10 hover:text-white"
    )}
  >
    <Link href={item.href}>
      <item.icon className="mr-2 h-4 w-4" />
      {item.label}
    </Link>
  </NavigationMenuLink>
</NavigationMenuItem>

        ))}

        {feedbackAllowed.includes(userRole) && (
          <NavigationMenuItem>
            <NavigationMenuTrigger className={cn(
               "h-9 bg-transparent text-sm font-medium",
               isFeedbackActive ? "bg-white/15 text-white ring-1 ring-white/20" : "text-blue-100 hover:bg-white/10"
            )}>
              <InboxStackIcon className="mr-2 h-4 w-4" /> Feedback
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[280px] gap-2 p-3 bg-white">
                <NavListItem href="/dashboard/feedback" title="Antrian Feedback" icon={InboxStackIcon}>
                  Kelola feedback pelanggan.
                </NavListItem>
                <NavListItem href="/dashboard/bookmarks" title="Bookmark" icon={TicketIcon}>
                  Akses cepat laporan penting.
                </NavListItem>
                <NavListItem href="/dashboard/archive" title="Arsip" icon={ClockIcon}>
                  Lihat data yang telah selesai.
                </NavListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function NavMobile({ menu, onNavigate, feedbackAllowed, userRole, feedbackRoutes }) {
  const pathname = usePathname();
  const [feedbackOpen, setFeedbackOpen] = useState(feedbackRoutes.includes(pathname));

  return (
    <nav className="flex flex-col gap-1">
      {menu.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
            pathname === item.href ? "bg-white text-blue-900 shadow-lg shadow-black/10" : "text-blue-100 hover:bg-white/10"
          )}
        >
          <item.icon className="h-5 w-5" />
          {item.label}
        </Link>
      ))}

      {feedbackAllowed.includes(userRole) && (
        <div className="mt-2">
          <button
            onClick={() => setFeedbackOpen(!feedbackOpen)}
            className={cn(
              "flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all text-blue-100 hover:bg-white/10",
              feedbackRoutes.includes(pathname) && "bg-white/5"
            )}
          >
            <span className="flex items-center gap-3">
              <InboxStackIcon className="h-5 w-5" /> Feedback
            </span>
            <ChevronDownIcon className={cn("h-4 w-4 transition-transform", feedbackOpen && "rotate-180")} />
          </button>
          
          {feedbackOpen && (
            <div className="mt-1 ml-4 flex flex-col gap-1 border-l border-white/10 pl-4">
              <Link href="/dashboard/feedback" onClick={onNavigate} className="py-2 text-sm text-blue-200 hover:text-white">Antrian Feedback</Link>
              <Link href="/dashboard/bookmarks" onClick={onNavigate} className="py-2 text-sm text-blue-200 hover:text-white">Bookmark</Link>
              <Link href="/dashboard/archive" onClick={onNavigate} className="py-2 text-sm text-blue-200 hover:text-white">Arsip</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

function NavListItem({ title, children, href, icon: Icon }) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className="block select-none rounded-lg p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-50 focus:bg-slate-50"
        >
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Icon className="h-4 w-4 text-blue-600" />
            {title}
          </div>
          <p className="mt-1 line-clamp-2 text-xs leading-snug text-slate-500">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}