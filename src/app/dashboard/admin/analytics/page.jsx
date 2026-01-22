'use client';

import { useState } from 'react';
import { 
  ChartBarIcon, 
  ArrowPathIcon, 
  InformationCircleIcon, 
  ArrowsPointingOutIcon,
  CircleStackIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent } from '@/components/ui/card';

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);

  // --- PENTING: GANTI URL DI BAWAH INI ---
  const lookerStudioUrl = "https://lookerstudio.google.com/embed/reporting/0B5ff6cdq.../page/1M"; 

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto px-4 pb-10 animate-in fade-in duration-700">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <ChartBarIcon className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Intelijen Bisnis</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Dashboard Analitik</h1>
          <p className="text-sm text-slate-500 max-w-2xl">
            Visualisasi performa laporan secara real-time yang terintegrasi langsung dengan 
            <span className="mx-1 inline-flex items-center font-bold text-blue-600">
              <CircleStackIcon className="h-3 w-3 mr-0.5" /> BigQuery Data Warehouse
            </span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
           <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Terakhir Diperbarui</span>
              <span className="text-xs font-medium text-slate-600">Otomatis (Real-time)</span>
           </div>
           <button 
             onClick={() => { setIsLoading(true); window.location.reload(); }}
             className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm"
             title="Refresh Laporan"
           >
             <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
           </button>
        </div>
      </div>

      {/* MAIN VIEWPORT */}
      <Card className="relative overflow-hidden border-none shadow-2xl shadow-blue-900/10 rounded-[32px] bg-slate-100">
        <CardContent className="p-0 h-[75vh] md:h-[80vh] relative">
          
          {/* Loading Placeholder */}
          {isLoading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-50 text-center px-6">
              <div className="relative mb-6">
                <div className="h-20 w-20 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
                <ChartBarIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-blue-600 opacity-50" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Mempersiapkan Laporan...</h3>
              <p className="mt-2 text-sm text-slate-500 max-w-xs">
                Sedang mengambil data dari BigQuery. Proses ini mungkin memakan waktu beberapa detik tergantung koneksi Anda.
              </p>
            </div>
          )}

          {/* Iframe Looker Studio */}
          <iframe
            src={lookerStudioUrl}
            frameBorder="0"
            style={{ border: 0 }}
            allowFullScreen
            onLoad={() => setIsLoading(false)}
            className="absolute top-0 left-0 w-full h-full z-10"
            title="Laporan Analisis Onda Care"
            sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          />

        </CardContent>
      </Card>

      {/* FOOTER INFO */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <InformationCircleIcon className="h-4 w-4" />
          <p>Gunakan kontrol di dalam laporan untuk memfilter data berdasarkan tanggal atau divisi.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter">BigQuery Live</span>
          </div>
          <div className="flex items-center gap-1.5 text-blue-600">
            <ArrowsPointingOutIcon className="h-3 w-3" />
            <span className="text-[11px] font-bold uppercase tracking-tighter">Full Screen Mode Enabled</span>
          </div>
        </div>
      </div>

    </div>
  );
}