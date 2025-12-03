// lib/googleDrive.js
import { google } from 'googleapis';
import path from 'path';

const KEYFILEPATH = path.join(process.cwd(), 'service-account-key.json');
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

export const drive = google.drive({ version: 'v3', auth });

export async function getOrCreateFolder(folderName) {
  const res = await drive.files.list({
    q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed = false`,
    fields: 'files(id, name)',
    spaces: 'drive',
  });

  if (res.data.files && res.data.files.length > 0) {
    return res.data.files[0].id;
  }

  const folder = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    },
    fields: 'id',
  });

  return folder.data.id;
}

export async function makeFilePublic(fileId) {
  try {
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
      fields: 'id',
    });
  } catch (err) {
    console.error('Gagal set public:', err);
  }
}
