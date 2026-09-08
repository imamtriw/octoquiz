import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Clock, 
  Flame, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ArrowRight,
  User,
  Shield,
  Zap,
  Image as ImageIcon,
  Maximize2,
  X
} from 'lucide-react';
import { Question, OptionKey, StudentRegistrationData, AnswerDetail } from '../types';
import { sound } from '../utils/audio';

interface StudentQuizProps {
  student: StudentRegistrationData;
  questions: Question[];
  onCompleteQuiz: (answers: Record<string, AnswerDetail>, totalScore: number) => void;
  onLiveScoreUpdate?: (currentScore: number, streak: number, qIndex: number) => void;
}

export const StudentQuiz: React.FC<StudentQuizProps> = ({
  student,
  questions,
  onCompleteQuiz,
  onLiveScoreUpdate,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerDetail>>({});
  const [currentScore, setCurrentScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isZoomImageModalOpen, setIsZoomImageModalOpen] = useState(false);

  // Current Question Timing State
  const currentQuestion = questions[currentIndex];
  const timeLimit = currentQuestion?.waktuDetik || 20;
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<OptionKey | null>(null);
  const [feedback, setFeedback] = useState<{
    status: 'CORRECT' | 'INCORRECT' | 'TIMEOUT';
    scoreEarned: number;
    speedBonus: number;
    streakBonus: number;
  } | null>(null);

  const optionsList = useMemo(() => {
    const optionKeys: OptionKey[] = ['A', 'B', 'C', 'D'];
    const source = [
      { originalKey: 'A' as OptionKey, text: currentQuestion.opsiA },
      { originalKey: 'B' as OptionKey, text: currentQuestion.opsiB },
      { originalKey: 'C' as OptionKey, text: currentQuestion.opsiC },
      { originalKey: 'D' as OptionKey, text: currentQuestion.opsiD },
    ];
    let seed = currentQuestion.id.split('').reduce((total, char) => total + char.charCodeAt(0), currentIndex + 17);
    const random = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    for (let index = source.length - 1; index > 0; index--) {
      const swapIndex = Math.floor(random() * (index + 1));
      [source[index], source[swapIndex]] = [source[swapIndex], source[index]];
    }

    return source.map((option, index) => ({
      key: optionKeys[index],
      originalKey: option.originalKey,
      text: option.text,
    }));
  }, [currentQuestion, currentIndex]);

  const correctOptionKey = optionsList.find(option => option.originalKey === currentQuestion.jawabanBenar)?.key || 'A';

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset timer on question change
  useEffect(() => {
    if (!currentQuestion) return;
    setTimeLeft(currentQuestion.waktuDetik);
    setIsAnswered(false);
    setSelectedOption(null);
    setFeedback(null);
  }, [currentIndex, currentQuestion]);

  // Handle timeout
  const handleTimeout = useCallback(() => {
    if (isAnswered) return;
    setIsAnswered(true);
    sound.playIncorrect();

    const answerRecord: AnswerDetail = {
      questionId: currentQuestion.id,
      questionIndex: currentIndex,
      selectedOption: 'TIMED_OUT',
      correctOption: correctOptionKey,
      isCorrect: false,
      timeSpentSeconds: currentQuestion.waktuDetik,
      timeLimitSeconds: currentQuestion.waktuDetik,
      scoreEarned: 0,
      status: 'INCORRECT',
    };

    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answerRecord }));
    setStreak(0);
    setFeedback({
      status: 'TIMEOUT',
      scoreEarned: 0,
      speedBonus: 0,
      streakBonus: 0,
    });
  }, [isAnswered, currentQuestion, currentIndex, correctOptionKey]);

  // Countdown timer effect
  useEffect(() => {
    if (isAnswered || !currentQuestion) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimeout();
          return 0;
        }
        if (prev <= 5) {
          sound.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isAnswered, currentQuestion, handleTimeout]);

  // Handle option selection
  const handleSelectOption = (optionKey: OptionKey) => {
    if (isAnswered || !currentQuestion) return;

    if (timerRef.current) clearInterval(timerRef.current);
    setIsAnswered(true);
    setSelectedOption(optionKey);

    const timeSpent = Math.max(1, currentQuestion.waktuDetik - timeLeft);
    const isCorrect = optionKey === correctOptionKey;

    let scoreEarned = 0;
    let speedBonus = 0;
    let streakBonus = 0;
    let newStreak = streak;
    const speedRatio = Math.max(0, timeLeft / currentQuestion.waktuDetik);

    if (isCorrect) {
      sound.playCorrect();
      newStreak = streak + 1;
      setStreak(newStreak);

      const baseScore = 1000;
      // Faster response yields higher speed bonus (up to 500)
      speedBonus = Math.round(speedRatio * 500);
      streakBonus = (newStreak - 1) * 100;
      scoreEarned = baseScore + speedBonus + streakBonus;

      setCurrentScore(prev => {
        const updated = prev + scoreEarned;
        if (onLiveScoreUpdate) {
          onLiveScoreUpdate(updated, newStreak, currentIndex);
        }
        return updated;
      });

      setFeedback({
        status: 'CORRECT',
        scoreEarned,
        speedBonus,
        streakBonus,
      });
    } else {
      sound.playIncorrect();
      setStreak(0);
      newStreak = 0;
      setFeedback({
        status: 'INCORRECT',
        scoreEarned: 0,
        speedBonus: 0,
        streakBonus: 0,
      });
      if (onLiveScoreUpdate) {
        onLiveScoreUpdate(currentScore, 0, currentIndex);
      }
    }

    const answerRecord: AnswerDetail = {
      questionId: currentQuestion.id,
      questionIndex: currentIndex,
      selectedOption: optionKey,
      correctOption: correctOptionKey,
      isCorrect,
      timeSpentSeconds: timeSpent,
      timeLimitSeconds: currentQuestion.waktuDetik,
      scoreEarned,
      status: isCorrect ? (speedRatio > 0.3 ? 'CORRECT' : 'PARTIALLY_CORRECT') : 'INCORRECT',
    };

    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answerRecord }));
  };

  // Move to next question or complete
  const handleNextQuestion = () => {
    sound.playClick();
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Finished
      sound.playFanfare();
      onCompleteQuiz(answers, currentScore);
    }
  };

  const progressPercent = ((currentIndex + 1) / questions.length) * 100;
  const timePercent = (timeLeft / (currentQuestion?.waktuDetik || 20)) * 100;

  // Option Styling configurations
  const OPTION_STYLES = {
    A: {
      base: 'bg-[#ff4d6d]/15 border-[#ff4d6d]/40 text-[#ff4d6d]',
      badge: 'bg-[#ff4d6d] text-white',
      hover: 'hover:bg-[#ff4d6d]/25 hover:border-[#ff4d6d]',
      selected: 'ring-4 ring-[#ff4d6d] bg-[#ff4d6d]/30',
    },
    B: {
      base: 'bg-[#00d2ff]/15 border-[#00d2ff]/40 text-[#00d2ff]',
      badge: 'bg-[#00d2ff] text-[#121218]',
      hover: 'hover:bg-[#00d2ff]/25 hover:border-[#00d2ff]',
      selected: 'ring-4 ring-[#00d2ff] bg-[#00d2ff]/30',
    },
    C: {
      base: 'bg-[#ffc107]/15 border-[#ffc107]/40 text-[#ffc107]',
      badge: 'bg-[#ffc107] text-[#121218]',
      hover: 'hover:bg-[#ffc107]/25 hover:border-[#ffc107]',
      selected: 'ring-4 ring-[#ffc107] bg-[#ffc107]/30',
    },
    D: {
      base: 'bg-[#00e6a8]/15 border-[#00e6a8]/40 text-[#00e6a8]',
      badge: 'bg-[#00e6a8] text-[#121218]',
      hover: 'hover:bg-[#00e6a8]/25 hover:border-[#00e6a8]',
      selected: 'ring-4 ring-[#00e6a8] bg-[#00e6a8]/30',
    },
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-between p-4 max-w-5xl mx-auto py-6">
      
      {/* Top Status & HUD Bar */}
      <div className="w-full bg-[#1e1e2d] border border-white/10 rounded-2xl p-4 shadow-xl mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Player Identity */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#00d2ff] to-[#8b5cf6] flex items-center justify-center text-xl shadow-md border border-white/20">
              {student.avatar || '⚡'}
            </div>
            <div>

            {feedback?.status === 'CORRECT' && (
              <div className="fixed top-24 left-1/2 z-40 -translate-x-1/2 pointer-events-none animate-bounce">
                <div className="px-6 py-3 rounded-2xl bg-emerald-400 text-slate-950 border-4 border-white/80 shadow-2xl shadow-emerald-400/50 text-center">
                  <div className="text-xs font-black uppercase tracking-[0.2em]">Jawaban Tepat!</div>
                  <div className="text-3xl font-black font-display">+{feedback.scoreEarned} PTS</div>
                </div>
              </div>
            )}
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                  {student.namaLengkap}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#262638] text-[10px] font-bold text-[#00d2ff] border border-white/10">
                  {student.kelas}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Shield className="w-3 h-3 text-slate-500" />
                <span>{student.namaKelompok}</span>
              </div>
            </div>
          </div>

          {/* Center: Question Progress */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Soal {currentIndex + 1} dari {questions.length}
            </span>
            <div className="w-32 sm:w-48 h-2 bg-[#121218] rounded-full overflow-hidden mt-1 border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-[#00d2ff] to-[#00e6a8] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Right: Score & Streak */}
          <div className="flex items-center gap-3">
            {streak > 1 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ff4d6d]/20 border border-[#ff4d6d]/40 text-[#ff4d6d] animate-bounce">
                <Flame className="w-4 h-4" />
                <span className="text-xs font-black tracking-wider">{streak}x STREAK!</span>
              </div>
            )}
            <div className="px-3.5 py-1.5 rounded-xl bg-[#121218] border border-white/10 text-right">
              <span className="text-[10px] block text-slate-400 font-semibold uppercase">Total Skor</span>
              <span className="text-sm sm:text-lg font-black text-[#ffc107] font-display tracking-tight">
                {currentScore.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

        </div>

        {/* Dynamic Countdown Timer Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1 font-semibold">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Clock className={`w-4 h-4 ${timeLeft <= 5 ? 'text-red-400 animate-spin' : 'text-[#00d2ff]'}`} />
              <span>Sisa Waktu</span>
            </div>
            <span className={`text-sm font-black font-display ${timeLeft <= 5 ? 'text-red-400 animate-pulse text-base' : 'text-white'}`}>
              {timeLeft}s
            </span>
          </div>

          <div className="w-full h-3 bg-[#121218] rounded-full overflow-hidden border border-white/10 p-0.5">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${
                timeLeft <= 5 
                  ? 'bg-gradient-to-r from-red-600 to-red-400 animate-pulse' 
                  : timeLeft <= 10 
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400' 
                  : 'bg-gradient-to-r from-[#00d2ff] via-[#8b5cf6] to-[#00e6a8]'
              }`}
              style={{ width: `${Math.max(0, timePercent)}%` }}
            />
          </div>
        </div>

      </div>

      {/* Main Question Box */}
      <div className="bg-[#1e1e2d] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative mb-6 flex-1 flex flex-col justify-center">
        
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-bold text-[#00e6a8] tracking-wider uppercase">
            ID: {currentQuestion.id}
          </span>
          <span className="text-xs text-slate-400">
            Maks 1500 Poin (Akurasi + Respon Cepat)
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-relaxed font-display">
          {currentQuestion.pertanyaan}
        </h2>

        {/* Question Image Attachment */}
        {currentQuestion.imageUrl && (
          <div className="mt-4 flex justify-center">
            <div 
              onClick={() => setIsZoomImageModalOpen(true)}
              className="relative group max-w-lg w-full max-h-60 sm:max-h-72 rounded-2xl overflow-hidden bg-black/40 border border-cyan-500/30 flex items-center justify-center cursor-pointer shadow-lg hover:border-cyan-400 transition-all p-2"
              title="Klik untuk memperbesar gambar"
            >
              <img 
                src={currentQuestion.imageUrl} 
                alt="Gambar Lampiran Soal" 
                className="max-h-56 sm:max-h-64 max-w-full object-contain rounded-xl transition-transform duration-300 group-hover:scale-[1.02]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm text-cyan-300 px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 border border-cyan-500/30 opacity-90 group-hover:opacity-100 shadow-md">
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Klik untuk Perbesar</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4 Interactive Option Cards (Wayground / Quizizz Style Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 mb-4">
        {optionsList.map((opt) => {
          const style = OPTION_STYLES[opt.key];
          const isSelected = selectedOption === opt.key;
          const isCorrectSelection = isAnswered && isSelected && opt.key === correctOptionKey;
          const isWrongSelection = isAnswered && isSelected && opt.key !== correctOptionKey;

          return (
            <button
              key={opt.key}
              disabled={isAnswered}
              onClick={() => handleSelectOption(opt.key)}
              className={`group relative p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 flex items-start gap-3.5 ${style.base} ${
                !isAnswered ? style.hover + ' active:scale-[0.98]' : 'cursor-default'
              } ${
                isCorrectSelection 
                  ? 'ring-4 ring-[#00e6a8] bg-[#00e6a8]/25 border-[#00e6a8]' 
                  : isWrongSelection 
                  ? 'ring-4 ring-red-500 bg-red-500/25 border-red-500' 
                  : isAnswered 
                  ? 'opacity-40' 
                  : ''
              }`}
            >
              {/* Option Letter Badge */}
              <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl font-extrabold text-sm flex items-center justify-center shrink-0 shadow-md ${style.badge}`}>
                {opt.key}
              </div>

              {/* Option Text */}
              <div className="flex-1 pr-2">
                <span className="text-sm sm:text-base font-semibold text-slate-100 block leading-snug group-hover:text-white">
                  {opt.text}
                </span>
              </div>

              {/* Status Icon on Answered */}
              {isCorrectSelection && (
                <CheckCircle2 className="w-6 h-6 text-[#00e6a8] shrink-0 animate-bounce" />
              )}
              {isWrongSelection && (
                <XCircle className="w-6 h-6 text-red-400 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Real-time Feedback & Next Action Banner */}
      {isAnswered && feedback && (
        <div className="w-full bg-[#181824] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-slideUp">
          
          <div className="flex items-center gap-3 text-center sm:text-left">
            {feedback.status === 'CORRECT' ? (
              <div className="w-12 h-12 rounded-xl bg-[#00e6a8]/20 border border-[#00e6a8] flex items-center justify-center text-[#00e6a8] shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
            ) : feedback.status === 'TIMEOUT' ? (
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500 flex items-center justify-center text-amber-400 shrink-0">
                <AlertCircle className="w-7 h-7" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500 flex items-center justify-center text-red-400 shrink-0">
                <XCircle className="w-7 h-7" />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h4 className={`text-lg font-extrabold font-display ${
                  feedback.status === 'CORRECT' ? 'text-[#00e6a8]' : feedback.status === 'TIMEOUT' ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {feedback.status === 'CORRECT' ? 'JAWABAN TEPAT!' : feedback.status === 'TIMEOUT' ? 'WAKTU HABIS!' : 'KURANG TEPAT!'}
                </h4>
                {feedback.status === 'CORRECT' && (
                  <span className="px-2 py-0.5 rounded-full bg-[#00e6a8]/20 text-[#00e6a8] text-xs font-black">
                    +{feedback.scoreEarned} PTS
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400 mt-0.5">
                {feedback.status === 'CORRECT' ? (
                  <span>
                    Basis 1000 + Bonus Kecepatan ({feedback.speedBonus})
                    {feedback.streakBonus > 0 && ` + Bonus Streak (${feedback.streakBonus})`}
                  </span>
                ) : (
                  <span>
                    {feedback.status === 'TIMEOUT' ? 'Waktu habis. Lanjutkan ke soal berikutnya.' : 'Belum tepat. Lanjutkan ke soal berikutnya.'}
                  </span>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={handleNextQuestion}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[#00d2ff] to-[#00e6a8] text-[#121218] hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 shrink-0"
          >
            <span>{currentIndex + 1 < questions.length ? 'Soal Berikutnya' : 'Lihat Hasil Akhir'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </div>
      )}

      {/* Full Image Zoom Modal for Students */}
      {isZoomImageModalOpen && currentQuestion.imageUrl && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsZoomImageModalOpen(false)}
        >
          <div 
            className="relative max-w-4xl max-h-[92vh] bg-[#0c1426] border border-cyan-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-3 mb-2 border-b border-white/10">
              <span className="text-cyan-300 font-bold text-sm flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                <span>Gambar Lampiran Soal #{currentIndex + 1}</span>
              </span>
              <button
                onClick={() => setIsZoomImageModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[72vh] overflow-auto flex items-center justify-center p-2">
              <img 
                src={currentQuestion.imageUrl} 
                alt="Gambar Soal Diperbesar" 
                className="max-h-[68vh] max-w-full object-contain rounded-xl shadow-lg border border-white/10"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">Klik di luar gambar atau tombol silang untuk kembali ke kuis</p>
          </div>
        </div>
      )}

    </div>
  );
};
