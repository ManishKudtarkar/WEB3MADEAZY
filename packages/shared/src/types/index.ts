/**
 * Shared types used across apps/web, apps/api, and packages.
 * These are the canonical definitions — import from here, not from app-local files.
 */

// ── Learning ─────────────────────────────────────────────────────────────────

export type LearningMode = 'developer' | 'explorer';

export type ChapterStatus =
  | 'not_started'
  | 'in_progress'
  | 'practice_completed'
  | 'master_unlocked'
  | 'master_passed'
  | 'master_failed'
  | 'reward_eligible'
  | 'reward_claimed';

export type Question = {
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
};

export type MasterChallenge = {
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
  tokenLabel: string;
  dropZoneHint: string;
};

// ── Students ─────────────────────────────────────────────────────────────────

export type StudentProfile = {
  id: string;
  username: string;
  ensName: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LinkedWallet = {
  id: string;
  studentId: string;
  address: string;
  isPrimary: boolean;
  linkedAt: string;
};

// ── Assessments ───────────────────────────────────────────────────────────────

export type PracticeAttempt = {
  id: string;
  studentId: string;
  lessonId: string;
  mode: LearningMode;
  questionIndex: number;
  selectedOption: number;
  correct: boolean;
  attemptedAt: string;
};

export type MasterChallengeAttempt = {
  id: string;
  studentId: string;
  lessonId: string;
  mode: LearningMode;
  selectedOption: number;
  correct: boolean;
  submittedAt: string;
  rewardEligible: boolean;
};

// ── Rewards ───────────────────────────────────────────────────────────────────

export type RewardClaim = {
  id: string;
  studentId: string;
  lessonId: string;
  mode: LearningMode;
  walletAddress: string;
  tokenAmount: string;
  status: RewardClaimStatus;
  txHash: string | null;
  blockNumber: number | null;
  claimedAt: string | null;
  createdAt: string;
};

export type RewardClaimStatus =
  | 'pending'
  | 'cre_submitted'
  | 'cre_completed'
  | 'minting'
  | 'confirmed'
  | 'failed'
  | 'expired';

// ── Achievements ──────────────────────────────────────────────────────────────

export type BadgeId =
  | 'first_victory'
  | 'rising_explorer'
  | 'knowledge_champion'
  | 'ethereum_master';

export type Badge = {
  id: BadgeId;
  name: string;
  description: string;
  requirement: string;
  icon: string;
  color: string;
};

export type StudentBadge = {
  studentId: string;
  badgeId: BadgeId;
  earnedAt: string;
};

// ── ENS ───────────────────────────────────────────────────────────────────────

export type EnsProfile = {
  studentId: string;
  subname: string;
  fullName: string;
  ownerAddress: string;
  registeredAt: string;
};

// ── API responses ─────────────────────────────────────────────────────────────

export type ApiResponse<T> = {
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiError = {
  error: string;
  code: string;
  details?: Record<string, unknown>;
};

export type PaginatedResponse<T> = ApiResponse<T[]> & {
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
};

// ── World ID ──────────────────────────────────────────────────────────────────

export type WorldIdVerification = {
  studentId: string;
  nullifierHash: string;
  verifiedAt: string;
  credential: 'orb' | 'device';
};

// ── CRE Workflow ──────────────────────────────────────────────────────────────

export type CreWorkflowExecution = {
  id: string;
  claimId: string;
  workflowId: string;
  status: 'initiated' | 'running' | 'completed' | 'failed';
  reportHash: string | null;
  startedAt: string;
  completedAt: string | null;
  error: string | null;
};
