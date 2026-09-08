import React, { useState, useMemo, useEffect } from 'react';
import { 
  Trophy, 
  Download, 
  Search, 
  Crown, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sparkles, 
  Filter, 
  Layers, 
  AlertCircle,
  Users,
  Waves,
  Medal
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Question, StudentResult, QuestionStatus, AnswerDetail, ActiveQuizSession } from '../types';
import { exportResultsToCSV } from '../utils/csvHelper';
import { sound } from '../utils/audio';

interface AdminResultsProps {
  questions: Question[];
  students: StudentResult[];
  activeSession?: ActiveQuizSession;
}

export const AdminResults: React.FC<AdminResultsProps> = ({
  questions,
  students,
  activeSession,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTeam, setFilterTeam] = useState<string>('ALL');

  // Trigger podium celebration on opening
  useEffect(() => {
    if (students.length > 0) {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.5 }
      });
    }
  }, [students.length]);

  // Sort students descending by score
  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => b.totalScore - a.totalScore);
  }, [students]);

  // Overall Class Accuracy
  const classAccuracy = useMemo(() => {
    let total = 0;
    let correct = 0;
    students.forEach(st => {
      Object.values(st.answers).forEach((a: AnswerDetail) => {
        total++;
        if (a.isCorrect) correct++;
      });
    });
    return total > 0 ? Math.round((correct / total) * 100) : 0;
  }, [students]);

  // Top 3 Podium
  const rank1 = sortedStudents[0];
  const rank2 = sortedStudents[1];
  const rank3 = sortedStudents[2];

  // Distinct Teams for Filter
  const distinctTeams = useMemo(() => {
    const set = new Set<string>();
    students.forEach(st => {
      if (st.namaKelompok) set.add(st.namaKelompok);
    });
    return Array.from(set);
  }, [students]);

  // Filtered Students for Overview Table
  const filteredStudents = useMemo(() => {
    return sortedStudents.filter(st => {
      const matchSearch = st.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
        st.namaKelompok.toLowerCase().includes(searchTerm.toLowerCase()) ||
        st.kelas.toLowerCase().includes(searchTerm.toLowerCase());

      const matchTeam = filterTeam === 'ALL' || st.namaKelompok === filterTeam;

      return matchSearch && matchTeam;
    });
  }, [sortedStudents, searchTerm, filterTeam]);

  const handleExportCSV = () => {
    sound.playClick();
    exportResultsToCSV(students, questions, classAccuracy);
  };

  const triggerConfetti = () => {
    sound.playFanfare();
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="min-h-[calc(100vh-80px)] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 relative z-10">
      
      {/* Top Controls & Export Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0e172a]/95 border border-cyan-500/20 p-6 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase">
              Result & Rekap Akhir
            </span>
            <span className="text-xs text-cyan-200/70">
              {students.length} Mahasiswa • {questions.length} Soal • {activeSession ? `Sesi ${activeSession.quizCode}` : ''}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white font-display">
            Podium & Rekapitulasi Nilai OCTOQUIZ
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Lihat perolehan poin akhir para juara kelas dan unduh rekap nilai lengkap format CSV/Excel.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={triggerConfetti}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#111c33] text-slate-200 hover:text-white border border-cyan-500/20 transition-colors flex items-center gap-1.5"
            title="Rayakan dengan confetti"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Rayakan 🎉</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold bg-gradient-to-r from-emerald-400 to-teal-300 text-slate-950 hover:scale-105 transition-all flex items-center gap-2 shadow-lg shadow-emerald-400/25 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Rekap Nilai (.CSV)</span>
          </button>
        </div>
      </div>

      {/* Podium 1, 2, 3 (Aquatic Themed Quiz Podium) */}
      <div className="bg-[#0e172a]/95 border border-cyan-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Glow ambient */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8 relative z-10">
          <h3 className="text-xl sm:text-2xl font-black text-white font-display flex items-center justify-center gap-2">
            <Trophy className="w-7 h-7 text-amber-400" />
            <span>Podium Jawara Samudera Kelas</span>
          </h3>
          <p className="text-xs text-cyan-200/70 mt-1">
            Peringkat tertinggi berdasarkan akumulasi poin ketepatan dan kecepatan menjawab kuis.
          </p>
        </div>

        {students.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <Waves className="w-12 h-12 mx-auto mb-2 opacity-30 text-cyan-400" />
            <p className="text-sm">Belum ada data kuis untuk menampilkan podium.</p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-end justify-center gap-4 sm:gap-6 pt-4 pb-2 relative z-10 max-w-3xl mx-auto">
            
            {/* Rank 2 (Silver - Left) */}
            <div className="w-full md:w-1/3 flex flex-col items-center order-2 md:order-1">
              {rank2 ? (
                <div className="w-full flex flex-col items-center">
                  <div className="relative mb-2">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-400 flex items-center justify-center text-3xl shadow-lg border-2 border-white/40">
                      {rank2.avatar || '🐬'}
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-slate-300 text-black font-black text-xs flex items-center justify-center shadow-md">
                      2
                    </div>
                  </div>

                  <span className="text-sm font-bold text-white text-center truncate max-w-full block">
                    {rank2.namaLengkap}
                  </span>
                  <span className="text-[11px] text-cyan-300 font-medium truncate max-w-full">
                    {rank2.namaKelompok}
                  </span>
                  <span className="text-sm font-black text-slate-300 font-display mt-0.5">
                    {rank2.totalScore.toLocaleString('id-ID')} pts
                  </span>

                  {/* Podium Stand */}
                  <div className="w-full h-28 sm:h-32 rounded-t-2xl bg-gradient-to-t from-[#060a14] via-[#0b1323] to-[#1a2b4a] border-t-2 border-slate-300/40 mt-3 flex flex-col items-center justify-center p-3">
                    <span className="text-2xl font-black text-slate-300 font-display">2nd</span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">{rank2.accuracy}% Akurasi</span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-28 rounded-t-2xl bg-[#080d19]/50 border-t border-white/5" />
              )}
            </div>

            {/* Rank 1 (Gold - Center, Highest) */}
            <div className="w-full md:w-1/3 flex flex-col items-center order-1 md:order-2">
              {rank1 && (
                <div className="w-full flex flex-col items-center">
                  <div className="relative mb-2">
                    <Crown className="w-9 h-9 text-amber-400 animate-bounce mx-auto mb-1" />
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-300 via-amber-400 to-amber-600 flex items-center justify-center text-4xl shadow-2xl shadow-yellow-500/40 border-2 border-white">
                      {rank1.avatar || '🐙'}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-amber-400 text-black font-black text-sm flex items-center justify-center shadow-lg border border-white">
                      1
                    </div>
                  </div>

                  <span className="text-base font-extrabold text-white text-center truncate max-w-full block">
                    {rank1.namaLengkap}
                  </span>
                  <span className="text-xs text-cyan-300 font-semibold truncate max-w-full">
                    {rank1.namaKelompok} • {rank1.kelas}
                  </span>
                  <span className="text-lg font-black text-amber-400 font-display mt-0.5">
                    {rank1.totalScore.toLocaleString('id-ID')} pts
                  </span>

                  {/* Podium Stand */}
                  <div className="w-full h-36 sm:h-44 rounded-t-2xl bg-gradient-to-t from-[#060a14] via-[#241a08] to-[#45310d] border-t-4 border-amber-400 mt-3 flex flex-col items-center justify-center p-3 shadow-lg shadow-amber-500/20">
                    <Trophy className="w-6 h-6 text-amber-400 mb-1" />
                    <span className="text-3xl font-black text-amber-400 font-display">1st</span>
                    <span className="text-xs text-amber-200 uppercase font-black">{rank1.accuracy}% Akurasi</span>
                  </div>
                </div>
              )}
            </div>

            {/* Rank 3 (Bronze - Right) */}
            <div className="w-full md:w-1/3 flex flex-col items-center order-3">
              {rank3 ? (
                <div className="w-full flex flex-col items-center">
                  <div className="relative mb-2">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-3xl shadow-lg border-2 border-white/30">
                      {rank3.avatar || '🦈'}
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center shadow-md">
                      3
                    </div>
                  </div>

                  <span className="text-sm font-bold text-white text-center truncate max-w-full block">
                    {rank3.namaLengkap}
                  </span>
                  <span className="text-[11px] text-cyan-300 truncate max-w-full">
                    {rank3.namaKelompok}
                  </span>
                  <span className="text-sm font-black text-amber-500 font-display mt-0.5">
                    {rank3.totalScore.toLocaleString('id-ID')} pts
                  </span>

                  {/* Podium Stand */}
                  <div className="w-full h-24 sm:h-28 rounded-t-2xl bg-gradient-to-t from-[#060a14] via-[#1f150e] to-[#3a2517] border-t-2 border-amber-600/40 mt-3 flex flex-col items-center justify-center p-3">
                    <span className="text-2xl font-black text-amber-500 font-display">3rd</span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">{rank3.accuracy}% Akurasi</span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-24 rounded-t-2xl bg-[#080d19]/50 border-t border-white/5" />
              )}
            </div>

          </div>
        )}

      </div>

      {/* Overall Class Accuracy Bar (0% - 100%) */}
      <div className="bg-[#0e172a]/95 border border-cyan-500/20 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h4 className="text-base font-extrabold text-white font-display">
              Akurasi Keseluruhan Kelas
            </h4>
            <p className="text-xs text-slate-400">
              Persentase keberhasilan kumulatif seluruh peserta terhadap butir soal yang telah dikerjakan.
            </p>
          </div>
          <span className="text-xl sm:text-2xl font-black text-emerald-400 font-display">
            {classAccuracy}%
          </span>
        </div>

        <div className="w-full h-6 bg-[#080d19] rounded-full overflow-hidden p-1 border border-cyan-500/20 flex">
          <div 
            className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-l-full transition-all duration-700 flex items-center justify-center text-[10px] font-black text-slate-950"
            style={{ width: `${classAccuracy}%` }}
          >
            {classAccuracy > 8 && `${classAccuracy}%`}
          </div>
          <div 
            className="h-full bg-rose-500 rounded-r-full transition-all duration-700 flex items-center justify-center text-[10px] font-black text-white"
            style={{ width: `${100 - classAccuracy}%` }}
          >
            {100 - classAccuracy > 8 && `${100 - classAccuracy}%`}
          </div>
        </div>
      </div>

      {/* Detailed Overview Table (Tabel Rekap Detail) */}
      <div className="bg-[#0e172a]/95 border border-cyan-500/20 rounded-3xl p-6 shadow-xl space-y-4">
        
        {/* Table Header & Search/Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-cyan-500/20">
          <div>
            <h3 className="text-lg font-bold text-white font-display">
              Tabel Rekap Detail Mahasiswa
            </h3>
            <p className="text-xs text-slate-400">
              Rincian status performa setiap mahasiswa per butir soal kuis.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama atau kelompok..."
                className="pl-9 pr-3 py-2 bg-[#080d19] border border-cyan-500/30 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 w-full sm:w-56"
              />
            </div>

            {/* Filter by Team */}
            {distinctTeams.length > 0 && (
              <select
                value={filterTeam}
                onChange={(e) => setFilterTeam(e.target.value)}
                className="px-3 py-2 bg-[#080d19] border border-cyan-500/30 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="ALL">Semua Kelompok ({students.length})</option>
                {distinctTeams.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Legend for Status Badges */}
        <div className="flex items-center gap-4 flex-wrap text-xs bg-[#080d19] p-3 rounded-xl border border-cyan-500/20">
          <span className="text-cyan-400 font-bold text-[11px] uppercase tracking-wider">
            Indikator Status:
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-3 h-3 rounded-md bg-emerald-400" />
            <span>Hijau (Benar)</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-3 h-3 rounded-md bg-rose-500" />
            <span>Merah (Salah)</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-3 h-3 rounded-md bg-amber-400" />
            <span>Kuning (Sebagian Benar)</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-3 h-3 rounded-md bg-slate-600" />
            <span>Abu-abu (Waktu Habis / Kosong)</span>
          </span>
        </div>

        {/* The Scrollable Responsive Table */}
        <div className="overflow-x-auto rounded-2xl border border-cyan-500/20">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#080d19] text-cyan-300 border-b border-cyan-500/20 font-bold uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">Rank</th>
                <th className="py-3 px-4">Nama Mahasiswa</th>
                <th className="py-3 px-4">Kelompok</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4 text-right">Total Skor</th>
                <th className="py-3 px-4 text-center">% Akurasi</th>
                {questions.map((q, i) => (
                  <th key={q.id} className="py-3 px-3 text-center" title={q.pertanyaan}>
                    Q{i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-[#0e172a]/60">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6 + questions.length} className="py-8 text-center text-slate-500">
                    Tidak ada data mahasiswa yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => {
                  const globalRank = sortedStudents.findIndex(s => s.id === st.id) + 1;

                  return (
                    <tr 
                      key={st.id} 
                      className="hover:bg-[#131f38] transition-colors"
                    >
                      {/* Rank */}
                      <td className="py-3 px-4 text-center font-bold">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-[11px] ${
                          globalRank === 1 ? 'bg-amber-400 text-black font-black' :
                          globalRank === 2 ? 'bg-slate-300 text-black font-black' :
                          globalRank === 3 ? 'bg-amber-700 text-white font-black' :
                          'text-slate-400'
                        }`}>
                          #{globalRank}
                        </span>
                      </td>

                      {/* Nama Mahasiswa */}
                      <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span>{st.avatar || '🐙'}</span>
                          <span>{st.namaLengkap}</span>
                        </div>
                      </td>

                      {/* Kelompok */}
                      <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                        {st.namaKelompok}
                      </td>

                      {/* Kelas */}
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-[#080d19] border border-cyan-500/20 text-[10px] font-mono text-cyan-300">
                          {st.kelas}
                        </span>
                      </td>

                      {/* Total Skor */}
                      <td className="py-3 px-4 text-right font-black text-amber-400 font-display whitespace-nowrap">
                        {st.totalScore.toLocaleString('id-ID')}
                      </td>

                      {/* % Akurasi */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                          st.accuracy >= 80 ? 'bg-emerald-500/20 text-emerald-300' :
                          st.accuracy >= 50 ? 'bg-amber-500/20 text-amber-300' :
                          'bg-rose-500/20 text-rose-300'
                        }`}>
                          {st.accuracy}%
                        </span>
                      </td>

                      {/* Question Status Badges */}
                      {questions.map((q) => {
                        const ans = st.answers[q.id];
                        let statusColor = 'bg-slate-800 text-slate-400 border-white/5';
                        let label = '-';

                        if (ans) {
                          if (ans.status === 'CORRECT') {
                            statusColor = 'bg-emerald-500/25 text-emerald-300 border-emerald-500/60 font-bold';
                            label = ans.selectedOption || '✓';
                          } else if (ans.status === 'PARTIALLY_CORRECT') {
                            statusColor = 'bg-amber-500/25 text-amber-300 border-amber-500/60 font-bold';
                            label = ans.selectedOption || '✓';
                          } else if (ans.status === 'INCORRECT') {
                            statusColor = 'bg-rose-500/25 text-rose-300 border-rose-500/60 font-bold';
                            label = ans.selectedOption === 'TIMED_OUT' ? '⏰' : (ans.selectedOption || '✗');
                          }
                        }

                        return (
                          <td key={q.id} className="py-3 px-3 text-center">
                            <span 
                              className={`inline-block w-7 h-7 rounded-lg text-xs leading-7 text-center border ${statusColor}`}
                              title={`Soal: ${q.pertanyaan} | Jawaban: ${label}`}
                            >
                              {label}
                            </span>
                          </td>
                        );
                      })}

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
