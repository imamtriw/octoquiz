import React, { useEffect, useRef, useState } from 'react';
import { 
  Tv, 
  BookOpen, 
  FileSpreadsheet, 
  History as HistoryIcon,
  Volume2, 
  VolumeX, 
  Music, 
  Sparkles,
  Share2,
  Lock,
  Unlock,
  GraduationCap,
  ShieldCheck,
  HardDrive,
  Cloud,
  CheckCircle2,
  KeyRound,
  ChevronDown
} from 'lucide-react';
import { AppViewMode, UserRole, ActiveQuizSession, MusicTrackId } from '../types';
import { sound, MUSIC_TRACKS } from '../utils/audio';
import { MusicController } from './MusicController';
import { GoogleUserProfile } from '../utils/googleAuth';

interface NavbarProps {
  currentView: AppViewMode;
  onNavigate: (view: AppViewMode) => void;
  userRole?: UserRole;
  onSwitchRole?: (role: UserRole) => void;
  activeSession?: ActiveQuizSession;
  activeSessionCode?: string;
  isStudentRole?: boolean;
  questionCount: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onToggleSimulation: () => void;
  hasSimulatedData: boolean;
  isBgmActive?: boolean;
  isBgmPlaying?: boolean;
  onToggleBgm: () => void;
  currentTrackId?: MusicTrackId;
  onSelectTrack?: (trackId: MusicTrackId) => void;
  bgmVolume?: number;
  onChangeVolume?: (vol: number) => void;
  onOpenDriveModal?: () => void;
  isDriveConnected?: boolean;
  onExportSingleHtml?: () => void;
  isHostAuthenticated?: boolean;
  onOpenHostAuthModal?: () => void;
  googleUser?: GoogleUserProfile | null;
  lastSyncTime?: string | null;
  enteredStudentCode?: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  userRole: propUserRole,
  onSwitchRole,
  activeSession,
  activeSessionCode,
  isStudentRole,
  questionCount,
  isMuted,
  onToggleMute,
  onToggleSimulation,
  hasSimulatedData,
  isBgmActive: propBgmActive,
  isBgmPlaying,
  onToggleBgm,
  currentTrackId = 'quiz-party',
  onSelectTrack,
  bgmVolume = 0.55,
  onChangeVolume,
  onOpenDriveModal,
  isDriveConnected,
  onExportSingleHtml,
  isHostAuthenticated = false,
  onOpenHostAuthModal,
  googleUser,
  lastSyncTime,
  enteredStudentCode,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const adminMenuRef = useRef<HTMLDivElement>(null);

  // Derive active role and safe session values
  const effectiveRole: UserRole = propUserRole || (isStudentRole || currentView.startsWith('STUDENT_') ? 'STUDENT' : 'ADMIN');
  const sessionCode = activeSession?.quizCode || activeSessionCode || 'OCTO-801';
  const sessionTitle = activeSession?.title || 'Kuis Interaktif';
  const effectiveBgmActive = Boolean(propBgmActive ?? isBgmPlaying);
  const displayedQuizCode = effectiveRole === 'STUDENT' ? enteredStudentCode : sessionCode;

  const handleCopyStudentLink = () => {
    sound.playClick();
    const url = `${window.location.origin}${window.location.pathname}?role=student&code=${sessionCode}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleAdminNavigation = (view: AppViewMode) => {
    sound.playClick();
    onNavigate(view);
    setIsAdminMenuOpen(false);
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (adminMenuRef.current && !adminMenuRef.current.contains(event.target as Node)) {
        setIsAdminMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[#0a0f1d]/90 backdrop-blur-md border-b border-cyan-500/20 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* OCTOQUIZ Brand Logo */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div 
            onClick={() => {
              if (effectiveRole === 'ADMIN') {
                onNavigate('ADMIN_DISPLAY');
              } else {
                onNavigate('STUDENT_REGISTRATION');
              }
            }}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
            title="OCTOQUIZ - Platform Kuis Kelas"
          >
            {/* Octopus Logo Icon */}
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-cyan-400 p-[1.5px] shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0d1424] rounded-[14px] flex items-center justify-center text-2xl group-hover:rotate-6 transition-transform">
                🐙
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#00e6a8] border-2 border-[#0a0f1d] flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent font-display">
                  OCTOQUIZ
                </span>
                <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 uppercase tracking-widest">
                  {effectiveRole === 'ADMIN' ? 'HOST' : 'SISWA'}
                </span>
              </div>
              <p className="text-[11px] text-cyan-200/60 font-medium truncate max-w-[180px]">
                {sessionTitle}
              </p>
            </div>
          </div>

          {/* Quick controls on mobile */}
        </div>

        {/* Dynamic Center Navigation: STRICTLY ROLE-BASED */}
        {effectiveRole === 'ADMIN' ? (
          <div ref={adminMenuRef} className="relative w-full md:w-auto flex justify-center">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setIsAdminMenuOpen(prev => !prev);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#0f172a]/90 border border-cyan-500/20 text-xs font-bold text-slate-100 hover:bg-slate-800 transition-all shadow-inner"
              aria-expanded={isAdminMenuOpen}
              aria-haspopup="menu"
            >
              {currentView === 'ADMIN_DISPLAY' && <Tv className="w-4 h-4 text-cyan-300" />}
              {currentView === 'ADMIN_QUESTIONS' && <BookOpen className="w-4 h-4 text-pink-300" />}
              {currentView === 'ADMIN_RESULTS' && <FileSpreadsheet className="w-4 h-4 text-amber-300" />}
              <span>Menu Host</span>
              {activeSession?.status === 'IN_PROGRESS' && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
              <ChevronDown className={`w-4 h-4 text-cyan-300 transition-transform ${isAdminMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isAdminMenuOpen && (
              <div role="menu" className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 w-64 p-1.5 rounded-2xl bg-[#0b1322] border border-cyan-500/25 shadow-2xl shadow-cyan-950/50 animate-fadeIn">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => handleAdminNavigation('ADMIN_DISPLAY')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-all ${currentView === 'ADMIN_DISPLAY' ? 'bg-cyan-500/15 text-cyan-200' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
                >
                  <Tv className="w-4 h-4 text-cyan-300" />
                  <span className="flex-1">Display Layar Kelas</span>
                  {activeSession?.status === 'IN_PROGRESS' && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => handleAdminNavigation('ADMIN_QUESTIONS')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-all ${currentView === 'ADMIN_QUESTIONS' ? 'bg-pink-500/15 text-pink-200' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
                >
                  <BookOpen className="w-4 h-4 text-pink-300" />
                  <span className="flex-1">Bank Soal</span>
                  <span className="text-[10px] text-slate-500">{questionCount}</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => handleAdminNavigation('ADMIN_RESULTS')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-all ${currentView === 'ADMIN_RESULTS' ? 'bg-amber-500/15 text-amber-200' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
                >
                  <FileSpreadsheet className="w-4 h-4 text-amber-300" />
                  <span>Rekap Hasil Kelas</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => handleAdminNavigation('ADMIN_HISTORY')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-all ${currentView === 'ADMIN_HISTORY' ? 'bg-emerald-500/15 text-emerald-200' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
                >
                  <HistoryIcon className="w-4 h-4 text-emerald-300" />
                  <span className="flex-1">History Kuis</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Student View Navigation: Minimal, no admin tabs visible whatsoever */
          <div className="flex items-center gap-2 bg-[#0f172a]/90 px-4 py-1.5 rounded-2xl border border-cyan-500/20">
            <span className="text-xs text-slate-300 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              <span>Student</span>
            </span>
          </div>
        )}

        {/* Right Action Tools */}
        <div className="flex w-full md:w-auto items-center justify-center md:justify-end gap-2.5 flex-wrap">
          {displayedQuizCode && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/70 border border-cyan-500/30 text-xs">
              <span className="text-slate-400">Kode</span>
              <span className="font-mono font-black tracking-wider text-cyan-300">{displayedQuizCode}</span>
            </div>
          )}
          
          {/* Background Multi-Track Music Player */}
          <MusicController
            isBgmPlaying={effectiveBgmActive}
            onToggleBgm={onToggleBgm}
            currentTrackId={currentTrackId}
            onSelectTrack={onSelectTrack || (() => {})}
            bgmVolume={bgmVolume}
            onChangeVolume={onChangeVolume || (() => {})}
            isCompact={true}
          />

          {/* Sound FX Toggle */}
          <button
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-white/10 transition-colors"
            title={isMuted ? 'Aktifkan Efek Suara' : 'Bisukan Efek Suara'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Admin Specific Actions */}
          {effectiveRole === 'ADMIN' && (
            <>
              {/* Copy Student Link */}
              <button
                onClick={handleCopyStudentLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20 transition-all"
                title="Salin Link Khusus Mahasiswa (hanya berisi form registrasi & kuis)"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'Link Tersalin!' : 'Bagikan ke Siswa'}</span>
              </button>

              {/* Google Drive Status & Sync Button */}
              <button
                onClick={onOpenDriveModal}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  isDriveConnected
                    ? 'bg-emerald-950/60 border-emerald-400/40 text-emerald-300 hover:bg-emerald-900/60'
                    : 'bg-indigo-950/60 border-indigo-400/40 text-indigo-200 hover:bg-indigo-900/60'
                }`}
                title={lastSyncTime ? `Terakhir sync: ${lastSyncTime}` : 'Sinkronisasi ke Google Drive'}
              >
                <HardDrive className="w-3.5 h-3.5 text-cyan-300" />
                <span className="hidden lg:inline">{isDriveConnected ? 'Drive Terhubung' : 'Simpan ke Drive'}</span>
                <span className="lg:hidden">Drive</span>
                {isDriveConnected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>

              {/* Host Authentication & Profile Button */}
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenHostAuthModal?.();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  isHostAuthenticated
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                    : 'bg-amber-950/60 border-amber-500/40 text-amber-300 hover:bg-amber-900/60'
                }`}
                title={googleUser ? `Host: ${googleUser.email}` : 'Pengaturan Password & ID Host'}
              >
                {googleUser?.photoURL ? (
                  <img
                    src={googleUser.photoURL}
                    alt={googleUser.displayName || 'Google Host'}
                    className="w-4 h-4 rounded-full border border-emerald-400 object-cover shrink-0"
                  />
                ) : isHostAuthenticated ? (
                  <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span className="hidden xl:inline max-w-[130px] truncate">
                  {googleUser?.email ? googleUser.email.split('@')[0] : (isHostAuthenticated ? 'Host Terbuka' : 'Kunci Host')}
                </span>
                <span className="xl:hidden">
                  {isHostAuthenticated ? 'Host' : 'Kunci'}
                </span>
              </button>

              {/* Demo Simulation Toggle */}
              <button
                onClick={onToggleSimulation}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  hasSimulatedData
                    ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-800/80 border-white/10 text-slate-300 hover:text-white'
                }`}
                title="Isi peserta akuatik simulasi untuk demo live display"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden lg:inline">{hasSimulatedData ? 'Reset Demo' : 'Simulasi Peserta'}</span>
              </button>
            </>
          )}

          {/* Role Switcher Button (with Password Protection) */}
          <button
            onClick={() => {
              sound.playClick();
              if (effectiveRole === 'ADMIN') {
                onSwitchRole?.('STUDENT');
                onNavigate('STUDENT_REGISTRATION');
              } else {
                if (!isHostAuthenticated) {
                  onOpenHostAuthModal?.();
                } else {
                  onSwitchRole?.('ADMIN');
                  onNavigate('ADMIN_DISPLAY');
                }
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              effectiveRole === 'ADMIN'
                ? 'bg-purple-950/60 border-purple-500/40 text-purple-200 hover:bg-purple-900/60'
                : 'bg-cyan-950/60 border-cyan-500/40 text-cyan-200 hover:bg-cyan-900/60'
            }`}
            title="Ganti tampilan antara Host/Admin dan Peserta Mahasiswa"
          >
            {effectiveRole === 'ADMIN' ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>Tampilan Siswa</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Panel Host</span>
              </>
            )}
          </button>

        </div>

      </div>
    </header>
  );
};
