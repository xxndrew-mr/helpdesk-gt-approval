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
    UserPlus,
    Inbox,
    ClipboardList,
    History,
    MessageSquare,
    AlertCircle,
    Database,
    BookOpen
  } from "lucide-react";

  import {
    Card,
    CardHeader,
    CardTitle, 
    CardDescription,
    CardContent,
  } from "@/components/ui/card";
  import { Button } from "@/components/ui/button";
  import { Separator } from "@/components/ui/separator";
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
    const isPIC = ["PIC OMI", "PIC OMI (SS)", "Acting PIC"].includes(role);
    const isManagerPlus = ["Sales Manager", "Acting Manager", "User Feedback", "Viewer"].includes(role);

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
        
        {isAdmin ? (
          /* --- 1. DASHBOARD ADMIN --- */
          <>
            <div className="relative isolate transform-gpu overflow-hidden rounded-3xl bg-slate-900 p-8 text-white shadow-2xl">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-400 ring-1 ring-blue-400/30">
                    <ShieldCheck className="h-3 w-3" /> Administrator Access
                  </div>
                  <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Panel Kendali Admin</h1>
                  <p className="text-slate-400 text-sm max-w-md leading-relaxed">Kelola penuh akun pengguna, otorisasi role, dan dashboard analitik BigQuery.</p>
                </div>
                <Button asChild className="bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20">
                  <Link href="/dashboard/admin/analytics">
                    <BarChart3 className="mr-2 h-4 w-4" /> Lihat Analitik
                  </Link>
                </Button>
              </div>
              <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Settings className="h-5 w-5 text-blue-600" /> Manajemen Sistem</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ActionCard href="/dashboard/admin/users" title="User Management" desc="Kelola akun, ganti role, atau nonaktifkan akses tim." icon={Users} color="bg-blue-100 text-blue-600" />
                  <ActionCard href="/dashboard/admin/analytics" title="Data Warehouse" desc="Visualisasi data performa tiket dari BigQuery." icon={BarChart3} color="bg-indigo-100 text-indigo-600" />
                </div>
              </div>
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Zap className="h-5 w-5 text-blue-600" /> Pintasan</h2>
                <Card className="border-none bg-blue-600 text-white p-6 space-y-4 shadow-lg shadow-blue-600/20 rounded-3xl">
                  <div className="p-3 bg-white/20 rounded-xl w-fit"><UserPlus className="h-6 w-6" /></div>
                  <h3 className="font-bold">Tambah User Baru</h3>
                  <Button asChild variant="secondary" className="w-full bg-white text-blue-600 hover:bg-blue-50"><Link href="/dashboard/admin/users">Buka User Manager</Link></Button>
                </Card>
              </div>
            </div>
          </>
        ) : (
          /* --- 2. DASHBOARD OPERASIONAL (SALES/PIC/MANAGER) --- */
          <>
            <div className="relative isolate transform-gpu overflow-hidden rounded-3xl bg-blue-800 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 p-8 text-white shadow-2xl">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md ring-1 ring-white/20">
                    <Zap className="h-3 w-3 text-yellow-400 fill-yellow-400" /> Sistem Onda Care Online
                  </div>
                  <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white leading-tight">Halo, {user.name?.split(' ')[0]}! 👋</h1>
                  <p className="text-blue-100/80 text-sm sm:text-base max-w-md leading-relaxed">
                    Anda masuk sebagai <span className="font-bold text-white uppercase">{role}</span> 
                    {user.division && <> di Divisi <span className="font-bold text-white">{user.division}</span></>}
                  </p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-lg shadow-inner ring-1 ring-white/20">
                  <ShieldCheck className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <LayoutDashboard className="h-5 w-5 text-blue-600" />
                  Menu Utama {role}
                </h2>
                <div className={`grid grid-cols-1 gap-4 ${menuCards.length > 2 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
                  {menuCards.map((card, i) => (
                    <Link key={i} href={card.href} className="group">
                      <Card className={`h-full border-slate-200 transition-all ${card.border} group-hover:shadow-md group-hover:-translate-y-1 rounded-3xl`}>
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
                <Card className="border-slate-200 bg-slate-50/50 p-6 flex items-start gap-4 rounded-3xl">
                  <div className="rounded-full bg-white p-2.5 shadow-sm border border-slate-200 text-blue-600"><Info className="h-5 w-5" /></div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-slate-900">Panduan Operasional</h3>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                      {isSalesAgen && "Gunakan menu di atas untuk mendokumentasikan kendala lapangan. Laporan Anda akan ditampung sebagai basis data evaluasi produk."}
                      {isPIC && "Lakukan validasi pada data yang masuk di menu Antrian Triase untuk memastikan kelengkapan informasi laporan."}
                      {isManagerPlus && "Tinjau data feedback dan riwayat aksi tim untuk memonitor efektivitas penanganan laporan secara berkala."}
                    </p>
                  </div>
                </Card>
              </div>

              {/* SIDEBAR: PENGERTIAN SISTEM (PENGGANTI STATS/BANTUAN) */}
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><BookOpen className="h-5 w-5 text-blue-600" /> Mengenal Sistem</h2>
                
                <Card className="border-slate-200 shadow-sm rounded-[2rem] overflow-hidden bg-white border-b-4 border-b-blue-600">
                  <CardHeader className="pb-3 bg-blue-50/50 border-b border-blue-100">
                    <CardTitle className="text-[11px] font-bold uppercase tracking-[0.1em] text-blue-700 flex items-center gap-2">
                      <Database className="h-3.5 w-3.5" /> Pusat Data Laporan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-3">
                      <p className="text-xs leading-relaxed text-slate-600">
                        <span className="font-bold text-slate-900">Onda Care</span> dirancang sebagai media pusat penyimpanan data dan informasi dari lapangan secara terstruktur.
                      </p>
                      <Separator className="bg-slate-100" />
                      <div className="flex gap-3">
                        <div className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                            <Zap className="h-3 w-3 fill-current" />
                        </div>
                        <p className="text-[11px] leading-relaxed text-slate-500">
                            Setiap masukan Anda dikelola sebagai <strong>Basis Data Strategis</strong> untuk pengembangan produk di masa mendatang.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <div className="h-5 w-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                            <AlertCircle className="h-3 w-3 fill-current" />
                        </div>
                        <p className="text-[11px] leading-relaxed text-slate-500 italic">
                            Penting: Sistem ini berfungsi sebagai <strong>Pendataan</strong>, bukan sistem instruksi pekerjaan instan.
                        </p>
                      </div>
                    </div>
                    
                  </CardContent>
                </Card>

                <div className="rounded-[2rem] border border-blue-100 bg-blue-50/40 p-5 flex gap-4">
                  <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-200">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-[11px] text-blue-800 leading-relaxed font-medium">
                    Integritas data adalah prioritas. Seluruh laporan yang masuk dilindungi oleh sistem keamanan Onda Mega Integra.
                  </p>
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
        <Card className="h-full border-slate-200 transition-all group-hover:border-blue-500 group-hover:shadow-md group-hover:-translate-y-1 rounded-3xl">
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