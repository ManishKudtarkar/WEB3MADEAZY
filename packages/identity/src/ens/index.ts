/**
 * ENSv2 subname registration and resolution helpers.
 *
 * The platform registers subnames under ENS_PARENT_NAME (e.g. learners.eth)
 * via the deployed ENS SubnameRegistry contract on Sepolia.
 *
 * Flow:
 *  1. validateSubname()       — check label + parent are valid
 *  2. isSubnameTaken()        — read from chain (view call)
 *  3. registerSubname()       — write tx (platform wallet pays gas)
 *  4. resolveSubname()        — look up owner on chain
 */
import { isAddress } from 'viem';
import { getPublicClient, getWalletClient } from '@ethereum-explorer/blockchain';
import {
  ENS_SUBNAME_REGISTRY_ABI,
  getEnsRegistryAddress,
} from '@ethereum-explorer/blockchain';

export class EnsError extends Error {
  public readonly code:
    | 'config_missing'
    | 'invalid_label'
    | 'name_taken'
    | 'registration_failed'
    | 'resolution_failed';
  
  constructor(
    code:
      | 'config_missing'
      | 'invalid_label'
      | 'name_taken'
      | 'registration_failed'
      | 'resolution_failed',
    message: string,
  ) {
    super(message);
    this.name = 'EnsError';
    this.code = code;
  }
}

const LABEL_RE = /^[a-z0-9-]{3,32}$/;

/** Check that an ENS label (the part before the dot) is valid. */
export function validateSubnameLabel(label: string): void {
  if (!LABEL_RE.test(label)) {
    throw new EnsError(
      'invalid_label',
      `ENS label "${label}" must be 3–32 lowercase alphanumeric characters or hyphens`,
    );
  }
}

/** Build the full ENS name for a given label under the configured parent. */
export function buildFullName(label: string): string {
  const parent = process.env.ENS_PARENT_NAME;
  if (!parent) throw new EnsError('config_missing', 'ENS_PARENT_NAME is not configured');
  validateSubnameLabel(label);
  return `${label}.${parent}`;
}

/** Returns true if the label is already registered on-chain. */
export async function isSubnameTaken(label: string): Promise<boolean> {
  const client = getPublicClient();
  const registryAddress = getEnsRegistryAddress();
  validateSubnameLabel(label);

  try {
    const owner = await client.readContract({
      address: registryAddress,
      abi: ENS_SUBNAME_REGISTRY_ABI,
      functionName: 'resolve',
      args: [label],
    });
    // Zero address means not registered
    return isAddress(owner as string) && (owner as string) !== '0x0000000000000000000000000000000000000000';
  } catch {
    // If the call reverts the name is not registered
    return false;
  }
}

export type SubnameRegistrationResult = {
  label: string;
  fullName: string;
  ownerAddress: string;
  txHash: `0x${string}`;
};

/**
 * Register a subname on-chain using the platform deployer wallet.
 * Throws EnsError on any failure so callers can translate to AppError.
 */
export async function registerSubname(
  label: string,
  ownerAddress: string,
): Promise<SubnameRegistrationResult> {
  if (!isAddress(ownerAddress)) {
    throw new EnsError('invalid_label', `Invalid owner address: ${ownerAddress}`);
  }
  validateSubnameLabel(label);

  const registryAddress = getEnsRegistryAddress();
  const fullName = buildFullName(label);

  // Check for collision before sending a tx
  const taken = await isSubnameTaken(label);
  if (taken) {
    throw new EnsError('name_taken', `ENS subname "${fullName}" is already registered`);
  }

  const walletClient = getWalletClient();

  let txHash: `0x${string}`;
  try {
    txHash = await walletClient.writeContract({
      address: registryAddress,
      abi: ENS_SUBNAME_REGISTRY_ABI,
      functionName: 'register',
      args: [label, ownerAddress as `0x${string}`],
    });
  } catch (err) {
    throw new EnsError('registration_failed', `ENS register tx failed: ${String(err)}`);
  }

  return { label, fullName, ownerAddress, txHash };
}

/**
 * Resolve a subname label to its owner address on-chain.
 * Returns null if not registered.
 */
export async function resolveSubname(label: string): Promise<string | null> {
  const client = getPublicClient();
  const registryAddress = getEnsRegistryAddress();

  try {
    const owner = await client.readContract({
      address: registryAddress,
      abi: ENS_SUBNAME_REGISTRY_ABI,
      functionName: 'resolve',
      args: [label],
    }) as string;

    if (!isAddress(owner) || owner === '0x0000000000000000000000000000000000000000') {
      return null;
    }
    return owner;
  } catch {
    return null;
  }
}
