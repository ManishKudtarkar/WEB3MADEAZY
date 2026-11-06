export type SimulationKey = 'banking' | 'replication' | 'peers' | 'hashes' | 'signatures' | 'blocks' | 'node' | 'wallet' | 'journey' | 'evm' | 'gas' | 'consensus' | 'txpool' | 'receipts' | 'contracts' | 'rpc' | 'rollups' | 'bridges' | 'oracles' | 'smartAccounts' | 'pow' | 'merge' | 'upgrades' | 'standards';
export type Question = { prompt: string; options: string[]; answer: number; explanation: string };

/** A single drag-and-drop Master Challenge definition. */
export type MasterChallenge = {
  /** The question prompt shown to the learner. */
  prompt: string;
  /** Exactly 4 answer options. */
  options: string[];
  /** 0-based index of the correct answer — never revealed client-side before submission. */
  answer: number;
  /** Shown only after an incorrect final submission (server-side enforced). */
  explanation: string;
  /** Short concept label shown on the draggable token. */
  tokenLabel: string;
  /** Short placeholder text shown inside the drop zone before placement. */
  dropZoneHint: string;
};

export type Lesson = {
  id: string;
  worldId: string;
  title: string;
  shortTitle: string;
  summary: string;
  duration: number;
  simulation: SimulationKey;
  aliases: string[];
  prerequisites: string[];
  related: string[];
  intro: string[];
  question: Question;
  experiment: string;
  reveal: string;
  mentalModel: string;
  deepDive: { title: string; body: string; example?: string; code?: string }[];
  relatedWhy?: Record<string, string>;
  boundary: string;
  check: Question;
  /** Five retryable practice MCQs — must all be answered correctly to unlock the Master Challenge. */
  practiceQuestions?: Question[];
  /** One final, single-attempt drag-and-drop challenge. */
  masterChallenge?: MasterChallenge;
  nextQuestion: string;
  sources: { title: string; url: string }[];
};
export type CurriculumWorld = { id: string; title: string; description: string; order: number; lessonIds: string[]; topics: string[] };
export type SimulationProps = { onDiscover: (message: string) => void };

// ── Explorer Mode types ────────────────────────────────────────────────────────

export type ExplorerChapterMode = 'explorer';

export type ExplorerChapter = {
  id: string;
  title: string;
  tagline: string;
  /** One-sentence summary for navigation. */
  summary: string;
  /** Visual icon slug for the chapter card. */
  icon: string;
  order: number;
  /** Plain-English sections. */
  sections: ExplorerSection[];
  /** Simple analogy to anchor the concept. */
  analogy: { title: string; body: string };
  /** Why this matters to an everyday user. */
  whyItMatters: string;
  /** Five retryable practice MCQs. */
  practiceQuestions: Question[];
  /** One single-attempt drag-and-drop master challenge. */
  masterChallenge: MasterChallenge;
};

export type ExplorerSection = {
  heading: string;
  body: string[];
  /** Optional animated demo key. */
  demo?: ExplorerDemoKey;
};

export type ExplorerDemoKey =
  | 'centralised-vs-decentralised'
  | 'wallet-keys'
  | 'transaction-journey'
  | 'gas-meter'
  | 'smart-contract'
  | 'token-balance'
  | 'ens-name'
  | 'web3-login';

// ── Identity / assessment types (shared browser ↔ server) ──────────────────────

export type LearningMode = 'developer' | 'explorer';

export type PracticeResult = {
  lessonId: string;
  mode: LearningMode;
  completedAt: number;
};

export type MasterChallengeResult = {
  lessonId: string;
  mode: LearningMode;
  correct: boolean;
  submittedAt: number;
  rewardEligible: boolean;
};
