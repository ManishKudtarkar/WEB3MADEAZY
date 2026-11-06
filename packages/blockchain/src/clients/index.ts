/**
 * Viem public and wallet clients for the Sepolia testnet.
 * Lazily initialised — call getPublicClient() / getWalletClient() at runtime,
 * not at module load, so the env vars are present.
 */
import { createPublicClient, createWalletClient, http, type PublicClient, type WalletClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';

let _publicClient: PublicClient | null = null;
let _walletClient: WalletClient | null = null;

export function getPublicClient(): PublicClient {
  if (_publicClient) return _publicClient;
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  if (!rpcUrl) throw new Error('SEPOLIA_RPC_URL is not configured');
  _publicClient = createPublicClient({ chain: sepolia, transport: http(rpcUrl) });
  return _publicClient;
}

export function getWalletClient(): WalletClient {
  if (_walletClient) return _walletClient;
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  const privateKey = process.env.PLATFORM_PRIVATE_KEY;
  if (!rpcUrl) throw new Error('SEPOLIA_RPC_URL is not configured');
  if (!privateKey) throw new Error('PLATFORM_PRIVATE_KEY is not configured');
  const account = privateKeyToAccount(`0x${privateKey.replace(/^0x/, '')}`);
  _walletClient = createWalletClient({ account, chain: sepolia, transport: http(rpcUrl) });
  return _walletClient;
}

/** Reset cached clients (useful for testing). */
export function resetClients(): void {
  _publicClient = null;
  _walletClient = null;
}
