// Lokasi File: prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Mulai proses seeding...');

  // 1. Buat Roles
  // (upsert = update jika ada, create jika tidak ada)
  console.log('Membuat Roles...');
  const roleAdmin = await prisma.role.upsert({
    where: { role_name: 'Administrator' },
    update: {},
    create: { role_name: 'Administrator' },
  });

  const roleSalesman = await prisma.role.upsert({
    where: { role_name: 'Salesman' },
    update: {},
    create: { role_name: 'Salesman' },
  });
  
  // --- ROLE BARU DITAMBAHKAN DI SINI ---
  const roleAgen = await prisma.role.upsert({
    where: { role_name: 'Agen' },
    update: {},
    create: { role_name: 'Agen' },
  });
  // ------------------------------------

  const rolePicOmi = await prisma.role.upsert({
    where: { role_name: 'PIC OMI' },
    update: {},
    create: { role_name: 'PIC OMI' },
  });
  
  const roleSm = await prisma.role.upsert({
    where: { role_name: 'Sales Manager' },
    update: {},
    create: { role_name: 'Sales Manager' },
  });
  
  const roleAm = await prisma.role.upsert({
    where: { role_name: 'Acting Manager' },
    update: {},
    create: { role_name: 'Acting Manager' },
  });
  
  const roleAp = await prisma.role.upsert({
    where: { role_name: 'Acting PIC' },
    update: {},
    create: { role_name: 'Acting PIC' },
  });

  const roleUserFb = await prisma.role.upsert({
    where: { role_name: 'User Feedback' },
    update: {},
    create: { role_name: 'User Feedback' },
  });
  console.log('Roles berhasil dibuat/diperbarui.');

  // 2. Buat Divisions
  console.log('Membuat Divisions...');
  await prisma.division.upsert({
    where: { division_name: 'Divisi A' },
    update: {},
    create: { division_name: 'Divisi A' },
  });
  await prisma.division.upsert({
    where: { division_name: 'Divisi B' },
    update: {},
    create: { division_name: 'Divisi B' },
  });
  await prisma.division.upsert({
    where: { division_name: 'Divisi C' },
    update: {},
    create: { division_name: 'Divisi C' },
  });
  await prisma.division.upsert({
    where: { division_name: 'Divisi D' },
    update: {},
    create: { division_name: 'Divisi D' },
  });
  console.log('Divisions berhasil dibuat/diperbarui.');

  // 3. Buat User Admin (jika belum ada)
  console.log('Membuat User Admin...');
  const adminEmail = 'admin@example.com';
  const adminExists = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!adminExists) {
    const adminPassword = await bcrypt.hash('password', 10);
    await prisma.user.create({
      data: {
        name: 'Admin User',
        email: adminEmail,
        password: adminPassword,
        role_id: roleAdmin.role_id,
      },
    });
    console.log('User Admin (admin@example.com / password) berhasil dibuat.');
  } else {
    console.log('User Admin (admin@example.com) sudah ada.');
  }

  console.log('Proses seeding selesai.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });