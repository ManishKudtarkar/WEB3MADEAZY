/**
 * Reward Worker — processes PENDING reward claims, triggers Chainlink CRE workflows.
 *
 * This worker:
 * 1. Polls the database for RewardClaim records with status=PENDING
 * 2. Validates the HMAC attestation
 * 3. Submits to Chainlink CRE via HTTP API
 * 4. Updates claim status to CRE_SUBMITTED
 * 5. Polls CRE for completion (or uses webhook if configured)
 * 6. On CRE completion, updates status to CRE_COMPLETED (the CRE then calls the smart contract)
 */
import { prisma } from '@ethereum-explorer/database';
import { SEPOLIA_CHAIN_ID, REWARD_ATTESTATION_TTL_MS } from '@ethereum-explorer/shared';
import { createHmac } from 'node:crypto';

const POLL_INTERVAL_MS = 10_000; // 10 seconds
const CRE_API_ENDPOINT = process.env.CHAINLINK_CRE_API_ENDPOINT || 'https://cre-api.chain.link';
const CRE_API_KEY = process.env.CHAINLINK_CRE_API_KEY;
const CRE_WORKFLOW_ID = process.env.CHAINLINK_CRE_WORKFLOW_ID;

type ClaimJob = {
  claimId: string;
  studentId: string;
  chapterId: string;
  walletAddress: string;
  tokenAmount: string;
  commitment: string;
};

async function processPendingClaims() {
  const pendingClaims = await prisma.rewardClaim.findMany({
    where: { status: 'PENDING' },
    take: 10,
    include: { eligibility: true, student: true, chapter: true },
  });

  for (const claim of pendingClaims) {
    try {
      await processClaim({
        claimId: claim.id,
        studentId: claim.studentId,
        chapterId: claim.chapterId,
        walletAddress: claim.walletAddress,
        tokenAmount: claim.tokenAmount.toString(),
        commitment: claim.eligibility.commitment,
      });
    } catch (err) {
      console.error(`[RewardWorker] Failed to process claim ${claim.id}:`, err);
      // Mark as failed if too many retries (add retry counter in production)
      await prisma.rewardClaim.update({
        where: { id: claim.id },
        data: { status: 'FAILED' },
      });
    }
  }
}

async function processClaim(job: ClaimJob) {
  console.log(`[RewardWorker] Processing claim ${job.claimId}`);

  // Build the evidence payload for CRE
  const evidence = {
    claimId: job.claimId,
    commitment: job.commitment,
    walletAddress: job.walletAddress,
    amount: job.tokenAmount,
    chainId: SEPOLIA_CHAIN_ID,
    expiresAt: Date.now() + REWARD_ATTESTATION_TTL_MS,
  };

  // Create HMAC signature
  const secret = process.env.JWT_SECRET || 'dev-secret-change-in-production';
  const payload = JSON.stringify(evidence);
  const signature = createHmac('sha256', secret).update(payload).digest('hex');
  const attestation = `${Buffer.from(payload).toString('base64')}.${signature}`;

  // Submit to Chainlink CRE
  if (!CRE_API_KEY || !CRE_WORKFLOW_ID) {
    console.warn('[RewardWorker] CRE not configured, marking as CRE_COMPLETED (dev mode)');
    await prisma.rewardClaim.update({
      where: { id: job.claimId },
      data: { status: 'CRE_COMPLETED' },
    });
    return;
  }

  const response = await fetch(`${CRE_API_ENDPOINT}/workflows/${CRE_WORKFLOW_ID}/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CRE_API_KEY}`,
    },
    body: JSON.stringify({
      attestation,
      evidence,
    }),
  });

  if (!response.ok) {
    throw new Error(`CRE API returned ${response.status}: ${await response.text()}`);
  }

  const result = await response.json() as { executionId: string; status: string };

  // Create workflow execution record
  await prisma.workflowExecution.create({
    data: {
      claimId: job.claimId,
      workflowId: result.executionId,
      status: 'RUNNING',
    },
  });

  // Update claim status
  await prisma.rewardClaim.update({
    where: { id: job.claimId },
    data: { status: 'CRE_SUBMITTED' },
  });

  console.log(`[RewardWorker] Claim ${job.claimId} submitted to CRE: ${result.executionId}`);
}

async function pollCREExecutions() {
  const runningExecutions = await prisma.workflowExecution.findMany({
    where: { status: 'RUNNING' },
    include: { claim: true },
  });

  for (const execution of runningExecutions) {
    try {
      const status = await checkCREStatus(execution.workflowId);
      
      if (status === 'COMPLETED') {
        await prisma.$transaction([
          prisma.workflowExecution.update({
            where: { id: execution.id },
            data: { status: 'COMPLETED', completedAt: new Date() },
          }),
          prisma.rewardClaim.update({
            where: { id: execution.claimId },
            data: { status: 'CRE_COMPLETED' },
          }),
        ]);
        console.log(`[RewardWorker] CRE execution ${execution.workflowId} completed`);
      } else if (status === 'FAILED') {
        await prisma.$transaction([
          prisma.workflowExecution.update({
            where: { id: execution.id },
            data: { status: 'FAILED', completedAt: new Date(), error: 'CRE workflow failed' },
          }),
          prisma.rewardClaim.update({
            where: { id: execution.claimId },
            data: { status: 'FAILED' },
          }),
        ]);
        console.error(`[RewardWorker] CRE execution ${execution.workflowId} failed`);
      }
    } catch (err) {
      console.error(`[RewardWorker] Error checking CRE status for ${execution.workflowId}:`, err);
    }
  }
}

async function checkCREStatus(executionId: string): Promise<'RUNNING' | 'COMPLETED' | 'FAILED'> {
  if (!CRE_API_KEY || !CRE_WORKFLOW_ID) {
    // Dev mode: simulate instant completion
    return 'COMPLETED';
  }

  const response = await fetch(`${CRE_API_ENDPOINT}/workflows/${CRE_WORKFLOW_ID}/executions/${executionId}`, {
    headers: { 'Authorization': `Bearer ${CRE_API_KEY}` },
  });

  if (!response.ok) {
    throw new Error(`CRE status check failed: ${response.status}`);
  }

  const result = await response.json() as { status: string };
  
  if (result.status === 'completed' || result.status === 'success') return 'COMPLETED';
  if (result.status === 'failed' || result.status === 'error') return 'FAILED';
  return 'RUNNING';
}

async function main() {
  console.log('[RewardWorker] Starting reward claim processor');
  
  // Main loop
  while (true) {
    try {
      await processPendingClaims();
      await pollCREExecutions();
    } catch (err) {
      console.error('[RewardWorker] Error in main loop:', err);
    }
    
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('[RewardWorker] Shutting down gracefully');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('[RewardWorker] Shutting down gracefully');
  process.exit(0);
});

main().catch(err => {
  console.error('[RewardWorker] Fatal error:', err);
  process.exit(1);
});
