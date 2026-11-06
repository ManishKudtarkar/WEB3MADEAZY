/**
 * Shared blockchain utilities — formatting, parsing, retry helpers.
 */
import { formatUnits, parseUnits, isAddress } from 'viem';
import { TOKEN_DECIMALS } from '@ethereum-explorer/shared';

/** Convert a human-readable token amount (e.g. "10") to wei bigint. */
export function toTokenUnits(amount: string): bigint {
  return parseUnits(amount, TOKEN_DECIMALS);
}

/** Convert a wei bigint to a human-readable string (e.g. "10.0"). */
export function fromTokenUnits(amount: bigint): string {
  return formatUnits(amount, TOKEN_DECIMALS);
}

/** Validate that a string is a checksummed or plain EVM address. */
export function isValidAddress(address: unknown): address is `0x${string}` {
  return typeof address === 'string' && isAddress(address);
}

/**
 * Retry an async operation up to `maxAttempts` times with exponential back-off.
 * Useful for RPC calls that may transiently fail.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 1_000,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, baseDelayMs * 2 ** (attempt - 1)));
      }
    }
  }
  throw lastError;
}

/**
 * Derive a bytes32 commitment from claimId + studentId (deterministic, collision-resistant).
 * Used as replay protection in RewardReceiver.sol.
 */
import { keccak256, toHex, stringToBytes } from 'viem';

export function buildCommitment(claimId: string, studentId: string): `0x${string}` {
  return keccak256(toHex(`${claimId}:${studentId}`, { size: 32 }));
}

/**
 * Encode a string report ID as bytes32 for the smart contract.
 */
export function encodeReportId(reportId: string): `0x${string}` {
  const bytes = stringToBytes(reportId, { size: 32 });
  return toHex(bytes);
}

/**
 * Wait for a transaction receipt with a configurable timeout.
 */
export async function waitForReceipt(
  txHash: `0x${string}`,
  timeoutMs = 120_000,
) {
  const { getPublicClient } = await import('../clients/index.ts');
  const client = getPublicClient();

  const receipt = await client.waitForTransactionReceipt({
    hash: txHash,
    timeout: timeoutMs,
    confirmations: 1,
  });

  if (receipt.status === 'reverted') {
    throw new Error(`Transaction reverted: ${txHash}`);
  }

  return receipt;
}
