import { ActiveQuizSession, Question, QuizPackage } from '../types';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';

interface SharedQuizPayload {
  session: ActiveQuizSession;
  package: QuizPackage;
}

export const createJoinSessionParam = (session: ActiveQuizSession, quizPackage: QuizPackage) => {
  const payload: SharedQuizPayload = {
    session,
    package: {
      ...quizPackage,
      // Images can make QR payloads unnecessarily large; questions and teams remain intact.
      questions: quizPackage.questions.map(({ imageUrl: _imageUrl, ...question }: Question) => question),
    },
  };
  return compressToEncodedURIComponent(JSON.stringify(payload));
};

export const readJoinSessionParam = (): SharedQuizPayload | null => {
  try {
    const value = new URLSearchParams(window.location.search).get('session');
    if (!value) return null;
    const decoded = decompressFromEncodedURIComponent(value);
    if (!decoded) return null;
    const parsed = JSON.parse(decoded) as SharedQuizPayload;
    if (!parsed?.session?.quizCode || !parsed.package?.questions?.length) return null;
    return parsed;
  } catch {
    return null;
  }
};