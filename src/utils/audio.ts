import { MusicTrack, MusicTrackId } from '../types';

export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'quiz-party',
    name: 'Quiz Party Groove',
    genre: 'Game Show Pop, Catchy & Fun',
    bpm: 118,
    icon: '🎉',
    description: 'Groove game-show yang catchy dengan hook cerah, aksen tepuk tangan, dan energi pesta kuis.',
    accentColor: 'from-cyan-400 to-violet-500',
  },
  {
    id: 'lofi-study',
    name: 'Lo-fi Quiz Focus',
    genre: 'Lo-fi Beats, Calm & Focused',
    bpm: 92,
    icon: '🎧',
    description: 'Beat santai dan hangat untuk sesi berpikir, membaca soal, dan menjaga fokus kelas.',
    accentColor: 'from-sky-400 to-indigo-500',
  },
  {
    id: 'neon-puzzle',
    name: 'Neon Puzzle Beat',
    genre: 'Synthwave Puzzle, Bright & Bouncy',
    bpm: 110,
    icon: '🧩',
    description: 'Groove synth cerah dan melompat untuk suasana puzzle game yang modern dan fun.',
    accentColor: 'from-fuchsia-400 to-cyan-400',
  },
  {
    id: 'victory-fanfare',
    name: 'Victory Fanfare',
    genre: 'Game Show, Triumphant & Bright',
    bpm: 128,
    icon: '🏅',
    description: 'Nada kemenangan penuh energi untuk jawaban benar, streak, dan babak penentuan.',
    accentColor: 'from-amber-300 to-orange-500',
  },
  {
    id: 'chill-game',
    name: 'Chill Game Lounge',
    genre: 'Chillhop, Playful & Warm',
    bpm: 100,
    icon: '🎮',
    description: 'Groove chill yang ringan untuk lobby, jeda kuis, dan suasana kelas yang santai.',
    accentColor: 'from-emerald-300 to-teal-500',
  },
];

/**
 * Procedural Web Audio Sound & Cheerful Indonesian Acoustic Music Synthesizer.
 * Authentic acoustic modeling of Kolintang, Angklung, Bonang Dolanan,
 * Suling Ceria, Woodblock, Shaker, and Bouncy Acoustic Bass.
 * 100% offline & zero external audio files required.
 */
class SoundEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  public isBgmPlaying: boolean = false;
  public currentTrackId: MusicTrackId = 'quiz-party';
  public bgmVolume: number = 0.55; // 0.0 to 1.0

  private bgmInterval: number | null = null;
  private bgmStep: number = 0;
  private noiseBuffer: AudioBuffer | null = null;

  constructor() {
    // Load saved music track & volume if available in browser
    if (typeof window !== 'undefined') {
      try {
        const savedTrack = localStorage.getItem('octoquiz_music_track');
        if (savedTrack && MUSIC_TRACKS.some(t => t.id === savedTrack)) {
          this.currentTrackId = savedTrack as MusicTrackId;
        } else {
          // Default fallback to first cheerful track
          this.currentTrackId = 'quiz-party';
        }
        const savedVol = localStorage.getItem('octoquiz_music_volume');
        if (savedVol) {
          const v = parseFloat(savedVol);
          if (!isNaN(v) && v >= 0 && v <= 1) {
            this.bgmVolume = v;
          }
        }
      } catch {
        // ignore
      }
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (this.ctx && !this.noiseBuffer) {
      // 1-second white noise buffer for acoustic shakers & woodblocks
      const bufferSize = this.ctx.sampleRate;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      this.noiseBuffer = buffer;
    }
  }

  /* =========================================================================
   * SOUND EFFECTS (Clicks, Correct, Wrong, Fanfare, Gong, Ticks)
   * ========================================================================= */

  public playClick() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch {
      // ignore
    }
  }

  public playCorrect() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Happy energetic kolintang arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0.2, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.26);
      });
    } catch {
      // ignore
    }
  }

  public playIncorrect() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(140, now + 0.3);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.36);
    } catch {
      // ignore
    }
  }

  public playTick() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // ignore
    }
  }

  public playFanfare() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880, 1108.73];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0.25, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.55);
      });
    } catch {
      // ignore
    }
  }

  public playGong() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      this.triggerGongAgeng(this.ctx.currentTime, 1.2);
    } catch {
      // ignore
    }
  }

  /* =========================================================================
   * CHEERFUL ACOUSTIC INSTRUMENT SYNTHESIZERS (NO BEAT / NO DJ)
   * ========================================================================= */

  /**
   * Kolintang / Gambang Kayu (Crisp wooden xylophone bar strike)
   * Lively, bright, cheerful fundamental with gentle wooden transient.
   */
  private triggerKolintang(now: number, freq: number, duration = 0.26, vol = 1.0) {
    if (!this.ctx) return;
    // Fundamental tone
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // Woody knock harmonic
    const oscWood = this.ctx.createOscillator();
    const gainWood = this.ctx.createGain();
    oscWood.type = 'triangle';
    oscWood.frequency.setValueAtTime(freq * 2.76, now);

    const peak = 0.14 * this.bgmVolume * vol;
    gain.gain.setValueAtTime(peak, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    gainWood.gain.setValueAtTime(peak * 0.35, now);
    gainWood.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    oscWood.connect(gainWood);
    gain.connect(this.ctx.destination);
    gainWood.connect(this.ctx.destination);

    osc.start(now);
    oscWood.start(now);
    osc.stop(now + duration + 0.02);
    oscWood.stop(now + 0.06);
  }

  /**
   * Angklung (Shaken tuned bamboo rattle with natural flutter)
   */
  private triggerAngklung(now: number, freq: number, duration = 0.28, vol = 1.0) {
    if (!this.ctx) return;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    // Octave higher tube
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, now);

    // 12 Hz amplitude flutter tremolo to simulate bamboo shaking
    const tremolo = this.ctx.createOscillator();
    const tremGain = this.ctx.createGain();
    tremolo.type = 'sine';
    tremolo.frequency.setValueAtTime(12, now);
    tremGain.gain.setValueAtTime(0.04, now);
    tremolo.connect(gain.gain);
    tremolo.start(now);
    tremolo.stop(now + duration);

    const peak = 0.12 * this.bgmVolume * vol;
    gain.gain.setValueAtTime(peak * 0.5, now);
    gain.gain.linearRampToValueAtTime(peak, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration + 0.02);
    osc2.stop(now + duration + 0.02);
  }

  /**
   * Bonang Dolanan (Playful ringing bronze kettle gongs)
   * Joyful, bright Javanese traditional play motif tone.
   */
  private triggerBonangDolanan(now: number, freq: number, duration = 0.45, vol = 1.0) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const overtone = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const otGain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    overtone.type = 'sine';
    overtone.frequency.setValueAtTime(freq * 2.76, now);

    const peak = 0.13 * this.bgmVolume * vol;
    gain.gain.setValueAtTime(peak, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    otGain.gain.setValueAtTime(peak * 0.28, now);
    otGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    overtone.connect(otGain);
    gain.connect(this.ctx.destination);
    otGain.connect(this.ctx.destination);

    osc.start(now);
    overtone.start(now);
    osc.stop(now + duration + 0.02);
    overtone.stop(now + 0.14);
  }

  /**
   * Suling Ceria (Bright, bouncy, staccato bamboo flute melody)
   */
  private triggerSulingCeria(now: number, freq: number, duration = 0.22, vol = 1.0) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1600, now);

    const peak = 0.13 * this.bgmVolume * vol;
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(peak, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  /**
   * Plucked Ukulele / Dawai Ceria (Upbeat acoustic rhythmic strum)
   */
  private triggerUkuleleStrum(now: number, freqs: number[], vol = 1.0) {
    if (!this.ctx) return;
    freqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.012);

      const peak = 0.06 * this.bgmVolume * vol;
      gain.gain.setValueAtTime(peak, now + idx * 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.012 + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.012);
      osc.stop(now + idx * 0.012 + 0.18);
    });
  }

  /**
   * Bouncy Acoustic Bass (Plucked Upright / Kontrabas Akustik Pizzicato)
   * Hopping, toe-tapping root-fifth progression, cheerful and completely organic.
   */
  private triggerAcousticBouncyBass(now: number, freq: number, duration = 0.16, vol = 1.0) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(260, now);

    const peak = 0.15 * this.bgmVolume * vol;
    gain.gain.setValueAtTime(peak, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  /**
   * Woodblock / Kenthongan Kayu (Organic, pleasant acoustic click)
   */
  private triggerWoodBlock(now: number, isHigh = false, vol = 1.0) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const startFreq = isHigh ? 820 : 540;
    const endFreq = isHigh ? 520 : 340;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.035);

    const peak = (isHigh ? 0.09 : 0.08) * this.bgmVolume * vol;
    gain.gain.setValueAtTime(peak, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.045);
  }

  /**
   * Shaker / Maracas (Light acoustic shaker groove on off-beats)
   */
  private triggerShaker(now: number, vol = 1.0) {
    if (!this.ctx || !this.noiseBuffer) return;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(6500, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.035 * this.bgmVolume * vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + 0.04);
  }

  /**
   * Triangle / Genta Kecil (Cheerful high metallic chime on periodic downbeats)
   */
  private triggerTriangle(now: number, vol = 1.0) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2960, now);

    const peak = 0.04 * this.bgmVolume * vol;
    gain.gain.setValueAtTime(peak, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.36);
  }

  /**
   * Kendang Tepuk Santai (Light acoustic hand tap - NOT a club kick)
   */
  private triggerKendangTepuk(now: number, type: 'dung' | 'tak' | 'tung', vol = 1.0) {
    if (!this.ctx) return;
    if (type === 'dung') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(95, now);
      osc.frequency.exponentialRampToValueAtTime(58, now + 0.14);

      gain.gain.setValueAtTime(0.18 * this.bgmVolume * vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === 'tak') {
      this.triggerWoodBlock(now, true, vol * 1.1);
    } else {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(175, now);
      osc.frequency.exponentialRampToValueAtTime(135, now + 0.08);

      gain.gain.setValueAtTime(0.12 * this.bgmVolume * vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    }
  }

  /**
   * Gong Ageng (Warm sacred bronze ring at phrase landmark)
   */
  private triggerGongAgeng(now: number, vol = 1.0) {
    if (!this.ctx) return;
    const partials = [
      { freq: 65.41, amp: 0.16, dur: 2.2 },
      { freq: 130.81, amp: 0.12, dur: 1.8 },
      { freq: 196.00, amp: 0.08, dur: 1.4 },
    ];
    partials.forEach(p => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(p.freq, now);

      gain.gain.setValueAtTime(p.amp * this.bgmVolume * vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + p.dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + p.dur + 0.05);
    });
  }

  /* =========================================================================
  * 5 CHEERFUL, SPIRITED & FUN MULTI-TRACK STEP SEQUENCERS
   * ========================================================================= */

  public startBGM(trackId?: MusicTrackId) {
    if (trackId) {
      this.currentTrackId = trackId;
    }
    this.stopBGM();
    this.initCtx();
    this.isBgmPlaying = true;
    this.bgmStep = 0;

    // Save to localStorage
    try {
      localStorage.setItem('octoquiz_music_track', this.currentTrackId);
    } catch {
      // ignore
    }

    const currentTrack = MUSIC_TRACKS.find(t => t.id === this.currentTrackId) || MUSIC_TRACKS[0];
    // 16th note step duration in ms: (60 / BPM / 4) * 1000
    const stepIntervalMs = Math.round((60 / currentTrack.bpm / 4) * 1000);

    this.bgmInterval = window.setInterval(() => {
      if (!this.isBgmPlaying || this.isMuted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const step = this.bgmStep % 32; // 2 measures of 16 steps

        if (this.currentTrackId === 'quiz-party') {
          this.stepQuizParty(step, now);
        } else if (this.currentTrackId === 'lofi-study') {
          this.stepLofiStudy(step, now);
        } else if (this.currentTrackId === 'neon-puzzle') {
          this.stepNeonPuzzle(step, now);
        } else if (this.currentTrackId === 'victory-fanfare') {
          this.stepVictoryFanfare(step, now);
        } else if (this.currentTrackId === 'chill-game') {
          this.stepChillGame(step, now);
        }

        this.bgmStep++;
      } catch {
        // ignore
      }
    }, stepIntervalMs);
  }

  /**
   * Track 1: Kolintang & Angklung Ceria (108 BPM • Ceria, Semangat & Fun)
   * Bouncy wooden kolintang arpeggio, angklung chord rattles, hopping acoustic bass,
   * woodblock taps & light shaker. No EDM/DJ beat!
   */
  private stepKolintangAngklung(step: number, now: number) {
    // Triangle bell on step 0
    if (step === 0) {
      this.triggerTriangle(now, 1.2);
    }

    // Light acoustic percussion groove (woodblock + shaker + soft kendang tap)
    // Hopping shaker on every odd step
    if (step % 2 === 1) {
      this.triggerShaker(now, step % 4 === 1 ? 1.0 : 0.6);
    }

    // Woodblock playful alternation
    if (step % 4 === 2) {
      this.triggerWoodBlock(now, true, 0.9); // High tap
    } else if (step === 7 || step === 15 || step === 23 || step === 31) {
      this.triggerWoodBlock(now, false, 0.8); // Low tap
    }

    // Soft warm kendang tap on downbeats (round, acoustic, NOT a dance kick)
    if (step === 0 || step === 8 || step === 16 || step === 24) {
      this.triggerKendangTepuk(now, 'dung', 0.85);
    }
    if (step === 4 || step === 12 || step === 20 || step === 28) {
      this.triggerKendangTepuk(now, 'tung', 0.75);
    }

    // Bouncy Plucked Upright Bass (C -> G -> Am -> F progression)
    // Steps 0-7: C major (C2: 65.41, G2: 98.0)
    // Steps 8-15: G major (G2: 98.0, D2: 73.42)
    // Steps 16-23: Am (A2: 110.0, E2: 82.41)
    // Steps 24-31: F major (F2: 87.31, C3: 130.81)
    const bassMap: Record<number, number> = {
      0: 65.41,   // C
      2: 98.00,   // G
      4: 65.41,   // C
      6: 98.00,   // G
      8: 98.00,   // G
      10: 73.42,  // D
      12: 98.00,  // G
      14: 73.42,  // D
      16: 110.00, // A
      18: 82.41,  // E
      20: 110.00, // A
      22: 82.41,  // E
      24: 87.31,  // F
      26: 130.81, // C
      28: 87.31,  // F
      30: 98.00,  // G (pickup)
    };
    if (bassMap[step]) {
      this.triggerAcousticBouncyBass(now, bassMap[step], 0.14, 0.95);
    }

    // Angklung chord tremolo bursts on upbeat accents (steps 2, 6, 10, 14, 18, 22, 26, 30)
    if (step === 2 || step === 6) {
      this.triggerAngklung(now, 523.25, 0.18, 0.7); // C5
    } else if (step === 10 || step === 14) {
      this.triggerAngklung(now, 587.33, 0.18, 0.7); // D5
    } else if (step === 18 || step === 22) {
      this.triggerAngklung(now, 659.25, 0.18, 0.7); // E5
    } else if (step === 26 || step === 30) {
      this.triggerAngklung(now, 698.46, 0.18, 0.7); // F5
    }

    // Melodic Bouncy Kolintang Minahasa (Playful, cheerful, uplifting run!)
    // C5=523.25, D5=587.33, E5=659.25, G5=783.99, A5=880.00, C6=1046.50
    const kolintangNotes: Record<number, number> = {
      0: 523.25,  // C5
      1: 659.25,  // E5
      2: 783.99,  // G5
      3: 1046.50, // C6
      4: 783.99,  // G5
      5: 659.25,  // E5
      6: 783.99,  // G5
      7: 880.00,  // A5
      8: 587.33,  // D5
      9: 783.99,  // G5
      10: 880.00, // A5
      11: 783.99, // G5
      12: 587.33, // D5
      13: 493.88, // B4
      14: 587.33, // D5
      15: 659.25, // E5
      16: 659.25, // E5
      17: 880.00, // A5
      18: 1046.50,// C6
      19: 880.00, // A5
      20: 659.25, // E5
      21: 523.25, // C5
      22: 659.25, // E5
      23: 783.99, // G5
      24: 698.46, // F5
      25: 783.99, // G5
      26: 880.00, // A5
      27: 1046.50,// C6
      28: 880.00, // A5
      29: 783.99, // G5
      30: 659.25, // E5
      31: 587.33, // D5
    };

    if (kolintangNotes[step]) {
      this.triggerKolintang(now, kolintangNotes[step], 0.22, 0.9);
    }
  }

  /**
   * Track 2: Gamelan Dolanan Riang (106 BPM • Semangat, Playful, Ceria & Berirama)
   * Lagu dolanan tradisional Jawa (Cublak-cublak Suweng / Sluku-sluku Bathok spirit),
   * bonang barung bersahut-sahutan riang, kendang batangan gesit & lonceng perunggu ceria.
   */
  private stepGamelanDolanan(step: number, now: number) {
    // Gong Ageng on phrase start (step 0 and 16)
    if (step === 0 || step === 16) {
      this.triggerGongAgeng(now, 0.9);
    }

    // Triangle bell accent on step 0 and 16
    if (step === 0 || step === 16) {
      this.triggerTriangle(now, 1.1);
    }

    // Kendang Batangan (Lively, cheerful, lightweight acoustic folk drums)
    if (step === 0 || step === 6 || step === 12 || step === 16 || step === 22 || step === 28) {
      this.triggerKendangTepuk(now, 'dung', 0.85);
    }
    if (step === 4 || step === 10 || step === 14 || step === 20 || step === 26 || step === 30) {
      this.triggerKendangTepuk(now, 'tung', 0.8);
    }
    if (step % 2 === 1) {
      this.triggerKendangTepuk(now, 'tak', 0.7);
    }

    // Shaker groove
    if (step % 4 === 2) {
      this.triggerShaker(now, 0.8);
    }

    // Saron Pelog Playful Motif (Slendro/Pelog riang: 1-2-3-5-6 / C4, D4, E4, G4, A4)
    // Ceria, melompat-lompat riang seperti anak-anak bermain dolanan
    const dolananMelody: Record<number, number> = {
      0: 392.00,  // G4 (Lu)
      2: 440.00,  // A4 (Ma)
      4: 523.25,  // C5 (Nem)
      6: 440.00,  // A4
      8: 392.00,  // G4
      10: 329.63, // E4
      12: 293.66, // D4
      14: 329.63, // E4
      16: 392.00, // G4
      18: 523.25, // C5
      20: 587.33, // D5
      22: 523.25, // C5
      24: 440.00, // A4
      26: 392.00, // G4
      28: 329.63, // E4
      30: 293.66, // D4
    };

    if (dolananMelody[step]) {
      this.triggerBonangDolanan(now, dolananMelody[step], 0.38, 0.95);
    }

    // Bonang Barung Imbal (Playful interlocking high bells on odd steps)
    const bonangImbal: Record<number, number> = {
      1: 783.99,  // G5
      3: 880.00,  // A5
      5: 1046.50, // C6
      7: 880.00,  // A5
      9: 783.99,  // G5
      11: 659.25, // E5
      13: 587.33, // D5
      15: 659.25, // E5
      17: 783.99, // G5
      19: 1046.50,// C6
      21: 1174.66,// D6
      23: 1046.50,// C6
      25: 880.00, // A5
      27: 783.99, // G5
      29: 659.25, // E5
      31: 783.99, // G5
    };

    if (bonangImbal[step]) {
      this.triggerBonangDolanan(now, bonangImbal[step], 0.22, 0.7);
    }
  }

  /**
  * Track 3: Quiz Party Groove (118 BPM • Catchy, Playful & Joyful)
  * Original game-show groove with bright hooks, offbeat chords and celebratory accents.
   */
  private stepQuizParty(step: number, now: number) {
    // Triangle chime at start
    if (step === 0) {
      this.triggerTriangle(now, 1.0);
    }

    // Shaker groove on all 16ths
    this.triggerShaker(now, step % 4 === 2 ? 0.9 : 0.45);

    // Woodblock organic rhythm
    if (step === 4 || step === 12 || step === 20 || step === 28) {
      this.triggerWoodBlock(now, true, 0.85);
    } else if (step === 7 || step === 15 || step === 23 || step === 31) {
      this.triggerWoodBlock(now, false, 0.75);
    }

    // Soft kendang tap on downbeats
    if (step === 0 || step === 8 || step === 16 || step === 24) {
      this.triggerKendangTepuk(now, 'dung', 0.8);
    }

    // Upbeat game-show chord strums on off-beats
    // C chord (C4, E4, G4), F chord (C4, F4, A4), G chord (B3, D4, G4)
    if (step === 2 || step === 6 || step === 18 || step === 22) {
      this.triggerUkuleleStrum(now, [261.63, 329.63, 392.00], 0.75); // C chord
    } else if (step === 10 || step === 14) {
      this.triggerUkuleleStrum(now, [261.63, 349.23, 440.00], 0.75); // F chord
    } else if (step === 26 || step === 30) {
      this.triggerUkuleleStrum(now, [246.94, 293.66, 392.00], 0.75); // G chord
    }

    // Bouncy party bass
    const partyBass: Record<number, number> = {
      0: 65.41,  // C2
      4: 98.00,  // G2
      8: 87.31,  // F2
      12: 130.81,// C3
      16: 65.41, // C2
      20: 98.00, // G2
      24: 98.00, // G2
      28: 73.42, // D2
    };
    if (partyBass[step]) {
      this.triggerAcousticBouncyBass(now, partyBass[step], 0.15, 0.9);
    }

    // Bright quiz-show hook
    const marimbaHook: Record<number, number> = {
      0: 523.25,  // C5
      2: 659.25,  // E5
      4: 783.99,  // G5
      6: 659.25,  // E5
      8: 698.46,  // F5
      10: 880.00, // A5
      12: 698.46, // F5
      14: 659.25, // E5
      16: 523.25, // C5
      18: 659.25, // E5
      20: 783.99, // G5
      22: 1046.50,// C6
      24: 987.77, // B5
      26: 783.99, // G5
      28: 880.00, // A5
      30: 987.77, // B5
    };

    if (marimbaHook[step]) {
      this.triggerKolintang(now, marimbaHook[step], 0.24, 0.9);
    }

    // Suling Ceria Happy Chirps (Sunny flute answering on steps 7, 15, 23)
    const fluteChirps: Record<number, number> = {
      7: 1046.50, // C6
      15: 880.00, // A5
      23: 1174.66,// D6
      31: 1046.50,// C6
    };
    if (fluteChirps[step]) {
      this.triggerSulingCeria(now, fluteChirps[step], 0.20, 0.9);
    }
  }

  private stepArcadeQuiz(step: number, now: number) {
    if (step === 0 || step === 16) {
      this.triggerTriangle(now, 0.9);
    }
    if (step % 2 === 1) {
      this.triggerShaker(now, 0.65);
    }
    if (step % 4 === 0 || step === 14 || step === 30) {
      this.triggerWoodBlock(now, step % 8 === 0, 0.8);
    }

    const arcadeBass: Record<number, number> = {
      0: 65.41, 4: 65.41, 8: 73.42, 12: 73.42,
      16: 82.41, 20: 82.41, 24: 98.00, 28: 98.00,
    };
    if (arcadeBass[step]) {
      this.triggerAcousticBouncyBass(now, arcadeBass[step], 0.12, 0.85);
    }

    const arcadeMelody: Record<number, number> = {
      0: 1046.50, 2: 1318.51, 4: 1567.98, 6: 1318.51,
      8: 1174.66, 10: 1567.98, 12: 1760.00, 14: 1567.98,
      16: 1046.50, 18: 1318.51, 20: 1567.98, 22: 2093.00,
      24: 1760.00, 26: 1567.98, 28: 1318.51, 30: 1174.66,
    };
    if (arcadeMelody[step]) {
      this.triggerKolintang(now, arcadeMelody[step], 0.14, 0.8);
    }
  }

  private stepFinalBoss(step: number, now: number) {
    if (step === 0 || step === 16) {
      this.triggerGongAgeng(now, 0.55);
      this.triggerTriangle(now, 0.75);
    }
    if (step === 0 || step === 8 || step === 16 || step === 24) {
      this.triggerKendangTepuk(now, 'dung', 0.85);
    }
    if (step === 4 || step === 12 || step === 20 || step === 28) {
      this.triggerKendangTepuk(now, 'tung', 0.75);
    }
    if (step % 2 === 1) {
      this.triggerShaker(now, 0.5);
    }

    const powerBass: Record<number, number> = {
      0: 55.00, 4: 55.00, 8: 65.41, 12: 65.41,
      16: 73.42, 20: 73.42, 24: 82.41, 28: 98.00,
    };
    if (powerBass[step]) {
      this.triggerAcousticBouncyBass(now, powerBass[step], 0.18, 1.0);
    }

    const heroMotif: Record<number, number> = {
      0: 392.00, 2: 523.25, 4: 659.25, 6: 783.99,
      8: 523.25, 10: 659.25, 12: 783.99, 14: 1046.50,
      16: 392.00, 18: 523.25, 20: 659.25, 22: 880.00,
      24: 783.99, 26: 659.25, 28: 523.25, 30: 392.00,
    };
    if (heroMotif[step]) {
      this.triggerBonangDolanan(now, heroMotif[step], 0.26, 0.85);
    }
  }

  private stepLofiStudy(step: number, now: number) {
    if (step % 4 === 0) {
      this.triggerShaker(now, 0.25);
    }
    if (step === 0 || step === 16) {
      this.triggerTriangle(now, 0.35);
    }

    const lofiBass: Record<number, number> = {
      0: 65.41, 8: 73.42, 16: 82.41, 24: 73.42,
    };
    if (lofiBass[step]) {
      this.triggerAcousticBouncyBass(now, lofiBass[step], 0.3, 0.5);
    }

    const lofiNotes: Record<number, number> = {
      2: 523.25, 6: 659.25, 10: 587.33, 14: 783.99,
      18: 523.25, 22: 698.46, 26: 659.25, 30: 587.33,
    };
    if (lofiNotes[step]) {
      this.triggerBonangDolanan(now, lofiNotes[step], 0.5, 0.35);
    }
  }

  private stepNeonPuzzle(step: number, now: number) {
    if (step === 0 || step === 16) {
      this.triggerTriangle(now, 0.75);
    }
    if (step % 2 === 1) {
      this.triggerShaker(now, 0.5);
    }
    if (step % 8 === 4) {
      this.triggerWoodBlock(now, true, 0.65);
    }

    const neonNotes: Record<number, number> = {
      0: 261.63, 2: 329.63, 4: 392.00, 6: 523.25,
      8: 329.63, 10: 392.00, 12: 523.25, 14: 659.25,
      16: 293.66, 18: 349.23, 20: 440.00, 22: 587.33,
      24: 349.23, 26: 440.00, 28: 587.33, 30: 698.46,
    };
    if (neonNotes[step]) {
      this.triggerKolintang(now, neonNotes[step], 0.16, 0.7);
    }
  }

  private stepVictoryFanfare(step: number, now: number) {
    if (step === 0 || step === 16) {
      this.triggerGongAgeng(now, 0.65);
      this.triggerTriangle(now, 0.95);
    }
    if (step === 4 || step === 12 || step === 20 || step === 28) {
      this.triggerKendangTepuk(now, 'tung', 0.8);
    }
    if (step % 2 === 1) {
      this.triggerShaker(now, 0.65);
    }

    const fanfareNotes: Record<number, number> = {
      0: 523.25, 2: 659.25, 4: 783.99, 6: 1046.50,
      8: 659.25, 10: 783.99, 12: 1046.50, 14: 1318.51,
      16: 587.33, 18: 783.99, 20: 987.77, 22: 1174.66,
      24: 783.99, 26: 987.77, 28: 1174.66, 30: 1567.98,
    };
    if (fanfareNotes[step]) {
      this.triggerSulingCeria(now, fanfareNotes[step], 0.18, 0.8);
    }
  }

  private stepChillGame(step: number, now: number) {
    if (step % 4 === 2) {
      this.triggerShaker(now, 0.35);
    }
    if (step === 0 || step === 16) {
      this.triggerWoodBlock(now, false, 0.35);
    }

    const chillBass: Record<number, number> = {
      0: 55.00, 8: 65.41, 16: 73.42, 24: 65.41,
    };
    if (chillBass[step]) {
      this.triggerAcousticBouncyBass(now, chillBass[step], 0.24, 0.55);
    }

    const chillNotes: Record<number, number> = {
      2: 392.00, 6: 493.88, 10: 587.33, 14: 659.25,
      18: 440.00, 22: 523.25, 26: 659.25, 30: 783.99,
    };
    if (chillNotes[step]) {
      this.triggerUkuleleStrum(now, [chillNotes[step], chillNotes[step] * 1.25], 0.35);
    }
  }

  public stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  public toggleBGM(): boolean {
    if (this.isBgmPlaying) {
      this.stopBGM();
      return false;
    } else {
      this.startBGM(this.currentTrackId);
      return true;
    }
  }

  public setTrack(trackId: MusicTrackId): void {
    this.currentTrackId = trackId;
    try {
      localStorage.setItem('octoquiz_music_track', trackId);
    } catch {
      // ignore
    }
    if (this.isBgmPlaying) {
      this.startBGM(trackId);
    }
  }

  public setVolume(volume: number): void {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    try {
      localStorage.setItem('octoquiz_music_volume', this.bgmVolume.toString());
    } catch {
      // ignore
    }
  }

  public getCurrentTrack(): MusicTrack {
    return MUSIC_TRACKS.find(t => t.id === this.currentTrackId) || MUSIC_TRACKS[0];
  }
}

export const sound = new SoundEngine();
