import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  RefreshCw, 
  ExternalLink, 
  FileText, 
  FolderCheck, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  UploadCloud, 
  DownloadCloud, 
  Check,
  Mail,
  HardDrive
} from 'lucide-react';
import { 
  syncAllToGoogleDrive, 
  listOctoquizDriveFiles, 
  restorePackagesFromDrive, 
  DriveFileInfo, 
  DriveSyncResult 
} from '../utils/googleDrive';
import { signInWithGoogle, GoogleUserProfile, getAccessToken } from '../utils/googleAuth';
import { QuizPackage, StudentResult, ActiveQuizSession } from '../types';
import { sound } from '../utils/audio';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  googleUser: GoogleUserProfile | null;
  onGoogleSignInSuccess: (user: GoogleUserProfile) => void;
  quizPackages: QuizPackage[];
  students: StudentResult[];
  activeSession: ActiveQuizSession;
  onRestorePackages?: (packages: QuizPackage[]) => void;
  lastSyncTime: string | null;
  onUpdateLastSyncTime: (time: string) => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  googleUser,
  onGoogleSignInSuccess,
  quizPackages,
  students,
  activeSession,
  onRestorePackages,
  lastSyncTime,
  onUpdateLastSyncTime,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [syncResult, setSyncResult] = useState<DriveSyncResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [driveFiles, setDriveFiles] = useState<DriveFileInfo[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState('');

  // Auto-sync setting saved in localStorage
  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('octoquiz_autosync_drive') === 'true';
    } catch {
      return true;
    }
  });

  const toggleAutoSync = () => {
    const next = !autoSyncEnabled;
    setAutoSyncEnabled(next);
    try {
      localStorage.setItem('octoquiz_autosync_drive', next ? 'true' : 'false');
    } catch {
      // ignore
    }
  };

  // Load files from Google Drive when modal opens and user is logged in
  useEffect(() => {
    if (isOpen && googleUser) {
      loadDriveFiles();
    }
  }, [isOpen, googleUser]);

  const loadDriveFiles = async () => {
    setIsLoadingFiles(true);
    try {
      const files = await listOctoquizDriveFiles();
      setDriveFiles(files);
    } catch (err: any) {
      console.error('Gagal memuat file Drive:', err);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleConnectGoogle = async () => {
    setIsSigningIn(true);
    setErrorMessage('');
    try {
      const { user } = await signInWithGoogle();
      sound.playFanfare();
      const profile: GoogleUserProfile = {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        uid: user.uid,
      };
      onGoogleSignInSuccess(profile);
      await loadDriveFiles();
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setErrorMessage(err?.message || 'Gagal menghubungkan Google Drive.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setErrorMessage('');
    setSyncResult(null);
    setRestoreMessage('');

    try {
      const token = await getAccessToken();
      if (!token && !googleUser) {
        // Need to sign in first
        await handleConnectGoogle();
      }

      const result = await syncAllToGoogleDrive(
        quizPackages,
        students,
        activeSession,
        googleUser?.email
      );

      setSyncResult(result);
      if (result.success) {
        sound.playCorrect();
        if (result.timestamp) {
          onUpdateLastSyncTime(result.timestamp);
        }
        await loadDriveFiles();
      } else {
        sound.playIncorrect();
        setErrorMessage(result.message);
      }
    } catch (err: any) {
      sound.playIncorrect();
      setErrorMessage(err?.message || 'Terjadi kesalahan saat menyinkronkan data.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRestoreFromDrive = async () => {
    if (!onRestorePackages) return;
    const confirm = window.confirm(
      'Apakah Anda yakin ingin memulihkan bank soal dari Google Drive? Paket soal yang ada saat ini akan digantikan dengan versi dari Google Drive.'
    );
    if (!confirm) return;

    setIsRestoring(true);
    setErrorMessage('');
    setRestoreMessage('');

    try {
      const restored = await restorePackagesFromDrive();
      if (restored && restored.packages) {
        sound.playCorrect();
        onRestorePackages(restored.packages);
        setRestoreMessage(restored.message);
      }
    } catch (err: any) {
      sound.playIncorrect();
      setErrorMessage(err?.message || 'Gagal memulihkan bank soal dari Google Drive.');
    } finally {
      setIsRestoring(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#0b1322] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/60 overflow-hidden text-slate-100 max-h-[90vh] flex flex-col">
        
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors"
          title="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-white/10 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400/20 via-emerald-400/20 to-blue-500/20 border border-cyan-400/40 flex items-center justify-center shadow-lg">
            <HardDrive className="w-6 h-6 text-cyan-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white font-display">Integrasi Google Drive</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-950 text-cyan-300 border border-cyan-700/50">
                CLOUD BACKUP
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Simpan bank soal, paket kuis, dan rekap nilai otomatis ke Google Drive Anda
            </p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          
          {/* Notifications */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {restoreMessage && (
            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{restoreMessage}</span>
            </div>
          )}

          {/* User Connection Status Card */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {googleUser ? (
              <div className="flex items-center gap-3">
                {googleUser.photoURL ? (
                  <img
                    src={googleUser.photoURL}
                    alt={googleUser.displayName || 'Google Profile'}
                    className="w-11 h-11 rounded-full border-2 border-emerald-400 object-cover shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-cyan-600 flex items-center justify-center font-bold text-white shrink-0">
                    {googleUser.displayName?.charAt(0) || 'G'}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Google Drive Terhubung</span>
                  </div>
                  <div className="text-sm font-black text-white">{googleUser.displayName || 'Host Kuis'}</div>
                  <div className="text-xs text-cyan-300 font-mono flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    <span>{googleUser.email}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Status Akun Google
                </div>
                <div className="text-sm text-slate-300 font-semibold">
                  Belum terhubung ke akun Google
                </div>
                <div className="text-xs text-slate-500">
                  Hubungkan akun Google agar data tersimpan langsung di Google Drive Anda
                </div>
              </div>
            )}

            {!googleUser && (
              <button
                type="button"
                onClick={handleConnectGoogle}
                disabled={isSigningIn}
                className="py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shrink-0"
              >
                {/* Google Icon */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  <path fill="none" d="M0 0h48v48H0z"/>
                </svg>
                <span>{isSigningIn ? 'Menghubungkan...' : 'Hubungkan Google Drive'}</span>
              </button>
            )}
          </div>

          {/* Sync Actions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Action 1: Manual Sync Now */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/40 to-slate-900 border border-cyan-500/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs uppercase tracking-wider mb-1">
                  <UploadCloud className="w-4 h-4" />
                  <span>Sinkronisasi Data</span>
                </div>
                <div className="text-xs text-slate-300 mb-3">
                  Upload paket kuis ({quizPackages.length} paket) & nilai ({students.length} peserta) ke Google Drive.
                </div>
              </div>

              <button
                type="button"
                onClick={handleSyncNow}
                disabled={isSyncing}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-500 hover:brightness-110 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
              </button>
            </div>

            {/* Action 2: Restore from Drive */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider mb-1">
                  <DownloadCloud className="w-4 h-4" />
                  <span>Pulihkan dari Drive</span>
                </div>
                <div className="text-xs text-slate-300 mb-3">
                  Muat bank soal yang tersimpan di Google Drive Anda ke dalam aplikasi ini.
                </div>
              </div>

              <button
                type="button"
                onClick={handleRestoreFromDrive}
                disabled={isRestoring}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-60"
              >
                <DownloadCloud className="w-3.5 h-3.5" />
                <span>{isRestoring ? 'Memulihkan...' : 'Muat Bank Soal'}</span>
              </button>
            </div>
          </div>

          {/* Sync Details / Success Box */}
          {syncResult && syncResult.success && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{syncResult.message}</span>
                </div>
                {syncResult.folderLink && (
                  <a
                    href={syncResult.folderLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-cyan-300 hover:underline text-[11px]"
                  >
                    <span>Buka Folder Drive</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Direct links to uploaded files */}
              {syncResult.fileLinks && Object.keys(syncResult.fileLinks).length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  {Object.entries(syncResult.fileLinks).map(([name, link]) => (
                    <a
                      key={name}
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-slate-900/90 border border-emerald-500/20 text-slate-200 hover:text-white hover:border-cyan-400 text-[11px] font-semibold flex items-center justify-between gap-1 transition-all"
                    >
                      <span className="truncate">{name}</span>
                      <ExternalLink className="w-3 h-3 text-cyan-400 shrink-0" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Files List Inside OCTOQUIZ-Data Folder */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FolderCheck className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white">Folder: Google Drive / OCTOQUIZ-Data</span>
              </div>
              <button
                onClick={loadDriveFiles}
                disabled={isLoadingFiles}
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                <span>Segarkan</span>
              </button>
            </div>

            {isLoadingFiles ? (
              <div className="py-6 text-center text-xs text-slate-400">
                <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1.5 text-cyan-400" />
                <span>Memeriksa file di Google Drive...</span>
              </div>
            ) : driveFiles.length > 0 ? (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {driveFiles.map((file) => (
                  <div
                    key={file.id}
                    className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-200 truncate">{file.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {file.modifiedTime ? new Date(file.modifiedTime).toLocaleString('id-ID') : 'Tersimpan'}
                        </div>
                      </div>
                    </div>
                    {file.webViewLink && (
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800/60 hover:bg-cyan-900 text-[11px] font-semibold flex items-center gap-1 shrink-0 transition-colors"
                      >
                        <span>Buka</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500">
                {googleUser 
                  ? 'Belum ada file di folder OCTOQUIZ-Data. Klik "Sinkronkan Sekarang" untuk mengunggah data pertama kali.' 
                  : 'Hubungkan akun Google Anda untuk melihat dan menyinkronkan file.'}
              </div>
            )}
          </div>

          {/* Auto-Sync Toggle & Sync Info */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/50 border border-white/5 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="font-bold text-white">Sinkronisasi Otomatis</div>
                <div className="text-[10px] text-slate-400">
                  {lastSyncTime ? `Sinkronisasi terakhir: ${lastSyncTime}` : 'Belum pernah disinkronkan'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleAutoSync}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                autoSyncEnabled 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                  : 'bg-slate-800 text-slate-400 border border-white/10'
              }`}
            >
              {autoSyncEnabled && <Check className="w-3.5 h-3.5" />}
              <span>{autoSyncEnabled ? 'Aktif' : 'Nonaktif'}</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/10 mt-4 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Data tersimpan privat di Google Drive pribadi Anda</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
