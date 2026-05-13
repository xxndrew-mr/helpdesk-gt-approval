import { S3Client } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
    region: "auto",
    // Ganti menjadi R2_ACCOUNT_ID agar sesuai dengan file .env kamu
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true, // Wajib untuk menghindari error SSL di R2
});