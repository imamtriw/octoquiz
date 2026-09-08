import { getAccessToken } from './googleAuth';
import { QuizPackage, StudentResult, ActiveQuizSession } from '../types';

export interface DriveSyncResult {
  success: boolean;
  message: string;
  folderId?: string;
  folderLink?: string;
  fileLinks?: { [fileName: string]: string };
  timestamp?: string;
}

export interface DriveFileInfo {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  webViewLink?: string;
  size?: string;
}

const FOLDER_NAME = 'OCTOQUIZ-Data';

/**
 * Find or create the OCTOQUIZ-Data folder in user's Google Drive
 */
export async function getOrCreateOctoquizFolder(accessToken: string): Promise<{ id: string; webViewLink?: string }> {
  // 1. Search for existing folder
  const query = `name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,webViewLink)`;

  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!searchRes.ok) {
    const errData = await searchRes.json().catch(() => ({}));
    throw new Error(errData?.error?.message || 'Gagal mencari folder di Google Drive');
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return {
      id: searchData.files[0].id,
      webViewLink: searchData.files[0].webViewLink,
    };
  }

  // 2. Create folder if not found
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Folder penyimpanan otomatis data kuis, bank soal, dan nilai OCTOQUIZ',
    }),
  });

  if (!createRes.ok) {
    const errData = await createRes.json().catch(() => ({}));
    throw new Error(errData?.error?.message || 'Gagal membuat folder di Google Drive');
  }

  const folderData = await createRes.json();
  return {
    id: folderData.id,
    webViewLink: folderData.webViewLink,
  };
}

/**
 * Upload or update a file in the OCTOQUIZ folder
 */
export async function uploadOrUpdateFile(
  accessToken: string,
  folderId: string,
  fileName: string,
  content: string,
  mimeType = 'application/json'
): Promise<{ id: string; webViewLink?: string }> {
  // Check if file already exists inside this folder
  const query = `name='${fileName}' and '${folderId}' in parents and trashed=false`;
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,webViewLink)`;

  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  let existingFileId: string | null = null;
  let existingWebLink: string | undefined;

  if (searchRes.ok) {
    const searchData = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) {
      existingFileId = searchData.files[0].id;
      existingWebLink = searchData.files[0].webViewLink;
    }
  }

  const boundary = '-------octoquiz_multipart_boundary';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelim = `\r\n--${boundary}--`;

  if (existingFileId) {
    // Update existing file content with PATCH
    const patchUrl = `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=media`;
    const updateRes = await fetch(patchUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': mimeType,
      },
      body: content,
    });

    if (!updateRes.ok) {
      const errData = await updateRes.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Gagal memperbarui ${fileName}`);
    }

    const updatedData = await updateRes.json();
    return { id: existingFileId, webViewLink: updatedData.webViewLink || existingWebLink };
  } else {
    // Create new file inside folder with multipart upload
    const metadata = {
      name: fileName,
      mimeType,
      parents: [folderId],
    };

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${mimeType}; charset=UTF-8\r\n\r\n` +
      content +
      closeDelim;

    const createRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    });

    if (!createRes.ok) {
      const errData = await createRes.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Gagal mengunggah ${fileName}`);
    }

    const createdData = await createRes.json();
    return { id: createdData.id, webViewLink: createdData.webViewLink };
  }
}

/**
 * Generate CSV report of student results
 */
export function generateStudentResultsCSV(students: StudentResult[], sessionTitle = 'OCTOQUIZ'): string {
  const headers = ['Peringkat', 'Nama_Siswa', 'Tim', 'Skor_Total', 'Benar', 'Salah', 'Akurasi_%', 'Waktu_Detik', 'Status_Kuis'];
  
  const sorted = [...students].sort((a, b) => b.totalScore - a.totalScore);
  const rows = sorted.map((s, idx) => {
    const totalAnswered = s.correctCount + s.incorrectCount;
    const accuracy = totalAnswered > 0 ? Math.round((s.correctCount / totalAnswered) * 100) : 0;
    const timeTakenSeconds = Object.values(s.answers).reduce((total, answer) => total + answer.timeSpentSeconds, 0);
    return [
      idx + 1,
      `"${s.namaLengkap.replace(/"/g, '""')}"`,
      `"${s.namaKelompok.replace(/"/g, '""')}"`,
      s.totalScore,
      s.correctCount,
      s.incorrectCount,
      accuracy,
      timeTakenSeconds,
      s.isCompleted ? 'Selesai' : 'Sedang Mengerjakan',
    ].join(',');
  });

  return [
    `# REKAP HASIL KUIS ${sessionTitle}`,
    `# Diekspor otomatis oleh OCTOQUIZ pada ${new Date().toLocaleString('id-ID')}`,
    headers.join(','),
    ...rows,
  ].join('\r\n');
}

