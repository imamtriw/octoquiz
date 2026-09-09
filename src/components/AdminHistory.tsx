import React, { useMemo, useState } from 'react';
import { BarChart3, CheckCircle2, Clock3, FileText, History as HistoryIcon, Medal, Search, Users, XCircle } from 'lucide-react';
import { AnswerDetail, QuizHistoryEntry, StudentResult } from '../types';
import { exportResultsToCSV } from '../utils/csvHelper';

interface AdminHistoryProps {
  history: QuizHistoryEntry[];
}

const formatDate = (timestamp: number) => new Date(timestamp).toLocaleString('id-ID', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export const AdminHistory: React.FC<AdminHistoryProps> = ({ history }) => {
  const [selectedId, setSelectedId] = useState(history[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const selected = history.find(entry => entry.id === selectedId) || history[0];

  const rankedStudents = useMemo(() => {
    if (!selected) return [];
    return [...selected.students].sort((first, second) => second.totalScore - first.totalScore);
  }, [selected]);

  const filteredStudents = rankedStudents.filter(student => {
    const query = searchTerm.toLowerCase();
    return student.namaLengkap.toLowerCase().includes(query) || student.namaKelompok.toLowerCase().includes(query);
  });

  const stats = useMemo(() => {
    const answers = selected?.students.flatMap(student => Object.values(student.answers)) || [];
    const correct = answers.filter(answer => answer.isCorrect).length;
    const completed = selected?.students.filter(student => student.isCompleted).length || 0;
    return {
      participants: selected?.students.length || 0,
      completed,
      accuracy: answers.length ? Math.round((correct / answers.length) * 100) : 0,
      averageScore: selected?.students.length ? Math.round(selected.students.reduce((sum, student) => sum + student.totalScore, 0) / selected.students.length) : 0,
    };
  }, [selected]);

  const teamSummary = useMemo(() => {
    const teams = new Map<string, { name: string; score: number; members: number; accuracy: number }>();
    rankedStudents.forEach(student => {
      const name = student.namaKelompok || 'Tanpa Kelompok';
      const existing = teams.get(name) || { name, score: 0, members: 0, accuracy: 0 };
      teams.set(name, {
        name,
        score: existing.score + student.totalScore,
        members: existing.members + 1,
        accuracy: existing.accuracy + student.accuracy,
      });
    });
    return [...teams.values()].map(team => ({ ...team, accuracy: Math.round(team.accuracy / team.members) })).sort((a, b) => b.score - a.score);
  }, [rankedStudents]);

  const handleExport = () => {
    if (selected) exportResultsToCSV(selected.students, selected.questions, stats.accuracy);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 relative z-10">
      <section className="bg-[#0e172a]/95 border border-emerald-500/20 rounded-3xl p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider"><HistoryIcon className="w-4 h-4" /> Arsip sesi selesai</div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-display mt-2">History Kuis & Rekap Detail</h1>
            <p className="text-sm text-slate-400 mt-1">Buka kembali peringkat, performa tim, dan jawaban peserta dari kuis yang telah dimainkan.</p>
          </div>
          {selected && <button onClick={handleExport} className="px-4 py-2.5 rounded-xl bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-2"><FileText className="w-4 h-4" /> Export Rekap CSV</button>}
        </div>
      </section>

      {history.length === 0 ? (
        <section className="bg-[#0e172a]/95 border border-cyan-500/20 rounded-3xl p-12 text-center text-slate-400"><HistoryIcon className="w-12 h-12 mx-auto mb-3 text-cyan-400 opacity-60" /><p>Belum ada kuis yang selesai dimainkan.</p><p className="text-xs mt-1">Arsip akan muncul setelah Host menekan Selesaikan Kuis.</p></section>
      ) : (
        <>
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {history.map(entry => (
              <button key={entry.id} onClick={() => setSelectedId(entry.id)} className={`text-left p-4 rounded-2xl border transition-all ${selected?.id === entry.id ? 'bg-emerald-500/15 border-emerald-400/60' : 'bg-[#0e172a]/90 border-white/10 hover:border-cyan-400/40'}`}>
                <div className="flex items-start justify-between gap-3"><div><div className="text-white font-black text-sm">{entry.session.title}</div><div className="text-xs text-cyan-300 font-mono mt-1">{entry.session.quizCode}</div></div><span className="text-[10px] text-slate-400 whitespace-nowrap">{formatDate(entry.playedAt)}</span></div>
                <div className="text-xs text-slate-400 mt-3">{entry.students.length} peserta • {entry.questions.length} soal</div>
              </button>
            ))}
          </section>

          {selected && <>
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                ['Peserta', stats.participants, Users], ['Selesai', stats.completed, CheckCircle2], ['Rata-rata Nilai', stats.averageScore.toLocaleString('id-ID'), BarChart3], ['Akurasi Kelas', `${stats.accuracy}%`, Medal],
              ].map(([label, value, Icon]) => { const StatIcon = Icon as React.ElementType; return <div key={String(label)} className="bg-[#0e172a]/95 border border-cyan-500/15 rounded-2xl p-4"><StatIcon className="w-5 h-5 text-cyan-300 mb-2" /><div className="text-xl font-black text-white">{value}</div><div className="text-xs text-slate-400">{label}</div></div>; })}
            </section>

            <section className="bg-[#0e172a]/95 border border-cyan-500/20 rounded-3xl p-5 overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4"><div><h2 className="text-lg font-black text-white">Peringkat Peserta</h2><p className="text-xs text-slate-400">{selected.session.targetClass} • dimainkan {formatDate(selected.playedAt)}</p></div><div className="relative"><Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" /><input value={searchTerm} onChange={event => setSearchTerm(event.target.value)} placeholder="Cari peserta atau tim" className="bg-slate-950 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-cyan-400" /></div></div>
              <div className="overflow-x-auto"><table className="w-full text-left text-xs min-w-[760px]"><thead><tr className="border-b border-white/10 text-slate-400 uppercase"><th className="p-3">Rank</th><th className="p-3">Peserta</th><th className="p-3">Tim</th><th className="p-3">Skor</th><th className="p-3">Akurasi</th><th className="p-3">Benar</th><th className="p-3">Salah</th><th className="p-3">Status</th></tr></thead><tbody>{filteredStudents.map((student, index) => <tr key={student.id} className="border-b border-white/5 hover:bg-white/[0.03]"><td className="p-3 font-black text-amber-300">#{rankedStudents.findIndex(item => item.id === student.id) + 1}</td><td className="p-3"><div className="font-bold text-white">{student.avatar} {student.namaLengkap}</div><div className="text-[10px] text-slate-500">{student.nim || 'NIM tidak tersedia'} • {student.kelas}</div></td><td className="p-3 text-cyan-200">{student.namaKelompok}</td><td className="p-3 font-black text-emerald-300">{student.totalScore.toLocaleString('id-ID')}</td><td className="p-3">{student.accuracy}%</td><td className="p-3 text-emerald-300">{student.correctCount}</td><td className="p-3 text-rose-300">{student.incorrectCount}</td><td className="p-3">{student.isCompleted ? <span className="text-emerald-300 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Selesai</span> : <span className="text-amber-300 flex items-center gap-1"><Clock3 className="w-3.5 h-3.5" /> Berlangsung</span>}</td></tr>)}</tbody></table></div>
            </section>

            <section className="grid lg:grid-cols-2 gap-6">
              <div className="bg-[#0e172a]/95 border border-cyan-500/20 rounded-3xl p-5"><h2 className="text-lg font-black text-white mb-4">Rekap Performa Tim</h2><div className="space-y-2">{teamSummary.map((team, index) => <div key={team.name} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/70"><div className="flex items-center gap-3"><span className="text-amber-300 font-black">#{index + 1}</span><div><div className="text-sm text-white font-bold">{team.name}</div><div className="text-[11px] text-slate-400">{team.members} anggota • {team.accuracy}% akurasi</div></div></div><span className="font-black text-cyan-300">{team.score.toLocaleString('id-ID')} pts</span></div>)}</div></div>
              <div className="bg-[#0e172a]/95 border border-cyan-500/20 rounded-3xl p-5"><h2 className="text-lg font-black text-white mb-4">Analisis Soal</h2><div className="space-y-2 max-h-72 overflow-y-auto">{selected.questions.map((question, index) => { const answers = selected.students.map(student => student.answers[question.id]).filter(Boolean) as AnswerDetail[]; const correct = answers.filter(answer => answer.isCorrect).length; const accuracy = answers.length ? Math.round(correct / answers.length * 100) : 0; return <div key={question.id} className="p-3 rounded-xl bg-slate-950/70"><div className="flex justify-between gap-3 text-xs"><span className="text-white font-bold">Soal {index + 1}: {question.pertanyaan}</span><span className="text-cyan-300 font-black">{accuracy}%</span></div><div className="text-[11px] text-slate-400 mt-1">{correct} benar dari {answers.length} jawaban • kunci {question.jawabanBenar}</div></div>; })}</div></div>
            </section>
          </>}
        </>
      )}
    </div>
  );
};