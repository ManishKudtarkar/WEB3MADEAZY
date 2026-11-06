/**
 * Reward claim button component.
 * Handles the full claim flow: wallet connection, signature, backend submission.
 */
import { useState } from 'react';
import { Award, Check, Loader2 } from 'lucide-react';
import { claimReward } from '../services/rewardService.ts';
import { ApiError } from '../../../lib/api.ts';

type Props = {
  lessonId: string;
  mode: 'developer' | 'explorer';
  studentId: string;
  tokenAmount: string;
  onClaimed: () => void;
};

export function RewardClaimButton({ lessonId, mode, studentId, tokenAmount, onClaimed }: Props) {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'signing' | 'claiming' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleClaim = async () => {
    setStatus('connecting');
    setError(null);

    try {
      // Connect wallet
      if (typeof window.ethereum === 'undefined') {
        throw new Error('No wallet detected. Please install MetaMask.');
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
      const walletAddress = accounts[0];

      setStatus('signing');
      
      // Claim reward (includes signature step)
      setStatus('claiming');
      const result = await claimReward(lessonId, mode, walletAddress, studentId);
      setTxHash(result?.txHash ?? null);

      setStatus('success');
      setTimeout(onClaimed, 1500);
    } catch (err) {
      setStatus('error');
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to claim reward');
      }
    }
  };

  if (status === 'success') {
    return (
      <div className="reward-claim-success">
        <Check size={16} />
        <span>
          Reward confirmed on Sepolia. Your tokens are available now.
          {txHash && <a href={`${import.meta.env.VITE_BLOCK_EXPLORER_URL || 'https://sepolia.etherscan.io'}/tx/${txHash}`} target="_blank" rel="noreferrer"> View transaction</a>}
        </span>
      </div>
    );
  }

  return (
    <div className="reward-claim">
      <button
        className="btn btn-primary"
        onClick={handleClaim}
        disabled={status !== 'idle' && status !== 'error'}
      >
        {status === 'connecting' && <><Loader2 size={14} className="spinning" /> Connecting wallet...</>}
        {status === 'signing' && <><Loader2 size={14} className="spinning" /> Sign message...</>}
        {status === 'claiming' && <><Loader2 size={14} className="spinning" /> Claiming...</>}
        {(status === 'idle' || status === 'error') && <><Award size={14} /> Claim {tokenAmount} tokens</>}
      </button>
      {error && <p className="reward-claim-error">{error}</p>}
    </div>
  );
}
