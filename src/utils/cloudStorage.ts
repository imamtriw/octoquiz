import { getApp } from 'firebase/app';
import { collection, doc, getDoc, getDocs, getFirestore, setDoc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { auth } from './googleAuth';
import { ActiveQuizSession, QuizHistoryEntry, QuizPackage, StudentResult } from '../types';

const db = getFirestore(getApp());
const stateRef = doc(db, 'octoquiz', 'shared-state');

const sessionKey = (quizCode: string) => encodeURIComponent(quizCode.trim().toUpperCase());

const studentsRef = (quizCode: string, history = false) => collection(
  db,
  'sessions',
  sessionKey(quizCode),
  history ? 'historyStudents' : 'students',
);

function omitUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(omitUndefined) as T;
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entry]) => entry !== undefined)
        .map(([key, entry]) => [key, omitUndefined(entry)]),
    ) as T;
  }
  return value;
}

export interface CloudQuizState {
  quizPackages?: QuizPackage[];
  activeSession?: ActiveQuizSession;
  students?: StudentResult[];
  quizHistory?: QuizHistoryEntry[];
}

export async function loadCloudQuizState(): Promise<CloudQuizState | null> {
  await signInAnonymously(auth);
  const snapshot = await getDoc(stateRef);
  if (!snapshot.exists()) return null;

  const state = snapshot.data() as CloudQuizState;
  const activeStudents = state.activeSession?.quizCode
    ? await loadStudentsForSession(state.activeSession.quizCode)
    : [];
  const history = await Promise.all((state.quizHistory || []).map(async (entry) => {
    const historyStudents = await loadStudentsForSession(entry.session.quizCode, true);
    return historyStudents.length > 0 ? { ...entry, students: historyStudents } : entry;
  }));

  return {
    ...state,
    students: activeStudents.length > 0 ? activeStudents : state.students,
    quizHistory: history,
  };
}

export async function saveCloudQuizState(state: CloudQuizState): Promise<void> {
  const metadata = omitUndefined({
    ...state,
    students: undefined,
    quizHistory: state.quizHistory?.map((entry) => ({ ...entry, students: undefined })),
    updatedAt: Date.now(),
  });
  await setDoc(stateRef, metadata, { merge: true });

  if (state.activeSession?.quizCode && state.students) {
    await saveStudentsForSession(state.activeSession.quizCode, state.students);
  }

  await Promise.all((state.quizHistory || []).map((entry) => (
    saveStudentsForSession(entry.session.quizCode, entry.students, true)
  )));
}

export async function saveStudentToCloud(quizCode: string, student: StudentResult, history = false): Promise<void> {
  await setDoc(
    doc(studentsRef(quizCode, history), student.id),
    omitUndefined(student),
    { merge: true },
  );
}

async function loadStudentsForSession(quizCode: string, history = false): Promise<StudentResult[]> {
  const snapshot = await getDocs(studentsRef(quizCode, history));
  return snapshot.docs.map((student) => student.data() as StudentResult);
}

async function saveStudentsForSession(quizCode: string, students: StudentResult[], history = false): Promise<void> {
  await Promise.all(students
    .filter((student) => student.quizCode === quizCode)
    .map((student) => setDoc(
      doc(studentsRef(quizCode, history), student.id),
      omitUndefined(student),
      { merge: true },
    )));
}
