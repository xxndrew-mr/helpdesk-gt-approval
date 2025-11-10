const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Mulai proses seeding...');

  // 1. Buat Roles
  console.log('Membuat Roles...');
  await prisma.role.createMany({
    data: [
      { role_name: 'Administrator' },
      { role_name: 'Salesman' },
      { role_name: 'PIC OMI' },
      { role_name: 'Sales Manager' },
      { role_name: 'Acting Manager' },
      { role_name: 'Acting PIC' },
      { role_name: 'User Feedback' },
    ],
    skipDuplicates: true, // Lewati jika sudah ada
  });
  console.log('Roles berhasil dibuat.');

  // 2. Buat Divisions
  console.log('Membuat Divisions...');
  await prisma.division.createMany({
    data: [
      { division_name: 'Divisi A' },
      { division_name: 'Divisi B' },
      { division_name: 'Divisi C' },
      { division_name: 'Divisi D' },
    ],
    skipDuplicates: true,
  });
  console.log('Divisions berhasil dibuat.');

  // 3. Buat User Admin
  console.log('Membuat User Admin...');
  const adminRole = await prisma.role.findUnique({
    where: { role_name: 'Administrator' },
  });

  if (adminRole) {
    const adminPassword = await bcrypt.hash('password', 10); // Ganti 'password' jika mau

    await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@example.com',
        password: adminPassword,
        role_id: adminRole.role_id,
        division_id: null,
      },
    });
    console.log('User Admin (admin@example.com / password) berhasil dibuat.');
  } else {
    console.error('Role Administrator tidak ditemukan, gagal membuat user admin.');
  }

  console.log('Proses seeding selesai.');
}

// Menjalankan fungsi main dan menutup koneksi
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });