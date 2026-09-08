import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  LogIn, 
  LogOut, 
  Sparkles,
  Mail,
  UserCheck
} from 'lucide-react';
import { signInWithGoogle, logoutGoogle, GoogleUserProfile } from '../utils/googleAuth';
import { sound } from '../utils/audio';

interface HostAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isHostAuthenticated: boolean;
  onUnlockHost: () => void;
  onLockHost: () => void;
  hostPassword: string;
  onUpdateHostPassword: (newPassword: string) => void;
  googleUser: GoogleUserProfile | null;
  onGoogleSignInSuccess: (user: GoogleUserProfile) => void;
  onGoogleSignOut: () => void;
  onOpenDriveModal?: () => void;
}

export const HostAuthModal: React.FC<HostAuthModalProps> = ({
  isOpen,
  onClose,
  isHostAuthenticated,
  onUnlockHost,
  onLockHost,
  hostPassword,
  onUpdateHostPassword,
  googleUser,
  onGoogleSignInSuccess,
  onGoogleSignOut,
  onOpenDriveModal,
}) => {
  const [enteredPassword, setEnteredPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSigningInGoogle, setIsSigningInGoogle] = useState(false);

  // Change password sub-mode
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [oldPasswordInput, setOldPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [changeSuccessMessage, setChangeSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (enteredPassword.trim() === hostPassword.trim()) {
      sound.playCorrect();
      onUnlockHost();
      setEnteredPassword('');
    } else {
      sound.playIncorrect();
      setErrorMessage('Password Host salah! Silakan coba lagi atau masuk dengan Google.');
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSigningInGoogle(true);
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
      onUnlockHost();
    } catch (err: any) {
      console.error('Sign in error:', err);
      if (err?.code !== 'auth/popup-closed-by-user') {
        const messageByCode: Record<string, string> = {
          'auth/popup-blocked': 'Popup Google diblokir browser. Izinkan popup untuk localhost lalu coba lagi.',
          'auth/unauthorized-domain': 'Domain aplikasi belum diizinkan Firebase. Tambahkan localhost pada Authorized domains.',
          'auth/operation-not-allowed': 'Login Google belum diaktifkan di Firebase Authentication.',
          'auth/network-request-failed': 'Koneksi ke Google gagal. Periksa koneksi internet lalu coba lagi.',
        };
        setErrorMessage(messageByCode[err?.code] || 'Login Google gagal diproses. Pastikan popup diizinkan lalu coba lagi.');
      }
    } finally {
      setIsSigningInGoogle(false);
    }
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setChangeSuccessMessage('');

    if (oldPasswordInput.trim() !== hostPassword.trim()) {
      setErrorMessage('Password lama tidak cocok!');
      return;
    }
    if (newPasswordInput.length < 4) {
      setErrorMessage('Password baru minimal 4 karakter!');
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setErrorMessage('Konfirmasi password baru tidak cocok!');
      return;
    }

    onUpdateHostPassword(newPasswordInput.trim());
    sound.playCorrect();
    setChangeSuccessMessage('Password Host berhasil diperbarui!');
    setIsChangingPassword(false);
    setOldPasswordInput('');
    setNewPasswordInput('');
    setConfirmPasswordInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-x-hidden overflow-y-auto overscroll-contain bg-[#0b1322] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/60 text-slate-100">
        
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors"
          title="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 border border-cyan-400/40 flex items-center justify-center shadow-lg shadow-cyan-500/10">
            {isHostAuthenticated ? (
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
            ) : (
              <Lock className="w-8 h-8 text-cyan-400" />
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white font-display">
            {isHostAuthenticated ? 'Status Panel Host' : 'Autentikasi Panel Host'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            {isHostAuthenticated 
              ? 'Panel host terbuka. Anda memiliki hak akses penuh untuk mengelola kuis, proyektor, dan nilai.'
              : 'Masukkan password host atau masuk dengan akun Google (ID Email) Anda.'}
          </p>
        </div>

        {/* Messages */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {changeSuccessMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{changeSuccessMessage}</span>
          </div>
        )}

        {/* STATE 1: HOST ALREADY UNLOCKED */}
        {isHostAuthenticated ? (
          <div className="space-y-4">
            
            {/* User ID Card */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/20 flex items-center gap-3">
              {googleUser?.photoURL ? (
                <img 
                  src={googleUser.photoURL} 
                  alt={googleUser.displayName || 'Google User'} 
                  className="w-12 h-12 rounded-full border-2 border-emerald-400 object-cover shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-500 flex items-center justify-center text-slate-950 font-black text-lg shrink-0">
                  {googleUser?.displayName ? googleUser.displayName.charAt(0).toUpperCase() : 'H'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold uppercase tracking-wider">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Host Terverifikasi</span>
                </div>
                <div className="text-sm font-black text-white truncate">
                  {googleUser?.displayName || 'Host / Pengajar'}
                </div>
                <div className="text-xs text-cyan-300/80 font-mono truncate flex items-center gap-1 mt-0.5">
                  <Mail className="w-3 h-3 shrink-0" />
                  <span>{googleUser?.email || 'Login Lokal (Password Host)'}</span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {onOpenDriveModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenDriveModal();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Google Drive Sync</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsChangingPassword(!isChangingPassword)}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>{isChangingPassword ? 'Batal Ganti' : 'Ganti Password'}</span>
              </button>
            </div>

            {/* Change Password Sub-Form */}
            {isChangingPassword && (
              <form onSubmit={handleChangePasswordSubmit} className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-3 animate-fadeIn">
                <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Ubah Password Host</span>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Password Saat Ini</label>
                  <input
                    type="password"
                    value={oldPasswordInput}
                    onChange={(e) => setOldPasswordInput(e.target.value)}
                    required
                    placeholder="Masukkan password lama"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Password Baru (Min. 4 Karakter)</label>
                  <input
                    type="password"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    required
                    placeholder="Masukkan password baru"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Konfirmasi Password Baru</label>
                  <input
                    type="password"
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    required
                    placeholder="Ulangi password baru"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs hover:brightness-110 transition-all shadow-md"
                >
                  Simpan Password Baru
                </button>
              </form>
            )}

            {/* Lock / Sign Out Button */}
            <div className="pt-2 border-t border-white/10 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onLockHost();
                  onClose();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Lock className="w-3.5 h-3.5 text-rose-400" />
                <span>Kunci Panel Host</span>
              </button>

              {googleUser && (
                <button
                  type="button"
                  onClick={async () => {
                    sound.playClick();
                    await logoutGoogle();
                    onGoogleSignOut();
                  }}
                  className="py-2.5 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  title="Logout Akun Google"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout Google</span>
                </button>
              )}
            </div>

          </div>
        ) : (
          /* STATE 2: HOST IS LOCKED - REQUIRES PASSWORD OR GOOGLE */
          <div className="space-y-4">
            
            {/* Option A: Google Sign In Button (Host ID with Google Email) */}
            <div>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSigningInGoogle}
                className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
              >
                {/* Official Google G Logo SVG */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  <path fill="none" d="M0 0h48v48H0z"/>
                </svg>
                <span>{isSigningInGoogle ? 'Menghubungkan ke Google...' : 'Masuk dengan Google (ID Email Guru)'}</span>
              </button>
              <p className="text-[10px] text-center text-slate-400 mt-1.5">
                Menggunakan ID Email Google & sinkronisasi otomatis ke Google Drive
              </p>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                ATAU DENGAN PASSWORD HOST
              </span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Option B: Enter Host Password Form */}
            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Password Host</span>
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={enteredPassword}
                    onChange={(e) => setEnteredPassword(e.target.value)}
                    required
                    autoFocus
                    placeholder="Ketik password host..."
                    className="w-full bg-slate-900/90 border border-cyan-500/30 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 pr-11 tracking-wider font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-500 hover:brightness-110 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                <Unlock className="w-4 h-4" />
                <span>Buka Panel Host</span>
              </button>
            </form>

            <div className="text-[11px] text-center text-slate-500 pt-1">
              <span>Keamanan Panel: Khusus Pengajar / Host Kuis</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
