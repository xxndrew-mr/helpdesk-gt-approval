import { BigQuery } from '@google-cloud/bigquery';
import prisma from '/src/lib/prisma.js';

async function main() {
  try {
    console.log("=== SYNC BIGQUERY START ===");

    if (!process.env.GCP_PROJECT_ID || !process.env.GCP_CLIENT_EMAIL || !process.env.GCP_PRIVATE_KEY) {
      throw new Error("GCP credentials atau PROJECT_ID belum diset di env");
    }

    const bigquery = new BigQuery({
      projectId: process.env.GCP_PROJECT_ID,
      credentials: {
        client_email: process.env.GCP_CLIENT_EMAIL,
        private_key: process.env.GCP_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
    });

    const datasetId = 'helpdesk_data';
    const tableId = 'tickets_analytics';
    const dataset = bigquery.dataset(datasetId);

    // Pastikan dataset ada
    const [datasetExists] = await dataset.exists();
    if (!datasetExists) {
      console.log(`Dataset '${datasetId}' tidak ada. Membuat dataset...`);
      await dataset.create();
      console.log("✅ Dataset dibuat");
    }

    // Drop table lama
    let table = dataset.table(tableId);
    const [tableExists] = await table.exists();
    if (tableExists) {
      console.log("Dropping old table...");
      await table.delete();
      console.log("✅ Old table dropped");
    }

    // Create table baru (hanya tambah notes)
    console.log("Creating new table...");
    await dataset.createTable(tableId, {
      schema: [
        { name: "ticket_id", type: "STRING" },
        { name: "title", type: "STRING" },
        { name: "description", type: "STRING" },
        { name: "notes", type: "STRING" },
        { name: "kode_sales", type: "STRING" }, // ✅ TAMBAHAN SAJA
        { name: "submitted_by", type: "STRING" },
        { name: "type", type: "STRING" },
        { name: "status", type: "STRING" },
        { name: "created_at", type: "TIMESTAMP" },
        { name: "updated_at", type: "TIMESTAMP" },
        { name: "kategori", type: "STRING" },
        { name: "nama_pengisi", type: "STRING" },
        { name: "toko", type: "STRING" },
      ],
    });

    table = dataset.table(tableId);
    for (let i = 0; i < 10; i++) {
      const [exists] = await table.exists();
      if (exists) break;
      await new Promise(res => setTimeout(res, 2000));
    }
    console.log("✅ Table ready for insert");

    // Ambil data dari Prisma + logs
    const tickets = await prisma.ticket.findMany({
  include: {
    submittedBy: { 
      select: { 
        name: true,
        username: true
      } 
    },
    detail: true,
    logs: {
      orderBy: { timestamp: 'desc' }, // ambil log terbaru
      take: 1,
    },
  },
});

    console.log("Total tickets from DB:", tickets.length);

    if (!tickets.length) {
      console.log("⚠️ Tidak ada data untuk disinkronisasi");
      return;
    }

    const rows = tickets.map((t, idx) => {
      const createdAt = t.createdAt ? new Date(t.createdAt) : new Date();
      const updatedAt = t.updatedAt ? new Date(t.updatedAt) : new Date();
      const ticket_id = t.ticket_id ? String(t.ticket_id) : `ticket-${Math.random()}-${idx}`;

      return {
        ticket_id,
        title: t.title ? String(t.title) : "(No Title)",
        description: t.detail?.description ? String(t.detail.description) : "(No Description)",
        notes: t.logs?.[0]?.notes ? String(t.logs[0].notes) : null,
        submitted_by: t.submittedBy?.name ? String(t.submittedBy.name) : "Unknown",
        kode_sales: t.submittedBy?.username ? String(t.submittedBy.username) : "Unknown",
        type: t.type ? String(t.type) : "Pending",
        status: t.status ? String(t.status) : "Open",
        created_at: createdAt.toISOString(),
        updated_at: updatedAt.toISOString(),
        kategori: t.kategori ? String(t.kategori) : "(No Category)",
        nama_pengisi: t.nama_pengisi ? String(t.nama_pengisi) : "Unknown",
        toko: t.toko ? String(t.toko) : "Unknown",
      };
    });

    console.log("Rows ready for BigQuery preview:", rows.slice(0, 3));

    try {
      await table.insert(rows, { ignoreUnknownValues: true, skipInvalidRows: true });
      console.log(`✅ Sinkronisasi selesai, total rows attempted: ${rows.length}`);
    } catch (insertErr) {
      console.error("❌ Error saat insert ke BigQuery:", insertErr);
    }

  } catch (err) {
    console.error("❌ FULL ETL ERROR:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();