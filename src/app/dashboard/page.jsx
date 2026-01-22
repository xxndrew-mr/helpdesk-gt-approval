"use client";

import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Sparkles,
  ListChecks,
  Ticket,
  Info,
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock,
  Users,
  BarChart3,
  Settings,
  Activity,
  UserPlus,
  CheckCircle2,
  Inbox,
  ClipboardList,
  History,
  MessageSquare
} from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle, 
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session } = useSession();

  if (!session || !session.user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-sm font-medium text-slate-500">Memuat data pengguna...</p>
      </div>
    );
  }

  const user = session.user;
  const role = user.role;

  // --- LOGIC ROLE CHECKING ---
  const isAdmin = role === "Administrator";
  const isSalesAgen = ["Salesman", "Agen"].includes(role);
  const isPIC = ["PIC OMI", "Acting PIC"].includes(role);
  const isManagerPlus = ["Sales Manager", "Acting Manager", "User Feedback", "Viewer"].includes(role);

  // --- MENU MAPPING BERDASARKAN ROLE ---
  const getMenuCards = () => {
    if (isSalesAgen) {
      return [
        { href: "/dashboard/submit", title: "Isi Formulir", desc: "Kirim laporan barang atau kendala toko secara instan.", icon: Sparkles, color: "bg-blue-50 text-blue-600", border: "hover:border-blue-500" },
        { href: "/dashboard/my-tickets", title: "Cek Status Laporan", desc: "Pantau perkembangan laporan Anda secara real-time.", icon: ListChecks, color: "bg-emerald-50 text-emerald-600", border: "hover:border-emerald-500" },
      ];
    }
    if (isPIC) {
      return [
        { href: "/dashboard/queue", title: "Antrian Triase", desc: "Periksa dan tindak lanjuti laporan masuk dari lapangan.", icon: ClipboardList, color: "bg-amber-50 text-amber-600", border: "hover:border-amber-500" },
        { href: "/dashboard/history", title: "Riwayat Saya", desc: "Lihat kembali semua aksi dan penanganan yang telah selesai.", icon: History, color: "bg-blue-50 text-blue-600", border: "hover:border-blue-500" },
      ];
    }
    if (isManagerPlus) {
      return [
        { href: "/dashboard/queue", title: "Antrian Tugas", desc: "Pantau dan kelola antrian tugas tim di bawah divisi Anda.", icon: Inbox, color: "bg-indigo-50 text-indigo-600", border: "hover:border-indigo-500" },
        { href: "/dashboard/history", title: "Riwayat Saya", desc: "Tinjau riwayat penanganan tugas yang telah selesai.", icon: History, color: "bg-blue-50 text-blue-600", border: "hover:border-blue-500" },
        { href: "/dashboard/feedback", title: "Analisis Feedback", desc: "Lihat masukan dan evaluasi untuk peningkatan layanan.", icon: MessageSquare, color: "bg-rose-50 text-rose-600", border: "hover:border-rose-500" },
      ];
    }
    return [];
  };

  const menuCards = getMenuCards();

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* --- 1. DASHBOARD ADMIN (SLATE THEME) --- */}
      {isAdmin ? (
        <>
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 text-white shadow-2xl">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-400 ring-1 ring-blue-400/30">
                  <ShieldCheck className="h-3 w-3" /> Administrator Access
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Panel Kendali Admin</h1>
                <p className="text-slate-400 text-sm max-w-md">Kelola penuh akun pengguna, otorisasi role, dan dashboard analitik BigQuery.</p>
              </div>
              <Button asChild className="bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20">
                <Link href="/dashboard/admin/analytics">
                  <BarChart3 className="mr-2 h-4 w-4" /> Lihat Analitik
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Settings className="h-5 w-5 text-blue-600" /> Manajemen</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ActionCard href="/dashboard/admin/users" title="User Management" desc="Kelola akun, ganti role, atau nonaktifkan akses tim." icon={Users} color="bg-blue-100 text-blue-600" />
                <ActionCard href="/dashboard/admin/analytics" title="Data Warehouse" desc="Visualisasi data performa tiket dari BigQuery." icon={BarChart3} color="bg-indigo-100 text-indigo-600" />
              </div>
            </div>
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Zap className="h-5 w-5 text-blue-600" /> Pintasan</h2>
              <Card className="border-none bg-blue-600 text-white p-6 space-y-4 shadow-lg shadow-blue-600/20">
                <div className="p-3 bg-white/20 rounded-xl w-fit"><UserPlus className="h-6 w-6" /></div>
                <h3 className="font-bold">Tambah User Baru</h3>
                <Button asChild variant="secondary" className="w-full bg-white text-blue-600"><Link href="/dashboard/admin/users">Buka User Manager</Link></Button>
              </Card>
            </div>
          </div>
        </>
      ) : (
        /* --- 2. DASHBOARD OPERASIONAL (BLUE THEME) --- */
        <>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 p-8 text-white shadow-2xl">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md ring-1 ring-white/20">
                  <Zap className="h-3 w-3 text-yellow-400 fill-yellow-400" /> Sistem Onda Care Online
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Halo, {user.name?.split(' ')[0]}! 👋</h1>
                <p className="text-blue-100/80 text-sm sm:text-base max-w-md">
                  Anda masuk sebagai <span className="font-bold text-white uppercase">{role}</span> 
                  {user.division && <> di Divisi <span className="font-bold text-white">{user.division}</span></>}
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-lg shadow-inner ring-1 ring-white/20">
                <ShieldCheck className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5 text-blue-600" />
                Menu Utama {role}
              </h2>
              <div className={`grid grid-cols-1 gap-4 ${menuCards.length > 2 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
                {menuCards.map((card, i) => (
                  <Link key={i} href={card.href} className="group">
                    <Card className={`h-full border-slate-200 transition-all ${card.border} group-hover:shadow-md group-hover:-translate-y-1`}>
                      <CardContent className="p-5 space-y-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.color} transition-colors group-hover:bg-blue-600 group-hover:text-white`}>
                          <card.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 group-hover:text-blue-700">{card.title}</h3>
                          <p className="mt-1 text-xs text-slate-500 leading-relaxed line-clamp-2">{card.desc}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Tambahan Info Sesuai Role */}
              <Card className="border-slate-200 bg-slate-50/50 p-5 flex items-start gap-4">
                <div className="rounded-full bg-white p-2 shadow-sm border border-slate-200"><Info className="h-5 w-5 text-blue-600" /></div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-900">Informasi Bantuan</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {isSalesAgen && "Gunakan menu di atas untuk mengirimkan laporan atau mengecek progres laporan yang sedang ditangani PIC."}
                    {isPIC && "Segera proses laporan di Antrian Triase. Laporan yang sudah selesai diproses akan masuk ke menu Riwayat Saya."}
                    {isManagerPlus && "Menu Analisis Feedback digunakan untuk meninjau kepuasan user terhadap penanganan laporan tim."}
                  </p>
                </div>
              </Card>
            </div>

            {/* SIDEBAR OPERASIONAL */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Clock className="h-5 w-5 text-blue-600" /> Aktivitas</h2>
              <Card className="bg-slate-900 text-white p-6 relative overflow-hidden shadow-xl">
                <h3 className="font-bold text-blue-400 relative z-10">Bantuan IT</h3>
                <p className="mt-2 text-xs text-slate-300 relative z-10 leading-relaxed">Mengalami kendala saat mengakses data atau menu? Hubungi tim support IT OMI.</p>
                <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-500 font-bold relative z-10 text-xs">Hubungi IT OMI</Button>
                <LayoutDashboard className="absolute -bottom-6 -right-6 h-24 w-24 text-white/5 rotate-12" />
              </Card>
              <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 flex gap-3">
                <div className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-[10px] font-bold">!</div>
                <p className="text-[11px] text-blue-800 leading-relaxed font-medium">Sistem melakukan pencatatan log otomatis pada setiap perubahan status laporan demi keamanan data.</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* --- REUSABLE HELPER COMPONENTS --- */

function ActionCard({ href, title, desc, icon: Icon, color }) {
  return (
    <Link href={href} className="group">
      <Card className="h-full border-slate-200 transition-all group-hover:border-blue-500 group-hover:shadow-md group-hover:-translate-y-1">
        <CardContent className="p-6 space-y-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${color} group-hover:bg-blue-600 group-hover:text-white transition-all`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 group-hover:text-blue-700">{title}</h3>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">{desc}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}