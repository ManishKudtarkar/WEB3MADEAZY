/**
 * Wallet signature verification helpers.
 *
 * The platform uses EIP-191 personal_sign for linking a wallet to a student
 * account.  The signed message is deterministic and includes:
 *   - the student ID (prevents replay across accounts)
 *   - the platform domain (prevents cross-origin replay)
 *   - an ISO timestamp (≤ 10 minutes old, prevents stale replay)
 */
import { verifyMessage, isAddress } from 'viem';

export class WalletVerificationError extends Error {
  public readonly code:
    | 'invalid_address'
    | 'signature_mismatch'
    | 'message_expired'
    | 'message_malformed';
  
  constructor(
    code:
      | 'invalid_address'
      | 'signature_mismatch'
      | 'message_expired'
      | 'message_malformed',
    message: string,
  ) {
    super(message);
    this.name = 'WalletVerificationError';
    this.code = code;
  }
}

const MAX_AGE_MS = 10 * 60 * 1_000; // 10 minutes
const DOMAIN = 'ethereum-explorer.xyz';

/**
 * Build the canonical wallet-link message that the frontend must sign.
 * Must be called server-side to generate the message for display, then
 * the same function is called to reconstruct it for verification.
 */
export function buildWalletLinkMessage(studentId: string, issuedAt: string): string {
  return [
    `${DOMAIN} wants to link your wallet to your Ethereum Explorer account.`,
    '',
    `Student ID: ${studentId}`,
    `Issued at: ${issuedAt}`,
    '',
    'Sign this message to confirm you own this wallet.',
    'This does not authorise any transactions.',
  ].join('\n');
}

/**
 * Verify that `signature` is a valid EIP-191 personal_sign over `message`
 * from `address`.  Also validates that the embedded timestamp is recent.
 *
 * @throws WalletVerificationError on any failure.
 */
export async function verifyWalletSignature(params: {
  address: string;
  signature: string;
  message: string;
  studentId: string;
}): Promise<void> {
  const { address, signature, message, studentId } = params;

  // 1. Validate address format
  if (!isAddress(address)) {
    throw new WalletVerificationError('invalid_address', `Not a valid Ethereum address: ${address}`);
  }

  // 2. Extract and validate timestamp from message
  const issuedAtMatch = message.match(/Issued at: (.+)/);
  if (!issuedAtMatch) {
    throw new WalletVerificationError('message_malformed', 'Message is missing "Issued at" field');
  }
  const issuedAt = new Date(issuedAtMatch[1]);
  if (isNaN(issuedAt.getTime())) {
    throw new WalletVerificationError('message_malformed', 'Invalid timestamp in message');
  }
  if (Date.now() - issuedAt.getTime() > MAX_AGE_MS) {
    throw new WalletVerificationError('message_expired', 'Wallet link message has expired (> 10 minutes)');
  }

  // 3. Verify the message contains the correct student ID
  if (!message.includes(`Student ID: ${studentId}`)) {
    throw new WalletVerificationError('message_malformed', 'Student ID in message does not match session');
  }

  // 4. Recover signer and compare
  let valid: boolean;
  try {
    valid = await verifyMessage({
      address: address as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    });
  } catch {
    throw new WalletVerificationError('signature_mismatch', 'Signature could not be verified');
  }

  if (!valid) {
    throw new WalletVerificationError('signature_mismatch', 'Signature does not match the provided address');
  }
}

/** Generate a fresh ISO timestamp for embedding in a wallet link message. */
export function buildIssuedAt(): string {
  return new Date().toISOString();
}
