/**
 * Reward claim service — handles the full claim flow including wallet signature.
 */
import { api } from '../../../lib/api.ts';

export async function claimReward(
  lessonId: string,
  mode: 'developer' | 'explorer',
  walletAddress: string,
  studentId: string,
): Promise<{ claimId: string; status: string; tokenAmount: string; txHash: string; blockNumber: string } | null> {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('No wallet detected');
  }

  // Build the message for wallet signature
  const issuedAt = new Date().toISOString();
  const message = [
    `ethereum-explorer.xyz wants to link your wallet to your Ethereum Explorer account.`,
    '',
    `Student ID: ${studentId}`,
    `Issued at: ${issuedAt}`,
    '',
    'Sign this message to confirm you own this wallet.',
    'This does not authorise any transactions.',
  ].join('\n');

  // Request signature from wallet
  const signature = await window.ethereum.request({
    method: 'personal_sign',
    params: [message, walletAddress],
  }) as string;

  // Submit to backend
  const result = await api.claimReward({
    lessonId,
    mode,
    walletAddress,
    signature,
    message,
  });

  return result;
}
