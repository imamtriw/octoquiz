import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { AquaticBackground } from './components/AquaticBackground';
import { StudentRegistration } from './components/StudentRegistration';
import { StudentQuiz } from './components/StudentQuiz';
import { StudentSummary } from './components/StudentSummary';
import { AdminDisplay } from './components/AdminDisplay';
import { AdminQuestionManager } from './components/AdminQuestionManager';
import { AdminResults } from './components/AdminResults';
import { AdminHistory } from './components/AdminHistory';
import { HostAuthModal } from './components/HostAuthModal';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { 
  DEFAULT_QUESTIONS, 
  SAMPLE_SIMULATED_STUDENTS, 
  INITIAL_QUIZ_PACKAGES 
} from './data/defaultQuestions';
import { 
  Question, 
  StudentRegistrationData, 
  StudentResult, 
  AppViewMode, 
  AnswerDetail, 
  QuizPackage, 
  ActiveQuizSession,
  QuizHistoryEntry,
  MusicTrackId 
} from './types';
import { GoogleUserProfile } from './utils/googleAuth';
import { sound } from './utils/audio';
import { downloadSingleFileHTML } from './utils/singleHtmlGenerator';
import { readJoinSessionParam } from './utils/joinSession';
import { loadCloudQuizState, saveCloudQuizState } from './utils/cloudStorage';

const STORAGE_KEYS = {
  PACKAGES: 'octoquiz_packages_v1',
  ACTIVE_SESSION: 'octoquiz_active_session_v1',
  STUDENTS: 'octoquiz_students_v1',
  HOST_PASSWORD: 'octoquiz_host_password_v3',
  HISTORY: 'octoquiz_history_v1',
};

