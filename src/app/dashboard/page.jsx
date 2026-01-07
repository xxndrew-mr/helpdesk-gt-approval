// Lokasi: src/app/dashboard/page.jsx

"use client";

import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Sparkles,
  ListChecks,
  Ticket,
  Info,
} from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function DashboardPage() {
  const { data: session } = useSession();

  if (!session || !session.user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">
        Memuat data pengguna...
      </div>
    );
  }

  const user = session.user;

 return (
  <div className="space-y-6">
    {/* HEADER SEDERHANA */}
    <Card className="border border-blue-100 bg-blue-50/60">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="inline-flex items-center text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700/80">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Helpdesk GT · Menu Utama
          </p>
          <CardTitle className="text-xl sm:text-2xl text-slate-900">
            Selamat datang, {user.name}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-slate-700">
            Anda masuk sebagai{" "}
            <span className="font-semibold text-slate-900">
              {user.role}
            </span>
            {user.division && (
              <>
                {" "}
                · Divisi{" "}
                <span className="font-semibold text-slate-900">
                  {user.division}
                </span>
              </>
            )}
          </CardDescription>
        </div>

        <div className="mt-2 flex items-center justify-end sm:mt-0">
          <span className="inline-flex items-center rounded-full bg-blue-600 px-3 py-1 text-[11px] font-medium text-white shadow-sm">
            <span className="mr-2 inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            Aktif
          </span>
        </div>
      </CardHeader>
    </Card>

    {/* BODY OVERVIEW */}
    <Card>
      <CardHeader className="flex items-start gap-2">
        <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full border border-blue-100 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
        </div>
        <div>
          <CardTitle className="text-base sm:text-lg text-slate-900">
            Panduan Singkat Penggunaan
          </CardTitle>
          <CardDescription className="mt-1 text-xs sm:text-sm text-slate-600">
            Penjelasan singkat menu yang bisa Anda gunakan di Helpdesk GT.
          </CardDescription>
        </div>
      </CardHeader>

      <Separator className="bg-slate-100" />

      <CardContent className="pt-4 space-y-5">
        <div className="space-y-2 text-sm leading-relaxed text-slate-700">
          <p>
            Halaman ini membantu Anda menyampaikan  laporan,
            atau kendala dari lapangan dengan mudah dan cepat.
          </p>
          <p>
            Gunakan menu di bagian atas untuk membuat permintaan baru,
            melihat status pelaporan, atau mengecek riwayat yang sudah dikirim.
          </p>
        </div>

        <Separator className="bg-slate-100" />

        <div className="grid gap-4 md:grid-cols-3 text-sm">
          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full border border-blue-100 bg-blue-50">
              <Sparkles className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Isi Formulir
              </p>
              <p className="mt-1 text-xs sm:text-[13px] text-slate-600">
                Kirim tentang barang, laporan kendala, atau masukan dari toko.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full border border-blue-100 bg-blue-50">
              <ListChecks className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Cek Status Laporan
              </p>
              <p className="mt-1 text-xs sm:text-[13px] text-slate-600">
                Lihat apakah Laporan Anda masih diproses atau sudah selesai.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full border border-blue-100 bg-blue-50">
              <Ticket className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Riwayat
              </p>
              <p className="mt-1 text-xs sm:text-[13px] text-slate-600">
                Lihat kembali Laporan yang pernah Anda kirim sebelumnya.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-2 flex items-start gap-2 text-xs text-slate-500">
          <span className="mt-[5px] inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>
            Jika mengalami kendala, silakan hubungi Tim Support OMI.
          </span>
        </p>
      </CardContent>
    </Card>
  </div>
);
}