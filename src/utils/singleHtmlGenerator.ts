/**
 * Generates an all-in-one Single HTML File (HTML + CSS + Pure JS)
 * that runs completely standalone without any server or external build tool.
 */
export function generateSingleFileHTML(): string {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OCTOQUIZ - Kuis Interaktif Kelas Standalone</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;700;900&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #060b14;
      color: #f1f5f9;
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      min-height: 100vh;
      overflow-x: hidden;
    }
    h1, h2, h3, h4, .font-display { font-family: 'Outfit', sans-serif; }
    .nav-bar {
      background: #0e172a;
      border-bottom: 1px solid rgba(6, 182, 212, 0.2);
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 50;
    }
    .brand { display: flex; align-items: center; gap: 10px; cursor: pointer; }
    .brand-logo {
      width: 38px; height: 38px; border-radius: 12px;
      background: linear-gradient(135deg, #06b6d4, #3b82f6, #10b981);
      display: flex; align-items: center; justify-content: center; font-size: 20px;
    }
    .brand-title { font-size: 18px; font-weight: 900; letter-spacing: -0.5px; color: #fff; }
    .nav-tabs { display: flex; gap: 6px; background: #080d19; padding: 4px; border-radius: 12px; border: 1px solid rgba(6, 182, 212, 0.2); }
    .tab-btn {
      background: transparent; color: #94a3b8; border: none; padding: 8px 16px;
      border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s;
    }
    .tab-btn.active { background: linear-gradient(135deg, #06b6d4, #3b82f6); color: #fff; }
    .container { max-width: 1100px; margin: 0 auto; padding: 24px 16px; }
    .card {
      background: #0e172a; border: 1px solid rgba(6, 182, 212, 0.2); border-radius: 24px;
      padding: 24px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.7); margin-bottom: 24px;
    }
    .input-field {
      width: 100%; padding: 12px 16px; background: #121218; border: 1px solid rgba(255,255,255,0.15);
      border-radius: 12px; color: #fff; font-size: 14px; margin-top: 6px; outline: none;
    }
    .input-field:focus { border-color: #00e6a8; }
    .btn-primary {
      width: 100%; padding: 14px; background: linear-gradient(135deg, #00e6a8, #00d2ff);
      color: #121218; border: none; border-radius: 12px; font-size: 15px; font-weight: 900;
      cursor: pointer; margin-top: 20px; letter-spacing: 0.5px; transition: transform 0.1s;
    }
    .btn-primary:active { transform: scale(0.99); }
    /* Quiz Options */
    .options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 16px; }
    @media (max-width: 640px) { .options-grid { grid-template-columns: 1fr; } }
    .opt-btn {
      padding: 16px; border-radius: 16px; border: 2px solid transparent; cursor: pointer;
      text-align: left; display: flex; align-items: center; gap: 12px; font-weight: 600; font-size: 15px;
      transition: all 0.2s;
    }
    .opt-a { background: rgba(255, 77, 109, 0.15); border-color: rgba(255, 77, 109, 0.4); color: #ff4d6d; }
    .opt-b { background: rgba(0, 210, 255, 0.15); border-color: rgba(0, 210, 255, 0.4); color: #00d2ff; }
    .opt-c { background: rgba(255, 193, 7, 0.15); border-color: rgba(255, 193, 7, 0.4); color: #ffc107; }
    .opt-d { background: rgba(0, 230, 168, 0.15); border-color: rgba(0, 230, 168, 0.4); color: #00e6a8; }
    .opt-badge { width: 34px; height: 34px; border-radius: 8px; font-weight: 900; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #121218; }
    .opt-a .opt-badge { background: #ff4d6d; color: #fff; }
    .opt-b .opt-badge { background: #00d2ff; }
    .opt-c .opt-badge { background: #ffc107; }
    .opt-d .opt-badge { background: #00e6a8; }
    /* Accuracy Bar */
    .accuracy-track { width: 100%; height: 22px; background: #121218; border-radius: 20px; overflow: hidden; display: flex; border: 1px solid rgba(255,255,255,0.1); margin: 10px 0; }
    .acc-green { background: linear-gradient(90deg, #00d2ff, #00e6a8); height: 100%; transition: width 0.5s; display: flex; align-items: center; justify-content: flex-end; padding-right: 8px; font-size: 11px; font-weight: 900; color: #121218; }
    .acc-red { background: #ff4d6d; height: 100%; transition: width 0.5s; display: flex; align-items: center; padding-left: 8px; font-size: 11px; font-weight: 900; color: #fff; }
    /* Table */
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { background: #181824; padding: 12px; text-align: left; color: #94a3b8; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.1); }
    td { padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .badge-correct { background: rgba(0, 230, 168, 0.2); color: #00e6a8; padding: 3px 8px; border-radius: 6px; font-weight: 700; }
    .badge-incorrect { background: rgba(255, 77, 109, 0.2); color: #ff4d6d; padding: 3px 8px; border-radius: 6px; font-weight: 700; }
    /* Podium */
    .podium-wrap { display: flex; align-items: flex-end; justify-content: center; gap: 16px; margin: 30px 0; }
    .podium-card { background: #181824; border-radius: 16px; text-align: center; padding: 16px; flex: 1; max-width: 220px; }
    .podium-1 { border-top: 4px solid #ffc107; height: 210px; }
    .podium-2 { border-top: 4px solid #cbd5e1; height: 170px; }
    .podium-3 { border-top: 4px solid #b45309; height: 140px; }
  </style>
</head>
<body>
  <div class="nav-bar">
    <div class="brand" onclick="switchView('PLAYER_REG')">
      <div class="brand-logo">⚡</div>
      <div>
        <div class="brand-title">WAYQUIZ LIVE</div>
        <div style="font-size: 11px; color: #94a3b8;">Kuis Interaktif Kelas</div>
      </div>
    </div>
    <div class="nav-tabs">
      <button class="tab-btn active" id="tab-player" onclick="switchView('PLAYER_REG')">🎮 Mahasiswa</button>
      <button class="tab-btn" id="tab-display" onclick="switchView('ADMIN_DISPLAY')">🖥️ Display Kelas</button>
      <button class="tab-btn" id="tab-questions" onclick="switchView('ADMIN_QUESTIONS')">⚙️ Bank Soal</button>
      <button class="tab-btn" id="tab-results" onclick="switchView('ADMIN_RESULTS')">📊 Rekap Nilai</button>
    </div>
  </div>

  <div class="container" id="app-content">
    <!-- Rendered via JavaScript -->
  </div>

  <script>
    // Local Data Store
    const DEFAULT_QUESTIONS = [
      { id: 'Q1', pertanyaan: 'Protokol jaringan manakah yang bertugas menerjemahkan domain menjadi IP?', opsiA: 'HTTP', opsiB: 'DNS', opsiC: 'DHCP', opsiD: 'FTP', jawabanBenar: 'B', waktuDetik: 20 },
      { id: 'Q2', pertanyaan: 'Struktur data manakah yang menggunakan prinsip LIFO (Last In First Out)?', opsiA: 'Queue', opsiB: 'Binary Tree', opsiC: 'Stack', opsiD: 'Linked List', jawabanBenar: 'C', waktuDetik: 20 },
      { id: 'Q3', pertanyaan: 'Manakah prinsip RESTful API yang mewajibkan ketiadaan session state di server?', opsiA: 'Stateless', opsiB: 'Stateful', opsiC: 'Binary RPC', opsiD: 'Monolithic', jawabanBenar: 'A', waktuDetik: 20 },
      { id: 'Q4', pertanyaan: 'Kompleksitas waktu rata-rata (average time complexity) dari Quick Sort adalah?', opsiA: 'O(n)', opsiB: 'O(n^2)', opsiC: 'O(log n)', opsiD: 'O(n log n)', jawabanBenar: 'D', waktuDetik: 25 },
      { id: 'Q5', pertanyaan: 'Perintah SQL untuk mengambil data unik tanpa duplikasi adalah?', opsiA: 'SELECT UNIQUE', opsiB: 'SELECT DISTINCT', opsiC: 'SELECT ONLY', opsiD: 'SELECT ONE', jawabanBenar: 'B', waktuDetik: 20 }
    ];

    let questions = JSON.parse(localStorage.getItem('quiz_questions') || 'null') || DEFAULT_QUESTIONS;
    let students = JSON.parse(localStorage.getItem('quiz_students') || '[]');

    let currentView = 'PLAYER_REG';
    let currentStudent = null;
    let currentQIndex = 0;
    let timerInterval = null;
    let timeLeft = 20;
    let studentAnswers = {};
    let studentScore = 0;
    let studentStreak = 0;

    function saveState() {
      localStorage.setItem('quiz_questions', JSON.stringify(questions));
      localStorage.setItem('quiz_students', JSON.stringify(students));
    }

    function switchView(view) {
      currentView = view;
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      if (view === 'PLAYER_REG' || view === 'PLAYER_QUIZ' || view === 'PLAYER_SUMMARY') document.getElementById('tab-player')?.classList.add('active');
      if (view === 'ADMIN_DISPLAY') document.getElementById('tab-display')?.classList.add('active');
      if (view === 'ADMIN_QUESTIONS') document.getElementById('tab-questions')?.classList.add('active');
      if (view === 'ADMIN_RESULTS') document.getElementById('tab-results')?.classList.add('active');
      render();
    }

    function render() {
      const root = document.getElementById('app-content');
      if (currentView === 'PLAYER_REG') {
        root.innerHTML = \`
          <div style="max-width: 520px; margin: 30px auto;" class="card">
            <h2 style="font-size: 24px; font-weight: 900; margin-bottom: 6px; text-align: center;">Registrasi Mahasiswa</h2>
            <p style="font-size: 13px; color: #94a3b8; text-align: center; margin-bottom: 24px;">Silakan masukkan identitas diri sebelum mengerjakan kuis.</p>
            <form onsubmit="startQuiz(event)">
              <div style="margin-bottom: 14px;">
                <label style="font-size: 12px; font-weight: 700; color: #cbd5e1;">NAMA LENGKAP *</label>
                <input id="reg-nama" class="input-field" placeholder="Contoh: Budi Santoso" required />
              </div>
              <div style="margin-bottom: 14px;">
                <label style="font-size: 12px; font-weight: 700; color: #cbd5e1;">NAMA KELOMPOK *</label>
                <input id="reg-kelompok" class="input-field" placeholder="Contoh: Kelompok Cyber 01" required />
              </div>
              <div style="margin-bottom: 14px;">
                <label style="font-size: 12px; font-weight: 700; color: #cbd5e1;">KELAS *</label>
                <input id="reg-kelas" class="input-field" placeholder="Contoh: TI-3A" required />
              </div>
              <button type="submit" class="btn-primary">MULAI KERJAKAN KUIS 🚀</button>
            </form>
          </div>
        \`;
      } else if (currentView === 'PLAYER_QUIZ') {
        renderQuizPlayer(root);
      } else if (currentView === 'ADMIN_DISPLAY') {
        renderAdminDisplay(root);
      } else if (currentView === 'ADMIN_QUESTIONS') {
        renderAdminQuestions(root);
      } else if (currentView === 'ADMIN_RESULTS') {
        renderAdminResults(root);
      }
    }

    function startQuiz(e) {
      e.preventDefault();
      currentStudent = {
        id: 'st_' + Date.now(),
        namaLengkap: document.getElementById('reg-nama').value.trim(),
        namaKelompok: document.getElementById('reg-kelompok').value.trim(),
        kelas: document.getElementById('reg-kelas').value.trim().toUpperCase(),
        avatar: '⚡'
      };
      currentQIndex = 0;
      studentAnswers = {};
      studentScore = 0;
      studentStreak = 0;
      switchView('PLAYER_QUIZ');
      startQuestionTimer();
    }

    function startQuestionTimer() {
      if (timerInterval) clearInterval(timerInterval);
      const q = questions[currentQIndex];
      timeLeft = q ? q.waktuDetik : 20;
      timerInterval = setInterval(() => {
        timeLeft--;
        const timerEl = document.getElementById('time-number');
        if (timerEl) timerEl.innerText = timeLeft + 's';
        if (timeLeft <= 0) {
          clearInterval(timerInterval);
          submitAnswer('TIMED_OUT');
        }
      }, 1000);
    }

    function renderQuizPlayer(root) {
      const q = questions[currentQIndex];
      if (!q) { finishQuiz(); return; }
      root.innerHTML = \`
        <div class="card" style="max-width: 800px; margin: 0 auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px; margin-bottom: 16px;">
            <div>
              <span style="font-size: 14px; font-weight: 800; color: #fff;">\${currentStudent.namaLengkap}</span>
              <span style="font-size: 12px; color: #94a3b8; margin-left: 8px;">\${currentStudent.namaKelompok} (\${currentStudent.kelas})</span>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 11px; color: #94a3b8; display: block;">SKOR REALTIME</span>
              <span style="font-size: 18px; font-weight: 900; color: #ffc107;">\${studentScore} pts</span>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="font-size: 12px; font-weight: 700; color: #00e6a8;">SOAL \${currentQIndex + 1} / \${questions.length}</span>
            <span id="time-number" style="font-size: 15px; font-weight: 900; color: #00d2ff;">\${timeLeft}s</span>
          </div>
          <h2 style="font-size: 20px; font-weight: 800; line-height: 1.4; margin: 16px 0;">\${q.pertanyaan}</h2>
          <div class="options-grid">
            <button class="opt-btn opt-a" onclick="submitAnswer('A')"><div class="opt-badge">A</div> <span>\${q.opsiA}</span></button>
            <button class="opt-btn opt-b" onclick="submitAnswer('B')"><div class="opt-badge">B</div> <span>\${q.opsiB}</span></button>
            <button class="opt-btn opt-c" onclick="submitAnswer('C')"><div class="opt-badge">C</div> <span>\${q.opsiC}</span></button>
            <button class="opt-btn opt-d" onclick="submitAnswer('D')"><div class="opt-badge">D</div> <span>\${q.opsiD}</span></button>
          </div>
        </div>
      \`;
    }

    function submitAnswer(selected) {
      if (timerInterval) clearInterval(timerInterval);
      const q = questions[currentQIndex];
      const isCorrect = selected === q.jawabanBenar;
      let pts = 0;
      if (isCorrect) {
        studentStreak++;
        pts = 1000 + Math.round((timeLeft / q.waktuDetik) * 500) + (studentStreak * 100);
        studentScore += pts;
      } else {
        studentStreak = 0;
      }
      studentAnswers[q.id] = { selected, isCorrect, scoreEarned: pts, timeSpent: q.waktuDetik - timeLeft };
      
      alert(isCorrect ? \`🎉 BENAR! +\${pts} PTS\` : \`❌ KURANG TEPAT! Kunci: \${q.jawabanBenar}\`);
      currentQIndex++;
      if (currentQIndex < questions.length) {
        render();
        startQuestionTimer();
      } else {
        finishQuiz();
      }
    }

    function finishQuiz() {
      let correctCount = 0;
      Object.values(studentAnswers).forEach(a => { if (a.isCorrect) correctCount++; });
      const accuracy = Math.round((correctCount / questions.length) * 100);
      const fullRecord = {
        ...currentStudent,
        totalScore: studentScore,
        accuracy,
        correctCount,
        incorrectCount: questions.length - correctCount,
        answers: studentAnswers,
        isCompleted: true
      };
      students.push(fullRecord);
      saveState();
      alert(\`Kuis Selesai! Skor Anda: \${studentScore} pts (Akurasi: \${accuracy}%)\`);
      switchView('ADMIN_DISPLAY');
    }

    function renderAdminDisplay(root) {
      let totalAns = 0, totalCorr = 0;
      students.forEach(st => {
        Object.values(st.answers || {}).forEach(a => { totalAns++; if (a.isCorrect) totalCorr++; });
      });
      const acc = totalAns > 0 ? Math.round((totalCorr / totalAns) * 100) : 0;
      
      root.innerHTML = \`
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <h2 style="font-size: 26px; font-weight: 900;">Class Accuracy (Wayground Display)</h2>
            <span style="font-size: 28px; font-weight: 900; color: #00e6a8;">\${acc}%</span>
          </div>
          <div class="accuracy-track">
            <div class="acc-green" style="width: \${acc}%">\${acc}% Benar</div>
            <div class="acc-red" style="width: \${100 - acc}%">\${100 - acc}% Salah</div>
          </div>
        </div>
        <div class="card">
          <h3 style="font-size: 18px; font-weight: 900; margin-bottom: 12px;">Live Papan Peringkat Peserta</h3>
          <table>
            <thead><tr><th>Rank</th><th>Nama</th><th>Kelompok</th><th>Kelas</th><th>Skor</th><th>Akurasi</th></tr></thead>
            <tbody>
              \${students.sort((a,b)=>b.totalScore-a.totalScore).map((s,i)=>\`
                <tr>
                  <td><b>#\${i+1}</b></td>
                  <td><b>\${s.namaLengkap}</b></td>
                  <td>\${s.namaKelompok}</td>
                  <td>\${s.kelas}</td>
                  <td style="color:#ffc107; font-weight:900;">\${s.totalScore} pts</td>
                  <td><span class="badge-correct">\${s.accuracy}%</span></td>
                </tr>
              \`).join('') || '<tr><td colspan="6" style="text-align:center; color:#94a3b8;">Belum ada peserta.</td></tr>'}
            </tbody>
          </table>
        </div>
      \`;
    }

    function renderAdminQuestions(root) {
      root.innerHTML = \`
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="font-size: 18px; font-weight: 900;">Bank Soal (\${questions.length} Soal)</h3>
            <input type="file" accept=".csv" onchange="importCSV(event)" style="font-size: 12px;" />
          </div>
          <p style="font-size: 12px; color: #94a3b8; margin-bottom: 16px;">Format CSV: ID_Soal, Pertanyaan, Opsi_A, Opsi_B, Opsi_C, Opsi_D, Jawaban_Benar, Waktu_Detik</p>
          <table>
            <thead><tr><th>ID</th><th>Pertanyaan</th><th>Kunci</th><th>Waktu</th></tr></thead>
            <tbody>
              \${questions.map(q => \`
                <tr>
                  <td><b>\${q.id}</b></td>
                  <td>\${q.pertanyaan}</td>
                  <td style="color:#00e6a8; font-weight:900;">\${q.jawabanBenar}</td>
                  <td>\${q.waktuDetik}s</td>
                </tr>
              \`).join('')}
            </tbody>
          </table>
        </div>
      \`;
    }

    function importCSV(e) {
      const file = e.target.files[0];
      if (!file) return;
      const r = new FileReader();
      r.onload = ev => {
        const lines = ev.target.result.split(/\\r?\\n/).filter(l => l.trim().length > 0);
        const newQ = [];
        for (let i = 1; i < lines.length; i++) {
          const col = lines[i].split(',');
          if (col.length >= 7) {
            newQ.push({
              id: col[0].trim(),
              pertanyaan: col[1].trim(),
              opsiA: col[2].trim(),
              opsiB: col[3].trim(),
              opsiC: col[4]?.trim() || '',
              opsiD: col[5]?.trim() || '',
              jawabanBenar: col[6].trim().toUpperCase(),
              waktuDetik: parseInt(col[7]) || 20
            });
          }
        }
        if (newQ.length > 0) {
          questions = newQ;
          saveState();
          alert(\`Berhasil memuat \${newQ.length} butir soal dari CSV!\`);
          render();
        }
      };
      r.readAsText(file);
    }

    function renderAdminResults(root) {
      const sorted = [...students].sort((a,b)=>b.totalScore - a.totalScore);
      root.innerHTML = \`
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h2 style="font-size: 22px; font-weight: 900;">Rekap Hasil & Podium Juara</h2>
            <button onclick="downloadCSVResults()" style="padding: 8px 16px; background:#00e6a8; color:#121218; font-weight:800; border:none; border-radius:8px; cursor:pointer;">Export Rekap CSV</button>
          </div>
          <div class="podium-wrap">
            <div class="podium-card podium-2">
              <div style="font-size: 20px;">🥈</div>
              <div style="font-size: 13px; font-weight:800;">\${sorted[1]?.namaLengkap || '-'}</div>
              <div style="color: #cbd5e1; font-weight:900;">\${sorted[1]?.totalScore || 0} pts</div>
              <div style="font-size: 24px; font-weight:900; margin-top:14px; color:#cbd5e1;">2nd</div>
            </div>
            <div class="podium-card podium-1">
              <div style="font-size: 28px;">👑</div>
              <div style="font-size: 15px; font-weight:800;">\${sorted[0]?.namaLengkap || '-'}</div>
              <div style="color: #ffc107; font-weight:900;">\${sorted[0]?.totalScore || 0} pts</div>
              <div style="font-size: 32px; font-weight:900; margin-top:14px; color:#ffc107;">1st</div>
            </div>
            <div class="podium-card podium-3">
              <div style="font-size: 20px;">🥉</div>
              <div style="font-size: 13px; font-weight:800;">\${sorted[2]?.namaLengkap || '-'}</div>
              <div style="color: #b45309; font-weight:900;">\${sorted[2]?.totalScore || 0} pts</div>
              <div style="font-size: 20px; font-weight:900; margin-top:14px; color:#b45309;">3rd</div>
            </div>
          </div>
        </div>
      \`;
    }

    function downloadCSVResults() {
      let csv = 'Peringkat,Nama,Kelompok,Kelas,Skor,Akurasi\\r\\n';
      students.sort((a,b)=>b.totalScore - a.totalScore).forEach((s, i) => {
        csv += \`"\${i+1}","\${s.namaLengkap}","\${s.namaKelompok}","\${s.kelas}",\${s.totalScore},"\${s.accuracy}%"\\r\\n\`;
      });
      const blob = new Blob([csv], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'Rekap_Nilai_Kuis.csv';
      a.click();
    }

    render();
  </script>
</body>
</html>`;
}

/**
 * Downloads generated single HTML file
 */
export function downloadSingleFileHTML(): void {
  const html = generateSingleFileHTML();
  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'kuis-interaktif-kelas-standalone.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
