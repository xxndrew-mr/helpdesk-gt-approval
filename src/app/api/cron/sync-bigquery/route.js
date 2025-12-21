import { NextResponse } from 'next/server';
import { BigQuery } from '@google-cloud/bigquery';
import prisma from '@/lib/prisma';

// Konfigurasi BigQuery via ENV (AMAN UNTUK VERCEL)
const bigquery = new BigQuery({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: {
    client_email: process.env.GCP_CLIENT_EMAIL,
    private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

const datasetId = 'helpdesk_data';
const tableId = 'tickets_analytics';

export async function GET(request) {
  // 🔐 Keamanan Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('--- Mulai Sinkronisasi Tiket (Cron) ---');

    // 1️⃣ Ambil data dari PostgreSQL
    const tickets = await prisma.ticket.findMany({
      include: {
        submittedBy: { select: { name: true } },
      },
    });

    if (tickets.length === 0) {
      return NextResponse.json({ message: 'Tidak ada tiket untuk disinkronisasi.' });
    }

    // 2️⃣ Transformasi data (DATETIME BigQuery = STRING tanpa Z)
    const rows = tickets.map(t => ({
      ticket_id: Number(t.ticket_id),
      title: t.title,
      submitted_by: t.submittedBy?.name || 'Unknown',
      type: t.type,
      status: t.status,
      created_at: t.createdAt.toISOString().replace('Z', ''),
      updated_at: t.updatedAt.toISOString().replace('Z', ''),
      kategori: t.kategori,
      sub_kategori: t.sub_kategori,
      nama_pengisi: t.nama_pengisi,
      jabatan: t.jabatan,
      toko: t.toko,
    }));

    // 3️⃣ Load ke BigQuery
    const dataset = bigquery.dataset(datasetId);
    const table = dataset.table(tableId);

    const [exists] = await table.exists();
    if (!exists) {
      throw new Error(`Table ${tableId} belum dibuat di BigQuery`);
    }

    // 4️⃣ Insert dengan WRITE_TRUNCATE (AMAN & ATOMIC)
    await table.insert(rows, {
      writeDisposition: 'WRITE_TRUNCATE',
    });

    console.log(`✅ Berhasil sync ${rows.length} baris`);

    return NextResponse.json({
      message: 'Sinkronisasi Berhasil',
      count: rows.length,
    });
  } catch (error) {
    console.error('❌ ETL Error:', error);
    return NextResponse.json(
      { message: 'Gagal sinkronisasi', error: error.message },
      { status: 500 }
    );
  }
}
