import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  HelpCircle, 
  Users, 
  User, 
  Flame, 
  CheckCircle2, 
  XCircle, 
  Play, 
  Flag, 
  Sparkles,
  Layers,
  Waves,
  QrCode,
  Share2,
  Copy,
  Link2,
  ChevronRight,
  ShieldAlert,
  Image as ImageIcon,
  Maximize2,
  X
} from 'lucide-react';
import { 
  Question, 
  StudentResult, 
  TeamResult, 
  QuestionAnalysis, 
  OptionKey, 
  AnswerDetail, 
  ActiveQuizSession,
  MusicTrackId
} from '../types';
import { sound } from '../utils/audio';
import { QRCodeCanvas } from 'qrcode.react';

interface AdminDisplayProps {
  questions: Question[];
  students: StudentResult[];
  activeSession: ActiveQuizSession;
  onStartQuizSession: () => void;
  onFinishQuizSession: () => void;
  onResetSessionToLobby: () => void;
  onSimulateNewStudentJoin?: () => void;
  isBgmPlaying?: boolean;
  onToggleBgm?: () => void;
  currentTrackId?: MusicTrackId;
  onSelectTrack?: (trackId: MusicTrackId) => void;
  bgmVolume?: number;
  onChangeVolume?: (vol: number) => void;
}

