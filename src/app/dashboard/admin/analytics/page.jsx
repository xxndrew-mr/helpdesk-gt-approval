'use client';

export default function AnalyticsPage() {
  // --- PENTING: GANTI URL DI BAWAH INI ---
  // Cara mendapatkan URL:
  // 1. Buka Laporan Looker Studio Anda.
  // 2. Klik "File" -> "Embed report".
  // 3. Centang "Enable embedding".
  // 4. Pilih "Embed URL".
  // 5. Copy link tersebut dan tempel di bawah ini.
  
  // Contoh URL (Ganti dengan milik Anda):
  const lookerStudioUrl = "https://lookerstudio.google.com/embed/reporting/0B5ff6cdq.../page/1M"; 

  return (
    <div className="flex flex-col h-[85vh]"> {/* Tinggi disesuaikan agar pas di layar */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analisis Data (BigQuery)</h1>
        <p className="text-sm text-gray-500">
          Visualisasi data performa tiket yang bersumber dari Data Warehouse BigQuery.
        </p>
      </div>

      <div className="flex-1 w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
        <iframe
          src={lookerStudioUrl}
          frameBorder="0"
          style={{ border: 0 }}
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full"
          title="Laporan Analisis Onda Care"
          sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        />
      </div>
    </div>
  );
}