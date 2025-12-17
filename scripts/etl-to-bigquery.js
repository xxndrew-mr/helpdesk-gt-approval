// scripts/etl-to-bigquery.js

const { BigQuery } = require('@google-cloud/bigquery');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

// Inisialisasi Prisma
const prisma = new PrismaClient();


const bigquery = new BigQuery({
  keyFilename: path.join(__dirname, '../service-account-key.json'),
  projectId: 'spg-ds-onda', 
});
const datasetId = 'helpdesk_data'; 

async function createTableIfNotExists(tableName, schema) {
  const dataset = bigquery.dataset(datasetId);
  const table = dataset.table(tableName);
  
  const [exists] = await table.exists();
  if (!exists) {
    console.log(`Membuat tabel ${tableName} di BigQuery...`);
    await dataset.createTable(tableName, { schema });
  }
}

async function syncTickets() {
  console.log('--- Mulai Sinkronisasi Tiket ---');

  // 1. Ambil data dari PostgreSQL (Batching bisa ditambahkan jika data sangat besar)
  const tickets = await prisma.ticket.findMany({
    include: {
        submittedBy: { select: { name: true } }
    }
  });
  
  if (tickets.length === 0) {
      console.log("Tidak ada tiket untuk disinkronisasi.");
      return;
  }

  // 2. Transformasi Data (Sesuaikan dengan tipe data BigQuery)
  const rows = tickets.map(t => ({
    ticket_id: Number(t.ticket_id), // BigInt ke Number/Integer
    title: t.title,
    submitted_by: t.submittedBy?.name || 'Unknown', // Denormalisasi nama user
    type: t.type,
    status: t.status,
    created_at: bigquery.datetime(t.createdAt.toISOString()), // Format Tanggal
    updated_at: bigquery.datetime(t.updatedAt.toISOString()),
    kategori: t.kategori,
    sub_kategori: t.sub_kategori,
    nama_pengisi: t.nama_pengisi,
    jabatan: t.jabatan,
    toko: t.toko
  }));

  // 3. Load ke BigQuery
  // Definisi Skema Tabel BigQuery
  const schema = [
    { name: 'ticket_id', type: 'INTEGER' },
    { name: 'title', type: 'STRING' },
    { name: 'submitted_by', type: 'STRING' },
    { name: 'type', type: 'STRING' },
    { name: 'status', type: 'STRING' },
    { name: 'created_at', type: 'DATETIME' },
    { name: 'updated_at', type: 'DATETIME' },
    { name: 'kategori', type: 'STRING' },
    { name: 'sub_kategori', type: 'STRING' },
    { name: 'nama_pengisi', type: 'STRING' },
    { name: 'jabatan', type: 'STRING' },
    { name: 'toko', type: 'STRING' },
  ];

  await createTableIfNotExists('tickets_analytics', schema);
  
  // Insert data (Streaming Insert)
  // Catatan: Untuk data sangat besar, sebaiknya gunakan Job Load (batch load dari file JSONL)
  // Tapi untuk ribuan baris, streaming insert masih oke.
  // PENTING: Metode ini akan MENAMBAH data (append). 
  // Untuk sinkronisasi penuh (overwrite), sebaiknya truncate tabel dulu atau gunakan metode WRITE_TRUNCATE via Job.
  
  // Solusi Sederhana: Hapus semua dulu (Truncate) lalu insert ulang (Full Load)
  // Hati-hati, ini hanya cocok untuk dataset kecil-menengah.
  const dataset = bigquery.dataset(datasetId);
  const table = dataset.table('tickets_analytics');
  
  try {
      // Hapus isi tabel lama (opsional, jika ingin data selalu fresh snapshot)
      const query = `TRUNCATE TABLE \`${datasetId}.tickets_analytics\``;
      await bigquery.query(query).catch(() => {}); // Abaikan error jika tabel belum ada
      
      // Insert baru
      await table.insert(rows);
      console.log(`Berhasil menyisipkan ${rows.length} baris ke tabel tickets_analytics.`);
  } catch (e) {
      if (e.name === 'PartialFailureError') {
          e.errors.forEach(err => console.error(err));
      } else {
          console.error(e);
      }
  }
}

async function main() {
    try {
        await syncTickets();
        // Anda bisa menambahkan fungsi sync untuk tabel lain (Logs, Users) di sini
    } catch (err) {
        console.error('ETL Error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();