export const AdminDisplay: React.FC<AdminDisplayProps> = ({
  questions,
  students,
  activeSession,
  onStartQuizSession,
  onFinishQuizSession,
  onResetSessionToLobby,
  onSimulateNewStudentJoin,
  isBgmPlaying = false,
  onToggleBgm,
  currentTrackId = 'quiz-party',
  onSelectTrack,
  bgmVolume = 0.55,
  onChangeVolume,
}) => {
  const [activeTab, setActiveTab] = useState<'LEADERBOARD' | 'QUESTIONS'>('LEADERBOARD');
  const [leaderboardView, setLeaderboardView] = useState<'TEAMS' | 'INDIVIDUAL' | 'SPLIT'>('SPLIT');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedJoinLink, setCopiedJoinLink] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const quizCode = activeSession?.quizCode || 'OCTO-801';
  const joinLink = `${window.location.origin}${window.location.pathname}?role=student&code=${encodeURIComponent(quizCode)}`;

  // Filter students for the current active quiz code (or show all if same)
  const currentStudents = useMemo(() => {
    return students.filter(s => !s.quizCode || s.quizCode === activeSession?.quizCode);
  }, [students, activeSession?.quizCode]);

  // Calculate Overall Class Accuracy
  const classStats = useMemo(() => {
    let totalAnswers = 0;
    let totalCorrect = 0;
    let totalIncorrect = 0;

    currentStudents.forEach(st => {
      Object.values(st.answers).forEach((ans: AnswerDetail) => {
        totalAnswers++;
        if (ans.isCorrect) {
          totalCorrect++;
        } else {
          totalIncorrect++;
        }
      });
    });

    const accuracyPercent = totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0;
    const incorrectPercent = totalAnswers > 0 ? 100 - accuracyPercent : 0;
    const completedCount = currentStudents.filter(s => s.isCompleted).length;

    return {
      totalAnswers,
      totalCorrect,
      totalIncorrect,
      accuracyPercent,
      incorrectPercent,
      totalStudents: currentStudents.length,
      completedCount,
    };
  }, [currentStudents]);

  // Aggregate Team Results
  const teamResults: TeamResult[] = useMemo(() => {
    const teamMap: Record<string, StudentResult[]> = {};

    currentStudents.forEach(st => {
      const team = st.namaKelompok || 'Tanpa Kelompok';
      if (!teamMap[team]) {
        teamMap[team] = [];
      }
      teamMap[team].push(st);
    });

    const list: TeamResult[] = Object.entries(teamMap).map(([namaKelompok, members]) => {
      let totalScore = 0;
      let totalCorrect = 0;
      let totalIncorrect = 0;
      let totalQuestionsAnswered = 0;

      members.forEach(m => {
        totalScore += m.totalScore;
        totalCorrect += m.correctCount;
        totalIncorrect += m.incorrectCount;
        totalQuestionsAnswered += (m.correctCount + m.incorrectCount);
      });

      const avgAccuracy = totalQuestionsAnswered > 0 
        ? Math.round((totalCorrect / totalQuestionsAnswered) * 100) 
        : 0;

      // Assign avatar by team name hash or first member's avatar
      const avatar = members[0]?.avatar || '🐙';

      return {
        namaKelompok,
        totalScore,
        avgAccuracy,
        totalCorrect,
        totalIncorrect,
        memberCount: members.length,
        members: [...members].sort((a, b) => b.totalScore - a.totalScore),
        rank: 0,
        avatar,
      };
    });

    // Sort by totalScore descending
    list.sort((a, b) => b.totalScore - a.totalScore);
    list.forEach((t, idx) => {
      t.rank = idx + 1;
    });

    return list;
  }, [currentStudents]);

  // Sorted individual students
  const sortedStudents = useMemo(() => {
    return [...currentStudents].sort((a, b) => b.totalScore - a.totalScore);
  }, [currentStudents]);

  // Questions Analysis Data
  const questionAnalyses: QuestionAnalysis[] = useMemo(() => {
    return questions.map((q, idx) => {
      let responses = 0;
      let correct = 0;
      let totalTime = 0;
      const optionCounts: Record<OptionKey, number> = { A: 0, B: 0, C: 0, D: 0 };

      currentStudents.forEach(st => {
        const ans = st.answers[q.id];
        if (ans) {
          responses++;
          if (ans.isCorrect) correct++;
          if (ans.selectedOption && ans.selectedOption !== 'TIMED_OUT') {
            optionCounts[ans.selectedOption as OptionKey] = (optionCounts[ans.selectedOption as OptionKey] || 0) + 1;
          }
          totalTime += ans.timeSpentSeconds;
        }
      });

      const accuracyPercentage = responses > 0 ? Math.round((correct / responses) * 100) : 0;
      const avgTimeSpent = responses > 0 ? Math.round((totalTime / responses) * 10) / 10 : 0;

      return {
        questionId: q.id,
        questionNumber: idx + 1,
        pertanyaan: q.pertanyaan,
        totalResponses: responses,
        correctResponses: correct,
        accuracyPercentage,
        optionCounts,
        avgTimeSpent,
      };
    });
  }, [questions, currentStudents]);

  const handleCopyCode = () => {
    sound.playClick();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(quizCode);
    }
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyJoinLink = () => {
    sound.playClick();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(joinLink);
    }
    setCopiedJoinLink(true);
    setTimeout(() => setCopiedJoinLink(false), 2500);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 relative z-10">
      
      {/* ============================================================ */}
      {/* 1. LOBBY VIEW (BEFORE ADMIN CLICKS "MULAI KUIS")             */}
      {/* ============================================================ */}
      {activeSession?.status === 'LOBBY' ? (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Big Projector Lobby Header */}
          <div className="bg-[#0e172a]/95 border-2 border-cyan-400/40 rounded-3xl p-4 sm:p-6 shadow-2xl shadow-cyan-950/70 relative overflow-hidden text-center">
            
            {/* Background Glow */}
            <div className="absolute -top-20 -left-20 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl" />

            {/* Quiz Banner info */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-[11px] font-black tracking-widest uppercase mb-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>RUANG TUNGGU KELAS (LOBBY)</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight font-display mb-2">
              {activeSession?.title || 'Kuis Interaktif'}
            </h1>
            <p className="text-xs sm:text-sm text-cyan-200/70 max-w-xl mx-auto mb-3">
              Buka OCTOQUIZ pada perangkat Anda, pilih karakter laut, dan masukkan Kode Kuis di bawah untuk bergabung!
            </p>

            {/* Join options: manual code, QR scan, and a copyable quick link */}
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] items-start gap-3 my-3">
              <div className="flex h-full flex-col gap-3 justify-start">
                <div 
                  onClick={handleCopyCode}
                  className="cursor-pointer group flex-none flex items-center justify-center gap-4 px-5 py-3 rounded-2xl bg-[#060b14] border-2 border-cyan-400 shadow-xl shadow-cyan-500/20 hover:scale-[1.02] transition-all text-center"
                  title="Klik untuk menyalin kode kuis"
                >
                  <div>
                    <span className="text-xs uppercase font-bold text-cyan-400 tracking-wider block text-center">KODE KUIS</span>
                    <span className="text-2xl sm:text-4xl font-black text-white font-mono tracking-widest text-center block">
                      {activeSession?.quizCode || 'OCTO-801'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-300 group-hover:bg-cyan-500 group-hover:text-black transition-colors">
                    <Share2 className="w-6 h-6" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-[minmax(130px,0.7fr)_minmax(0,1.5fr)] gap-3">
                  <div className="rounded-2xl bg-[#111c33] border border-cyan-500/20 p-2.5 text-left">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Kelas Target</div>
                    <div className="text-sm font-black text-cyan-300">{activeSession?.targetClass || 'TI-3A'}</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-2">Jumlah Soal</div>
                    <div className="text-sm font-black text-white">{questions.length} Pilihan Ganda</div>
                  </div>

                  <div className="rounded-2xl bg-[#111c33] border border-cyan-500/20 p-2.5 text-left min-w-0">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Link2 className="w-4 h-4 text-cyan-300 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-[10px] uppercase tracking-wider font-bold text-cyan-300">Link Join Cepat</div>
                          <div className="text-xs text-slate-300 truncate" title={joinLink}>{joinLink}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyJoinLink}
                        className="w-full inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-200 text-xs font-bold transition-colors"
                      >
                        {copiedJoinLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedJoinLink ? 'Link Tersalin' : 'Salin Link'}</span>
                      </button>
                    </div>
                    {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
                      <p className="mt-1 text-[10px] text-amber-300/80">
                        Gunakan alamat Network/LAN untuk scan dari HP.
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons: MULAI KUIS */}
                <div className="mt-1 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      sound.playGong();
                      onStartQuizSession();
                    }}
                    className="px-8 py-3.5 rounded-2xl font-black text-base tracking-wider bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 text-slate-950 shadow-2xl shadow-emerald-400/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 cursor-pointer"
                  >
                    <Play className="w-6 h-6 fill-current" />
                    <span>MULAI KUIS</span>
                  </button>

                  {onSimulateNewStudentJoin && (
                    <button
                      onClick={onSimulateNewStudentJoin}
                      className="px-4 py-3 rounded-2xl text-xs font-bold bg-[#131d36] hover:bg-[#1a294c] border border-cyan-500/30 text-cyan-200 transition-all flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span>+ Tambah Peserta Masuk</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="w-full max-w-[340px] justify-self-center flex flex-col items-center justify-center gap-2 text-slate-950">
                <div className="w-[min(82vw,320px)] aspect-square p-3 rounded-2xl bg-white border-2 border-white shadow-xl shadow-cyan-500/20">
                  <QRCodeCanvas
                    value={joinLink}
                    size={292}
                    level="M"
                    includeMargin
                    bgColor="#ffffff"
                    fgColor="#07111f"
                    className="w-full h-full"
                  />
                </div>
                <div className="text-center min-w-0">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider text-cyan-200">
                    <QrCode className="w-4 h-4" />
                    <span>Scan Untuk Bergabung</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Kode <span className="font-bold text-cyan-300">{quizCode}</span> terisi otomatis.
                  </p>
                </div>
              </div>
            </div>

            {copiedCode && (
              <p className="text-xs text-cyan-300 font-bold animate-bounce">
                Kode kuis berhasil disalin ke clipboard!
              </p>
            )}

          </div>

          {/* Real-time Participant Grid in Lobby */}
          <div className="bg-[#0e172a]/95 border border-cyan-500/20 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-cyan-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-xl">
                  🐙
                </div>
                <div>
                  <h3 className="text-xl font-black text-white font-display flex items-center gap-2">
                    <span>Peserta Yang Sudah Terdaftar</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                      {currentStudents.length} Mahasiswa
                    </span>
                  </h3>
                  <p className="text-xs text-cyan-200/60">
                    Daftar langsung terupdate otomatis saat mahasiswa menekan tombol daftar di HP/laptop mereka.
                  </p>
                </div>
              </div>

              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Menunggu peserta lainnya...</span>
              </div>
            </div>

            {currentStudents.length === 0 ? (
              <div className="py-16 text-center text-slate-500">
                <Waves className="w-12 h-12 mx-auto mb-3 text-cyan-400/30 animate-pulse" />
                <h4 className="text-base font-bold text-slate-300 mb-1">Belum Ada Peserta yang Masuk</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Bagikan kode <span className="text-cyan-400 font-mono font-bold">{activeSession?.quizCode || 'OCTO-801'}</span> kepada mahasiswa untuk mendaftar.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {currentStudents.map((student) => (
                  <div 
                    key={student.id}
                    className="p-4 rounded-2xl bg-[#090f1d] border border-cyan-500/20 hover:border-cyan-400/50 flex flex-col items-center text-center group hover:scale-105 transition-all shadow-md"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-950 to-[#132242] border border-cyan-400/40 flex items-center justify-center text-3xl mb-2.5 shadow-inner group-hover:rotate-6 transition-transform">
                      {student.avatar || '🐙'}
                    </div>
                    <div className="w-full">
                      <h5 className="text-xs font-bold text-white truncate w-full" title={student.namaLengkap}>
                        {student.namaLengkap}
                      </h5>
                      <span className="text-[10px] text-cyan-300 font-medium block truncate mt-0.5">
                        {student.namaKelompok}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30 inline-block mt-1 font-mono">
                        {student.kelas}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      ) : (
        /* ============================================================ */
        /* 2. LIVE IN-PROGRESS VIEW (LIVE RESPONSIVE ACCURACY & FINISH)  */
        /* ============================================================ */
        <div className="space-y-6">
          
          {/* Top Live Banner & Finish Quiz Control */}
          <div className="bg-[#0e172a]/95 border border-cyan-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
            
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              
              {/* Class Accuracy Widget */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-black tracking-wide uppercase">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Kuis Sedang Berlangsung (Live)
                  </span>
                  <span className="text-xs text-cyan-200/70 font-medium">
                    {classStats.completedCount} dari {classStats.totalStudents} siswa selesai
                  </span>
                </div>

                <div className="flex items-baseline gap-3 mb-2">
                  <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight font-display">
                    Akurasi Kelas
                  </h2>
                  <span className="text-2xl sm:text-4xl font-black text-emerald-400 font-display">
                    {classStats.accuracyPercent}%
                  </span>
                </div>

                {/* Dual Split Progress Bar (Green vs Red) */}
                <div className="w-full">
                  <div className="w-full h-5 sm:h-6 bg-[#060a14] rounded-full overflow-hidden p-1 border border-cyan-500/30 flex">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-l-full transition-all duration-700 flex items-center justify-end pr-2 text-[10px] font-black text-slate-950"
                      style={{ width: `${classStats.accuracyPercent}%` }}
                    >
                      {classStats.accuracyPercent > 12 && `${classStats.accuracyPercent}%`}
                    </div>
                    <div 
                      className="h-full bg-gradient-to-r from-rose-500 to-red-600 rounded-r-full transition-all duration-700 flex items-center justify-start pl-2 text-[10px] font-black text-white"
                      style={{ width: `${classStats.incorrectPercent}%` }}
                    >
                      {classStats.incorrectPercent > 12 && `${classStats.incorrectPercent}%`}
                    </div>
                  </div>

                  {/* Accuracy Bar Breakdown Labels */}
                  <div className="flex items-center justify-between text-xs text-slate-300 mt-2 font-medium">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Benar: <strong>{classStats.totalCorrect}</strong> ({classStats.accuracyPercent}%)
                    </span>
                    <span className="flex items-center gap-1.5 text-rose-400">
                      <XCircle className="w-3.5 h-3.5" />
                      Salah: <strong>{classStats.totalIncorrect}</strong> ({classStats.incorrectPercent}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* FINISH & Tab Switcher Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                
                {/* FINISH BUTTON (Proceed to Results Podium) */}
                <button
                  onClick={() => {
                    sound.playFanfare();
                    onFinishQuizSession();
                  }}
                  className="px-6 py-3.5 rounded-2xl font-black text-sm tracking-wide bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-xl shadow-rose-500/25 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  title="Klik untuk menyelesaikan kuis dan melihat podium rekap hasil"
                >
                  <Flag className="w-5 h-5 fill-current" />
                  <span>FINISH & LIHAT HASIL</span>
                </button>

                {/* Sub Tab Switcher */}
                <div className="flex items-center gap-1.5 bg-[#080d19] p-1.5 rounded-2xl border border-cyan-500/20">
                  <button
                    onClick={() => setActiveTab('LEADERBOARD')}
                    className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                      activeTab === 'LEADERBOARD'
                        ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Trophy className="w-4 h-4" />
                    <span>Leaderboard</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('QUESTIONS')}
                    className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                      activeTab === 'QUESTIONS'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>Per Soal</span>
                  </button>
                </div>

              </div>

            </div>

          </div>

          {/* Main Tab Content */}
          {activeTab === 'LEADERBOARD' ? (
            <div className="space-y-4">
              
              {/* Sub-toggle for View Type */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-1 bg-[#0e172a] p-1.5 rounded-xl border border-cyan-500/20 text-xs">
                  <button
                    onClick={() => setLeaderboardView('SPLIT')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      leaderboardView === 'SPLIT' ? 'bg-cyan-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Berdampingan
                  </button>
                  <button
                    onClick={() => setLeaderboardView('TEAMS')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      leaderboardView === 'TEAMS' ? 'bg-emerald-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Papan Tim ({teamResults.length})
                  </button>
                  <button
                    onClick={() => setLeaderboardView('INDIVIDUAL')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      leaderboardView === 'INDIVIDUAL' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Papan Siswa ({currentStudents.length})
                  </button>
                </div>

                <button
                  onClick={onResetSessionToLobby}
                  className="text-xs text-slate-400 hover:text-cyan-300 underline"
                >
                  Kembali ke Ruang Tunggu (Lobby)
                </button>
              </div>

              {/* Grid Layout depending on view */}
              <div className={`grid gap-6 ${
                leaderboardView === 'SPLIT' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
              }`}>
                
                {/* Team / Kelompok Leaderboard */}
                {(leaderboardView === 'TEAMS' || leaderboardView === 'SPLIT') && (
                  <div className="bg-[#0e172a]/95 border border-cyan-500/20 rounded-3xl p-5 shadow-xl">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-cyan-500/20">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-emerald-400" />
                        <h3 className="font-extrabold text-base sm:text-lg text-white font-display">
                          Peringkat Tim / Kelompok
                        </h3>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        {teamResults.length} Tim Aktif
                      </span>
                    </div>

                    {teamResults.length === 0 ? (
                      <div className="py-12 text-center text-slate-500">
                        <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">Belum ada tim yang terbentuk.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {teamResults.map((team) => {
                          const correctRatio = team.totalCorrect + team.totalIncorrect > 0
                            ? Math.round((team.totalCorrect / (team.totalCorrect + team.totalIncorrect)) * 100)
                            : 0;
                          const incorrectRatio = 100 - correctRatio;

                          const isRank1 = team.rank === 1;
                          const isRank2 = team.rank === 2;
                          const isRank3 = team.rank === 3;

                          return (
                            <div
                              key={team.namaKelompok}
                              className={`p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                                isRank1 
                                  ? 'bg-gradient-to-r from-amber-500/15 via-[#0e172a] to-[#0e172a] border-amber-400/50 shadow-lg shadow-amber-500/10' 
                                  : isRank2
                                  ? 'bg-[#0b1220] border-slate-400/30'
                                  : isRank3
                                  ? 'bg-[#0b1220] border-amber-700/30'
                                  : 'bg-[#080d19] border-white/5'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3 mb-2.5">
                                
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shadow-md ${
                                    isRank1 
                                      ? 'bg-gradient-to-br from-yellow-300 to-amber-500 text-slate-950' 
                                      : isRank2
                                      ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-950'
                                      : isRank3
                                      ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white'
                                      : 'bg-[#060a14] text-slate-400 border border-white/10'
                                  }`}>
                                    #{team.rank}
                                  </div>

                                  <div className="w-10 h-10 rounded-xl bg-[#060a14] border border-cyan-500/20 flex items-center justify-center text-2xl shrink-0">
                                    {team.avatar}
                                  </div>

                                  <div>
                                    <h4 className="text-sm sm:text-base font-extrabold text-white leading-tight">
                                      {team.namaKelompok}
                                    </h4>
                                    <span className="text-[11px] text-slate-400">
                                      {team.memberCount} pemain
                                    </span>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <span className="text-base sm:text-lg font-black text-amber-400 font-display block">
                                    {team.totalScore.toLocaleString('id-ID')}
                                  </span>
                                  <span className="text-[10px] uppercase font-bold text-slate-400">
                                    {team.avgAccuracy}% Akurasi
                                  </span>
                                </div>

                              </div>

                              {/* Progress bar */}
                              <div className="w-full">
                                <div className="w-full h-2.5 bg-[#060a14] rounded-full overflow-hidden flex border border-white/5">
                                  <div 
                                    className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-500"
                                    style={{ width: `${correctRatio}%` }}
                                  />
                                  <div 
                                    className="h-full bg-rose-500 transition-all duration-500"
                                    style={{ width: `${incorrectRatio}%` }}
                                  />
                                </div>
                              </div>

                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Personal / Individual Leaderboard */}
                {(leaderboardView === 'INDIVIDUAL' || leaderboardView === 'SPLIT') && (
                  <div className="bg-[#0e172a]/95 border border-cyan-500/20 rounded-3xl p-5 shadow-xl">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-cyan-500/20">
                      <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-cyan-400" />
                        <h3 className="font-extrabold text-base sm:text-lg text-white font-display">
                          Peringkat Personal / Individu
                        </h3>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                        {currentStudents.length} Mahasiswa
                      </span>
                    </div>

                    {currentStudents.length === 0 ? (
                      <div className="py-12 text-center text-slate-500">
                        <User className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">Belum ada mahasiswa yang masuk.</p>
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
                        {sortedStudents.map((st, idx) => {
                          const rank = idx + 1;

                          return (
                            <div
                              key={st.id}
                              className={`p-3 sm:p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                                rank === 1
                                  ? 'bg-amber-500/10 border-amber-400/40'
                                  : rank === 2
                                  ? 'bg-slate-400/10 border-slate-400/30'
                                  : rank === 3
                                  ? 'bg-amber-800/10 border-amber-700/30'
                                  : 'bg-[#080d19] border-white/5 hover:border-cyan-500/20'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                                  rank === 1 ? 'bg-amber-400 text-black font-black' :
                                  rank === 2 ? 'bg-slate-300 text-black font-black' :
                                  rank === 3 ? 'bg-amber-700 text-white font-black' :
                                  'text-slate-400 bg-[#060a14]'
                                }`}>
                                  #{rank}
                                </span>

                                <div className="w-9 h-9 rounded-xl bg-[#060a14] border border-cyan-500/20 flex items-center justify-center text-xl">
                                  {st.avatar || '🐙'}
                                </div>

                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs sm:text-sm font-bold text-white leading-none">
                                      {st.namaLengkap}
                                    </span>
                                    {st.currentStreak >= 3 && (
                                      <span className="flex items-center text-[10px] font-black text-rose-400" title={`${st.currentStreak}x Streak`}>
                                        <Flame className="w-3 h-3 fill-current" />
                                        {st.currentStreak}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-slate-400">
                                    {st.namaKelompok} • {st.kelas}
                                  </span>
                                </div>
                              </div>

                              <div className="text-right">
                                <span className="text-sm sm:text-base font-black text-amber-400 font-display block">
                                  {st.totalScore.toLocaleString('id-ID')}
                                </span>
                                <span className="text-[10px] text-emerald-400 font-bold">
                                  {st.accuracy}% Benar
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

              </div>

            </div>
          ) : (
            /* Questions Tab: Analytics */
            <div className="bg-[#0e172a]/95 border border-cyan-500/20 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-cyan-500/20">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white font-display">
                    Analisis Detail Per Butir Soal
                  </h3>
                  <p className="text-xs text-slate-400">
                    Pemantauan langsung respons mahasiswa untuk setiap butir soal kuis.
                  </p>
                </div>
                <div className="px-3 py-1 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold">
                  Total {questions.length} Soal
                </div>
              </div>

              <div className="space-y-4">
                {questionAnalyses.map((qa) => {
                  const questionObj = questions.find(q => q.id === qa.questionId);
                  const isEasy = qa.accuracyPercentage >= 75;
                  const isMedium = qa.accuracyPercentage >= 45 && qa.accuracyPercentage < 75;

                  return (
                    <div 
                      key={qa.questionId}
                      className="p-4 sm:p-5 rounded-2xl bg-[#080d19] border border-cyan-500/20"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-xl bg-[#111c33] text-cyan-300 font-extrabold text-xs flex items-center justify-center border border-cyan-500/30">
                            Q{qa.questionNumber}
                          </span>
                          <h4 className="text-sm sm:text-base font-bold text-white">
                            {qa.pertanyaan}
                          </h4>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                            isEasy 
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                              : isMedium 
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}>
                            {qa.accuracyPercentage}% Benar
                          </span>
                          <span className="text-[11px] text-slate-400">
                            ({qa.correctResponses}/{qa.totalResponses} respon)
                          </span>
                        </div>
                      </div>

                      {questionObj?.imageUrl && (
                        <div 
                          onClick={() => setImagePreviewUrl(questionObj.imageUrl || null)}
                          className="mt-1 mb-2 inline-flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 hover:border-cyan-400 cursor-pointer group transition-all"
                          title="Klik untuk memperbesar gambar"
                        >
                          <img 
                            src={questionObj.imageUrl} 
                            alt="Thumbnail Soal" 
                            className="w-10 h-10 rounded-lg object-contain bg-black/60 border border-cyan-500/20"
                            referrerPolicy="no-referrer"
                          />
                          <div className="text-left">
                            <span className="text-[10px] font-bold uppercase tracking-wider block text-cyan-400 flex items-center gap-1">
                              <ImageIcon className="w-3 h-3" /> Lampiran Soal
                            </span>
                            <span className="text-[11px] text-slate-300 group-hover:text-white flex items-center gap-1">
                              <Maximize2 className="w-3 h-3 text-cyan-400" /> Lihat Detail Gambar
                            </span>
                          </div>
                        </div>
                      )}

                      {questionObj && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-3 pt-3 border-t border-white/5">
                          {(['A', 'B', 'C', 'D'] as OptionKey[]).map((key) => {
                            const isCorrectKey = key === questionObj.jawabanBenar;
                            const count = qa.optionCounts[key] || 0;
                            const optionText = 
                              key === 'A' ? questionObj.opsiA :
                              key === 'B' ? questionObj.opsiB :
                              key === 'C' ? questionObj.opsiC : questionObj.opsiD;

                            return (
                              <div 
                                key={key}
                                className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                                  isCorrectKey 
                                    ? 'bg-emerald-500/15 border-emerald-500/40 text-white font-medium' 
                                    : 'bg-[#060a14] border-white/5 text-slate-300'
                                }`}
                              >
                                <div className="flex items-center gap-1.5 truncate">
                                  <span className={`w-5 h-5 rounded-md font-bold text-[10px] flex items-center justify-center shrink-0 ${
                                    isCorrectKey ? 'bg-emerald-400 text-slate-950' : 'bg-white/10 text-slate-400'
                                  }`}>
                                    {key}
                                  </span>
                                  <span className="truncate text-[11px]" title={optionText}>
                                    {optionText}
                                  </span>
                                </div>
                                <span className={`font-black text-xs shrink-0 ${isCorrectKey ? 'text-emerald-400' : 'text-slate-400'}`}>
                                  {count}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Full-Screen Question Image Lightbox Modal for Admin Display */}
      {imagePreviewUrl && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setImagePreviewUrl(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] bg-[#0c1426] border border-cyan-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                <ImageIcon className="w-4 h-4" />
                <span>Gambar Soal Layar Penuh</span>
              </div>
              <button
                onClick={() => setImagePreviewUrl(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[72vh] max-w-full overflow-auto flex items-center justify-center p-2">
              <img 
                src={imagePreviewUrl} 
                alt="Gambar Soal Ukuran Penuh" 
                className="max-h-[68vh] max-w-full object-contain rounded-xl shadow-lg border border-white/10"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="pt-3 text-xs text-slate-400">
              Klik di luar gambar atau tombol silang untuk menutup
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
