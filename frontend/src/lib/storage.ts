export type Progress = {
  completed: string[];
  visited: string[];
  lastLesson: string;
  scenes: Record<string, number>;
  /** Lessons where all 5 practice MCQs have been answered correctly */
  practiceCompleted: string[];
  /** Master Challenge results: lessonId → true (correct) | false (incorrect) */
  masterResults: Record<string, boolean>;
};
const emptyProgress: Progress = {
  completed: [],
  visited: [],
  lastLesson: 'source-of-truth',
  scenes: {},
  practiceCompleted: [],
  masterResults: {},
};
export function readProgress(): Progress {
  try {
    const value: unknown = JSON.parse(localStorage.getItem('ethereum-explorer-progress-v1') || 'null');
    if (!value || typeof value !== 'object') return emptyProgress;
    const raw = value as Record<string, unknown>;
    return {
      completed: Array.isArray(raw.completed) ? raw.completed.filter((v): v is string => typeof v === 'string') : [],
      visited: Array.isArray(raw.visited) ? raw.visited.filter((v): v is string => typeof v === 'string') : [],
      lastLesson: typeof raw.lastLesson === 'string' ? raw.lastLesson : 'source-of-truth',
      // Existing four-scene saves resume at their equivalent teaching stage.
      scenes: raw.scenes && typeof raw.scenes === 'object' ? Object.fromEntries(Object.entries(raw.scenes).filter(([,v]) => Number.isInteger(v) && v >= 0 && v <= (raw.teachingVersion === 2 ? 7 : 3)).map(([id, scene]) => [id, raw.teachingVersion === 2 ? scene : [0, 4, 5, 6][scene as number]])) : {},
      practiceCompleted: Array.isArray(raw.practiceCompleted) ? (raw.practiceCompleted as unknown[]).filter((v): v is string => typeof v === 'string') : [],
      masterResults: raw.masterResults && typeof raw.masterResults === 'object' && !Array.isArray(raw.masterResults)
        ? Object.fromEntries(Object.entries(raw.masterResults as Record<string, unknown>).filter(([, v]) => typeof v === 'boolean') as [string, boolean][])
        : {},
    };
  } catch { return emptyProgress; }
}
export function saveProgress(value: Progress): boolean {
  try { localStorage.setItem('ethereum-explorer-progress-v1', JSON.stringify({ ...value, teachingVersion: 2 })); return true; }
  catch { return false; }
}
export function clearProgress(): Progress {
  try { localStorage.removeItem('ethereum-explorer-progress-v1'); } catch { /* Continue with an in-memory reset. */ }
  return { ...emptyProgress, scenes: {}, completed: [], visited: [], practiceCompleted: [], masterResults: {} };
}
export function readPreference(key: string): boolean {
  try { return localStorage.getItem(`ethereum-explorer-${key}`) === 'true'; } catch { return false; }
}
export function savePreference(key: string, value: boolean) {
  try { localStorage.setItem(`ethereum-explorer-${key}`, String(value)); } catch { /* Preferences remain in memory when storage is unavailable. */ }
}
