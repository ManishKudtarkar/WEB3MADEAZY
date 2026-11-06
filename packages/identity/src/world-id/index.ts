/**
 * World ID verification helpers (server-side).
 *
 * Handles the HTTP call to the World ID Developer Portal API and exposes
 * typed result / error types consumed by the backend world-id module.
 */

export type WorldIdInput = {
  result: Record<string, unknown>;
  action: string;
  signal: string;
};

export type WorldIdVerifyResult = {
  nullifierHash: string;
  verificationLevel: 'orb' | 'device';
};

export class WorldIdError extends Error {
  public readonly code: 'invalid_proof' | 'duplicate_identity' | 'provider_unavailable' | 'config_missing';
  
  constructor(
    code: 'invalid_proof' | 'duplicate_identity' | 'provider_unavailable' | 'config_missing',
    message: string,
  ) {
    super(message);
    this.name = 'WorldIdError';
    this.code = code;
  }
}

/**
 * Verify a World ID ZKP against the Developer Portal.
 * Throws WorldIdError on any failure.
 */
export async function verifyWorldId(
  input: WorldIdInput,
  signal?: AbortSignal,
): Promise<WorldIdVerifyResult> {
  const endpoint = process.env.WORLD_ID_VERIFICATION_ENDPOINT;
  const appId = process.env.WORLD_ID_APP_ID;
  const rpId = process.env.WORLD_ID_RP_ID;
  if ((!endpoint && !rpId) || !appId) {
    throw new WorldIdError('config_missing', 'World ID verification endpoint or RP ID, and app ID, are required');
  }
  const verificationEndpoint = endpoint || `https://developer.world.org/api/v4/verify/${rpId}`;

  let response: Response;
  try {
    response = await fetch(verificationEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...input.result,
      }),
      signal,
    });
  } catch (err) {
    throw new WorldIdError('provider_unavailable', `World ID API unreachable: ${String(err)}`);
  }

  if (response.status === 400) {
    const body = await response.json().catch(() => ({})) as Record<string, unknown>;
    const detail = typeof body.detail === 'string' ? body.detail : 'invalid_proof';
    if (detail.includes('already_used') || detail.includes('duplicate')) {
      throw new WorldIdError('duplicate_identity', 'This World ID nullifier has already been used');
    }
    throw new WorldIdError('invalid_proof', `World ID verification failed: ${detail}`);
  }

  if (!response.ok) {
    throw new WorldIdError('provider_unavailable', `World ID API returned ${response.status}`);
  }

  const result = await response.json() as {
    success?: boolean;
    nullifier?: string;
    results?: Array<{ nullifier?: string }>;
  };
  if (!result.success) {
    throw new WorldIdError('invalid_proof', 'World ID proof verification returned success=false');
  }

  return {
    nullifierHash: result.nullifier ?? result.results?.[0]?.nullifier ?? 'unknown',
    verificationLevel: 'orb',
  };
}

/**
 * Build the signal string for a student's Master Challenge verification.
 * Keeps the signal deterministic per student so the same World ID can be
 * recognised even if the frontend regenerates it.
 */
export function buildStudentSignal(studentId: string): string {
  return `learner-${studentId}`;
}
