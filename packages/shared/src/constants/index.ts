/**
 * Shared constants — used across API, frontend, and workers.
 * Values that differ per environment belong in .env, not here.
 */

// ── Assessment ────────────────────────────────────────────────────────────────

/** Number of practice questions required per chapter. */
export const PRACTICE_QUESTIONS_REQUIRED = 5;

/** Number of Master Challenge attempts allowed per verified learner per chapter. */
export const MASTER_CHALLENGE_ATTEMPTS_ALLOWED = 1;

// ── Rewards ───────────────────────────────────────────────────────────────────

/** ERC-20 token amounts per chapter (in token units, 18 decimals on-chain). */
export const CHAPTER_REWARD_AMOUNTS: Record<string, string> = {
  'source-of-truth':      '10',
  'replication':          '10',
  'peers':                '10',
  'hashes':               '15',
  'signatures':           '15',
  'blocks':               '15',
  'ethereum-node':        '20',
  'wallets':              '20',
  'transaction-pool':     '20',
  'evm':                  '25',
  'gas':                  '20',
  'receipts-and-logs':    '20',
  'consensus':            '25',
  'transaction-journey':  '25',
  'contract-workshop':    '30',
  'frontend-rpc':         '25',
  'rollups':              '30',
  'bridges':              '25',
  'oracles':              '25',
  'smart-accounts':       '25',
  'proof-of-work':        '20',
  'the-merge':            '25',
  'protocol-upgrades':    '20',
  'token-standards':      '20',
  // Explorer Mode chapters
  'explorer-what-is-blockchain': '15',
  'explorer-wallets':             '15',
  'explorer-transactions':        '15',
  'explorer-gas-fees':            '15',
  'explorer-smart-contracts':     '20',
  'explorer-tokens-nfts':         '15',
  'explorer-defi':                '20',
  'explorer-ens':                 '20',
  'explorer-web3-safety':         '15',
  'explorer-ethereum-ecosystem':  '20',
};

/** Developer Mode chapters that form the "full path" for the Ethereum Master badge. */
export const DEVELOPER_FULL_PATH_CHAPTERS = [
  'source-of-truth', 'replication', 'peers', 'hashes', 'signatures',
  'blocks', 'ethereum-node', 'wallets', 'transaction-pool', 'evm',
  'gas', 'receipts-and-logs', 'consensus', 'transaction-journey',
  'contract-workshop', 'frontend-rpc', 'rollups', 'bridges', 'oracles',
  'smart-accounts', 'proof-of-work', 'the-merge', 'protocol-upgrades',
  'token-standards',
] as const;

/** Explorer Mode chapters that form the "full path" for the Ethereum Master badge. */
export const EXPLORER_FULL_PATH_CHAPTERS = [
  'explorer-what-is-blockchain', 'explorer-wallets', 'explorer-transactions',
  'explorer-gas-fees', 'explorer-smart-contracts', 'explorer-tokens-nfts',
  'explorer-defi', 'explorer-ens', 'explorer-web3-safety',
  'explorer-ethereum-ecosystem',
] as const;

// ── Badges ────────────────────────────────────────────────────────────────────

import type { Badge } from '../types/index.ts';

export const BADGES: Badge[] = [
  {
    id: 'first_victory',
    name: 'First Victory',
    description: 'Every expert was once a beginner.',
    requirement: 'Earn your first chapter reward by passing a Master Challenge.',
    icon: '🏆',
    color: '#e1be7c',
  },
  {
    id: 'rising_explorer',
    name: 'Rising Explorer',
    description: "You're building your Web3 knowledge!",
    requirement: 'Earn rewards from 3 different chapters.',
    icon: '🚀',
    color: '#b6e9be',
  },
  {
    id: 'knowledge_champion',
    name: 'Knowledge Champion',
    description: 'Five victories. Your Web3 journey is getting stronger.',
    requirement: 'Earn rewards from 5 different chapters.',
    icon: '⭐',
    color: '#89c4f4',
  },
  {
    id: 'ethereum_master',
    name: 'Ethereum Master',
    description: "You've conquered the entire learning journey!",
    requirement: 'Earn rewards from every chapter in your learning path.',
    icon: '💎',
    color: '#c4a8f5',
  },
];

// ── Rate limiting ─────────────────────────────────────────────────────────────

export const RATE_LIMITS = {
  /** AI lesson generation: requests per IP per 10 minutes. */
  AI_PER_IP_PER_10_MIN: 30,
  /** AI lesson generation: requests per day globally. */
  AI_PER_DAY: 500,
  /** AI concurrent requests. */
  AI_CONCURRENT: 5,
  /** Assessment submission: requests per student per minute. */
  ASSESSMENT_PER_STUDENT_PER_MIN: 10,
  /** Reward claim: requests per student per hour. */
  REWARD_PER_STUDENT_PER_HOUR: 5,
} as const;

// ── Token / chain ─────────────────────────────────────────────────────────────

export const SEPOLIA_CHAIN_ID = 11155111;
export const TOKEN_DECIMALS = 18;

// ── CRE ───────────────────────────────────────────────────────────────────────

/** How long (ms) a reward eligibility attestation is valid for CRE pickup. */
export const REWARD_ATTESTATION_TTL_MS = 30 * 60 * 1000; // 30 minutes
