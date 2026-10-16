import { useSyncExternalStore } from 'react';

export type WordPracticeStat = {
  correctCount: number;
  wrongCount: number;
  lastScore: number;
  status: 'passed' | 'struggling';
  updatedAt: number;
};

export type ProgressState = {
  xp: number;
  hearts: number;
  streak: number;
  lastPracticed: string | null;
  completed: Record<string, number>;
  wordStats: Record<string, WordPracticeStat>;
};

const STORAGE_KEY_PROGRESS = 'hsk-progress';
const STORAGE_KEY_WORD_STATS = 'hsk_vocab_pronunciation_stats_v1';
export const MAX_HEARTS = 5;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function defaultProgress(): ProgressState {
  return {
    xp: 0,
    hearts: MAX_HEARTS,
    streak: 0,
    lastPracticed: null,
    completed: {},
    wordStats: {}
  };
}

function loadFromStorage(): ProgressState {
  if (typeof window === 'undefined') return defaultProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROGRESS);
    const parsed = raw ? JSON.parse(raw) : {};

    let wordStats: Record<string, WordPracticeStat> = {};
    const rawStats = localStorage.getItem(STORAGE_KEY_WORD_STATS);
    if (rawStats) {
      try {
        wordStats = JSON.parse(rawStats);
      } catch {
        // ignore
      }
    }

    return {
      xp: parsed.xp ?? 0,
      hearts: parsed.hearts ?? MAX_HEARTS,
      streak: parsed.streak ?? 0,
      lastPracticed: parsed.lastPracticed ?? null,
      completed: parsed.completed ?? {},
      wordStats
    };
  } catch {
    return defaultProgress();
  }
}

let currentState: ProgressState = loadFromStorage();
const listeners = new Set<() => void>();

function notify() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(
        STORAGE_KEY_PROGRESS,
        JSON.stringify({
          xp: currentState.xp,
          hearts: currentState.hearts,
          streak: currentState.streak,
          lastPracticed: currentState.lastPracticed,
          completed: currentState.completed
        })
      );
      localStorage.setItem(
        STORAGE_KEY_WORD_STATS,
        JSON.stringify(currentState.wordStats)
      );
    } catch (e) {
      console.warn('Failed to save progress to localStorage', e);
    }
  }
  listeners.forEach((fn) => fn());
}

export const progressStore = {
  getSnapshot(): ProgressState {
    return currentState;
  },

  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  addXp(amount: number) {
    const t = today();
    let newStreak = currentState.streak;
    if (currentState.lastPracticed !== t) {
      const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
      newStreak = currentState.lastPracticed === yesterday ? currentState.streak + 1 : 1;
    }

    currentState = {
      ...currentState,
      xp: currentState.xp + amount,
      streak: newStreak,
      lastPracticed: t
    };
    notify();
  },

  loseHeart() {
    currentState = {
      ...currentState,
      hearts: Math.max(0, currentState.hearts - 1)
    };
    notify();
  },

  refillHearts() {
    currentState = {
      ...currentState,
      hearts: MAX_HEARTS
    };
    notify();
  },

  completeStage(stageId: string, stars: number, xpBonus = 25) {
    const prev = currentState.completed[stageId] ?? 0;
    const newCompleted = {
      ...currentState.completed,
      [stageId]: Math.max(prev, stars)
    };

    const t = today();
    let newStreak = currentState.streak;
    if (currentState.lastPracticed !== t) {
      const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
      newStreak = currentState.lastPracticed === yesterday ? currentState.streak + 1 : 1;
    }

    currentState = {
      ...currentState,
      completed: newCompleted,
      xp: currentState.xp + xpBonus,
      streak: newStreak,
      lastPracticed: t
    };
    notify();
  },

  recordWordPractice(wordId: string, score: number, isCorrect: boolean) {
    const prev = currentState.wordStats[wordId] || {
      correctCount: 0,
      wrongCount: 0,
      lastScore: 0,
      status: 'unlearned',
      updatedAt: 0
    };

    const updated: WordPracticeStat = {
      correctCount: prev.correctCount + (isCorrect ? 1 : 0),
      wrongCount: prev.wrongCount + (!isCorrect ? 1 : 0),
      lastScore: score,
      status: isCorrect ? 'passed' : 'struggling',
      updatedAt: Date.now()
    };

    currentState = {
      ...currentState,
      wordStats: {
        ...currentState.wordStats,
        [wordId]: updated
      }
    };
    notify();
  },

  reset() {
    currentState = defaultProgress();
    notify();
  }
};

export function useProgress(): ProgressState & {
  maxHearts: number;
  addXp: (amount: number) => void;
  loseHeart: () => void;
  refillHearts: () => void;
  completeStage: (stageId: string, stars: number, xpBonus?: number) => void;
  recordWordPractice: (wordId: string, score: number, isCorrect: boolean) => void;
  reset: () => void;
} {
  const snapshot = useSyncExternalStore(
    progressStore.subscribe,
    progressStore.getSnapshot,
    progressStore.getSnapshot
  );

  return {
    ...snapshot,
    maxHearts: MAX_HEARTS,
    addXp: progressStore.addXp,
    loseHeart: progressStore.loseHeart,
    refillHearts: progressStore.refillHearts,
    completeStage: progressStore.completeStage,
    recordWordPractice: progressStore.recordWordPractice,
    reset: progressStore.reset
  };
}
