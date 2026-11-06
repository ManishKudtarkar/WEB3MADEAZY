/**
 * Hook for World ID verification state and actions.
 */
import { useState, useCallback } from 'react';
import { api, ApiError } from '../../../lib/api.ts';

export type WorldIdState = {
  isVerified: boolean;
  isVerifying: boolean;
  error: string | null;
};

export function useWorldId() {
  const [state, setState] = useState<WorldIdState>({
    isVerified: false,
    isVerifying: false,
    error: null,
  });

  const verify = useCallback(async (proof: {
    result: Record<string, unknown>;
    action: string;
    signal: string;
  }) => {
    setState(prev => ({ ...prev, isVerifying: true, error: null }));
    try {
      await api.verifyWorldId(proof);
      setState({ isVerified: true, isVerifying: false, error: null });
      return true;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Verification failed';
      setState(prev => ({ ...prev, isVerifying: false, error: message }));
      return false;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ isVerified: false, isVerifying: false, error: null });
  }, []);

  return { ...state, verify, reset };
}
