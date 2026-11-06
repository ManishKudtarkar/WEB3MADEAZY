/**
 * Hook for wallet connection and linking.
 * Uses browser wallet (MetaMask, etc.) for signing.
 */
import { useState, useCallback } from 'react';
import { api, ApiError } from '../../../lib/api.ts';

export type WalletState = {
  address: string | null;
  isConnecting: boolean;
  isLinking: boolean;
  isLinked: boolean;
  error: string | null;
};

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    isConnecting: false,
    isLinking: false,
    isLinked: false,
    error: null,
  });

  const connect = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') {
      setState(prev => ({ ...prev, error: 'No wallet detected. Please install MetaMask.' }));
      return null;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
      const address = accounts[0];
      setState(prev => ({ ...prev, address, isConnecting: false }));
      return address;
    } catch (err) {
      setState(prev => ({ ...prev, isConnecting: false, error: 'Wallet connection rejected' }));
      return null;
    }
  }, []);

  const linkWallet = useCallback(async (studentId: string) => {
    if (!state.address) {
      setState(prev => ({ ...prev, error: 'No wallet connected' }));
      return false;
    }

    setState(prev => ({ ...prev, isLinking: true, error: null }));
    try {
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

      if (!window.ethereum) {
        setState(prev => ({ ...prev, isLinking: false, error: 'Wallet disconnected' }));
        return false;
      }

      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, state.address],
      }) as string;

      await api.linkWallet({ address: state.address, signature, message });
      setState(prev => ({ ...prev, isLinking: false, isLinked: true }));
      return true;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to link wallet';
      setState(prev => ({ ...prev, isLinking: false, error: message }));
      return false;
    }
  }, [state.address]);

  return { ...state, connect, linkWallet };
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on?: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}
