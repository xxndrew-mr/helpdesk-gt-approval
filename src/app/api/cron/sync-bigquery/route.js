import { NextResponse } from 'next/server';
import { BigQuery } from '@google-cloud/bigquery';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    console.log("=== SYNC BIGQUERY START ===");
    console.log("NODE_ENV:", process.env.NODE_ENV);

    // 🔹 Ambil data dari PostgreSQL
    const tickets = await prisma.ticket.findMany({
      include: {
        submittedBy: { select: { name: true } },
      },
    });

    if (tickets.length === 0) {
      return NextResponse.json({
        message: 'Tidak ada tiket untuk disinkronisasi.',
      });
    }

    // 🔹 Transform data (hapus semua kemungkinan BigInt)
    const rows = tickets.map((t) => ({
      ticket_id: t.ticket_id ? Number(t.ticket_id) : null,
      title: t.title ?? null,
      submitted_by: t.submittedBy?.name ?? "Unknown",
      type: t.type ?? null,
      status: t.status ?? null,
      created_at: t.createdAt
        ? t.createdAt.toISOString().replace("Z", "")
        : null,
      updated_at: t.updatedAt
        ? t.updatedAt.toISOString().replace("Z", "")
        : null,
      kategori: t.kategori ?? null,
      sub_kategori: t.sub_kategori ?? null,
      nama_pengisi: t.nama_pengisi ?? null,
      jabatan: t.jabatan ?? null,
      toko: t.toko ?? null,
    }));

    // 🔹 Init BigQuery
    const bigquery = new BigQuery({
      projectId: process.env.GCP_PROJECT_ID,
      credentials: {
        client_email: process.env.GCP_CLIENT_EMAIL,
        private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
    });

    const dataset = bigquery.dataset('helpdesk_data');
    const table = dataset.table('tickets_analytics');

    const [exists] = await table.exists();
    if (!exists) {
      throw new Error("Table tickets_analytics belum dibuat di BigQuery");
    }

    // 🔹 Insert ke BigQuery
    await table.insert(rows);

    console.log(`✅ Berhasil sync ${rows.length} baris`);

    return NextResponse.json({
      message: "Sinkronisasi Berhasil",
      count: rows.length,
    });

  } catch (error) {
    console.error("❌ ETL Error:", error);
    return NextResponse.json(
      { message: "Gagal sinkronisasi", error: error.message },
      { status: 500 }
    );
  }
}