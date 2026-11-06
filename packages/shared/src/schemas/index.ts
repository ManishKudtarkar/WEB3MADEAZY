/**
 * Zod-compatible validation schemas for API request/response bodies.
 * We keep these as plain TypeScript type guards to avoid adding a Zod
 * dependency to every consumer. Zod schemas live in apps/api.
 */

// ── Request body shapes (used for documentation and light validation) ─────────

export type CreateStudentBody = {
  username: string;
};

export type VerifyWorldIdBody = {
  result: Record<string, unknown>;
  action: string;
  signal: string;
};

export type LinkWalletBody = {
  address: string;
  signature: string;
  message: string;
};

export type SubmitPracticeBody = {
  lessonId: string;
  mode: 'developer' | 'explorer';
  questionIndex: number;
  selectedOption: number;
};

export type SubmitMasterChallengeBody = {
  lessonId: string;
  mode: 'developer' | 'explorer';
  selectedOption: number;
  /** Idempotency key — client generates once before showing the challenge. */
  idempotencyKey: string;
};

export type ClaimRewardBody = {
  lessonId: string;
  mode: 'developer' | 'explorer';
  walletAddress: string;
  /** EIP-712 signature proving wallet ownership. */
  signature: string;
  message: string;
};

export type RegisterEnsBody = {
  username: string;
  walletAddress: string;
  signature: string;
};

// ── Simple type guards ────────────────────────────────────────────────────────

export function isString(v: unknown): v is string {
  return typeof v === 'string';
}

export function isEthAddress(v: unknown): v is string {
  return typeof v === 'string' && /^0x[0-9a-fA-F]{40}$/.test(v);
}

export function isLearningMode(v: unknown): v is 'developer' | 'explorer' {
  return v === 'developer' || v === 'explorer';
}

export function isValidUsername(v: unknown): v is string {
  return typeof v === 'string' && /^[a-z0-9-]{3,32}$/.test(v);
}
