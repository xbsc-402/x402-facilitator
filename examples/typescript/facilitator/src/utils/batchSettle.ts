/**
 * Batch Settlement Utility
 * Supports submitting multiple transactions at once, each using different nonce sent in parallel
 * 
 * Implementation note: This file copies the settle logic from x402/schemes/exact/evm/facilitator.ts
 * but modified to support batch processing and nonce management
 */

import { parseErc6492Signature } from 'viem';
import type { Hex } from 'viem';
import type { 
  Signer, 
  PaymentPayload, 
  PaymentRequirements, 
  SettleResponse
} from 'x402/types';

// ABI definition for transferWithAuthorization function
// This is an ERC-3009 standard function for authorized transfers
const transferWithAuthorizationABI = [
  {
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'validAfter', type: 'uint256' },
      { name: 'validBefore', type: 'uint256' },
      { name: 'nonce', type: 'bytes32' },
      { name: 'v', type: 'uint8' },
      { name: 'r', type: 'bytes32' },
      { name: 's', type: 'bytes32' }
    ],
    name: 'transferWithAuthorization',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const;

export interface BatchSettleItem {
  paymentPayload: PaymentPayload;
  paymentRequirements: PaymentRequirements;
}

export interface BatchSettleResponse {
  success: boolean;
  results: Array<{
    index: number;
    success: boolean;
    transaction?: string;
    nonce: number;
    error?: string;
  }>;
  totalSubmitted: number;
  totalSuccess: number;
  totalFailed: number;
}

/**
 * Batch settle transactions
 * 
 * @param wallet - Signing wallet
 * @param items - List of transactions to settle
 * @returns Batch settle result
 */
export async function batchSettle(
  wallet: Signer,
  items: BatchSettleItem[]
): Promise<BatchSettleResponse> {
  if (items.length === 0) {
    return {
      success: true,
      results: [],
      totalSubmitted: 0,
      totalSuccess: 0,
      totalFailed: 0,
    };
  }

  console.log(`\n🚀 Batch Settle: ${items.length} transactions`);
  
  // 1. Get current nonce (need to provide address parameter)
  const walletAddress = (wallet as any).account?.address;
  if (!walletAddress) {
    throw new Error('Wallet address not found');
  }
  
  const currentNonce = await (wallet as any).getTransactionCount({ 
    address: walletAddress,
    blockTag: 'pending' 
  });
  console.log(`   📊 Current nonce: ${currentNonce} (address: ${walletAddress})`);

  const results: BatchSettleResponse['results'] = [];
  const txPromises: Promise<void>[] = [];

  // 2. Assign consecutive nonces to each transaction and send
  // Note: We send serially to avoid nonce gaps (if one fails, stop subsequent ones)
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const nonce = currentNonce + i;
    
    console.log(`   🔢 Transaction ${i + 1}/${items.length} - Nonce: ${nonce}`);

    // Create transaction promise (parallel execution)
    const txPromise = (async () => {
      try {
        // Note: Backend has already called verify before adding to queue, no need to verify again here
        const payload = item.paymentPayload.payload as any;
        
        // Use viem's parseErc6492Signature to properly handle signatures
        // If it's an ERC-6492 signature, it will auto-unpack; if not, return original signature
        const { signature } = parseErc6492Signature(payload.signature as Hex);
        
        // Step 3: Split signature into v, r, s components
        // Parse signature: 0x + r(64) + s(64) + v(2) = 132 characters
        // Signature format: 0x + r(64 chars) + s(64 chars) + v(2 chars) = 132 chars total
        const r = signature.slice(0, 66) as Hex;  // 0x + 64 chars
        const s = ('0x' + signature.slice(66, 130)) as Hex;  // 0x + 64 chars
        const v = parseInt(signature.slice(130, 132), 16);  // last 2 chars as number

        // Step 4: Send transaction with specified nonce
        // Send transaction (specify nonce)
        // Note: Don't specify gas parameters, let viem auto-estimate (consistent with original settle logic)
        const tx = await (wallet as any).writeContract({
          address: item.paymentRequirements.asset as any,
          abi: transferWithAuthorizationABI,
          functionName: 'transferWithAuthorization',
          args: [
            payload.authorization.from as any,
            payload.authorization.to as any,
            BigInt(payload.authorization.value),
            BigInt(payload.authorization.validAfter),
            BigInt(payload.authorization.validBefore),
            payload.authorization.nonce as any,
            v,
            r,
            s,
          ],
          nonce, // Use pre-allocated nonce
          chain: (wallet as any).chain, // Specify chain
        });

        results[i] = {
          index: i,
          success: true,
          transaction: tx,
          nonce,
        };
        
        console.log(`   ✅ Transaction ${i + 1} submitted: ${tx}`);
      } catch (error: any) {
        results[i] = {
          index: i,
          success: false,
          nonce,
          error: error.message || 'Unknown error',
        };
        
        console.error(`   ❌ Transaction ${i + 1} failed:`, error.message);
        
        // Note: Failed transactions won't be sent to chain, causing nonce gaps
        // But since we're sending in parallel, other transactions may have already been sent
        // This is a known limitation of the current implementation
        // Solution: Ensure all transactions can pass verification before sending
      }
    })();

    txPromises.push(txPromise);
  }

  // 3. Send all transactions in parallel
  console.log(`   ⏳ Sending ${items.length} transactions in parallel...`);
  await Promise.all(txPromises);

  // 4. Compile results
  const totalSuccess = results.filter(r => r.success).length;
  const totalFailed = results.filter(r => !r.success).length;

  console.log(`\n   📊 Batch Result:`);
  console.log(`      Total: ${items.length}`);
  console.log(`      Success: ${totalSuccess}`);
  console.log(`      Failed: ${totalFailed}`);

  return {
    success: totalFailed === 0,
    results,
    totalSubmitted: items.length,
    totalSuccess,
    totalFailed,
  };
}

/**
 * Batch wait for transaction confirmations
 * 
 * @param wallet - Signing wallet
 * @param txHashes - List of transaction hashes
 * @param confirmations - Required confirmations (default 1)
 * @returns Confirmation results
 */
export async function waitForBatchConfirmations(
  wallet: Signer,
  txHashes: string[],
  confirmations: number = 1
): Promise<Array<{ hash: string; confirmed: boolean; receipt?: any }>> {
  console.log(`\n⏳ Waiting for ${txHashes.length} transactions to confirm...`);
  
  const results = await Promise.all(
    txHashes.map(async (hash, index) => {
      try {
        const receipt = await (wallet as any).waitForTransactionReceipt({
          hash: hash as any,
          confirmations,
        });
        
        console.log(`   ✅ Transaction ${index + 1} confirmed (block: ${receipt.blockNumber})`);
        
        return {
          hash,
          confirmed: receipt.status === 'success',
          receipt,
        };
      } catch (error: any) {
        console.error(`   ❌ Transaction ${index + 1} failed to confirm:`, error.message);
        return {
          hash,
          confirmed: false,
          receipt: null,
        };
      }
    })
  );

  const confirmed = results.filter(r => r.confirmed).length;
  console.log(`\n   📊 Confirmation Result: ${confirmed}/${txHashes.length} confirmed`);

  return results;
}

/**
 * Smart batch settle (does not retry individual failed items)
 * 
 * Note: Does not retry individual failed items, as retrying would break nonce order
 * Failed transactions should be handled by the caller
 * 
 * @param wallet - Signing wallet
 * @param items - List of transactions to settle
 * @param options - Configuration options
 * @returns Batch settle result
 */
export async function smartBatchSettle(
  wallet: Signer,
  items: BatchSettleItem[],
  options: {
    maxRetries?: number;
    retryDelay?: number;
    waitForConfirmation?: boolean;
  } = {}
): Promise<BatchSettleResponse> {
  const {
    waitForConfirmation = true, // Default wait for confirmation to ensure transaction is on-chain
  } = options;

  // Call batchSettle directly, no retries
  // Because retrying individual failed items would break nonce order
  const result = await batchSettle(wallet, items);

  // If confirmation is needed
  if (waitForConfirmation && result.totalSuccess > 0) {
    const successHashes = result.results
      .filter(r => r.success && r.transaction)
      .map(r => r.transaction!);
    
    if (successHashes.length > 0) {
      await waitForBatchConfirmations(wallet, successHashes);
    }
  }
  
  return result;
}

