/**
 * Shared error classes and codes used by API, workers, and frontend error handling.
 */

export type ErrorCode =
  // Auth / identity
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'SESSION_EXPIRED'
  | 'STUDENT_NOT_FOUND'
  | 'STUDENT_ALREADY_EXISTS'
  // World ID
  | 'WORLD_ID_VERIFICATION_FAILED'
  | 'WORLD_ID_DUPLICATE_NULLIFIER'
  | 'WORLD_ID_NOT_VERIFIED'
  // Assessment
  | 'PRACTICE_NOT_COMPLETED'
  | 'MASTER_CHALLENGE_ALREADY_ATTEMPTED'
  | 'MASTER_CHALLENGE_NOT_ELIGIBLE'
  | 'INVALID_ANSWER'
  // Rewards
  | 'REWARD_NOT_ELIGIBLE'
  | 'REWARD_ALREADY_CLAIMED'
  | 'REWARD_CLAIM_IN_PROGRESS'
  | 'REWARD_ATTESTATION_EXPIRED'
  | 'WALLET_NOT_LINKED'
  | 'WALLET_SIGNATURE_INVALID'
  | 'WALLET_ALREADY_LINKED_TO_OTHER_STUDENT'
  // ENS
  | 'ENS_NAME_TAKEN'
  | 'ENS_REGISTRATION_FAILED'
  | 'ENS_NOT_FOUND'
  // CRE
  | 'CRE_WORKFLOW_FAILED'
  | 'CRE_REPORT_INVALID'
  // Blockchain
  | 'TX_FAILED'
  | 'TX_TIMEOUT'
  // General
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR';

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly statusCode: number;
  readonly details?: Record<string, unknown>;

  constructor(code: ErrorCode, message: string, statusCode = 400, details?: Record<string, unknown>) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
      ...(this.details ? { details: this.details } : {}),
    };
  }
}

// Convenience factories
export const Errors = {
  unauthorized: (msg = 'Unauthorized') => new AppError('UNAUTHORIZED', msg, 401),
  forbidden: (msg = 'Forbidden') => new AppError('FORBIDDEN', msg, 403),
  notFound: (resource: string) => new AppError('NOT_FOUND', `${resource} not found`, 404),
  validation: (msg: string, details?: Record<string, unknown>) => new AppError('VALIDATION_ERROR', msg, 400, details),
  rateLimited: (msg = 'Too many requests') => new AppError('RATE_LIMITED', msg, 429),
  internal: (msg = 'Internal server error') => new AppError('INTERNAL_ERROR', msg, 500),
  worldIdNotVerified: () => new AppError('WORLD_ID_NOT_VERIFIED', 'World ID verification is required to access this resource', 403),
  worldIdDuplicate: () => new AppError('WORLD_ID_DUPLICATE_NULLIFIER', 'This identity has already been verified with a different account', 409),
  masterAlreadyAttempted: (lessonId: string) => new AppError('MASTER_CHALLENGE_ALREADY_ATTEMPTED', `You have already submitted a Master Challenge attempt for chapter: ${lessonId}`, 409),
  practiceNotCompleted: (lessonId: string) => new AppError('PRACTICE_NOT_COMPLETED', `Complete all 5 practice questions for chapter: ${lessonId} before attempting the Master Challenge`, 403),
  rewardAlreadyClaimed: (lessonId: string) => new AppError('REWARD_ALREADY_CLAIMED', `Reward for chapter ${lessonId} has already been claimed`, 409),
  rewardNotEligible: (lessonId: string) => new AppError('REWARD_NOT_ELIGIBLE', `You are not eligible for the reward for chapter: ${lessonId}`, 403),
  walletSignatureInvalid: () => new AppError('WALLET_SIGNATURE_INVALID', 'Wallet signature verification failed', 401),
};
