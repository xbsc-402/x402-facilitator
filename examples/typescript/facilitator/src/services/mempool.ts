/**
 * Transaction Mempool Service
 * Manages pending transactions using PostgreSQL for persistence
 * Provides deduplication, retry logic, and batch processing
 */

import Bull from 'bull';
import { createHash } from 'crypto';
import { DatabaseClient } from '../database/client.js';
import { TransactionRecord } from '../database/schema.js';
import { createLogger } from '../utils/logger.js';

export interface MempoolConfig {
  redisUrl: string;
  databaseUrl: string;
  maxConcurrentJobs?: number;
  maxRetries?: number;
  retryDelayMs?: number;
  staleTransactionMinutes?: number;
}

export interface MempoolTransaction {
  id: string;
  requestHash: string;
  network: 'bsc';
  payload: any;
  status: 'pending' | 'processing' | 'confirmed' | 'failed';
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
  result?: any;
  error?: string;
}

export interface TransactionPayload {
  paymentPayload: any;
  paymentRequirements: any;
  network: string;
}

export class TransactionMempool {
  private queue: Bull.Queue;
  private db: DatabaseClient;
  private maxRetries: number;
  private retryDelayMs: number;
  private staleTransactionMinutes: number;
  private processingHandler?: (tx: MempoolTransaction) => Promise<any>;
  private logger = createLogger('TransactionMempool');
  private retryInterval?: NodeJS.Timeout;

  constructor(config: MempoolConfig) {
    this.logger.info('Initializing TransactionMempool', {
      redisUrl: config.redisUrl.replace(/\/\/.*@/, '//***@'), // Hide credentials
      maxRetries: config.maxRetries || 3,
      retryDelayMs: config.retryDelayMs || 2000,
      staleTransactionMinutes: config.staleTransactionMinutes || 30
    });

    // Initialize database client
    this.db = new DatabaseClient(config.databaseUrl);

    // Initialize Bull queue for job processing
    this.queue = new Bull('evm-transaction-queue', config.redisUrl, {
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: false,
        attempts: config.maxRetries || 3,
        backoff: {
          type: 'exponential',
          delay: config.retryDelayMs || 2000
        }
      }
    });

    // Set configuration
    this.maxRetries = config.maxRetries || 3;
    this.retryDelayMs = config.retryDelayMs || 2000;
    this.staleTransactionMinutes = config.staleTransactionMinutes || 30;

    // Setup queue event handlers
    this.setupQueueEvents();

    // Setup periodic retry of failed transactions
    this.setupRetryInterval();

