import { getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { auth } from './googleAuth';
import { ActiveQuizSession, QuizPackage, StudentResult } from '../types';

const db = getFirestore(getApp());
const stateRef = doc(db, 'octoquiz', 'shared-state');

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
}

export async function loadCloudQuizState(): Promise<CloudQuizState | null> {
  await signInAnonymously(auth);
  const snapshot = await getDoc(stateRef);
  return snapshot.exists() ? snapshot.data() as CloudQuizState : null;
}

export async function saveCloudQuizState(state: CloudQuizState): Promise<void> {
  await setDoc(stateRef, omitUndefined({
    ...state,
    updatedAt: Date.now(),
  }), { merge: true });
}
