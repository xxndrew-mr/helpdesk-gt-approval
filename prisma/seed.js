const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Mulai proses seeding...');

  // 1. Buat Roles
  const roles = [
    'Administrator', 'Salesman', 'Agen', 'PIC OMI', 
    'Sales Manager', 'Acting Manager', 'Acting PIC', 'User Feedback'
  ];
  for (const r of roles) {
    await prisma.role.upsert({
      where: { role_name: r },
      update: {},
      create: { role_name: r },
    });
  }

  // 2. Buat Divisions (GABUNGAN: Regional + Fungsional)
  const divisions = [
    // Divisi Regional (Untuk Salesman/Agen/SM/PIC OMI)
    'Divisi AB', 'Divisi AT', 'Divisi DC', 'Divisi PDAM',
    
    // Divisi Fungsional (Untuk Acting Manager)
    'Divisi Operation', 
    'Divisi Marketing Pusat', 
    'Divisi Sales Operation',

    // Divisi Fungsional (Untuk Acting PIC)
    'Divisi Prodev', 
    'Divisi Supply Chain',
    // (Marketing Pusat & Sales Operation juga dipakai oleh Acting PIC)
  ];

  for (const d of divisions) {
    await prisma.division.upsert({
      where: { division_name: d },
      update: {},
      create: { division_name: d },
    });
  }

  // 3. Buat User Admin
  const adminPassword = await bcrypt.hash('password', 10);
  const roleAdmin = await prisma.role.findUnique({ where: { role_name: 'Administrator' } });
  
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      name: 'Super Admin',
      username: 'admin',
      email: 'admin@helpdesk.com',
      password: adminPassword,
      role_id: roleAdmin.role_id,
    },
  });

  // 4. BUAT USER PEJABAT (Hardcode untuk keperluan Routing)
  // Kita butuh ID Role dulu
  const roleAM = await prisma.role.findUnique({ where: { role_name: 'Acting Manager' } });
  const roleAP = await prisma.role.findUnique({ where: { role_name: 'Acting PIC' } });

  // --- Level Acting Manager ---
  // GM Operation
  const divOp = await prisma.division.findUnique({ where: { division_name: 'Divisi Operation' } });
  await prisma.user.upsert({
    where: { username: 'gm_op' },
    update: {},
    create: { name: 'Bpk. GM Operation', username: 'gm_op', email: 'gm@op.com', password: adminPassword, role_id: roleAM.role_id, division_id: divOp.division_id },
  });

  // Marketing Manager
  const divMkt = await prisma.division.findUnique({ where: { division_name: 'Divisi Marketing Pusat' } });
  await prisma.user.upsert({
    where: { username: 'mkt_mgr' },
    update: {},
    create: { name: 'Ibu Marketing Mgr', username: 'mkt_mgr', email: 'mgr@mkt.com', password: adminPassword, role_id: roleAM.role_id, division_id: divMkt.division_id },
  });

  // Sales Op Manager
  const divSalesOp = await prisma.division.findUnique({ where: { division_name: 'Divisi Sales Operation' } });
  await prisma.user.upsert({
    where: { username: 'sales_op_mgr' },
    update: {},
    create: { name: 'Bpk. Sales Op Mgr', username: 'sales_op_mgr', email: 'mgr@salesop.com', password: adminPassword, role_id: roleAM.role_id, division_id: divSalesOp.division_id },
  });

  // --- Level Acting PIC ---
  // Staff Prodev
  const divProdev = await prisma.division.findUnique({ where: { division_name: 'Divisi Prodev' } });
  await prisma.user.upsert({
    where: { username: 'staff_prodev' },
    update: {},
    create: { name: 'Staff Prodev', username: 'staff_prodev', email: 'staff@prodev.com', password: adminPassword, role_id: roleAP.role_id, division_id: divProdev.division_id },
  });

  // Staff Supply Chain
  const divSupply = await prisma.division.findUnique({ where: { division_name: 'Divisi Supply Chain' } });
  await prisma.user.upsert({
    where: { username: 'staff_supply' },
    update: {},
    create: { name: 'Staff Supply Chain', username: 'staff_supply', email: 'staff@supply.com', password: adminPassword, role_id: roleAP.role_id, division_id: divSupply.division_id },
  });

  // Staff Marketing
  await prisma.user.upsert({
    where: { username: 'staff_mkt' },
    update: {},
    create: { name: 'Staff Marketing', username: 'staff_mkt', email: 'staff@mkt.com', password: adminPassword, role_id: roleAP.role_id, division_id: divMkt.division_id },
  });

  // Staff Sales Op
  await prisma.user.upsert({
    where: { username: 'staff_sales_op' },
    update: {},
    create: { name: 'Staff Sales Op', username: 'staff_sales_op', email: 'staff@salesop.com', password: adminPassword, role_id: roleAP.role_id, division_id: divSalesOp.division_id },
  });

  console.log('Seeding Data Pejabat Selesai.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });