/**
 * Event-listening utilities for RewardReceiver on Sepolia.
 * Uses viem's watchContractEvent for real-time indexing.
 */
import type { Log } from 'viem';
import { getPublicClient } from '../clients/index.ts';
import { REWARD_RECEIVER_ABI } from '../contracts/abis.ts';
import { getRewardReceiverAddress } from '../contracts/addresses.ts';

export type RewardClaimedLog = {
  reportId: `0x${string}`;
  commitment: `0x${string}`;
  recipient: `0x${string}`;
  amount: bigint;
  transactionHash: `0x${string}` | null;
  blockNumber: bigint | null;
};

/**
 * Subscribe to RewardClaimed events from the RewardReceiver contract.
 * Returns an unsubscribe function.
 */
export function watchRewardClaimedEvents(
  onEvent: (log: RewardClaimedLog) => void,
  onError?: (err: Error) => void,
): () => void {
  const client = getPublicClient();
  const address = getRewardReceiverAddress();

  const unwatch = client.watchContractEvent({
    address,
    abi: REWARD_RECEIVER_ABI,
    eventName: 'RewardClaimed',
    onLogs(logs) {
      for (const log of logs) {
        const { args, transactionHash, blockNumber } = log as Log & {
          args: { reportId: `0x${string}`; commitment: `0x${string}`; recipient: `0x${string}`; amount: bigint };
        };
        onEvent({
          reportId: args.reportId,
          commitment: args.commitment,
          recipient: args.recipient,
          amount: args.amount,
          transactionHash: transactionHash ?? null,
          blockNumber: blockNumber ?? null,
        });
      }
    },
    onError,
  });

  return unwatch;
}

/**
 * Fetch historical RewardClaimed events from a given block range.
 */
export async function getRewardClaimedLogs(
  fromBlock: bigint,
  toBlock: bigint | 'latest' = 'latest',
): Promise<RewardClaimedLog[]> {
  const client = getPublicClient();
  const address = getRewardReceiverAddress();

  const logs = await client.getLogs({
    address,
    event: REWARD_RECEIVER_ABI.find(e => e.type === 'event' && e.name === 'RewardClaimed')! as Parameters<typeof client.getLogs>[0]['event'],
    fromBlock,
    toBlock,
  });

  return logs.map(log => {
    const typedLog = log as Log & {
      args: { reportId: `0x${string}`; commitment: `0x${string}`; recipient: `0x${string}`; amount: bigint };
    };
    return {
      reportId: typedLog.args.reportId,
      commitment: typedLog.args.commitment,
      recipient: typedLog.args.recipient,
      amount: typedLog.args.amount,
      transactionHash: typedLog.transactionHash ?? null,
      blockNumber: typedLog.blockNumber ?? null,
    };
  });
}
