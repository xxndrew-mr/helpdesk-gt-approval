// Lokasi: src/app/api/tickets/[ticketId]/am-process/route.js

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { getRoutingTarget } from '@/lib/smartRouting'; // <-- Import Logika Mapping

export async function POST(request, context) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'Acting Manager') {
    return NextResponse.json({ message: 'Akses ditolak.' }, { status: 403 });
  }

  const { ticketId } = await context.params;
  const { action, notes } = await request.json();

  if (!['approve', 'reject'].includes(action)) return NextResponse.json({ message: 'Aksi tidak valid.' }, { status: 400 });
  if (!notes) return NextResponse.json({ message: 'Catatan wajib.' }, { status: 400 });

  const currentAssignment = await prisma.ticketAssignment.findFirst({
    where: { ticket_id: BigInt(ticketId), user_id: session.user.id, status: 'Pending' },
    include: { ticket: true }
  });

  if (!currentAssignment) return NextResponse.json({ message: 'Tugas tidak ditemukan.' }, { status: 403 });

  try {
    await prisma.$transaction(async (tx) => {
      await tx.ticketAssignment.delete({ where: { assignment_id: currentAssignment.assignment_id } });

      await tx.ticketLog.create({
        data: {
          ticket_id: BigInt(ticketId),
          actor_user_id: session.user.id,
          action_type: `am_${action}`,
          notes: notes,
        },
      });

      if (action === 'approve') {
        // --- SMART ROUTING: MENCARI ACTING PIC ---
        const subKategori = currentAssignment.ticket.sub_kategori;
        const target = getRoutingTarget(subKategori);

        if (!target) throw new Error(`Mapping routing tidak ditemukan untuk sub kategori: ${subKategori}`);

        // Cari User Acting PIC di Divisi yang sesuai (misal: Divisi Prodev)
        const targetAP = await tx.user.findFirst({
          where: {
            role: { role_name: 'Acting PIC' },
            division: { division_name: target.ap_division }
          }
        });

        if (!targetAP) throw new Error(`User Acting PIC untuk ${target.ap_division} tidak ditemukan.`);

        await tx.ticketAssignment.create({
          data: {
            ticket_id: BigInt(ticketId),
            user_id: targetAP.user_id, // <-- Kirim ke Staff Prodev/Supply/dll yang tepat
            assignment_type: 'Active',
            status: 'Pending',
          },
        });
        // -----------------------------------------

      } else if (action === 'reject') {
        await tx.ticket.update({ where: { ticket_id: BigInt(ticketId) }, data: { status: 'Rejected' } });
      }
    });

    return NextResponse.json({ message: `Aksi '${action}' berhasil.` }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}