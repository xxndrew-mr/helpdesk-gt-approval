// Lokasi: src/app/api/upload/route.js

import { NextResponse } from 'next/server';
import { drive, makeFilePublic } from '../../../lib/googleDrive';
import { Readable } from 'stream';

export const runtime = 'nodejs';

// Helper: convert Buffer to stream
function bufferToStream(buffer) {
  return Readable.from(buffer);
}

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get('file');

    if (!file) {
      return NextResponse.json(
        { message: 'Tidak ada file yang diunggah' },
        { status: 400 }
      );
    }

    // ✅ FOLDER ID LANGSUNG (SUDAH BENAR)
    const FOLDER_ID = '1k2ACUnNGbKEKypw3rLmXRHHKMmrRo80z';
    const folderId = FOLDER_ID;

    // Konversi File -> Stream
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileStream = bufferToStream(buffer);

    // Upload ke Google Drive (Shared Drive)
    const response = await drive.files.create({
      supportsAllDrives: true,
      requestBody: {
        name: file.name,
        parents: [folderId],
      },
      media: {
        mimeType: file.type,
        body: fileStream,
      },
      fields: 'id, webViewLink, webContentLink',
    });

    const uploadedFile = response.data;

    // Jadikan file public
    await makeFilePublic(uploadedFile.id);

    return NextResponse.json(
      {
        message: 'File berhasil diupload',
        fileId: uploadedFile.id,
        fileUrl: uploadedFile.webViewLink,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { message: 'Gagal mengupload file ke Google Drive' },
      { status: 500 }
    );
  }
}
