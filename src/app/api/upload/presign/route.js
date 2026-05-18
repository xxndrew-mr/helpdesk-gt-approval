import { NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '@/lib/r2';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 100 * 1024 * 1024;

export async function POST(request) {
    try {
        const { fileName, fileType, fileSize } = await request.json();

        if (!fileName || !fileType || !fileSize) {
            return NextResponse.json(
                { message: 'fileName, fileType, dan fileSize wajib diisi' },
                { status: 400 }
            );
        }

        const isAllowed =
            fileType.startsWith('image/') ||
            fileType.startsWith('video/') ||
            fileType === 'application/pdf';

        if (!isAllowed) {
            return NextResponse.json(
                { message: 'File harus berupa gambar, video, atau PDF' },
                { status: 400 }
            );
        }

        if (fileSize > MAX_FILE_SIZE) {
            return NextResponse.json(
                { message: 'Ukuran file maksimal 100MB' },
                { status: 413 }
            );
        }

        const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
        const key = `attachments/${Date.now()}-${safeName}`;

        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
            ContentType: fileType,
        });

        const uploadUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 60 * 5,
        });

        const publicBaseUrl = process.env.R2_PUBLIC_URL?.startsWith('http')
            ? process.env.R2_PUBLIC_URL
            : `https://${process.env.R2_PUBLIC_URL}`;

        const fileUrl = `${publicBaseUrl}/${key}`;

        return NextResponse.json({
            uploadUrl,
            fileUrl,
            key,
        });
    } catch (err) {
        console.error('Presign upload error:', err);

        return NextResponse.json(
            { message: 'Gagal membuat upload URL', error: err.message },
            { status: 500 }
        );
    }
}