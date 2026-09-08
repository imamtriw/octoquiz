import React, { useState } from 'react';
import { 
  User, 
  Users, 
  GraduationCap, 
  ArrowRight, 
  Sparkles, 
  Flame, 
  Clock, 
  ShieldAlert,
  KeyRound,
} from 'lucide-react';
import { StudentRegistrationData, AQUATIC_AVATARS, ActiveQuizSession } from '../types';
import { sound } from '../utils/audio';

interface StudentRegistrationProps {
  onStartQuiz: (data: StudentRegistrationData) => void;
  totalQuestions: number;
  activeSession: ActiveQuizSession;
  customTeams: string[];
}

export const StudentRegistration: React.FC<StudentRegistrationProps> = ({
  onStartQuiz,
  totalQuestions,
  activeSession,
  customTeams,
}) => {
  const [quizCode, setQuizCode] = useState(() => {
    const codeFromLink = new URLSearchParams(window.location.search).get('code');
    return (codeFromLink || activeSession?.quizCode || 'OCTO-801').toUpperCase();
  });
  const [namaLengkap, setNamaLengkap] = useState('');
  const [nim, setNim] = useState('');
  const [namaKelompok, setNamaKelompok] = useState(customTeams?.[0] || '');
  const [isCustomTeamInput, setIsCustomTeamInput] = useState(false);
  const [kelas, setKelas] = useState(activeSession?.targetClass || 'TI-3A');
  const [selectedAvatar, setSelectedAvatar] = useState('🐙');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!quizCode.trim()) {
      setErrorMessage('Kode Kuis wajib diisi!');
      sound.playIncorrect();
      return;
    }
    if (!namaLengkap.trim()) {
      setErrorMessage('Nama Lengkap wajib diisi!');
      sound.playIncorrect();
      return;
    }
    if (!nim.trim()) {
      setErrorMessage('NIM wajib diisi!');
      sound.playIncorrect();
      return;
    }
    if (!namaKelompok.trim()) {
      setErrorMessage('Nama Kelompok wajib diisi!');
      sound.playIncorrect();
      return;
    }
    if (!kelas.trim()) {
      setErrorMessage('Kelas wajib diisi!');
      sound.playIncorrect();
      return;
    }

    setErrorMessage('');
    sound.playClick();
    onStartQuiz({
      quizCode: quizCode.trim().toUpperCase(),
      namaLengkap: namaLengkap.trim(),
      nim: nim.trim(),
      namaKelompok: namaKelompok.trim(),
      kelas: kelas.trim().toUpperCase(),
      avatar: selectedAvatar,
    });
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 py-8 relative z-10">
      <div className="w-full max-w-xl">
        
        {/* Registration Card */}
        <div className="bg-[#0e1628]/95 border border-cyan-500/25 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/60 relative overflow-hidden backdrop-blur-md">
          
          {/* Subtle Aquatic Accent Corner */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-44 h-44 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="text-center mb-7 relative z-10">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-display mb-2">
              Registrasi Mahasiswa
            </h1>
            <p className="text-sm text-cyan-200/70">
              Pilih karakter hewan laut dan masukkan kode kuis untuk bergabung ke kuis kelas.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 relative z-10">
            
            {/* Error Notification */}
            {errorMessage && (
              <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs animate-shake">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Aquatic Avatar Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-cyan-200">
                  Pilih Avatar Hewan Akuatik <span className="text-rose-400">*</span>
                </label>
                <span className="text-xs text-cyan-400 font-semibold">
                  {AQUATIC_AVATARS.find(a => a.icon === selectedAvatar)?.name || 'Karakter'}
                </span>
              </div>
              <div className="grid grid-cols-6 gap-2 sm:gap-2.5 p-2 rounded-2xl bg-[#080d19]/80 border border-cyan-500/20">
                {AQUATIC_AVATARS.map((avatar) => (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => {
                      setSelectedAvatar(avatar.icon);
                      sound.playClick();
                    }}
                    title={avatar.name}
                    className={`aspect-square rounded-xl text-2xl sm:text-3xl flex items-center justify-center transition-all ${
                      selectedAvatar === avatar.icon
                        ? 'bg-gradient-to-tr from-cyan-500 to-purple-600 scale-110 shadow-lg shadow-cyan-500/40 border-2 border-white ring-2 ring-cyan-400/50'
                        : 'bg-[#111c33] border border-white/5 hover:border-cyan-400/40 text-slate-300 hover:scale-105'
                    }`}
                  >
                    {avatar.icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Kode Kuis */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-cyan-200">
                  Kode Kuis Kelas <span className="text-rose-400">*</span>
                </label>
                <span className="text-[11px] text-cyan-400 font-mono">
                  Sesi Aktif: {activeSession?.quizCode || quizCode || 'OCTO-801'}
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cyan-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={quizCode}
                  onChange={(e) => setQuizCode(e.target.value.toUpperCase())}
                  placeholder="Contoh: OCTO-801"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#0a1020] border border-cyan-500/30 rounded-xl text-cyan-100 font-mono font-bold tracking-widest placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 uppercase transition-all"
                />
              </div>
            </div>

            {/* 1. Nama Lengkap */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-cyan-200 mb-1.5">
                Nama Lengkap <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4 text-cyan-400" />
                </div>
                <input
                  type="text"
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  placeholder="Masukkan nama lengkap Anda"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#0a1020] border border-cyan-500/20 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                />
              </div>
            </div>

            {/* NIM */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-cyan-200 mb-1.5">
                NIM <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <GraduationCap className="w-4 h-4 text-cyan-400" />
                </div>
                <input
                  type="text"
                  value={nim}
                  onChange={(e) => setNim(e.target.value)}
                  placeholder="Masukkan NIM Anda"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#0a1020] border border-cyan-500/20 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                />
              </div>
            </div>

            {/* 2. Nama Kelompok (with Admin Custom Teams) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-cyan-200">
                  Nama Kelompok <span className="text-rose-400">*</span>
                </label>
                {customTeams.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsCustomTeamInput(!isCustomTeamInput)}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 underline"
                  >
                    {isCustomTeamInput ? 'Pilih dari daftar tim' : 'Ketik tim manual'}
                  </button>
                )}
              </div>

              {isCustomTeamInput || customTeams.length === 0 ? (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Users className="w-4 h-4 text-cyan-400" />
                  </div>
                  <input
                    type="text"
                    value={namaKelompok}
                    onChange={(e) => setNamaKelompok(e.target.value)}
                    placeholder="Contoh: Kelompok Gurita Poseidon"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-[#0a1020] border border-cyan-500/20 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                  />
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Users className="w-4 h-4 text-cyan-400" />
                  </div>
                  <select
                    value={namaKelompok}
                    onChange={(e) => setNamaKelompok(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-[#0a1020] border border-cyan-500/20 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all appearance-none cursor-pointer"
                  >
                    {customTeams.map((team) => (
                      <option key={team} value={team} className="bg-[#0e1628] text-white">
                        {team}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Quick Select Buttons from Admin Custom Teams */}
              {!isCustomTeamInput && customTeams.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  <span className="text-[10px] text-cyan-400/70">Pilihan Admin:</span>
                  {customTeams.map((team) => (
                    <button
                      key={team}
                      type="button"
                      onClick={() => {
                        setNamaKelompok(team);
                        sound.playClick();
                      }}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                        namaKelompok === team
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                          : 'bg-[#080d19] border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {team}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Kelas */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-cyan-200 mb-1.5">
                Kelas <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <GraduationCap className="w-4 h-4 text-cyan-400" />
                </div>
                <input
                  type="text"
                  value={kelas}
                  onChange={(e) => setKelas(e.target.value.toUpperCase())}
                  placeholder="Contoh: TI-3A atau Agribisnis 2"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#0a1020] border border-cyan-500/20 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all uppercase"
                />
              </div>
            </div>

            {/* Rules preview */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-[#080d19]/80 border border-cyan-500/20 text-center">
              <div className="flex flex-col items-center justify-center p-1">
                <Clock className="w-4 h-4 text-cyan-400 mb-1" />
                <span className="text-[10px] text-slate-400">Total Soal</span>
                <span className="text-xs font-bold text-white">{totalQuestions} Soal</span>
              </div>
              <div className="flex flex-col items-center justify-center p-1 border-x border-white/5">
                <Sparkles className="w-4 h-4 text-amber-400 mb-1" />
                <span className="text-[10px] text-slate-400">Skor Max</span>
                <span className="text-xs font-bold text-amber-400">1500 Pts</span>
              </div>
              <div className="flex flex-col items-center justify-center p-1">
                <Flame className="w-4 h-4 text-rose-400 mb-1" />
                <span className="text-[10px] text-slate-400">Streak Combo</span>
                <span className="text-xs font-bold text-rose-400">Aktif 🔥</span>
              </div>
            </div>

            {/* Start Button */}
            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl font-black text-sm sm:text-base tracking-wide bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 text-[#080e1b] hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-xl shadow-cyan-400/25 group cursor-pointer"
            >
              <span>MASUK DAN MULAI KUIS</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

          </form>

        </div>

      </div>
    </div>
  );
};
