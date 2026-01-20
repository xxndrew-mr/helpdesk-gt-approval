import { google } from 'googleapis';

const privateKey = process.env.GDRIVE_PRIVATE_KEY
  ? process.env.GDRIVE_PRIVATE_KEY.replace(/\\n/g, '\n')
  : null;

if (!privateKey) {
  throw new Error('GDRIVE_PRIVATE_KEY belum diset di .env.local');
}

const auth = new google.auth.GoogleAuth({
  credentials: {
    project_id: process.env.GDRIVE_PROJECT_ID,
    client_email: process.env.GDRIVE_CLIENT_EMAIL,
    private_key: privateKey,
  },
  scopes: ['https://www.googleapis.com/auth/drive'],
});

export const drive = google.drive({
  version: 'v3',
  auth,
});

export async function makeFilePublic(fileId) {
  await drive.permissions.create({
    fileId,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });
}
