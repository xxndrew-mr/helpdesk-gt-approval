import { PrismaClient } from '@prisma/client';

// === PERBAIKAN BIGINT (TAMBAHKAN BLOK INI) ===
// Ini "mengajari" JSON.stringify cara menangani BigInt
// dengan mengubahnya menjadi String.
if (typeof BigInt.prototype.toJSON === 'undefined') {
  BigInt.prototype.toJSON = function () {
    return this.toString();
  };
}
// ========================================

// Mendeklarasikan variabel global untuk Prisma Client
let prisma;

// --- Ini Kode Anda yang Sudah Benar ---
// Mengecek apakah kita berada di lingkungan produksi
if (process.env.NODE_ENV === 'production') {
  // Di produksi, buat instance baru
  prisma = new PrismaClient();
} else {
  // Di pengembangan, cek apakah instance sudah ada di global
  if (!global.prisma) {
    // Jika tidak ada, buat instance baru dan simpan di global
    global.prisma = new PrismaClient();
  }
  // Gunakan instance dari global
  prisma = global.prisma;
}
// ------------------------------------

// Ekspor instance Prisma Client yang sudah di-cache dan diperbaiki
export default prisma;