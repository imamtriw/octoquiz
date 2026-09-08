import React, { useEffect } from 'react';
import { 
  Trophy, 
  Target, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Sparkles, 
  Flame,
  Award,
  Waves
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StudentResult, Question } from '../types';
import { sound } from '../utils/audio';

interface StudentSummaryProps {
  studentResult: StudentResult;
  questions: Question[];
  totalParticipants: number;
  rank: number;
  topTeams: Array<{
    teamName: string;
    totalScore: number;
    memberCount: number;
  }>;
  onRetakeOrNewStudent: () => void;
}

export const StudentSummary: React.FC<StudentSummaryProps> = ({
  studentResult,
  questions,
  totalParticipants,
  rank,
  topTeams,
  onRetakeOrNewStudent,
}) => {
  useEffect(() => {
    sound.playFanfare();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 py-8 relative z-10">
      <div className="w-full max-w-2xl bg-[#0e172a]/95 border-2 border-cyan-400/40 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-cyan-950/70 relative overflow-hidden backdrop-blur">
        
        {/* Subtle Glows */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header & Avatar */}
        <div className="text-center relative z-10 mb-8">
          <div className="relative inline-block mb-3">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-cyan-950 via-[#132242] to-cyan-800 border-2 border-cyan-400/50 flex items-center justify-center text-5xl shadow-2xl shadow-cyan-500/30">
              {studentResult.avatar || '🐙'}
            </div>
            <div className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-xs shadow-lg border border-white/40">
              #{rank}
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[11px] font-bold tracking-widest uppercase mb-2">
            <Waves className="w-3 h-3" />
            <span>Rekap Hasil Individu Mahasiswa</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white font-display">
            Kuis Berhasil Diselesaikan!
          </h1>
          <p className="text-sm text-cyan-200/80 mt-1">
            Selamat <strong className="text-white">{studentResult.namaLengkap}</strong> dari <span className="text-cyan-300 font-semibold">{studentResult.namaKelompok}</span> ({studentResult.kelas})!
          </p>
          {studentResult.quizCode && (
            <span className="inline-block mt-2 text-[10px] font-mono px-2.5 py-0.5 rounded bg-[#060a14] border border-cyan-500/30 text-cyan-300">
              Kode Sesi: {studentResult.quizCode}
            </span>
          )}
        </div>

        {/* Highlight Metrics Cards */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 relative z-10">
          <div className="bg-[#080d19] border border-cyan-500/20 rounded-2xl p-4 text-center">
            <Trophy className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Skor</span>
            <span className="text-xl sm:text-2xl font-black text-amber-400 font-display">
              {studentResult.totalScore.toLocaleString('id-ID')}
            </span>
          </div>

          <div className="bg-[#080d19] border border-cyan-500/20 rounded-2xl p-4 text-center">
            <Target className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Akurasi</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400 font-display">
              {studentResult.accuracy}%
            </span>
          </div>

          <div className="bg-[#080d19] border border-cyan-500/20 rounded-2xl p-4 text-center">
            <Award className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Peringkat</span>
            <span className="text-xl sm:text-2xl font-black text-cyan-300 font-display">
              #{rank} <span className="text-xs font-normal text-slate-400">/ {totalParticipants}</span>
            </span>
          </div>
        </div>

        {/* Top 3 Team Leaderboard */}
        <div className="bg-[#080d19] border border-amber-500/20 rounded-2xl p-4 sm:p-5 mb-6 relative z-10">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-200 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              Top 3 Kelompok
            </h3>
            <span className="text-[10px] text-slate-500">Total skor anggota</span>
          </div>

          <div className="space-y-2">
            {topTeams.map((team, index) => (
              <div
                key={team.teamName}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${
                  index === 0
                    ? 'bg-amber-400/10 border-amber-400/30'
                    : 'bg-slate-900/60 border-white/5'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
                  index === 0 ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'
                }`}>
                  #{index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-white truncate">{team.teamName}</div>
                  <div className="text-[10px] text-slate-500">{team.memberCount} anggota</div>
                </div>
                <div className="text-sm font-black text-amber-300 font-mono">
                  {team.totalScore.toLocaleString('id-ID')} pts
                </div>
              </div>
            ))}
            {topTeams.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-3">Belum ada data kelompok.</p>
            )}
          </div>
        </div>

        {/* Detailed Breakdown per Question */}
        <div className="bg-[#080d19] border border-cyan-500/20 rounded-2xl p-4 sm:p-5 mb-6 relative z-10">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-200">
              Rincian Jawaban Soal Anda
            </h3>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> {studentResult.correctCount} Benar
              </span>
              <span className="flex items-center gap-1 text-rose-400 font-bold">
                <XCircle className="w-3.5 h-3.5" /> {studentResult.incorrectCount} Salah
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {questions.map((q, idx) => {
              const ans = studentResult.answers[q.id];
              const isCorrect = ans?.isCorrect;
              return (
                <div 
                  key={q.id}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    isCorrect 
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' 
                      : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Q{idx + 1}</span>
                  <div className="flex items-center justify-center gap-1 my-1">
                    {isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    )}
                  </div>
                  <span className="text-xs font-black">
                    {ans?.selectedOption || '-'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Single Student Action Button: Logout / Retake / Selesai */}
        <div className="flex items-center justify-center relative z-10">
          <button
            onClick={() => {
              sound.playClick();
              onRetakeOrNewStudent();
            }}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-cyan-400 to-teal-300 text-slate-950 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-400/20 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Selesai & Keluar / Ganti Peserta</span>
          </button>
        </div>

      </div>
    </div>
  );
};
