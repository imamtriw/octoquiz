import { getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { auth } from './googleAuth';
import { ActiveQuizSession, QuizPackage, StudentResult } from '../types';

const db = getFirestore(getApp());
const stateRef = doc(db, 'octoquiz', 'shared-state');

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
  await setDoc(stateRef, {
    ...state,
    updatedAt: Date.now(),
  }, { merge: true });
}