export default function App() {
  const sharedJoinSession = useMemo(() => readJoinSessionParam(), []);

  // Load Quiz Packages (Bank Soal)
  const [quizPackages, setQuizPackages] = useState<QuizPackage[]>(() => {
    if (sharedJoinSession?.package) return [sharedJoinSession.package];
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PACKAGES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_QUIZ_PACKAGES;
  });

  // Load Active Quiz Session
  const [activeSession, setActiveSession] = useState<ActiveQuizSession>(() => {
    if (sharedJoinSession?.session) return sharedJoinSession.session;
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.quizCode) return parsed;
      }
    } catch {
      // fallback
    }
    const initialPkg = INITIAL_QUIZ_PACKAGES[0];
    return {
      quizId: initialPkg.id,
      quizCode: 'OCTO-801',
      title: initialPkg.title,
      targetClass: initialPkg.targetClass,
      status: 'LOBBY',
      startedAt: undefined,
      customTeams: initialPkg.customTeams,
    };
  });

  // Load students from LocalStorage or start with sample simulated class
  const [students, setStudents] = useState<StudentResult[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return SAMPLE_SIMULATED_STUDENTS;
  });

  const [quizHistory, setQuizHistory] = useState<QuizHistoryEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  });

  // Navigation State
  const [currentView, setCurrentView] = useState<AppViewMode>('STUDENT_REGISTRATION');
  const [isHostAuthModalOpen, setIsHostAuthModalOpen] = useState(false);
  const [isHostAuthenticated, setIsHostAuthenticated] = useState(false);
  const [googleUser, setGoogleUser] = useState<GoogleUserProfile | null>(null);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [hostPassword, setHostPassword] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.HOST_PASSWORD) || 'dosenikn1234';
  });

  // Currently active player session
  const [currentStudentData, setCurrentStudentData] = useState<StudentRegistrationData | null>(null);
  const [completedStudentResult, setCompletedStudentResult] = useState<StudentResult | null>(null);
  const [cloudReady, setCloudReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let cloudLoaded = false;
    loadCloudQuizState()
      .then((cloudState) => {
        if (cancelled) return;
        cloudLoaded = true;
        if (!sharedJoinSession && cloudState?.quizPackages?.length) setQuizPackages(cloudState.quizPackages);
        if (!sharedJoinSession && cloudState?.activeSession?.quizCode) setActiveSession(cloudState.activeSession);
        if (cloudState?.students) setStudents(cloudState.students);
        if (cloudState?.quizHistory) setQuizHistory(cloudState.quizHistory);
      })
      .catch((error) => {
        console.warn('Cloud storage belum aktif; memakai penyimpanan lokal.', error);
      })
      .finally(() => {
        if (!cancelled) setCloudReady(cloudLoaded);
      });

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HOST_PASSWORD, hostPassword);
  }, [hostPassword]);

  // Audio State
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isBgmPlaying, setIsBgmPlaying] = useState<boolean>(false);
  const [currentTrackId, setCurrentTrackId] = useState<MusicTrackId>(() => sound.currentTrackId);
  const [bgmVolume, setBgmVolume] = useState<number>(() => sound.bgmVolume);

  // Active quiz package and questions
  const currentPackage = useMemo(() => {
    return quizPackages.find(p => p.id === activeSession?.quizId) || quizPackages[0];
  }, [quizPackages, activeSession?.quizId]);

  const currentQuestions = useMemo(() => {
    return currentPackage?.questions || DEFAULT_QUESTIONS;
  }, [currentPackage]);

  // Synchronize state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(quizPackages));
    } catch {
      // ignore
    }
  }, [quizPackages]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(activeSession));
    } catch {
      // ignore
    }
  }, [activeSession]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    } catch {
      // ignore
    }
  }, [students]);

  useEffect(() => {
    if (!cloudReady) return;
    const timeoutId = window.setTimeout(() => {
      saveCloudQuizState({ quizPackages, activeSession, students, quizHistory }).catch((error) => {
        console.warn('Gagal menyimpan data ke Cloud Firestore.', error);
      });
    }, 500);
    return () => window.clearTimeout(timeoutId);
  }, [cloudReady, quizPackages, activeSession, students, quizHistory]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(quizHistory));
    } catch {
      // ignore
    }
  }, [quizHistory]);

  // Real-time Cross-tab Sync (via BroadcastChannel & Storage Event)
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('octoquiz_realtime_channel');
        bc.onmessage = (event) => {
          if (event.data?.type === 'STUDENT_SUBMITTED') {
            const updatedList: StudentResult[] = event.data.students;
            if (Array.isArray(updatedList)) {
              setStudents(updatedList);
            }
          } else if (event.data?.type === 'PACKAGES_UPDATED') {
            const updatedP: QuizPackage[] = event.data.packages;
            if (Array.isArray(updatedP)) {
              setQuizPackages(updatedP);
            }
          } else if (event.data?.type === 'SESSION_UPDATED') {
            const updatedS: ActiveQuizSession = event.data.session;
            if (updatedS && updatedS.quizCode) {
              setActiveSession(updatedS);
            }
          }
        };
      }
    } catch {
      // fallback
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.STUDENTS && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setStudents(parsed);
        } catch {
          // ignore
        }
      } else if (e.key === STORAGE_KEYS.PACKAGES && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setQuizPackages(parsed);
        } catch {
          // ignore
        }
      } else if (e.key === STORAGE_KEYS.ACTIVE_SESSION && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed && parsed.quizCode) setActiveSession(parsed);
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (bc) bc.close();
    };
  }, []);

  // Broadcast helper
  const broadcastStudents = (newList: StudentResult[]) => {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('octoquiz_realtime_channel');
        bc.postMessage({ type: 'STUDENT_SUBMITTED', students: newList });
        bc.close();
      }
    } catch {
      // ignore
    }
  };

  const broadcastSession = (newSession: ActiveQuizSession) => {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('octoquiz_realtime_channel');
        bc.postMessage({ type: 'SESSION_UPDATED', session: newSession });
        bc.close();
      }
    } catch {
      // ignore
    }
  };

  // Handle Player Registration
  const handleStartQuiz = (data: StudentRegistrationData) => {
    // Add student to the lobby / active list immediately so teacher sees them
    const newStudentId = `st-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const studentRecord: StudentResult = {
      id: newStudentId,
      quizCode: data.quizCode,
      namaLengkap: data.namaLengkap,
      nim: data.nim,
      namaKelompok: data.namaKelompok,
      kelas: data.kelas,
      avatar: data.avatar || '🐙',
      totalScore: 0,
      accuracy: 0,
      correctCount: 0,
      incorrectCount: 0,
      unattemptedCount: currentQuestions.length,
      answers: {},
      isCompleted: false,
      currentQuestionIndex: 0,
      currentStreak: 0,
      joinedAt: Date.now(),
      lastUpdated: Date.now(),
    };

    const updatedStudents = [studentRecord, ...students];
    setStudents(updatedStudents);
    broadcastStudents(updatedStudents);

    setCurrentStudentData(data);
    setCurrentView('STUDENT_QUIZ');
  };

  // Handle Player Completing Quiz
  const handleCompleteQuiz = (answers: Record<string, AnswerDetail>, totalScore: number) => {
    if (!currentStudentData) return;

    let correctCount = 0;
    let incorrectCount = 0;

    Object.values(answers).forEach((ans) => {
      if (ans.isCorrect) {
        correctCount++;
      } else {
        incorrectCount++;
      }
    });

    const totalQuestionsCount = currentQuestions.length || 1;
    const accuracy = Math.round((correctCount / totalQuestionsCount) * 100);

    // Update the existing record or create
    let found = false;
    const updatedStudents = students.map(st => {
      if (st.namaLengkap === currentStudentData.namaLengkap && st.kelas === currentStudentData.kelas) {
        found = true;
        return {
          ...st,
          totalScore,
          accuracy,
          correctCount,
          incorrectCount,
          unattemptedCount: Math.max(0, currentQuestions.length - (correctCount + incorrectCount)),
          answers,
          isCompleted: true,
          currentQuestionIndex: currentQuestions.length,
          lastUpdated: Date.now(),
        };
      }
      return st;
    });

    const completedRecord: StudentResult = found 
      ? updatedStudents.find(s => s.namaLengkap === currentStudentData.namaLengkap)!
      : {
          id: `student-${Date.now()}`,
          quizCode: currentStudentData.quizCode,
          namaLengkap: currentStudentData.namaLengkap,
          nim: currentStudentData.nim,
          namaKelompok: currentStudentData.namaKelompok,
          kelas: currentStudentData.kelas,
          avatar: currentStudentData.avatar || '🐙',
          totalScore,
          accuracy,
          correctCount,
          incorrectCount,
          unattemptedCount: Math.max(0, currentQuestions.length - (correctCount + incorrectCount)),
          answers,
          isCompleted: true,
          currentQuestionIndex: currentQuestions.length,
          currentStreak: 0,
          joinedAt: Date.now(),
          lastUpdated: Date.now(),
        };

    const finalList = found ? updatedStudents : [completedRecord, ...students];
    setStudents(finalList);
    setCompletedStudentResult(completedRecord);
    broadcastStudents(finalList);
    setCurrentView('STUDENT_SUMMARY');
  };

  // Live score update during quiz
  const handleLiveScoreUpdate = useCallback((currentScore: number, streak: number, qIndex: number) => {
    if (!currentStudentData) return;

    setStudents(prev => {
      const updated = prev.map(st => {
        if (st.namaLengkap === currentStudentData.namaLengkap && st.kelas === currentStudentData.kelas) {
          return {
            ...st,
            totalScore: currentScore,
            currentStreak: streak,
            currentQuestionIndex: qIndex + 1,
            lastUpdated: Date.now(),
          };
        }
        return st;
      });
      broadcastStudents(updated);
      return updated;
    });
  }, [currentStudentData]);

  // Admin Session Controls
  const handleStartQuizSession = () => {
    const nextSession: ActiveQuizSession = {
      ...activeSession,
      status: 'IN_PROGRESS',
      startedAt: Date.now(),
    };
    setActiveSession(nextSession);
    broadcastSession(nextSession);
  };

  const handleFinishQuizSession = () => {
    const nextSession: ActiveQuizSession = {
      ...activeSession,
      status: 'FINISHED',
      finishedAt: Date.now(),
    };
    const historyEntry: QuizHistoryEntry = {
      id: `${activeSession.quizCode}-${Date.now()}`,
      session: nextSession,
      questions: currentQuestions,
      students: students.filter(student => student.quizCode === activeSession.quizCode),
      playedAt: Date.now(),
    };
    setQuizHistory(previous => [historyEntry, ...previous.filter(entry => entry.session.quizCode !== activeSession.quizCode)]);
    setActiveSession(nextSession);
    broadcastSession(nextSession);
    setCurrentView('ADMIN_RESULTS');
  };

  const handleResetSessionToLobby = () => {
    const nextSession: ActiveQuizSession = {
      ...activeSession,
      status: 'LOBBY',
    };
    setActiveSession(nextSession);
    broadcastSession(nextSession);
  };

  // Play Quiz Package with a new class & new generated quiz code
  const handlePlayQuizSession = (pkg: QuizPackage, newClass: string, newCode: string) => {
    const nextSession: ActiveQuizSession = {
      quizId: pkg.id,
      quizCode: newCode,
      title: pkg.title,
      targetClass: newClass,
      status: 'LOBBY',
      startedAt: undefined,
      customTeams: pkg.customTeams,
    };
    setActiveSession(nextSession);
    broadcastSession(nextSession);
    setCurrentView('ADMIN_DISPLAY');
  };

  // Simulate new student join live in lobby
  const handleSimulateNewStudentJoin = () => {
    sound.playClick();
    const aquaticNames = [
      'Gibran Samudera', 'Nadia Coralina', 'Rehan Atlantis', 
      'Siti Mutiara', 'Fahri Maritim', 'Ayla Laguna'
    ];
    const avatars = ['🐙', '🐬', '🦈', '🐳', '🐢', '🦀'];
    const randomName = aquaticNames[Math.floor(Math.random() * aquaticNames.length)] + ` (${Math.floor(Math.random() * 90 + 10)})`;
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
    const randomTeam = currentPackage.customTeams[Math.floor(Math.random() * currentPackage.customTeams.length)] || 'Kelompok Gurita Poseidon';

    const newSimulatedStudent: StudentResult = {
      id: `sim-${Date.now()}`,
      quizCode: activeSession.quizCode,
      namaLengkap: randomName,
      namaKelompok: randomTeam,
      kelas: activeSession.targetClass,
      avatar: randomAvatar,
      totalScore: Math.floor(Math.random() * 3000 + 1000),
      accuracy: Math.floor(Math.random() * 40 + 60),
      correctCount: Math.floor(currentQuestions.length * 0.7),
      incorrectCount: Math.floor(currentQuestions.length * 0.3),
      unattemptedCount: 0,
      answers: {},
      isCompleted: false,
      currentQuestionIndex: 1,
      currentStreak: 1,
      joinedAt: Date.now(),
      lastUpdated: Date.now(),
    };

    const updated = [newSimulatedStudent, ...students];
    setStudents(updated);
    broadcastStudents(updated);
  };

  // Save or update Quiz Package
  const handleSaveQuizPackage = (pkg: QuizPackage) => {
    setQuizPackages(prev => {
      const exists = prev.some(p => p.id === pkg.id);
      if (exists) {
        return prev.map(p => p.id === pkg.id ? pkg : p);
      }
      return [...prev, pkg];
    });
  };

  // Delete Quiz Package
  const handleDeleteQuizPackage = (id: string) => {
    setQuizPackages(prev => prev.filter(p => p.id !== id));
  };

  // Reset to default questions
  const handleResetDefaultQuestions = () => {
    if (confirm('Kembalikan paket soal ke set bawaan OCTOQUIZ?')) {
      setQuizPackages(INITIAL_QUIZ_PACKAGES);
      setActiveSession({
        quizId: INITIAL_QUIZ_PACKAGES[0].id,
        quizCode: 'OCTO-801',
        title: INITIAL_QUIZ_PACKAGES[0].title,
        targetClass: INITIAL_QUIZ_PACKAGES[0].targetClass,
        status: 'LOBBY',
        startedAt: null,
      });
      sound.playClick();
    }
  };

  // Toggle mock / simulated class participants
  const hasSimulatedData = students.length > 0;
  const handleToggleSimulation = () => {
    sound.playClick();
    if (hasSimulatedData) {
      if (confirm('Bersihkan semua peserta kuis saat ini?')) {
        setStudents([]);
        broadcastStudents([]);
      }
    } else {
      setStudents(SAMPLE_SIMULATED_STUDENTS);
      broadcastStudents(SAMPLE_SIMULATED_STUDENTS);
    }
  };

  // Audio Toggles & Music Control
  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    sound.isMuted = nextMute;
  };

  const handleToggleBgm = () => {
    const isPlaying = sound.toggleBGM();
    setIsBgmPlaying(isPlaying);
  };

  const handleSelectTrack = (trackId: MusicTrackId) => {
    setCurrentTrackId(trackId);
    sound.setTrack(trackId);
  };

  const handleChangeVolume = (vol: number) => {
    setBgmVolume(vol);
    sound.setVolume(vol);
  };

  // Compute student rank in class
  const studentRank = useMemo(() => {
    if (!completedStudentResult) return 1;
    const sorted = [...students].sort((a, b) => b.totalScore - a.totalScore);
    const index = sorted.findIndex(s => s.id === completedStudentResult.id);
    return index !== -1 ? index + 1 : 1;
  }, [students, completedStudentResult]);

  const topTeams = useMemo(() => {
    const teamScores = new Map<string, { teamName: string; totalScore: number; memberCount: number }>();

    students.forEach((student) => {
      const teamName = student.namaKelompok || 'Tanpa Kelompok';
      const existing = teamScores.get(teamName);
      teamScores.set(teamName, {
        teamName,
        totalScore: (existing?.totalScore || 0) + student.totalScore,
        memberCount: (existing?.memberCount || 0) + 1,
      });
    });

    return Array.from(teamScores.values())
      .sort((first, second) => second.totalScore - first.totalScore)
      .slice(0, 3);
  }, [students]);

  // Is student view mode (strictly hide admin tabs)
  const isStudentRole = currentView.startsWith('STUDENT_');

  return (
    <div className="min-h-screen bg-[#060b14] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-300 relative overflow-x-hidden font-sans">
      
      {/* Subtle Transparent Aquatic Background with Marine Life */}
      <AquaticBackground />

      {/* Top OCTOQUIZ Navigation Bar */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        userRole={isStudentRole ? 'STUDENT' : 'ADMIN'}
        onSwitchRole={(role) => {
          if (role === 'ADMIN') {
            setCurrentView('ADMIN_DISPLAY');
          } else {
            setCurrentView('STUDENT_REGISTRATION');
          }
        }}
        activeSession={activeSession}
        studentCount={students.length}
        questionCount={currentQuestions.length}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        isBgmActive={isBgmPlaying}
        isBgmPlaying={isBgmPlaying}
        onToggleBgm={handleToggleBgm}
        currentTrackId={currentTrackId}
        onSelectTrack={handleSelectTrack}
        bgmVolume={bgmVolume}
        onChangeVolume={handleChangeVolume}
        onToggleSimulation={handleToggleSimulation}
        hasSimulatedData={hasSimulatedData}
        onExportSingleHtml={downloadSingleFileHTML}
        isStudentRole={isStudentRole}
        activeSessionCode={activeSession?.quizCode || 'OCTO-801'}
        isHostAuthenticated={isHostAuthenticated}
        onOpenHostAuthModal={() => setIsHostAuthModalOpen(true)}
        googleUser={googleUser}
        enteredStudentCode={currentStudentData?.quizCode || null}
        onOpenDriveModal={() => setIsDriveModalOpen(true)}
        isDriveConnected={Boolean(googleUser)}
        lastSyncTime={lastSyncTime}
      />

      {/* Main Dynamic View Content */}
      <main className="flex-1 w-full relative z-10">
        
        {/* 1. STUDENT REGISTRATION (Player Entry Portal) */}
        {currentView === 'STUDENT_REGISTRATION' && (
          <StudentRegistration
            onStartQuiz={handleStartQuiz}
            totalQuestions={currentQuestions.length}
            activeSession={activeSession}
            customTeams={currentPackage?.customTeams || []}
          />
        )}

        {/* 2. STUDENT QUIZ INTERFACE (Player Active Quiz) */}
        {currentView === 'STUDENT_QUIZ' && currentStudentData && (
          <StudentQuiz
            student={currentStudentData}
            questions={currentQuestions}
            onCompleteQuiz={handleCompleteQuiz}
            onLiveScoreUpdate={handleLiveScoreUpdate}
          />
        )}

        {/* 3. STUDENT QUIZ SUMMARY (Player Finished Screen - Individual Recap Only) */}
        {currentView === 'STUDENT_SUMMARY' && completedStudentResult && (
          <StudentSummary
            studentResult={completedStudentResult}
            questions={currentQuestions}
            totalParticipants={students.length}
            rank={studentRank}
            topTeams={topTeams}
            onRetakeOrNewStudent={() => {
              setCurrentStudentData(null);
              setCompletedStudentResult(null);
              setCurrentView('STUDENT_REGISTRATION');
            }}
          />
        )}

        {/* 4. ADMIN LIVE CLASS DISPLAY (Ruang Tunggu Lobby -> Live Scoreboard -> Finish) */}
        {currentView === 'ADMIN_DISPLAY' && (
          <AdminDisplay
            questions={currentQuestions}
            students={students}
            activeSession={activeSession}
            onStartQuizSession={handleStartQuizSession}
            onFinishQuizSession={handleFinishQuizSession}
            onResetSessionToLobby={handleResetSessionToLobby}
            onSimulateNewStudentJoin={handleSimulateNewStudentJoin}
            isBgmPlaying={isBgmPlaying}
            onToggleBgm={handleToggleBgm}
            currentTrackId={currentTrackId}
            onSelectTrack={handleSelectTrack}
            bgmVolume={bgmVolume}
            onChangeVolume={handleChangeVolume}
          />
        )}

        {/* 5. ADMIN QUESTION BANK & MULTI-QUIZ MANAGER */}
        {currentView === 'ADMIN_QUESTIONS' && (
          <AdminQuestionManager
            quizPackages={quizPackages}
            activeSession={activeSession}
            onSaveQuizPackage={handleSaveQuizPackage}
            onDeleteQuizPackage={handleDeleteQuizPackage}
            onPlayQuizSession={handlePlayQuizSession}
            onResetDefaultQuestions={handleResetDefaultQuestions}
            onSaveToDrive={() => setIsDriveModalOpen(true)}
          />
        )}

        {/* 6. ADMIN RESULTS & DETAILED OVERVIEW (Podium & Overview Table) */}
        {currentView === 'ADMIN_RESULTS' && (
          <AdminResults
            questions={currentQuestions}
            students={students}
            activeSession={activeSession}
          />
        )}

        {currentView === 'ADMIN_HISTORY' && (
          <AdminHistory history={quizHistory} />
        )}

      </main>

      <HostAuthModal
        isOpen={isHostAuthModalOpen}
        onClose={() => setIsHostAuthModalOpen(false)}
        isHostAuthenticated={isHostAuthenticated}
        onUnlockHost={() => {
          setIsHostAuthenticated(true);
          setIsHostAuthModalOpen(false);
          setCurrentView('ADMIN_DISPLAY');
        }}
        onLockHost={() => {
          setIsHostAuthenticated(false);
          setGoogleUser(null);
          setCurrentView('STUDENT_REGISTRATION');
        }}
        hostPassword={hostPassword}
        onUpdateHostPassword={setHostPassword}
        googleUser={googleUser}
        onGoogleSignInSuccess={setGoogleUser}
        onGoogleSignOut={() => setGoogleUser(null)}
      />

      <GoogleDriveModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        googleUser={googleUser}
        onGoogleSignInSuccess={setGoogleUser}
        quizPackages={quizPackages}
        students={students}
        activeSession={activeSession}
        onRestorePackages={setQuizPackages}
        lastSyncTime={lastSyncTime}
        onUpdateLastSyncTime={setLastSyncTime}
      />

      {/* Footer */}
      <footer className="py-4 border-t border-cyan-500/10 text-center text-xs text-slate-500 relative z-10 bg-[#060b14]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span>🐙 OCTOQUIZ • Kuis Interaktif Kelas Dark Theme</span>
            <span className="text-cyan-400 font-mono font-bold">[{activeSession?.quizCode || 'OCTO-801'}]</span>
            <span className="text-slate-400">Developer: itw</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="text-[11px] text-cyan-300">Live Cross-Tab Sync</span>
            <button 
              onClick={downloadSingleFileHTML}
              className="hover:text-cyan-300 transition-colors underline text-[11px]"
            >
              Unduh Versi Standalone Single File (.html)
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