/**
 * Sync entire OCTOQUIZ dataset to user's Google Drive:
 * 1. Bank Soal & Paket Kuis (JSON)
 * 2. Hasil Nilai Siswa & Sesi Aktif (JSON)
 * 3. Rekap Spreadsheet Nilai (CSV)
 */
export async function syncAllToGoogleDrive(
  packages: QuizPackage[],
  students: StudentResult[],
  activeSession: ActiveQuizSession,
  hostEmail?: string | null
): Promise<DriveSyncResult> {
  const token = await getAccessToken();
  if (!token) {
    return {
      success: false,
      message: 'Belum terhubung ke Google. Silakan klik "Masuk dengan Google" terlebih dahulu.',
    };
  }

  try {
    // 1. Get or create OCTOQUIZ folder
    const folder = await getOrCreateOctoquizFolder(token);

    // 2. Prepare payload contents
    const nowStr = new Date().toISOString();
    const timestampLocal = new Date().toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const packagesPayload = JSON.stringify({
      version: '1.0',
      hostEmail: hostEmail || 'unknown',
      lastSyncedAt: nowStr,
      packagesCount: packages.length,
      packages,
    }, null, 2);

    const studentsPayload = JSON.stringify({
      version: '1.0',
      hostEmail: hostEmail || 'unknown',
      lastSyncedAt: nowStr,
      session: activeSession,
      studentsCount: students.length,
      students,
    }, null, 2);

    const csvContent = generateStudentResultsCSV(students, activeSession.title || 'OCTOQUIZ');

    // 3. Upload all three files into the folder
    const fileLinks: { [fileName: string]: string } = {};

    const pkgFile = await uploadOrUpdateFile(
      token,
      folder.id,
      'OCTOQUIZ_BankSoal_Packages.json',
      packagesPayload,
      'application/json'
    );
    if (pkgFile.webViewLink) fileLinks['Bank Soal (JSON)'] = pkgFile.webViewLink;

    const stdFile = await uploadOrUpdateFile(
      token,
      folder.id,
      'OCTOQUIZ_Nilai_Siswa_Sesi.json',
      studentsPayload,
      'application/json'
    );
    if (stdFile.webViewLink) fileLinks['Nilai Siswa (JSON)'] = stdFile.webViewLink;

    const csvFile = await uploadOrUpdateFile(
      token,
      folder.id,
      `OCTOQUIZ_Rekap_Nilai_${activeSession.quizCode || 'Kelas'}.csv`,
      csvContent,
      'text/csv'
    );
    if (csvFile.webViewLink) fileLinks['Rekap Spreadsheet (CSV)'] = csvFile.webViewLink;

    return {
      success: true,
      message: `Semua data berhasil disinkronkan ke Google Drive (${timestampLocal})`,
      folderId: folder.id,
      folderLink: folder.webViewLink || `https://drive.google.com/drive/folders/${folder.id}`,
      fileLinks,
      timestamp: timestampLocal,
    };
  } catch (error: any) {
    console.error('Google Drive Sync Error:', error);
    return {
      success: false,
      message: error?.message || 'Gagal menyinkronkan data ke Google Drive.',
    };
  }
}

/**
 * List files in OCTOQUIZ folder
 */
export async function listOctoquizDriveFiles(): Promise<DriveFileInfo[]> {
  const token = await getAccessToken();
  if (!token) return [];

  try {
    const folder = await getOrCreateOctoquizFolder(token);
    const query = `'${folder.id}' in parents and trashed=false`;
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,modifiedTime,webViewLink,size)&orderBy=modifiedTime desc`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return [];
    const data = await res.json();
    return data.files || [];
  } catch {
    return [];
  }
}

/**
 * Fetch and parse Bank Soal from user's Drive
 */
export async function restorePackagesFromDrive(): Promise<{ packages: QuizPackage[]; message: string } | null> {
  const token = await getAccessToken();
  if (!token) throw new Error('Token Google Drive tidak tersedia');

  const folder = await getOrCreateOctoquizFolder(token);
  const query = `name='OCTOQUIZ_BankSoal_Packages.json' and '${folder.id}' in parents and trashed=false`;
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`;

  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const searchData = await searchRes.json();
  if (!searchData.files || searchData.files.length === 0) {
    throw new Error('File OCTOQUIZ_BankSoal_Packages.json belum ditemukan di folder Google Drive Anda.');
  }

  const fileId = searchData.files[0].id;
  const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

  const downloadRes = await fetch(downloadUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!downloadRes.ok) {
    throw new Error('Gagal mengunduh file bank soal dari Google Drive.');
  }

  const json = await downloadRes.json();
  if (json && Array.isArray(json.packages)) {
    return {
      packages: json.packages,
      message: `Berhasil memulihkan ${json.packages.length} paket bank soal dari Google Drive!`,
    };
  }

  throw new Error('Format file bank soal di Google Drive tidak valid.');
}
