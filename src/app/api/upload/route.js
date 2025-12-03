// Lokasi: src/app/api/upload/route.js

import { NextResponse } from 'next/server';
import { drive, getOrCreateFolder, makeFilePublic } from '../../../lib/googleDrive';
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

    // 1. Tentukan folder tujuan (folder ini harus berada di Shared Drive)
    const FOLDER_NAME = 'HelpdeskGT';
    const folderId = await getOrCreateFolder(FOLDER_NAME);

    // 2. Konversi File (Web API) -> Buffer -> Stream
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileStream = bufferToStream(buffer);

    // 3. Metadata file, parent = folder di Shared Drive
    const fileMetadata = {
      name: file.name,
      parents: [folderId],
    };

    // 4. Upload ke Google Drive (Shared Drive)
   const response = await drive.files.create({
  requestBody: {
    name: file.name,
    parents: [folderId],   // wajib
  },
  media: {
    mimeType: file.type,
    body: fileStream,
  },
  fields: 'id, webViewLink, webContentLink',
});


    const uploadedFile = response.data;

    // 5. Bikin file jadi public
    await makeFilePublic(uploadedFile.id);

    // 6. Ambil URL yang bisa dipakai di app kamu
    const fileUrl = uploadedFile.webViewLink;

    // 7. Return response ke frontend
    return NextResponse.json(
      {
        message: 'File berhasil diupload',
        fileId: uploadedFile.id,
        fileUrl,
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
