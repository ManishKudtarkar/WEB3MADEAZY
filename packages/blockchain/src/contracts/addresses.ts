/**
 * Runtime contract address resolution from environment variables.
 * Throws clearly if an address is missing or obviously zero.
 */
import { isAddress, zeroAddress } from 'viem';

function requireAddress(envVar: string): `0x${string}` {
  const val = process.env[envVar];
  if (!val || !isAddress(val) || val.toLowerCase() === zeroAddress) {
    throw new Error(`Missing or invalid contract address: ${envVar}`);
  }
  return val as `0x${string}`;
}

export const getRewardTokenAddress = () => requireAddress('REWARD_TOKEN_ADDRESS');
export const getRewardReceiverAddress = () => requireAddress('REWARD_DISTRIBUTOR_ADDRESS');
export const getEnsRegistryAddress = () => requireAddress('ENS_REGISTRY_ADDRESS');
