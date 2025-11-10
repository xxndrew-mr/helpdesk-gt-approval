// Lokasi: src/app/api/tickets/[ticketId]/triage/route.js
// Ini adalah KODE ASLI (BUKAN TES)

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';

// FUNGSI: PIC OMI melakukan Triase (memilah) tiket.
export async function POST(request, context) {
  // 1. Ambil session
  const session = await getServerSession(authOptions);

  // 2. Cek otorisasi (Hanya PIC OMI)
  if (!session || session.user.role !== 'PIC OMI') {
    return NextResponse.json(
      { message: 'Anda tidak diizinkan.' },
      { status: 403 }
    );
  }

  // === PERBAIKAN KRUSIAL ADA DI SINI ===
  // Kita definisikan 'picOmiUser' dari session
  const picOmiUser = session.user;
  // ===================================

  // 3. Ambil data dari body dan URL
  // 'context.params' adalah Promise di Next.js 14+
  const { ticketId } = await context.params;
  const { type, notes } = await request.json(); // Ambil 'Request'/'Feedback' dari body
  
  // 4. Validasi input
  if (!['Request', 'Feedback'].includes(type)) {
    return NextResponse.json(
      { message: "Tipe harus 'Request' atau 'Feedback'." },
      { status: 400 }
    );
  }
  
  // === PENJAGA (SAFE-GUARD) UNTUK CRASH BIGINT ===
  if (!ticketId) {
    console.error("FATAL: 'ticketId' adalah undefined. Gagal membaca params dari URL.");
    return NextResponse.json(
      { message: "Server Error: Gagal membaca ID tiket dari URL." },
      { status: 500 }
    );
  }
  // ===============================================

  // 5. Verifikasi penugasan
  // Cek apakah PIC OMI ini yang ditugaskan untuk tiket ini
  const currentAssignment = await prisma.ticketAssignment.findFirst({
    where: {
      ticket_id: BigInt(ticketId), 
      user_id: picOmiUser.id, // Baris ini sekarang AMAN
      assignment_type: 'Active',
      status: 'Pending',
    },
    // Ambil juga data submitter (pengirim) untuk alur logika
    include: {
      ticket: {
        include: {
          submittedBy: true,
        },
      },
    },
  });

  if (!currentAssignment) {
    return NextResponse.json(
      { message: 'Anda tidak ditugaskan untuk tiket ini.' },
      { status: 403 }
    );
  }

  // 6. Mulai Transaksi Database (SANGAT PENTING)
  try {
    await prisma.$transaction(async (tx) => {
      // a. Update tipe tiket utama
      await tx.ticket.update({
        where: { ticket_id: BigInt(ticketId) },
        data: { type: type, status: 'Open' }, // Set tipe dan pastikan status 'Open'
      });

      // b. Hapus penugasan 'Active' milik PIC OMI
      await tx.ticketAssignment.delete({
        where: { assignment_id: currentAssignment.assignment_id },
      });

      // c. Buat log triase
      await tx.ticketLog.create({
        data: {
          ticket_id: BigInt(ticketId),
          actor_user_id: picOmiUser.id, // Baris ini sekarang AMAN
          action_type: 'Triase',
          notes: `Triase sebagai: ${type}. Catatan: ${notes || '(Tidak ada catatan)'}`,
        },
      });

      // --- d. LOGIKA INTI ALUR KERJA ---

      const submitter = currentAssignment.ticket.submittedBy;
      const submitterDivisionId = submitter.division_id;

      if (type === 'Request') {
        // --- ALUR REQUEST (Sekuensial) ---
        if (!submitterDivisionId) {
          throw new Error('Pengirim tiket tidak memiliki divisi.');
        }
        // Cari Sales Manager di divisi yang sama dengan pengirim
        const salesManagerUser = await tx.user.findFirst({
          where: {
            role: { role_name: 'Sales Manager' },
            division_id: submitterDivisionId,
          },
        });

        if (!salesManagerUser) {
          throw new Error('Sales Manager untuk divisi ini tidak ditemukan.');
        }

        // Buat penugasan baru untuk Sales Manager
        await tx.ticketAssignment.create({
          data: {
            ticket_id: BigInt(ticketId),
            user_id: salesManagerUser.user_id,
            assignment_type: 'Active',
            status: 'Pending',
          },
        });
      } else {
        // --- ALUR FEEDBACK (Paralel) ---
        let assignmentsToCreate = [];

        // 1. Penugasan untuk PIC OMI (dirinya sendiri)
        assignmentsToCreate.push({
          ticket_id: BigInt(ticketId),
          user_id: picOmiUser.id, // Baris ini sekarang AMAN
          assignment_type: 'Feedback_Review',
          status: 'Pending',
        });

        // 2. Penugasan untuk Sales Manager (jika ada)
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

        // 3. Penugasan untuk semua 'User Feedback'
        const feedbackUsers = await tx.user.findMany({
          where: { role: { role_name: 'User Feedback' } },
        });

        feedbackUsers.forEach((fbUser) => {
          assignmentsToCreate.push({
            ticket_id: BigInt(ticketId),
            user_id: fbUser.user_id,
            assignment_type: 'Feedback_Review',
            status: 'Pending',
          });
        });

        // Buat semua penugasan feedback sekaligus
        await tx.ticketAssignment.createMany({
          data: assignmentsToCreate,
        });
      }
    }); // Transaksi selesai (commit)

    // 7. Kirim response sukses
    return NextResponse.json(
      { message: `Tiket berhasil di-triase sebagai ${type}.` },
      { status: 200 }
    );
  } catch (error) {
    // 8. Rollback jika ada error
    console.error('Gagal melakukan triase:', error);
    return NextResponse.json(
      { message: 'Gagal melakukan triase.', error: error.message },
      { status: 500 }
    );
  }
}