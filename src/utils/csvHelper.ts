import { Question, OptionKey, StudentResult } from '../types';

/**
 * Pure JavaScript robust CSV parser handling commas, semicolons, quotes, and multiline values
 */
export function parseCSVLines(text: string): string[][] {
  const cleanText = text.replace(/^\uFEFF/, '').trim(); // Remove UTF-8 BOM if present
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let inQuotes = false;

  // Detect delimiter: check first line for semicolon vs comma
  const firstLine = cleanText.split(/\r\n|\n|\r/)[0] || '';
  const delimiter = firstLine.includes(';') && !firstLine.includes(',') ? ';' : ',';

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      currentRow.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \n of CRLF
      }
      currentRow.push(currentVal.trim());
      if (currentRow.some(col => col.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }

  if (currentVal.length > 0 || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some(col => col.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Parses question bank CSV with columns:
 * ID_Soal, Pertanyaan, Opsi_A, Opsi_B, Opsi_C, Opsi_D, Jawaban_Benar (A/B/C/D), Waktu_Detik
 */
export function parseQuestionsCSV(csvText: string): { questions: Question[]; errors: string[] } {
  const rows = parseCSVLines(csvText);
  const questions: Question[] = [];
  const errors: string[] = [];

  if (rows.length === 0) {
    return { questions: [], errors: ['File CSV kosong atau tidak memiliki data yang valid.'] };
  }

  // Check header line
  let startIndex = 0;
  const firstRow = rows[0].map(c => c.toLowerCase());
  if (firstRow.some(c => c.includes('id') || c.includes('pertanyaan') || c.includes('soal'))) {
    startIndex = 1; // Header exists
  }

  for (let i = startIndex; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1;

    // Must have at least 7 columns (ID, Pertanyaan, 4 options, Jawaban_Benar)
    if (row.length < 7) {
      errors.push(`Baris ${rowNum}: Kolom tidak lengkap (ditemukan ${row.length} kolom, minimal 7 kolom dibutuhkan).`);
      continue;
    }

    const id = row[0]?.trim() || `Q${questions.length + 1}`;
    const pertanyaan = row[1]?.trim() || '';
    const opsiA = row[2]?.trim() || '';
    const opsiB = row[3]?.trim() || '';
    const opsiC = row[4]?.trim() || '';
    const opsiD = row[5]?.trim() || '';
    const rawAnswer = (row[6]?.trim() || '').toUpperCase();
    const rawTime = row[7]?.trim();

    if (!pertanyaan) {
      errors.push(`Baris ${rowNum}: Kolom pertanyaan tidak boleh kosong.`);
      continue;
    }

    if (!opsiA || !opsiB) {
      errors.push(`Baris ${rowNum}: Minimal Opsi A dan Opsi B wajib diisi.`);
      continue;
    }

    const validAnswers: OptionKey[] = ['A', 'B', 'C', 'D'];
    const answerKey = rawAnswer.charAt(0) as OptionKey;
    if (!validAnswers.includes(answerKey)) {
      errors.push(`Baris ${rowNum}: Jawaban Benar harus salah satu dari A, B, C, atau D (Ditemukan: "${rawAnswer}").`);
      continue;
    }

    let waktuDetik = parseInt(rawTime || '20', 10);
    if (isNaN(waktuDetik) || waktuDetik < 5) {
      waktuDetik = 20; // Default fallback
    }

    const rawImageUrl = row[8]?.trim();
    const imageUrl = rawImageUrl && (rawImageUrl.startsWith('http') || rawImageUrl.startsWith('data:image/')) 
      ? rawImageUrl 
      : undefined;

    questions.push({
      id,
      pertanyaan,
      opsiA,
      opsiB,
      opsiC: opsiC || '-',
      opsiD: opsiD || '-',
      jawabanBenar: answerKey,
      waktuDetik,
      imageUrl
    });
  }

  return { questions, errors };
}

/**
 * Downloads standard template CSV
 */
export function downloadCSVTemplate(): void {
  const csvContent = `ID_Soal,Pertanyaan,Opsi_A,Opsi_B,Opsi_C,Opsi_D,Jawaban_Benar,Waktu_Detik,URL_Gambar
Q1,Protokol apa yang digunakan untuk web aman?,HTTP,HTTPS,FTP,SMTP,B,20,
Q2,Di bawah ini yang BUKAN bahasa pemrograman adalah?,HTML,Python,Java,C++,A,15,
Q3,Sistem operasi open source berbasis kernel Linux adalah?,Ubuntu,Windows 11,macOS,iOS,A,20,
Q4,Satuan kecepatan transfer data jaringan komputer adalah?,Mbps,GHz,Watt,Kelvin,A,15,
Q5,Struktur data antrean yang menerapkan FIFO adalah?,Stack,Queue,Tree,Graph,B,20,`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'Template_Bank_Soal_Kuis.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports complete students score and question-by-question status to CSV
 */
export function exportResultsToCSV(
  students: StudentResult[],
  questions: Question[],
  classAccuracy: number
): void {
  // Build header: Rank, Nama Mahasiswa, Kelompok, Kelas, Total Skor, Akurasi (%), Q1, Q2, ...
  const questionHeaders = questions.map((q, idx) => `Q${idx + 1}_Status`);
  const headers = [
    'Peringkat',
    'Nama Mahasiswa',
    'Kelompok',
    'Kelas',
    'Total Skor',
    'Akurasi (%)',
    'Jumlah Benar',
    'Jumlah Salah',
    ...questionHeaders
  ];

  // Sort students by score descending
  const sorted = [...students].sort((a, b) => b.totalScore - a.totalScore);

  const rows = sorted.map((st, index) => {
    const questionStatuses = questions.map(q => {
      const ans = st.answers[q.id];
      if (!ans) return 'UNATTEMPTED';
      if (ans.status === 'CORRECT') return `CORRECT (${ans.selectedOption})`;
      if (ans.status === 'PARTIALLY_CORRECT') return `PARTIALLY_CORRECT (${ans.selectedOption})`;
      if (ans.status === 'INCORRECT') return `INCORRECT (${ans.selectedOption || 'MISSED'}, Kunci: ${q.jawabanBenar})`;
      return 'UNATTEMPTED';
    });

    return [
      `#${index + 1}`,
      `"${st.namaLengkap.replace(/"/g, '""')}"`,
      `"${st.namaKelompok.replace(/"/g, '""')}"`,
      `"${st.kelas.replace(/"/g, '""')}"`,
      st.totalScore,
      `${st.accuracy}%`,
      st.correctCount,
      st.incorrectCount,
      ...questionStatuses.map(s => `"${s}"`)
    ].join(',');
  });

  const metadataRows = [
    `# LAPORAN HASIL KUIS INTERAKTIF KELAS`,
    `# Tanggal Unduh: ${new Date().toLocaleString('id-ID')}`,
    `# Rata-rata Akurasi Kelas: ${classAccuracy}%`,
    `# Total Peserta: ${students.length}`,
    `# Total Soal: ${questions.length}`,
    ''
  ];

  const fullContent = [...metadataRows, headers.join(','), ...rows].join('\r\n');

  const blob = new Blob([fullContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('download', `Rekap_Nilai_Kuis_Kelas_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
