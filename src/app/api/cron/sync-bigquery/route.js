import { NextResponse } from 'next/server';
import { BigQuery } from '@google-cloud/bigquery';
import prisma from '@/lib/prisma'; // Gunakan prisma instance global aplikasi

// Helper untuk mengatasi masalah BigInt saat logging/response
function serializeBigInt(data) {
  return JSON.parse(JSON.stringify(data, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
}

// Konfigurasi BigQuery menggunakan Environment Variables
// (Di Vercel, jangan pakai file JSON. Simpan isi JSON ke env var)
const bigquery = new BigQuery({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: {
    client_email: process.env.GCP_CLIENT_EMAIL,
    // Handle newline character di private key
    private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

const datasetId = 'helpdesk_data'; // Sesuaikan dataset Anda

export async function GET(request) {
  // 1. KEAMANAN: Verifikasi Header dari Vercel
  // Vercel otomatis mengirim header ini saat menjalankan Cron Job
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('--- Mulai Sinkronisasi Tiket (Cron) ---');

    // 2. Ambil data dari PostgreSQL (Prisma)
    const tickets = await prisma.ticket.findMany({
      include: {
        submittedBy: { select: { name: true } }
      }
    });

    if (tickets.length === 0) {
      return NextResponse.json({ message: 'Tidak ada tiket untuk disinkronisasi.' });
    }

    // 3. Transformasi Data
    const rows = tickets.map(t => ({
      ticket_id: Number(t.ticket_id),
      title: t.title,
      submitted_by: t.submittedBy?.name || 'Unknown',
      type: t.type,
      status: t.status,
      created_at: bigquery.datetime(t.createdAt.toISOString()),
      updated_at: bigquery.datetime(t.updatedAt.toISOString()),
      kategori: t.kategori,
      sub_kategori: t.sub_kategori,
      nama_pengisi: t.nama_pengisi,
      jabatan: t.jabatan,
      toko: t.toko
    }));

    // 4. Load ke BigQuery
    const dataset = bigquery.dataset(datasetId);
    const table = dataset.table('tickets_analytics');

    // Cek tabel, buat jika belum ada (opsional, sebaiknya sudah ada)
    const [tableExists] = await table.exists();
    if (!tableExists) {
       // Definisi schema bisa ditaruh di sini jika mau auto-create
       return NextResponse.json({ message: 'Tabel BigQuery belum dibuat.' }, { status: 500 });
    }

    // Truncate (Hapus data lama) lalu Insert
    const query = `TRUNCATE TABLE \`${process.env.GCP_PROJECT_ID}.${datasetId}.tickets_analytics\``;
    await bigquery.query(query).catch(err => console.warn('Truncate warning:', err.message));

    await table.insert(rows);
    console.log(`Berhasil menyisipkan ${rows.length} baris.`);

    return NextResponse.json({ 
      message: 'Sinkronisasi Berhasil', 
      count: rows.length 
    });

  } catch (error) {
    console.error('ETL Error:', error);
    return NextResponse.json(
      { message: 'Gagal sinkronisasi', error: error.message },
      { status: 500 }
    );
  }
}