// Lokasi: src/app/api/tickets/[ticketId]/sm-process/route.js

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { getRoutingTarget } from '@/lib/smartRouting'; // <-- Import Logika Mapping

export async function POST(request, context) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'Sales Manager') {
    return NextResponse.json({ message: 'Akses ditolak.' }, { status: 403 });
  }

  const { ticketId } = await context.params;
  const { action, notes } = await request.json();

  if (!['approve', 'reject', 'complete'].includes(action)) return NextResponse.json({ message: 'Aksi tidak valid.' }, { status: 400 });
  if (!notes) return NextResponse.json({ message: 'Catatan wajib.' }, { status: 400 });

  // Ambil data tiket untuk cek Sub Kategori
  const currentAssignment = await prisma.ticketAssignment.findFirst({
    where: { ticket_id: BigInt(ticketId), user_id: session.user.id, status: 'Pending' },
    include: { ticket: true } // Include data tiket
  });

  if (!currentAssignment) return NextResponse.json({ message: 'Tugas tidak ditemukan.' }, { status: 403 });

  try {
    await prisma.$transaction(async (tx) => {
      await tx.ticketAssignment.delete({ where: { assignment_id: currentAssignment.assignment_id } });

      await tx.ticketLog.create({
        data: {
          ticket_id: BigInt(ticketId),
          actor_user_id: session.user.id,
          action_type: `sm_${action}`,
          notes: notes,
        },
      });

      if (action === 'approve') {
        // --- SMART ROUTING: MENCARI ACTING MANAGER ---
        const subKategori = currentAssignment.ticket.sub_kategori;
        const target = getRoutingTarget(subKategori);

        if (!target) throw new Error(`Mapping routing tidak ditemukan untuk sub kategori: ${subKategori}`);

        // Cari User Acting Manager di Divisi yang sesuai (misal: Divisi Operation)
        const targetAM = await tx.user.findFirst({
          where: {
            role: { role_name: 'Acting Manager' },
            division: { division_name: target.am_division }
          }
        });

        if (!targetAM) throw new Error(`User Acting Manager untuk ${target.am_division} tidak ditemukan.`);

        await tx.ticketAssignment.create({
          data: {
            ticket_id: BigInt(ticketId),
            user_id: targetAM.user_id, // <-- Kirim ke GM/Mkt Mgr/Sales Op Mgr yang tepat
            assignment_type: 'Active',
            status: 'Pending',
          },
        });
        // ---------------------------------------------
        
      } else if (action === 'reject') {
        await tx.ticket.update({ where: { ticket_id: BigInt(ticketId) }, data: { status: 'Rejected' } });
      } else if (action === 'complete') {
        await tx.ticket.update({ where: { ticket_id: BigInt(ticketId) }, data: { status: 'Done' } });
      }
    });

    return NextResponse.json({ message: `Aksi '${action}' berhasil.` }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}