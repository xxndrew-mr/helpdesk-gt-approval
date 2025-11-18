-- AlterTable
ALTER TABLE "User" ADD COLUMN     "jabatan" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Active',
ADD COLUMN     "toko" TEXT;
