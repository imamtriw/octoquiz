export type OptionKey = 'A' | 'B' | 'C' | 'D';

export interface Question {
  id: string;
  pertanyaan: string;
  opsiA: string;
  opsiB: string;
  opsiC: string;
  opsiD: string;
  jawabanBenar: OptionKey;
  waktuDetik: number;
  imageUrl?: string;
}

export interface AquaticAvatar {
  id: string;
  icon: string;
  name: string;
  color: string;
}

export const AQUATIC_AVATARS: AquaticAvatar[] = [
  { id: 'octopus', icon: '🐙', name: 'Gurita Cerdas', color: '#ff4d6d' },
  { id: 'dolphin', icon: '🐬', name: 'Lumba-Lumba', color: '#00d2ff' },
  { id: 'shark', icon: '🦈', name: 'Hiu Kilat', color: '#64748b' },
  { id: 'whale', icon: '🐳', name: 'Paus Raksasa', color: '#38bdf8' },
  { id: 'turtle', icon: '🐢', name: 'Penyu Bijak', color: '#00e6a8' },
  { id: 'crab', icon: '🦀', name: 'Kepiting Juara', color: '#f87171' },
  { id: 'clownfish', icon: '🐠', name: 'Ikan Badut', color: '#fb923c' },
  { id: 'squid', icon: '🦑', name: 'Cumi Tinta', color: '#c084fc' },
  { id: 'blowfish', icon: '🐡', name: 'Ikan Buntal', color: '#ffc107' },
  { id: 'lobster', icon: '🦞', name: 'Lobster Karang', color: '#ea580c' },
  { id: 'jellyfish', icon: '🪼', name: 'Ubur-Ubur Neon', color: '#e879f9' },
  { id: 'seal', icon: '🦭', name: 'Anjing Laut', color: '#94a3b8' },
];

export interface StudentRegistrationData {
  quizCode: string;
  namaLengkap: string;
  nim: string;
  namaKelompok: string;
  kelas: string;
  avatar: string;
}

export type QuestionStatus = 'CORRECT' | 'INCORRECT' | 'PARTIALLY_CORRECT' | 'UNATTEMPTED';

export interface AnswerDetail {
  questionId: string;
  questionIndex: number;
  selectedOption: OptionKey | 'TIMED_OUT' | null;
  correctOption: OptionKey;
  isCorrect: boolean;
  timeSpentSeconds: number;
  timeLimitSeconds: number;
  scoreEarned: number;
  status: QuestionStatus;
}

export interface StudentResult {
  id: string;
  quizCode: string;
  namaLengkap: string;
  nim?: string;
  namaKelompok: string;
  kelas: string;
  avatar: string;
  totalScore: number;
  accuracy: number; // in percentage 0 - 100
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  answers: Record<string, AnswerDetail>;
  isCompleted: boolean;
  currentQuestionIndex: number;
  currentStreak: number;
  joinedAt: number;
  lastUpdated: number;
}

export interface TeamResult {
  namaKelompok: string;
  totalScore: number;
  avgAccuracy: number;
  totalCorrect: number;
  totalIncorrect: number;
  memberCount: number;
  members: StudentResult[];
  rank: number;
  avatar: string;
}

export interface QuestionAnalysis {
  questionId: string;
  questionNumber: number;
  pertanyaan: string;
  totalResponses: number;
  correctResponses: number;
  accuracyPercentage: number;
  optionCounts: Record<OptionKey, number>;
  avgTimeSpent: number;
}

export interface QuizPackage {
  id: string;
  title: string;
  description?: string;
  targetClass: string;
  customTeams: string[];
  questions: Question[];
  createdAt: number;
  updatedAt: number;
}

export type QuizSessionStatus = 'LOBBY' | 'IN_PROGRESS' | 'FINISHED';
export type QuizSessionMode = 'LIVE' | 'ASSIGNMENT';

export interface ActiveQuizSession {
  quizId: string;
  quizCode: string; // e.g. "OCTO-842"
  title: string;
  targetClass: string;
  status: QuizSessionStatus;
  startedAt?: number;
  finishedAt?: number;
  customTeams: string[];
  mode?: QuizSessionMode;
  scheduledStartAt?: number;
  scheduledEndAt?: number;
}

export interface QuizHistoryEntry {
  id: string;
  session: ActiveQuizSession;
  questions: Question[];
  students: StudentResult[];
  playedAt: number;
}

export type UserRole = 'ADMIN' | 'STUDENT';

export type AppViewMode = 
  | 'STUDENT_REGISTRATION'
  | 'STUDENT_QUIZ'
  | 'STUDENT_SUMMARY'
  | 'ADMIN_DISPLAY'
  | 'ADMIN_QUESTIONS'
  | 'ADMIN_RESULTS'
  | 'ADMIN_HISTORY';

export type MusicTrackId = 'quiz-party' | 'lofi-study' | 'neon-puzzle' | 'victory-fanfare' | 'chill-game';

export interface MusicTrack {
  id: MusicTrackId;
  name: string;
  genre: string;
  bpm: number;
  icon: string;
  description: string;
  accentColor: string;
}

