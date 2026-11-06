/**
 * API client for the Ethereum Explorer backend.
 * Handles authentication, request/response formatting, and error mapping.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3003';

export class ApiError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: Record<string, unknown>;
  
  constructor(
    code: string,
    message: string,
    status: number,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('ethereum-explorer-auth-token', token);
  } else {
    localStorage.removeItem('ethereum-explorer-auth-token');
  }
}

export function getAuthToken(): string | null {
  if (authToken) return authToken;
  authToken = localStorage.getItem('ethereum-explorer-auth-token');
  return authToken;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  headers?: Record<string, string>,
): Promise<T> {
  const token = getAuthToken();
  const url = `${API_URL}${path}`;

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      data.code || 'UNKNOWN_ERROR',
      data.error || `Request failed with status ${response.status}`,
      response.status,
      data.details,
    );
  }

  return data.data ?? data;
}

export const api = {
  // Students
  createStudent: (username: string) =>
    request<{ student: { id: string; username: string }; token: string }>('POST', '/api/v1/students', { username }),
  getSession: () =>
    request<{ studentId: string }>('GET', '/api/v1/session'),

  // World ID
  getWorldIdStatus: () =>
    request<{ verified: boolean; verifiedAt: string | null }>('GET', '/api/v1/world-id/status'),
  getWorldIdRpContext: () =>
    request<{
      rp_id: string;
      signal: string;
      nonce: string;
      created_at: number;
      expires_at: number;
      signature: string;
    }>('GET', '/api/v1/world-id/rp-context'),

  verifyWorldId: (payload: {
    result: Record<string, unknown>;
    action: string;
    signal: string;
  }) =>
    request<{ verified: boolean; verifiedAt: string }>('POST', '/api/v1/verify-world-id', payload),

  // Wallets
  linkWallet: (payload: { address: string; signature: string; message: string }) =>
    request<{ id: string; address: string; isPrimary: boolean; linkedAt: string }>('POST', '/api/v1/wallets', payload),

  // Assessments
  submitPractice: (payload: {
    lessonId: string;
    mode: 'developer' | 'explorer';
    questionIndex: number;
    selectedOption: number;
  }) =>
    request<{ id: string; correct: boolean; explanation: string; attemptedAt: string }>('POST', '/api/v1/practice', payload),

  submitMasterChallenge: (
    payload: {
      lessonId: string;
      mode: 'developer' | 'explorer';
      selectedOption: number;
      idempotencyKey: string;
    },
    idempotencyKey: string,
  ) =>
    request<{ id: string; correct: boolean; rewardEligible: boolean; explanation: string; submittedAt: string }>(
      'POST',
      '/api/v1/master-challenge',
      payload,
      { 'Idempotency-Key': idempotencyKey },
    ),

  // Rewards
  claimReward: (payload: {
    lessonId: string;
    mode: 'developer' | 'explorer';
    walletAddress: string;
    signature: string;
    message: string;
  }) =>
    request<{ claimId: string; status: string; tokenAmount: string; txHash: string; blockNumber: string }>(
      'POST',
      '/api/v1/rewards/claim',
      payload,
    ),

  // Curriculum
  getCurriculum: () =>
    request<Array<{ id: string; mode: string; title: string; worlds: unknown[] }>>('GET', '/api/v1/curriculum'),
};
