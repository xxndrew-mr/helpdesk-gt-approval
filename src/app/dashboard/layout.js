// Lokasi: src/app/dashboard/layout.js

'use client';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  HomeIcon, 
  ArrowLeftOnRectangleIcon, 
  DocumentPlusIcon, 
  TicketIcon, 
  ClipboardDocumentListIcon, 
  InboxStackIcon, 
  UsersIcon 
} from '@heroicons/react/24/outline'; // Pastikan Anda menginstal heroicons jika belum

/* CATATAN: Jika Anda belum menginstal heroicons:
  jalankan: npm install @heroicons/react 
*/

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Ambil role dari session
  const userRole = session?.user?.role;

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Memuat sesi...</div>;
  }

  // Jika tidak ada sesi (meskipun middleware sudah ada, ini penjaga ganda)
  if (status === 'unauthenticated') {
    router.push('/login');
    return <div className="flex items-center justify-center min-h-screen">Mengarahkan...</div>;
  }

  // Fungsi untuk mengecek link aktif
  const isActive = (path) => pathname === path;

  // Daftar menu dinamis
  const menuItems = [
    // Menu Umum
    { 
      href: '/dashboard', 
      label: 'Dashboard', 
      icon: HomeIcon, 
      roles: ['Administrator', 'Salesman', 'Agen', 'PIC OMI', 'Sales Manager', 'Acting Manager', 'Acting PIC', 'User Feedback'] 
    },
    
    // Menu untuk Submitter (Salesman & Agen)
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

    // Menu untuk Approver/Processor
    { 
      href: '/dashboard/queue', 
      label: 'Antrian Tugas Saya', // Label default
      icon: ClipboardDocumentListIcon, 
      roles: ['PIC OMI', 'Sales Manager', 'Acting Manager', 'Acting PIC'] 
    },
    
    // Menu untuk Feedback
    { 
      href: '/dashboard/feedback', 
      label: 'Antrian Feedback', 
      icon: InboxStackIcon, 
      roles: ['PIC OMI', 'Sales Manager', 'User Feedback'] 
    },
    
    // Menu untuk Admin
    { 
      href: '/dashboard/admin/users', 
      label: 'Manajemen User', 
      icon: UsersIcon, 
      roles: ['Administrator'] 
    },
  ];

  // 1. Filter menu berdasarkan role user
  let filteredMenu = menuItems.filter(item => item.roles.includes(userRole));
  
  // 2. Logika khusus untuk mengganti label (INI SEKARANG AKAN BEKERJA)
  if (userRole === 'PIC OMI') {
    filteredMenu = filteredMenu.map(item => 
      // Jika item adalah '/dashboard/queue', ganti labelnya
      item.href === '/dashboard/queue' ? { ...item, label: 'Antrian Triase' } : item
    );
  } else {
    // Sembunyikan 'Antrian Tugas Saya' dari PIC OMI (jika labelnya masih default)
    // Ini adalah penjaga ganda jika map di atas gagal, tapi seharusnya tidak perlu
     if(userRole !== 'PIC OMI') {
        filteredMenu = filteredMenu.filter(item => item.label !== 'Antrian Triase');
     }
  }


  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="px-6 py-4 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-white">Helpdesk GT</h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          
          {filteredMenu.map((item) => (
            <Link
              key={item.href} // Key sekarang akan unik
              href={item.href}
              className={`
                flex items-center px-4 py-3 rounded-lg transition-colors
                ${isActive(item.href) 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'}
              `}
            >
              <item.icon className="h-6 w-6 mr-3" />
              {item.label}
            </Link> // <-- PERBAIKAN TYPO DI SINI
          ))}

        </nav>
        <div className="px-4 py-4 border-t border-gray-700">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
          >
            <ArrowLeftOnRectangleIcon className="h-6 w-6 mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-md border-b border-gray-200">
          <div className="flex justify-end items-center px-6 py-4">
            <div className="text-right text-gray-700">
              <div className="font-semibold">{session?.user?.name}</div>
              <div className="text-sm text-gray-500">({session?.user?.role})</div>
            </div>
          </div>
        </header>
        {/* Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}