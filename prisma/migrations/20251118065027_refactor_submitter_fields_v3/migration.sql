/*
  Warnings:

  - You are about to drop the column `jabatan` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `toko` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "nama_pengisi" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "jabatan",
DROP COLUMN "toko";
