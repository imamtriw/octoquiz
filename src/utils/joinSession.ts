import { ActiveQuizSession, Question, QuizPackage } from '../types';

interface SharedQuizPayload {
  session: ActiveQuizSession;
  package: QuizPackage;
}

const encodeBase64Url = (value: string) => {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach(byte => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const decodeBase64Url = (value: string) => {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((value.length + 3) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

export const createJoinSessionParam = (session: ActiveQuizSession, quizPackage: QuizPackage) => {
  const payload: SharedQuizPayload = {
    session,
    package: {
      ...quizPackage,
      // Images can make QR payloads unnecessarily large; questions and teams remain intact.
      questions: quizPackage.questions.map(({ imageUrl: _imageUrl, ...question }: Question) => question),
    },
  };
  return encodeBase64Url(JSON.stringify(payload));
};

export const readJoinSessionParam = (): SharedQuizPayload | null => {
  try {
    const value = new URLSearchParams(window.location.search).get('session');
    if (!value) return null;
    const parsed = JSON.parse(decodeBase64Url(value)) as SharedQuizPayload;
    if (!parsed?.session?.quizCode || !parsed.package?.questions?.length) return null;
    return parsed;
  } catch {
    return null;
  }
};