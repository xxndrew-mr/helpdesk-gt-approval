"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

import {
  LayoutDashboard,
  Sparkles,
  ListChecks,
  Info,
  ShieldCheck,
  Zap,
  Users,
  BarChart3,
  Settings,
  UserPlus,
  Inbox,
  ClipboardList,
  History,
  MessageSquare,
  Database,
  ArrowUpRight,
  Clock,
  CheckCircle2,
} from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function DashboardPage() {
  const { data: session } = useSession();

  if (!session || !session.user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-sm font-medium text-slate-500">
          Memuat data pengguna...
        </p>
      </div>
    );
  }

  const user = session.user;
  const role = user.role;

  const isAdmin = role === "Administrator";
  const isSalesAgen = ["Salesman", "Agen"].includes(role);
  const isPIC = ["PIC OMI", "PIC OMI (SS)", "Acting PIC"].includes(role);
  const isManagerPlus = [
    "Sales Manager",
    "Acting Manager",
    "User Feedback",
    "Viewer",
  ].includes(role);

  const getMenuCards = () => {
    if (isSalesAgen) {
      return [
        {
          href: "/dashboard/submit",
          title: "Isi Formulir",
          desc: "Laporan barang & kendala toko",
          icon: Sparkles,
          accent: "bg-blue-500",
          lightAccent: "bg-blue-50",
          textColor: "text-blue-600",
        },
        {
          href: "/dashboard/my-tickets",
          title: "Status Laporan",
          desc: "Pantau progres secara real-time",
          icon: ListChecks,
          accent: "bg-emerald-500",
          lightAccent: "bg-emerald-50",
          textColor: "text-emerald-600",
        },
      ];
    }

    if (isPIC) {
      return [
        {
          href: "/dashboard/queue",
          title: "Antrian Triase",
          desc: "Tindak lanjuti laporan lapangan",
          icon: ClipboardList,
          accent: "bg-amber-500",
          lightAccent: "bg-amber-50",
          textColor: "text-amber-600",
        },
        {
          href: "/dashboard/history",
          title: "Riwayat Saya",
          desc: "Aksi penanganan yang selesai",
          icon: History,
          accent: "bg-blue-500",
          lightAccent: "bg-blue-50",
          textColor: "text-blue-600",
        },
      ];
    }

    if (isManagerPlus) {
      return [
        {
          href: "/dashboard/queue",
          title: "Antrian Tugas",
          desc: "Kelola tugas antrian divisi",
          icon: Inbox,
          accent: "bg-indigo-500",
          lightAccent: "bg-indigo-50",
          textColor: "text-indigo-600",
        },
        {
          href: "/dashboard/history",
          title: "Riwayat Penanganan",
          desc: "Tinjau performa tugas selesai",
          icon: History,
          accent: "bg-blue-500",
          lightAccent: "bg-blue-50",
          textColor: "text-blue-600",
        },
        {
          href: "/dashboard/feedback",
          title: "Analisis Feedback",
          desc: "Evaluasi kualitas layanan",
          icon: MessageSquare,
          accent: "bg-rose-500",
          lightAccent: "bg-rose-50",
          textColor: "text-rose-600",
        },
      ];
    }
    return [];
  };

  const menuCards = getMenuCards();

  return (
    <div className="w-full space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {isAdmin ? (
        <>
          {/* ================= ADMIN VIEW ================= */}
          <section className="relative rounded-[2.5rem] bg-slate-900 p-8 md:p-12 text-white overflow-hidden shadow-2xl">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400 ring-1 ring-blue-400/30">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  System Administrator
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl leading-[1.1]">
                  Control <span className="text-blue-500 italic">Panel</span>
                </h1>
                <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
                  Manajemen akses user, otorisasi role, dan monitoring data warehouse.
                </p>
              </div>
              <Button asChild className="h-14 px-10 bg-blue-600 hover:bg-blue-500 rounded-2xl shadow-xl shadow-blue-600/30 transition-all hover:scale-105 active:scale-95 text-base font-bold">
                <Link href="/dashboard/admin/analytics">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Analytics
                </Link>
              </Button>
            </div>
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full" />
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center gap-4">
                 <h2 className="text-xl font-bold text-slate-800">Manajemen Sistem</h2>
                 <div className="h-[1px] flex-1 bg-slate-100" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <ActionCard href="/dashboard/admin/users" title="User Management" desc="Kontrol akses dan kredensial karyawan." icon={Users} color="bg-blue-50 text-blue-600" />
                <ActionCard href="/dashboard/admin/analytics" title="Data Warehouse" desc="Visualisasi data BigQuery real-time." icon={BarChart3} color="bg-indigo-50 text-indigo-600" />
              </div>
            </div>
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                 <h2 className="text-xl font-bold text-slate-800">Pintasan</h2>
                 <div className="h-[1px] flex-1 bg-slate-100" />
              </div>
              <Link href="/dashboard/admin/users" className="group block relative p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-600/20 overflow-hidden">
                <div className="relative z-10 space-y-6">
                  <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl w-fit group-hover:scale-110 transition-transform duration-500">
                    <UserPlus className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold tracking-tight">Tambah User</h3>
                    <p className="text-blue-100/70 text-sm mt-1">Registrasi personel baru ke sistem.</p>
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                   <UserPlus className="h-32 w-32" />
                </div>
              </Link>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* ================= HERO (Tetap Berkarakter) ================= */}
          <section className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] h-[300px] overflow-hidden text-white shadow-inner">
            <div className="absolute inset-0 bg-cover bg-center animate-[slideBg_12s_linear_infinite]" style={{ backgroundImage: "url('/bg3.jpg')" }} />
            <div className="absolute inset-0 bg-cover bg-center animate-[slideBg_12s_linear_infinite]" style={{ backgroundImage: "url('/bg2.jpg')", animationDelay: "4s" }} />
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[1px]" />
            <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12 h-full flex items-center">
              <div className="space-y-2">
                <h1 className="text-4xl font-extrabold tracking-tight">
                  Halo, <span className="text-blue-400">{user.name?.split(" ")[0]}</span> 👋
                </h1>
                <p className="text-blue-100/70 font-medium tracking-wide flex items-center gap-2">
                  <Zap className="h-4 w-4 fill-blue-400 text-blue-400" />
                  Onda Care — <span className="text-white uppercase text-[10px] tracking-widest">{role}</span>
                </p>
              </div>
            </div>
          </section>

          {/* ================= ASYMMETRIC CONTENT SECTION ================= */}
          <div className="bg-white -mt-12 pt-16 pb-12 rounded-t-[3.5rem] shadow-[0_-20px_50px_-20px_rgba(0,0,0,0.08)] relative z-20">
            <div className="mx-auto max-w-7xl px-6 lg:px-12">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                
                {/* KOLOM KIRI: MENU UTAMA (7/12 Ruang Desktop) */}
                <div className="lg:col-span-7 space-y-12">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Layanan Utama</h2>
                    <p className="text-sm text-slate-500 font-medium">Akses cepat modul operasional harian Anda</p>
                  </div>

                  <div className="grid grid-cols-1 gap-y-10">
                    {menuCards.map((card, i) => (
                      <Link key={i} href={card.href} className="group relative flex items-center gap-6 transition-all duration-500">
                        {/* Floating Icon Base */}
                        <div className="relative shrink-0">
                          <div className={`absolute inset-0 ${card.accent} opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500 rounded-full`} />
                          <div className={`relative flex items-center justify-center w-16 h-16 rounded-3xl ${card.lightAccent} transition-all duration-500 group-hover:-translate-y-2 group-hover:rotate-6 group-hover:shadow-lg shadow-sm border border-white`}>
                            <card.icon className={`h-8 w-8 ${card.textColor}`} />
                          </div>
                        </div>
                        
                        {/* Text Content */}
                        <div className="flex-1 space-y-1">
                          <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                            {card.title}
                          </h3>
                          <p className="text-sm text-slate-500 leading-snug">
                            {card.desc}
                          </p>
                        </div>

                        {/* Floating Action Indicator */}
                        <div className="p-2 rounded-full border border-slate-100 bg-slate-50 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-500">
                          <ArrowUpRight className="h-5 w-5 text-blue-500" />
                        </div>

                        {/* Subtle Bottom Divider */}
                        <div className="absolute -bottom-6 left-20 right-0 h-[1px] bg-slate-50 group-hover:bg-blue-50 transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>

                {/* KOLOM KANAN: WIDGET & INFO (5/12 Ruang Desktop) - MENGISI KEKOSONGAN */}
                <div className="lg:col-span-5 space-y-10">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Ringkasan</h2>
                    <p className="text-sm text-blue-600 font-medium italic">Status & Aktivitas Sistem</p>
                  </div>

                  <div className="space-y-6">
                    {/* Widget: Welcome & Status */}
                    <div className="p-8 rounded-[2.5rem] bg-blue-50/50 border border-blue-100/50 space-y-4 relative group overflow-hidden">
                      <div className="relative z-10 space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="p-3 bg-blue-600 rounded-2xl">
                            <Clock className="h-5 w-5 text-white" />
                          </div>
                          <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">Live Monitor</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Pengguna Aktif</p>
                          <h4 className="text-xl font-bold tracking-tight">{user.name}</h4>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 w-fit px-3 py-1.5 rounded-full border border-emerald-400/20">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          SESI TEROTENTIKASI AMAN
                        </div>
                      </div>
                      <Database className="absolute -bottom-10 -right-10 h-40 w-40 opacity-[0.03] group-hover:rotate-12 transition-transform duration-700" />
                    </div>

                    {/* Widget: Tips Operasional (Dipindah ke kanan) */}
                    <div className="p-8 rounded-[2.5rem] bg-blue-50/50 border border-blue-100/50 space-y-4 relative group overflow-hidden">
                      <div className="flex items-center gap-3 relative z-10">
                        <div className="p-2.5 bg-white rounded-xl shadow-sm">
                          <Info className="h-5 w-5 text-blue-600" />
                        </div>
                        <h4 className="font-bold text-slate-900">Tips Operasional</h4>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed italic relative z-10">
                        "{isSalesAgen && "Gunakan koneksi internet stabil saat mengirim laporan agar data sinkron sempurna."}
                        {isPIC && "Prioritaskan antrian dengan label 'Urgent' untuk menjaga kualitas layanan."}
                        {isManagerPlus && "Tinjau tren feedback mingguan untuk bahan meeting evaluasi divisi."}"
                      </p>
                      <Sparkles className="absolute -bottom-4 -right-4 h-24 w-24 text-blue-200/20 group-hover:scale-110 transition-transform duration-500" />
                    </div>

                    {/* Footer Info System */}
                    <div className="px-4 space-y-4 pt-4">
                      <div className="flex items-center gap-3">
                        <Database className="h-4 w-4 text-slate-400" />
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.4em]">Onda Cloud Engine v2.4</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Data Anda terenkripsi dan tersinkronisasi otomatis dengan infrastruktur BigQuery PT. Onda Mega Integra.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Sub-component ActionCard untuk Admin
function ActionCard({ href, title, desc, icon: Icon, color }) {
  return (
    <Link href={href} className="group flex items-start gap-5 p-2 transition-all">
      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${color} transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm`}>
        <Icon className="h-7 w-7" />
      </div>
      <div className="space-y-1 py-1">
        <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-slate-500 leading-tight">
          {desc}
        </p>
      </div>
    </Link>
  );
}