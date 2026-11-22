import { create } from 'zustand';
import { type QuizId, SCENES } from '../data/content';

export type ViewMode = 'video' | 'sandbox';
export type ThemeMode = 'dark' | 'light';

interface QuizRecord {
  selectedKey: 'A' | 'B' | 'C' | 'D' | null;
  firstAttemptCorrect: boolean | null;
}

interface PresentationState {
  viewMode: ViewMode;
  sceneIndex: number;
  beatIndex: number;
  theme: ThemeMode;
  coachEnabled: boolean;
  autoPlay: boolean;
  quizzes: Record<QuizId, QuizRecord>;

  setViewMode: (mode: ViewMode) => void;
  setScene: (sceneIndex: number, beatIndex?: number) => void;
  setBeat: (beatIndex: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  toggleTheme: () => void;
  toggleCoach: () => void;
  setAutoPlay: (playing: boolean) => void;
  toggleAutoPlay: () => void;
  answerQuiz: (quizId: QuizId, key: 'A' | 'B' | 'C' | 'D', isCorrect: boolean) => void;
  resetQuizzes: () => void;
}

function applyThemeToDom(theme: ThemeMode) {
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = theme;
  }
}

export const usePresentationStore = create<PresentationState>((set, get) => ({
  viewMode: 'video',
  sceneIndex: 0,
  beatIndex: 0,
  theme: 'dark',
  coachEnabled: true,
  autoPlay: false,
  quizzes: {
    q1: { selectedKey: null, firstAttemptCorrect: null },
    q2: { selectedKey: null, firstAttemptCorrect: null },
    q3: { selectedKey: null, firstAttemptCorrect: null },
  },

  setViewMode: (viewMode) => set({ viewMode, autoPlay: false }),

  setScene: (sceneIndex, beatIndex = 0) => {
    const clampedScene = Math.max(0, Math.min(SCENES.length - 1, sceneIndex));
    const maxBeat = SCENES[clampedScene].beats.length - 1;
    const clampedBeat = Math.max(0, Math.min(maxBeat, beatIndex));
    set({ sceneIndex: clampedScene, beatIndex: clampedBeat });
  },

  setBeat: (beatIndex) => {
    const { sceneIndex } = get();
    const maxBeat = SCENES[sceneIndex].beats.length - 1;
    set({ beatIndex: Math.max(0, Math.min(maxBeat, beatIndex)) });
  },

  nextStep: () => {
    const { sceneIndex, beatIndex } = get();
    const maxBeat = SCENES[sceneIndex].beats.length - 1;
    if (beatIndex < maxBeat) {
      set({ beatIndex: beatIndex + 1 });
    } else if (sceneIndex < SCENES.length - 1) {
      set({ sceneIndex: sceneIndex + 1, beatIndex: 0 });
    } else {
      set({ autoPlay: false });
    }
  },

  prevStep: () => {
    const { sceneIndex, beatIndex } = get();
    if (beatIndex > 0) {
      set({ beatIndex: beatIndex - 1 });
    } else if (sceneIndex > 0) {
      const prevScene = sceneIndex - 1;
      set({ sceneIndex: prevScene, beatIndex: SCENES[prevScene].beats.length - 1 });
    }
  },

  toggleTheme: () => {
    const nextTheme: ThemeMode = get().theme === 'dark' ? 'light' : 'dark';
    applyThemeToDom(nextTheme);
    set({ theme: nextTheme });
  },

  toggleCoach: () => set((s) => ({ coachEnabled: !s.coachEnabled })),

  setAutoPlay: (autoPlay) => set({ autoPlay }),

  toggleAutoPlay: () => set((s) => ({ autoPlay: !s.autoPlay })),

  answerQuiz: (quizId, key, isCorrect) => {
    const current = get().quizzes[quizId];
    set({
      quizzes: {
        ...get().quizzes,
        [quizId]: {
          selectedKey: key,
          firstAttemptCorrect:
            current.firstAttemptCorrect === null ? isCorrect : current.firstAttemptCorrect,
        },
      },
    });
  },

  resetQuizzes: () =>
    set({
      quizzes: {
        q1: { selectedKey: null, firstAttemptCorrect: null },
        q2: { selectedKey: null, firstAttemptCorrect: null },
        q3: { selectedKey: null, firstAttemptCorrect: null },
      },
    }),
}));
