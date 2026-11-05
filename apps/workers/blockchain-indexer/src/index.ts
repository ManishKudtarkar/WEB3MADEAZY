/**
 * Blockchain Indexer — listens to RewardClaimed events on Sepolia, reconciles DB state.
 *
 * This worker:
 * 1. Watches for RewardClaimed events from RewardReceiver.sol
 * 2. Matches events to RewardClaim records via commitment
 * 3. Updates claim status to CONFIRMED
 * 4. Records transaction hash and block number
 * 5. Awards achievement badges based on claim count
 */
import { prisma } from '@ethereum-explorer/database';
import { BADGES } from '@ethereum-explorer/shared';
import { watchRewardClaimedEvents, getRewardClaimedLogs, getPublicClient } from '@ethereum-explorer/blockchain';

let lastProcessedBlock = 0n;

async function initializeLastBlock() {
  // Find the highest block number we've already indexed
  const latestTx = await prisma.blockchainTransaction.findFirst({
    orderBy: { blockNumber: 'desc' },
  });

  if (latestTx && latestTx.blockNumber) {
    lastProcessedBlock = latestTx.blockNumber;
    console.log(`[BlockchainIndexer] Resuming from block ${lastProcessedBlock}`);
  } else {
    // Start from current block
    const client = getPublicClient();
    lastProcessedBlock = await client.getBlockNumber();
    console.log(`[BlockchainIndexer] Starting fresh from block ${lastProcessedBlock}`);
  }
}

async function indexHistoricalEvents() {
  console.log('[BlockchainIndexer] Indexing historical events...');
  const client = getPublicClient();
  const currentBlock = await client.getBlockNumber();

  if (currentBlock <= lastProcessedBlock) {
    console.log('[BlockchainIndexer] No historical events to index');
    return;
  }

  const fromBlock = lastProcessedBlock + 1n;
  const toBlock = currentBlock;

  try {
    const logs = await getRewardClaimedLogs(fromBlock, toBlock);
    console.log(`[BlockchainIndexer] Found ${logs.length} events between blocks ${fromBlock}-${toBlock}`);

    for (const log of logs) {
      await processRewardClaimedEvent(log);
    }

    lastProcessedBlock = toBlock;
  } catch (err) {
    console.error('[BlockchainIndexer] Error indexing historical events:', err);
  }
}

async function processRewardClaimedEvent(event: {
  reportId: `0x${string}`;
  commitment: `0x${string}`;
  recipient: `0x${string}`;
  amount: bigint;
  transactionHash: `0x${string}` | null;
  blockNumber: bigint | null;
}) {
  console.log(`[BlockchainIndexer] Processing RewardClaimed: ${event.transactionHash}`);

  // Find the claim by commitment
  const claim = await prisma.rewardClaim.findFirst({
    where: {
      eligibility: { commitment: event.commitment },
    },
    include: { student: true, eligibility: true },
  });

  if (!claim) {
    console.warn(`[BlockchainIndexer] No claim found for commitment ${event.commitment}`);
    return;
  }

  // Update claim status
  await prisma.$transaction(async tx => {
    // Record the blockchain transaction
    await tx.blockchainTransaction.create({
      data: {
        claimId: claim.id,
        txHash: event.transactionHash || '0x0',
        chainId: 11155111, // Sepolia
        status: 'confirmed',
        blockNumber: event.blockNumber || 0n,
      },
    });

    // Update the claim
    await tx.rewardClaim.update({
      where: { id: claim.id },
      data: {
        status: 'CONFIRMED',
        txHash: event.transactionHash || undefined,
        blockNumber: event.blockNumber || undefined,
        claimedAt: new Date(),
      },
    });

    console.log(`[BlockchainIndexer] Claim ${claim.id} confirmed on-chain`);
  });

  // Award badges
  await awardBadges(claim.studentId);
}

async function awardBadges(studentId: string) {
  // Count total confirmed claims for this student
  const confirmedClaims = await prisma.rewardClaim.count({
    where: { studentId, status: 'CONFIRMED' },
  });

  const existingBadges = await prisma.studentAchievement.findMany({
    where: { studentId },
  });

  const existingBadgeIds = new Set(existingBadges.map(b => b.achievementId));

  // Badge thresholds
  const badgesToAward: string[] = [];

  if (confirmedClaims >= 1 && !existingBadgeIds.has('first_victory')) {
    badgesToAward.push('first_victory');
  }
  if (confirmedClaims >= 3 && !existingBadgeIds.has('rising_explorer')) {
    badgesToAward.push('rising_explorer');
  }
  if (confirmedClaims >= 5 && !existingBadgeIds.has('knowledge_champion')) {
    badgesToAward.push('knowledge_champion');
  }

  // Check for Ethereum Master (all chapters completed in a mode)
  // This requires checking which mode the student is on and if they've completed all chapters
  const studentClaims = await prisma.rewardClaim.findMany({
    where: { studentId, status: 'CONFIRMED' },
    include: { chapter: true },
  });

  // Simple heuristic: if they have 24+ confirmed claims, award master badge
  if (studentClaims.length >= 24 && !existingBadgeIds.has('ethereum_master')) {
    badgesToAward.push('ethereum_master');
  }

  // Award new badges
  for (const badgeId of badgesToAward) {
    await prisma.studentAchievement.create({
      data: { studentId, achievementId: badgeId },
    });
    console.log(`[BlockchainIndexer] Awarded badge "${badgeId}" to student ${studentId}`);
  }
}

async function startRealtimeIndexing() {
  console.log('[BlockchainIndexer] Starting real-time event listener');

  const unwatch = watchRewardClaimedEvents(
    async event => {
      await processRewardClaimedEvent(event);
      if (event.blockNumber) {
        lastProcessedBlock = event.blockNumber;
      }
    },
    err => {
      console.error('[BlockchainIndexer] Event listener error:', err);
    },
  );

  // Return cleanup function
  return unwatch;
}

async function main() {
  console.log('[BlockchainIndexer] Starting blockchain event indexer');

  await initializeLastBlock();
  await indexHistoricalEvents();

  const unwatch = await startRealtimeIndexing();

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('[BlockchainIndexer] Shutting down gracefully');
    unwatch();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('[BlockchainIndexer] Shutting down gracefully');
    unwatch();
    process.exit(0);
  });

  // Keep alive
  await new Promise(() => {});
}

main().catch(err => {
  console.error('[BlockchainIndexer] Fatal error:', err);
  process.exit(1);
});
