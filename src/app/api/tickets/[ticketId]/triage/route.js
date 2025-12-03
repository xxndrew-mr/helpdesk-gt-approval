import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { getRoutingTarget } from '@/lib/smartRouting'; 

// FUNGSI: PIC OMI melakukan Triase (memilah) tiket.
export async function POST(request, context) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'PIC OMI') {
    return NextResponse.json({ message: 'Anda tidak diizinkan.' }, { status: 403 });
  }

  const picOmiUser = session.user;
  const { ticketId } = await context.params; 
  
  const { type, notes } = await request.json(); 

  if (!['Request', 'Feedback'].includes(type)) {
    return NextResponse.json({ message: "Tipe harus 'Request' atau 'Feedback'." }, { status: 400 });
  }
  
  if (!ticketId) return NextResponse.json({ message: "Server Error: Ticket ID missing." }, { status: 500 });

  // Ambil data assignment + tiket + submitter
  const currentAssignment = await prisma.ticketAssignment.findFirst({
    where: {
      ticket_id: BigInt(ticketId),
      user_id: picOmiUser.id,
      assignment_type: 'Active',
      status: 'Pending',
    },
    include: {
      ticket: {
        include: {
          submittedBy: true, 
        },
      },
    },
  });

  if (!currentAssignment) {
    return NextResponse.json({ message: 'Anda tidak ditugaskan untuk tiket ini.' }, { status: 403 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Update Tiket & Hapus Tugas Lama
      await tx.ticket.update({
        where: { ticket_id: BigInt(ticketId) },
        data: { type: type, status: 'Open' }, 
      });

      await tx.ticketAssignment.delete({
        where: { assignment_id: currentAssignment.assignment_id },
      });

      await tx.ticketLog.create({
        data: {
          ticket_id: BigInt(ticketId),
          actor_user_id: picOmiUser.id,
          action_type: 'Triase',
          notes: `Triase sebagai: ${type}. Catatan: ${notes || '-'}`,
        },
      });

      // 2. LOGIKA ROUTING
      const submitter = currentAssignment.ticket.submittedBy;
      const submitterDivisionId = submitter.division_id;
      const subKategori = currentAssignment.ticket.sub_kategori;

      if (type === 'Request') {
        // --- ALUR REQUEST (Tetap Sama) ---
        if (!submitterDivisionId) throw new Error('Pengirim tiket tidak memiliki divisi.');
        
        const salesManagerUser = await tx.user.findFirst({
          where: {
            role: { role_name: 'Sales Manager' },
            division_id: submitterDivisionId,
          },
        });

        if (!salesManagerUser) throw new Error('Sales Manager untuk divisi ini tidak ditemukan.');

        await tx.ticketAssignment.create({
          data: {
            ticket_id: BigInt(ticketId),
            user_id: salesManagerUser.user_id,
            assignment_type: 'Active',
            status: 'Pending',
          },
        });

      } else {
        // --- ALUR FEEDBACK (REVISI: Hapus PIC OMI) ---
        let assignmentsToCreate = [];

        // A. Penugasan untuk PIC OMI (Diri Sendiri) ---> DIHAPUS SESUAI PERMINTAAN
        // (Kode sebelumnya yang membuat assignment untuk picOmiUser.id dihapus di sini)

        // B. Penugasan untuk Sales Manager (Regional)
        if (submitterDivisionId) {
          const salesManagerUser = await tx.user.findFirst({
            where: {
              role: { role_name: 'Sales Manager' },
              division_id: submitterDivisionId,
            },
          });
          if (salesManagerUser) {
            assignmentsToCreate.push({
              ticket_id: BigInt(ticketId),
              user_id: salesManagerUser.user_id,
              assignment_type: 'Feedback_Review',
              status: 'Pending',
            });
          }
        }

        // C. Penugasan untuk User Feedback (Smart Routing)
        const target = getRoutingTarget(subKategori);
        let feedbackWhereClause = { role: { role_name: 'User Feedback' } };

        if (target && target.ap_division) {
             feedbackWhereClause = {
                role: { role_name: 'User Feedback' },
                division: { division_name: target.ap_division } 
             };
        }

        const feedbackUsers = await tx.user.findMany({
          where: feedbackWhereClause
        });

        feedbackUsers.forEach((fbUser) => {
          assignmentsToCreate.push({
            ticket_id: BigInt(ticketId),
            user_id: fbUser.user_id,
            assignment_type: 'Feedback_Review',
            status: 'Pending',
          });
        });

        if (assignmentsToCreate.length > 0) {
            await tx.ticketAssignment.createMany({
                data: assignmentsToCreate,
            });
        }
      }
    }); 

    return NextResponse.json({ message: `Tiket berhasil di-triase sebagai ${type}.` }, { status: 200 });
  } catch (error) {
    console.error('Gagal melakukan triase:', error);
    return NextResponse.json({ message: 'Gagal melakukan triase.', error: error.message }, { status: 500 });
  }
}