    this.logger.info('TransactionMempool initialized successfully');
  }

  /**
   * Add a transaction to the mempool with deduplication
   */
  async add(payload: TransactionPayload): Promise<string> {
    const startTime = Date.now();
    // Generate request hash for deduplication
    const requestHash = this.generateRequestHash(payload);
    const shortHash = requestHash.substring(0, 8) + '...';

    this.logger.info('Adding transaction to mempool', {
      requestHash: shortHash,
      network: payload.network
    });

    try {
      // Check if transaction already exists
      const existing = await this.db.getTransactionByHash(requestHash);
      if (existing) {
        this.logger.info('Transaction already exists (deduplication)', {
          txId: existing.id,
          requestHash: shortHash,
          status: existing.status
        });
        return existing.id;
      }

      // Extract relevant data from payload
      const { paymentPayload, paymentRequirements } = payload;
      const network = 'bsc'; // Only supporting BSC for EVM
      const nonce = paymentPayload.authorization?.nonce || '';
      const shortNonce = nonce ? nonce.substring(0, 10) + '...' : 'none';

      this.logger.debug('Creating transaction record', {
        from: paymentPayload.from || paymentPayload.authorization?.from,
        to: paymentRequirements.recipient,
        nonce: shortNonce,
        amount: paymentPayload.authorization?.value
      });

      // Create transaction record
      const transaction = await this.db.insertTransaction({
        request_hash: requestHash,
        network,
        from_address: paymentPayload.from || paymentPayload.authorization?.from || '',
        to_address: paymentRequirements.recipient || '',
        amount: paymentPayload.authorization?.value || '0',
        nonce: nonce,
        status: 'pending',
        attempts: 0,
        max_attempts: this.maxRetries,
        payload: JSON.stringify(payload),
        error_message: undefined,
        transaction_hash: undefined,
        block_number: undefined,
        gas_used: undefined,
        gas_price: undefined,
        confirmed_at: undefined
      });

      if (!transaction) {
        // Transaction already exists (race condition)
        const existing = await this.db.getTransactionByHash(requestHash);
        if (existing) {
          this.logger.info('Transaction created by concurrent request', {
            txId: existing.id,
            requestHash: shortHash
          });
          return existing.id;
        }
        throw new Error('Failed to create transaction record');
      }

      // Add to processing queue
      await this.queue.add('process-transaction', {
        id: transaction.id,
        requestHash: transaction.request_hash,
        network: transaction.network,
        payload: JSON.parse(transaction.payload),
        status: transaction.status,
        attempts: transaction.attempts,
        createdAt: transaction.created_at,
        updatedAt: transaction.updated_at
      }, {
        jobId: transaction.id,
        delay: 0
      });

      this.logger.info('Transaction added to queue successfully', {
        txId: transaction.id,
        requestHash: shortHash,
        nonce: shortNonce,
        queuePosition: await this.queue.getWaitingCount(),
        durationMs: Date.now() - startTime
      });

      return transaction.id;

    } catch (error) {
      this.logger.error('Failed to add transaction to mempool', {
        requestHash: shortHash,
        error: error instanceof Error ? error.message : error,
        durationMs: Date.now() - startTime
      });
      throw error;
    }
  }

  /**
   * Get transaction status by ID
   */
  async getStatus(txId: string): Promise<MempoolTransaction | null> {
    const startTime = Date.now();
    this.logger.debug('Getting transaction status', { txId });

    const transaction = await this.db.getTransaction(txId);

    if (!transaction) {
      this.logger.debug('Transaction not found', { txId });
      return null;
    }

    this.logger.debug('Transaction status retrieved', {
      txId,
      status: transaction.status,
      attempts: transaction.attempts,
      hasResult: !!transaction.transaction_hash,
      durationMs: Date.now() - startTime
    });

    return {
      id: transaction.id,
      requestHash: transaction.request_hash,
      network: transaction.network as 'bsc',
      payload: JSON.parse(transaction.payload),
      status: transaction.status as MempoolTransaction['status'],
      attempts: transaction.attempts,
      createdAt: transaction.created_at,
      updatedAt: transaction.updated_at,
      result: transaction.transaction_hash ? {
        transactionHash: transaction.transaction_hash,
        blockNumber: transaction.block_number,
        gasUsed: transaction.gas_used,
        gasPrice: transaction.gas_price,
        confirmedAt: transaction.confirmed_at
      } : undefined,
      error: transaction.error_message
    };
  }

  /**
   * Update transaction status
   */
  async updateStatus(
    txId: string,
    status: TransactionRecord['status'],
    data?: {
      transactionHash?: string;
      blockNumber?: number;
      gasUsed?: string;
      gasPrice?: string;
      error?: string;
    }
  ): Promise<void> {
    const startTime = Date.now();

    this.logger.info('Updating transaction status', {
      txId,
      oldStatus: 'unknown', // We don't have old status here
      newStatus: status,
      hasTransactionHash: !!data?.transactionHash,
      hasError: !!data?.error
    });

    await this.db.updateTransactionStatus(txId, status, {
      transaction_hash: data?.transactionHash,
      block_number: data?.blockNumber,
      gas_used: data?.gasUsed,
      gas_price: data?.gasPrice,
      error_message: data?.error
    });

    this.logger.info('Transaction status updated', {
      txId,
      status,
      transactionHash: data?.transactionHash?.substring(0, 10) + '...',
      blockNumber: data?.blockNumber,
      error: data?.error,
      durationMs: Date.now() - startTime
    });
  }

  /**
   * Get pending transactions for batch processing
   */
  async getPendingBatch(limit: number = 10): Promise<MempoolTransaction[]> {
    const transactions = await this.db.getPendingTransactions(limit);

    return transactions.map(tx => ({
      id: tx.id,
      requestHash: tx.request_hash,
      network: tx.network as 'bsc',
      payload: JSON.parse(tx.payload),
      status: tx.status as MempoolTransaction['status'],
      attempts: tx.attempts,
      createdAt: tx.created_at,
      updatedAt: tx.updated_at,
      result: tx.transaction_hash ? {
        transactionHash: tx.transaction_hash,
        blockNumber: tx.block_number,
        gasUsed: tx.gas_used,
        gasPrice: tx.gas_price,
        confirmedAt: tx.confirmed_at
      } : undefined,
      error: tx.error_message
    }));
  }

  /**
   * Setup processor for handling transactions
   */
  setupProcessor(handler: (tx: MempoolTransaction) => Promise<any>): void {
    this.processingHandler = handler;

    this.queue.process('process-transaction', async (job) => {
      const tx = job.data as MempoolTransaction;
      const startTime = Date.now();
      const shortNonce = tx.payload?.paymentPayload?.authorization?.nonce
        ? tx.payload.paymentPayload.authorization.nonce.substring(0, 10) + '...'
        : 'none';

      try {
        this.logger.info('Processing transaction', {
          txId: tx.id,
          requestHash: tx.requestHash.substring(0, 8) + '...',
          nonce: shortNonce,
          attempt: tx.attempts + 1,
          maxAttempts: this.maxRetries
        });

        // Update status to processing
        await this.updateStatus(tx.id, 'processing');

        // Call the handler
        if (!this.processingHandler) {
          throw new Error('No processing handler configured');
        }

        const result = await this.processingHandler(tx);

        // Update status to confirmed
        await this.updateStatus(tx.id, 'confirmed', {
          transactionHash: result.transactionHash || result.hash,
          blockNumber: result.blockNumber,
          gasUsed: result.gasUsed,
          gasPrice: result.gasPrice
        });

        this.logger.info('Transaction processed successfully', {
          txId: tx.id,
          transactionHash: (result.transactionHash || result.hash)?.substring(0, 10) + '...',
          blockNumber: result.blockNumber,
          durationMs: Date.now() - startTime
        });

        return result;

      } catch (error: any) {
        const errorMsg = error?.message || String(error);

        this.logger.error('Transaction processing failed', {
          txId: tx.id,
          nonce: shortNonce,
          attempt: tx.attempts + 1,
          error: errorMsg,
          durationMs: Date.now() - startTime
        });

        // Update status to failed
        await this.updateStatus(tx.id, 'failed', {
          error: errorMsg
        });

        // Rethrow to trigger retry
        throw error;
      }
    });

    this.logger.info('Transaction processor configured');
  }

  /**
   * Generate request hash for deduplication
   */
  private generateRequestHash(payload: TransactionPayload): string {
    const { paymentPayload, paymentRequirements } = payload;

    // Create a deterministic hash based on critical fields
    const content = JSON.stringify({
      network: 'bsc',
      from: paymentPayload.from || paymentPayload.authorization?.from,
      to: paymentRequirements.recipient,
      value: paymentPayload.authorization?.value,
      nonce: paymentPayload.authorization?.nonce,
      validAfter: paymentPayload.authorization?.validAfter,
      validBefore: paymentPayload.authorization?.validBefore
    });

    return createHash('sha256').update(content).digest('hex');
  }

  /**
   * Setup queue event handlers
   */
  private setupQueueEvents(): void {
    const queueLogger = this.logger.child('Queue');

    this.queue.on('completed', (job, result) => {
      queueLogger.info('Job completed', {
        jobId: job.id,
        txId: job.data?.id,
        hasResult: !!result,
        processingTime: job.finishedOn ? job.finishedOn - job.processedOn : undefined
      });
    });

    this.queue.on('failed', (job, error) => {
      queueLogger.error('Job failed', {
        jobId: job.id,
        txId: job.data?.id,
        attempt: job.attemptsMade,
        maxAttempts: job.opts.attempts,
        error: error.message,
        willRetry: job.attemptsMade < (job.opts.attempts || this.maxRetries)
      });
    });

    this.queue.on('stalled', (job) => {
      queueLogger.warn('Job stalled', {
        jobId: job.id,
        txId: job.data?.id,
        attempt: job.attemptsMade
      });
    });

    this.queue.on('error', (error) => {
      queueLogger.error('Queue error', error);
    });

    this.queue.on('waiting', (jobId) => {
      queueLogger.debug('Job waiting', { jobId });
    });

    this.queue.on('active', (job) => {
      queueLogger.debug('Job active', {
        jobId: job.id,
        txId: job.data?.id
      });
    });
  }

  /**
   * Setup periodic retry of failed transactions
   */
  private setupRetryInterval(): void {
    const intervalMinutes = 5;
    const retryLogger = this.logger.child('Retry');

    this.retryInterval = setInterval(async () => {
      const startTime = Date.now();
      try {
        const failedTxs = await this.db.getFailedTransactionsForRetry(5);

        if (failedTxs.length === 0) {
          retryLogger.debug('No failed transactions to retry');
          return;
        }

        retryLogger.info('Retrying failed transactions', {
          count: failedTxs.length
        });

        for (const tx of failedTxs) {
          const shortNonce = tx.nonce ? tx.nonce.substring(0, 10) + '...' : 'none';
          const delay = this.retryDelayMs * tx.attempts;

          retryLogger.info('Scheduling transaction retry', {
            txId: tx.id,
            nonce: shortNonce,
            attempt: tx.attempts + 1,
            maxAttempts: tx.max_attempts,
            delayMs: delay
          });

          // Re-add to queue for retry
          await this.queue.add('process-transaction', {
            id: tx.id,
            requestHash: tx.request_hash,
            network: tx.network,
            payload: JSON.parse(tx.payload),
            status: 'pending', // Reset to pending for retry
            attempts: tx.attempts,
            createdAt: tx.created_at,
            updatedAt: tx.updated_at
          }, {
            jobId: `${tx.id}-retry-${tx.attempts}`,
            delay: delay // Exponential backoff
          });

          // Update status to pending for retry
          await this.db.updateTransactionStatus(tx.id, 'pending');
        }

        retryLogger.info('Retry scheduling completed', {
          count: failedTxs.length,
          durationMs: Date.now() - startTime
        });
      } catch (error) {
        retryLogger.error('Error retrying failed transactions', {
          error: error instanceof Error ? error.message : error,
          durationMs: Date.now() - startTime
        });
      }
    }, intervalMinutes * 60 * 1000);

    retryLogger.info('Retry interval configured', {
      intervalMinutes
    });
  }

  /**
   * Get transaction statistics
   */
  async getStats(): Promise<{
    total: number;
    pending: number;
    processing: number;
    confirmed: number;
    failed: number;
    network: string;
  }> {
    const stats = await this.db.getTransactionStats('bsc');

    const result = {
      total: 0,
      pending: 0,
      processing: 0,
      confirmed: 0,
      failed: 0,
      network: 'bsc'
    };

    for (const stat of stats) {
      result.total += parseInt(stat.count);
      switch (stat.status) {
        case 'pending':
          result.pending = parseInt(stat.count);
          break;
        case 'processing':
          result.processing = parseInt(stat.count);
          break;
        case 'confirmed':
          result.confirmed = parseInt(stat.count);
          break;
        case 'failed':
          result.failed = parseInt(stat.count);
          break;
      }
    }

    return result;
  }

  /**
   * Get count of active transactions (pending + processing)
   * Used for mempool capacity check
   */
  async getActiveTransactionCount(): Promise<number> {
    const stats = await this.getStats();
    const activeCount = stats.pending + stats.processing;

    this.logger.debug('Active transaction count', {
      pending: stats.pending,
      processing: stats.processing,
      total: activeCount
    });

    return activeCount;
  }

  /**
   * Check if mempool has capacity for new transactions
   * @param maxCapacity Maximum allowed active transactions
   * @returns true if mempool has capacity, false if full
   */
  async hasCapacity(maxCapacity: number): Promise<boolean> {
    const activeCount = await this.getActiveTransactionCount();
    const hasSpace = activeCount < maxCapacity;

    this.logger.info('Mempool capacity check', {
      activeTransactions: activeCount,
      maxCapacity,
      hasCapacity: hasSpace,
      utilizationPercent: Math.round((activeCount / maxCapacity) * 100)
    });

    return hasSpace;
  }

  /**
   * Clean up stale transactions
   */
  async cleanupStale(): Promise<number> {
    // This would be implemented to clean up very old transactions
    // For now, we'll keep all transactions for auditing
    console.log('TransactionMempool: Cleanup not implemented yet');
    return 0;
  }

  /**
   * Close connections and clean up
   */
  async close(): Promise<void> {
    this.logger.info('Closing TransactionMempool connections');

    if (this.retryInterval) {
      clearInterval(this.retryInterval);
      this.logger.debug('Retry interval cleared');
    }

    await this.queue.close();
    this.logger.debug('Queue closed');

    await this.db.close();
    this.logger.debug('Database connection closed');

    this.logger.info('TransactionMempool shut down successfully');
  }
}