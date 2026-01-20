import { NextResponse } from 'next/server';
import { drive, makeFilePublic } from '@/lib/googleDrive';
import { Readable } from 'stream';

export const runtime = 'nodejs';

function bufferToStream(buffer) {
  return Readable.from(buffer);
}

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get('file');

    if (!file) {
      return NextResponse.json({ message: 'File tidak ditemukan' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ message: 'Maksimal file 10MB' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ message: 'Format tidak didukung' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = Readable.from(buffer);

    const res = await drive.files.create({
      supportsAllDrives: true,
      requestBody: {
        name: file.name,
        parents: ['1k2ACUnNGbKEKypw3rLmXRHHKMmrRo80z'],
      },
      media: {
        mimeType: file.type,
        body: stream,
      },
      fields: 'id, webViewLink',
    });

    await makeFilePublic(res.data.id);

    return NextResponse.json({
      fileId: res.data.id,
      fileUrl: res.data.webViewLink,
    });

  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json(
      { message: err.message || 'Upload gagal' },
      { status: 500 }
    );
  }
}
