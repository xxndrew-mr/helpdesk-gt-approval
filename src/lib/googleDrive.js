import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: {
    project_id: process.env.GDRIVE_PROJECT_ID,
    client_email: process.env.GDRIVE_CLIENT_EMAIL,
    private_key: process.env.GDRIVE_PRIVATE_KEY.replace(/\\n/g, '\n'),
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
