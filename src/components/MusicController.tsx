import React, { useState, useEffect } from 'react';
import { 
  Music, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Sparkles, 
  Radio, 
  Disc3, 
  Sliders, 
  X,
  ChevronDown,
  Check
} from 'lucide-react';
import { MusicTrack, MusicTrackId } from '../types';
import { MUSIC_TRACKS, sound } from '../utils/audio';

interface MusicControllerProps {
  isBgmPlaying: boolean;
  onToggleBgm: () => void;
  currentTrackId: MusicTrackId;
  onSelectTrack: (trackId: MusicTrackId) => void;
  bgmVolume: number;
  onChangeVolume: (vol: number) => void;
  isCompact?: boolean; // For Navbar dropdown
}

export const MusicController: React.FC<MusicControllerProps> = ({
  isBgmPlaying,
  onToggleBgm,
  currentTrackId,
  onSelectTrack,
  bgmVolume,
  onChangeVolume,
  isCompact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const currentTrack = MUSIC_TRACKS.find(t => t.id === currentTrackId) || MUSIC_TRACKS[0];

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#music-controller-container')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (isCompact) {
    return (
      <div id="music-controller-container" className="relative">
        <button
          onClick={() => {
            sound.playClick();
            setIsOpen(!isOpen);
          }}
          className={`relative p-2 rounded-xl text-xs font-semibold border transition-all ${
            isBgmPlaying
              ? 'bg-cyan-500/20 border-cyan-400/80 text-cyan-300 shadow-md shadow-cyan-500/20'
              : 'bg-slate-800/80 border-white/10 text-slate-400 hover:text-slate-200'
          }`}
          title={`Musik: ${currentTrack.name}`}
          aria-label="Buka pilihan musik"
        >
          <div className="relative flex items-center justify-center">
            <Music className={`w-3.5 h-3.5 ${isBgmPlaying ? 'animate-bounce text-cyan-300' : ''}`} />
            {isBgmPlaying && (
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
            )}
          </div>
          <ChevronDown className={`w-3 h-3 text-cyan-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-[#0c1424]/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-4 shadow-2xl z-50 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider text-cyan-300 font-display">
                  IRAMA NUSANTARA • Ceria & Semangat
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Play/Pause Master Switch */}
            <div className="flex items-center justify-between bg-slate-900/90 border border-white/5 p-2.5 rounded-xl mb-3">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => {
                    sound.playClick();
                    onToggleBgm();
                  }}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-lg ${
                    isBgmPlaying
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/20 hover:scale-105'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-cyan-500/20 hover:scale-105'
                  }`}
                >
                  {isBgmPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <div>
                  <div className="text-xs font-bold text-white">
                    {isBgmPlaying ? 'Irama Berputar' : 'Irama Dijeda'}
                  </div>
                  <div className="text-[10px] text-cyan-300 font-mono">
                    {currentTrack.bpm} BPM • {currentTrack.genre}
                  </div>
                </div>
              </div>

              {/* Animated Mini Equalizer */}
              {isBgmPlaying ? (
                <div className="flex items-end gap-0.5 h-5 px-1">
                  <span className="w-1 bg-emerald-400 rounded-full animate-[bounce_0.8s_infinite_100ms] h-full" />
                  <span className="w-1 bg-cyan-400 rounded-full animate-[bounce_0.8s_infinite_200ms] h-3" />
                  <span className="w-1 bg-amber-400 rounded-full animate-[bounce_0.8s_infinite_300ms] h-5" />
                  <span className="w-1 bg-teal-400 rounded-full animate-[bounce_0.8s_infinite_150ms] h-4" />
                </div>
              ) : (
                <div className="text-[10px] text-slate-500 font-mono">OFF</div>
              )}
            </div>

            {/* Track Selection List */}
            <div className="space-y-1.5 mb-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                Pilih Irama Ceria & Semangat (Akustik):
              </div>
              {MUSIC_TRACKS.map(track => {
                const isSelected = track.id === currentTrackId;
                return (
                  <button
                    key={track.id}
                    onClick={() => {
                      sound.playClick();
                      onSelectTrack(track.id);
                      if (!isBgmPlaying) onToggleBgm();
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-400/80 text-white shadow-md shadow-cyan-500/10'
                        : 'bg-slate-900/50 border-white/5 text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xl shrink-0">{track.icon}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate flex items-center gap-1.5">
                          <span>{track.name}</span>
                          <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-300 font-mono font-normal">
                            {track.bpm} BPM
                          </span>
                        </div>
                        <div className="text-[10px] text-cyan-300/80 truncate">
                          {track.genre}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="p-1 rounded-full bg-cyan-500 text-black">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Volume Slider */}
            <div className="bg-slate-900/70 border border-white/5 p-2.5 rounded-xl">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Volume Musik</span>
                </span>
                <span className="text-cyan-300 font-mono font-bold">
                  {Math.round(bgmVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={bgmVolume}
                onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Retained for compatibility with existing callers; the app uses compact mode in the navbar.
  return (
    <div className="bg-gradient-to-r from-[#0d1728] via-[#0f1d35] to-[#0a1424] border border-cyan-500/30 rounded-2xl p-4 shadow-xl shadow-cyan-950/40 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
        
        {/* Left: Master Play / Now Playing Status */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onToggleBgm();
            }}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg shrink-0 ${
              isBgmPlaying
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/30 hover:scale-105 ring-2 ring-emerald-400/40'
                : 'bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-500 text-slate-950 font-black shadow-cyan-500/30 hover:scale-105'
            }`}
            title={isBgmPlaying ? 'Jeda Musik' : 'Putar Musik'}
          >
            {isBgmPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-cyan-400 font-display flex items-center gap-1.5">
                <Disc3 className={`w-3.5 h-3.5 ${isBgmPlaying ? 'animate-spin text-emerald-300' : 'text-slate-500'}`} />
                IRAMA AKUSTIK NUSANTARA • CERIA, FUN & SEMANGAT
              </span>
              {isBgmPlaying && (
                <span className="px-2 py-0.2 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                  MEMUTAR
                </span>
              )}
            </div>
            
            <div className="text-base font-extrabold text-white flex items-center gap-2">
              <span>{currentTrack.icon}</span>
              <span>{currentTrack.name}</span>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-lg bg-cyan-950/80 text-cyan-300 border border-cyan-800/40">
                {currentTrack.bpm} BPM
              </span>
            </div>

            <p className="text-[11px] text-slate-400 max-w-sm line-clamp-1">
              {currentTrack.description}
            </p>
          </div>
        </div>

        {/* Center: 3 Modern Tracks Selector Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {MUSIC_TRACKS.map(track => {
            const isSelected = track.id === currentTrackId;
            return (
              <button
                key={track.id}
                onClick={() => {
                  sound.playClick();
                  onSelectTrack(track.id);
                  if (!isBgmPlaying) onToggleBgm();
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                  isSelected
                    ? `bg-gradient-to-r ${track.accentColor} text-slate-950 font-black border-transparent shadow-lg shadow-cyan-500/20 scale-[1.02]`
                    : 'bg-slate-900/80 border-white/10 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span className="text-base">{track.icon}</span>
                <div className="text-left">
                  <div className="leading-tight">{track.name}</div>
                  <div className={`text-[9px] font-mono leading-tight ${isSelected ? 'text-slate-900 font-bold opacity-80' : 'text-slate-500'}`}>
                    {track.genre}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Equalizer & Volume Slider */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-end border-t lg:border-t-0 border-white/10 pt-2 lg:pt-0">
          
          {/* Animated Equalizer */}
          <div className="flex items-end gap-1 h-6 px-2 py-0.5 rounded-lg bg-slate-950/60 border border-white/5">
            <span className={`w-1 bg-cyan-400 rounded-full transition-all ${isBgmPlaying ? 'animate-[bounce_0.5s_infinite_100ms] h-5' : 'h-1.5'}`} />
            <span className={`w-1 bg-teal-400 rounded-full transition-all ${isBgmPlaying ? 'animate-[bounce_0.5s_infinite_250ms] h-3.5' : 'h-1.5'}`} />
            <span className={`w-1 bg-purple-400 rounded-full transition-all ${isBgmPlaying ? 'animate-[bounce_0.5s_infinite_180ms] h-6' : 'h-1.5'}`} />
            <span className={`w-1 bg-rose-400 rounded-full transition-all ${isBgmPlaying ? 'animate-[bounce_0.5s_infinite_300ms] h-4' : 'h-1.5'}`} />
            <span className={`w-1 bg-amber-400 rounded-full transition-all ${isBgmPlaying ? 'animate-[bounce_0.5s_infinite_120ms] h-5' : 'h-1.5'}`} />
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2 bg-slate-950/60 border border-white/5 px-3 py-1.5 rounded-xl">
            <button
              onClick={() => onChangeVolume(bgmVolume > 0 ? 0 : 0.55)}
              className="text-slate-400 hover:text-cyan-300"
              title={bgmVolume === 0 ? 'Unmute' : 'Mute'}
            >
              {bgmVolume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={bgmVolume}
              onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
              className="w-20 sm:w-24 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              title={`Volume: ${Math.round(bgmVolume * 100)}%`}
            />
            <span className="text-[11px] font-mono text-cyan-300 font-bold min-w-[32px] text-right">
              {Math.round(bgmVolume * 100)}%
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
