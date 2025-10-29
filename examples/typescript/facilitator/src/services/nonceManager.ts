/**
 * EVM Nonce Manager Service
 * Manages nonce to prevent replay attacks using Redis for fast lookups
 * and PostgreSQL for persistent storage
 */

import { Redis } from 'ioredis';
import crypto from 'crypto';
import { DatabaseClient } from '../database/client.js';
import { NonceRecord } from '../database/schema.js';
import { createLogger } from '../utils/logger.js';

export interface NonceManagerConfig {
  redisUrl: string;
  databaseUrl: string;
  ttlSeconds?: number; // Default 24 hours
  cleanupIntervalSeconds?: number; // Default 1 hour
}

export class NonceManager {
  private redis: Redis;
  private db: DatabaseClient;
  private keyPrefix = 'evm:nonce:';
  private ttlSeconds: number;
  private cleanupInterval?: NodeJS.Timeout;
  private logger = createLogger('NonceManager');

  constructor(config: NonceManagerConfig) {
    this.logger.info('Initializing NonceManager', {
      redisUrl: config.redisUrl.replace(/\/\/.*@/, '//***@'), // Hide credentials in logs
      ttlSeconds: config.ttlSeconds || 86400
    });

    // Initialize Redis client
    this.redis = new Redis(config.redisUrl, {
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    // Initialize database client
    this.db = new DatabaseClient(config.databaseUrl);

    // Set TTL (default 24 hours)
    this.ttlSeconds = config.ttlSeconds || 86400;

    // Setup cleanup interval (default 1 hour)
    if (config.cleanupIntervalSeconds) {
      this.setupCleanup(config.cleanupIntervalSeconds);
      this.logger.info('Cleanup interval configured', { intervalSeconds: config.cleanupIntervalSeconds });
    }

    // Handle Redis connection events
    this.redis.on('error', (err) => {
      this.logger.error('Redis connection error', err);
    });

    this.redis.on('connect', () => {
      this.logger.info('Redis connected successfully');
    });

    this.redis.on('ready', () => {
      this.logger.info('Redis ready to accept commands');
    });

    this.redis.on('reconnecting', () => {
      this.logger.warn('Redis reconnecting...');
    });
  }

  /**
   * Generate a new unique nonce and reserve it
   */
  async generateAndReserve(address: string, network: 'bsc' = 'bsc'): Promise<string> {
    const startTime = Date.now();
    let attempts = 0;
    const maxAttempts = 10;

    this.logger.info('Generating new nonce', { address, network });

    while (attempts < maxAttempts) {
      // Generate random 32-byte nonce
      const nonce = '0x' + crypto.randomBytes(32).toString('hex');
      const key = this.keyPrefix + nonce;

      try {
        // Try to reserve in Redis first (fast path)
        const reserved = await this.redis.set(
          key,
          JSON.stringify({
            address,
            network,
            timestamp: Date.now(),
            status: 'reserved'
          }),
          'EX',
          this.ttlSeconds,
          'NX' // Only set if not exists
        );

        if (reserved === 'OK') {
          // Also store in database for persistence
          try {
            await this.db.insertNonce({
              nonce,
              network,
              address,
              status: 'reserved',
              expires_at: new Date(Date.now() + this.ttlSeconds * 1000),
              used_at: null as any,
              transaction_hash: undefined
            });

            const duration = Date.now() - startTime;
            this.logger.info('Nonce generated and reserved successfully', {
              nonce: nonce.substring(0, 10) + '...', // Log partial nonce for security
              address,
              network,
              attempts: attempts + 1,
              durationMs: duration
            });
            return nonce;
          } catch (dbError: any) {
            // If database insert fails, rollback Redis
            await this.redis.del(key);
            this.logger.error('Failed to persist nonce to database, rolling back', {
              nonce: nonce.substring(0, 10) + '...',
              error: dbError.message
            });
            throw new Error('Failed to persist nonce');
          }
        }
      } catch (error) {
        this.logger.warn('Error during nonce generation attempt', {
          attempt: attempts + 1,
          error: error instanceof Error ? error.message : error
        });
      }

      attempts++;
      // Small delay before retry
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    this.logger.error('Failed to generate unique nonce after max attempts', {
      maxAttempts,
      address,
      durationMs: Date.now() - startTime
    });
    throw new Error('Failed to generate unique nonce after ' + maxAttempts + ' attempts');
  }

  /**
   * Check if a nonce has been used
   */
  async isUsed(nonce: string): Promise<boolean> {
    const startTime = Date.now();
    const key = this.keyPrefix + nonce;
    const shortNonce = nonce.substring(0, 10) + '...';

    this.logger.debug('Checking if nonce is used', { nonce: shortNonce });

    // Check Redis first (fast path)
    const exists = await this.redis.exists(key);
    if (exists === 1) {
      const data = await this.redis.get(key);
      if (data) {
        const parsed = JSON.parse(data);
        const isUsed = parsed.status === 'used';
        this.logger.debug('Nonce status from Redis', {
          nonce: shortNonce,
          status: parsed.status,
          isUsed,
          durationMs: Date.now() - startTime
        });
        return isUsed;
      }
    }

    // Fallback to database
    this.logger.debug('Nonce not in Redis, checking database', { nonce: shortNonce });
    const dbRecord = await this.db.getNonce(nonce);
    if (dbRecord) {
      // Sync to Redis for faster future lookups
      if (dbRecord.status === 'used') {
        await this.redis.set(
          key,
          JSON.stringify({
            address: dbRecord.address,
            network: dbRecord.network,
            timestamp: dbRecord.used_at?.getTime() || Date.now(),
            status: 'used',
            transactionHash: dbRecord.transaction_hash
          }),
          'EX',
          this.ttlSeconds
        );
        this.logger.debug('Synced used nonce from database to Redis', { nonce: shortNonce });
      }

      this.logger.debug('Nonce status from database', {
        nonce: shortNonce,
        status: dbRecord.status,
        isUsed: dbRecord.status === 'used',
        durationMs: Date.now() - startTime
      });
      return dbRecord.status === 'used';
    }

    this.logger.debug('Nonce not found', { nonce: shortNonce, durationMs: Date.now() - startTime });
    return false;
  }

  /**
   * Check if a nonce exists (either reserved or used)
   */
  async exists(nonce: string): Promise<boolean> {
    const key = this.keyPrefix + nonce;

    // Check Redis first
    const exists = await this.redis.exists(key);
    if (exists === 1) {
      return true;
    }

    // Fallback to database
    const dbRecord = await this.db.getNonce(nonce);
    return dbRecord !== null;
  }

  /**
   * Mark a nonce as used (for client-provided nonces)
   */
  async markUsed(
    nonce: string,
    address: string,
    transactionHash?: string,
    network: 'bsc' = 'bsc'
  ): Promise<boolean> {
    const startTime = Date.now();
    const key = this.keyPrefix + nonce;
    const shortNonce = nonce.substring(0, 10) + '...';

    this.logger.info('Marking nonce as used', {
      nonce: shortNonce,
      address,
      transactionHash: transactionHash?.substring(0, 10) + '...',
      network
    });

    try {
      // Check if already exists
      const alreadyUsed = await this.isUsed(nonce);
      if (alreadyUsed) {
        this.logger.warn('Attempted to mark already used nonce', {
          nonce: shortNonce,
          address
        });
        return false;
      }

      // First, try to reserve it if it doesn't exist
      const reserved = await this.redis.set(
        key,
        JSON.stringify({
          address,
          network,
          timestamp: Date.now(),
          status: 'used',
          transactionHash
        }),
        'EX',
        this.ttlSeconds,
        'NX' // Only set if not exists
      );

      if (reserved === 'OK') {
        // New nonce, add to database
        await this.db.insertNonce({
          nonce,
          network,
          address,
          status: 'used',
          expires_at: new Date(Date.now() + this.ttlSeconds * 1000),
          used_at: new Date(),
          transaction_hash: transactionHash
        });

        this.logger.info('Marked new nonce as used', {
          nonce: shortNonce,
          address,
          transactionHash: transactionHash?.substring(0, 10) + '...',
          durationMs: Date.now() - startTime
        });
        return true;
      } else {
        // Nonce exists, update it
        const existingData = await this.redis.get(key);
        if (existingData) {
          const parsed = JSON.parse(existingData);
          if (parsed.status === 'reserved') {
            // Update from reserved to used
            parsed.status = 'used';
            parsed.transactionHash = transactionHash;
            await this.redis.set(key, JSON.stringify(parsed), 'EX', this.ttlSeconds);

            // Update in database
            await this.db.updateNonceStatus(nonce, 'used', transactionHash);

            this.logger.info('Updated nonce from reserved to used', {
              nonce: shortNonce,
              address,
              transactionHash: transactionHash?.substring(0, 10) + '...',
              durationMs: Date.now() - startTime
            });
            return true;
          } else {
            this.logger.warn('Nonce exists but not in expected state', {
              nonce: shortNonce,
              currentStatus: parsed.status
            });
          }
        }
      }

      this.logger.warn('Failed to mark nonce as used', {
        nonce: shortNonce,
        durationMs: Date.now() - startTime
      });
      return false;
    } catch (error) {
      this.logger.error('Error marking nonce as used', {
        nonce: shortNonce,
        error: error instanceof Error ? error.message : error,
        durationMs: Date.now() - startTime
      });
      throw error;
    }
  }

  /**
   * Reserve a specific nonce (prevent it from being used)
   */
  async reserve(nonce: string, address: string, network: 'bsc' = 'bsc'): Promise<boolean> {
    const startTime = Date.now();
    const key = this.keyPrefix + nonce;
    const shortNonce = nonce.substring(0, 10) + '...';

    this.logger.info('Attempting to reserve nonce', {
      nonce: shortNonce,
      address,
      network
    });

    // Try to reserve in Redis
    const reserved = await this.redis.set(
      key,
      JSON.stringify({
        address,
        network,
        timestamp: Date.now(),
        status: 'reserved'
      }),
      'EX',
      this.ttlSeconds,
      'NX'
    );

    if (reserved === 'OK') {
      // Also store in database
      try {
        await this.db.insertNonce({
          nonce,
          network,
          address,
          status: 'reserved',
          expires_at: new Date(Date.now() + this.ttlSeconds * 1000),
          used_at: null as any,
          transaction_hash: undefined
        });

        this.logger.info('Successfully reserved nonce', {
          nonce: shortNonce,
          address,
          network,
          durationMs: Date.now() - startTime
        });
        return true;
      } catch (dbError: any) {
        // Rollback Redis on database failure
        await this.redis.del(key);
        this.logger.error('Failed to persist nonce reservation, rolled back', {
          nonce: shortNonce,
          error: dbError.message,
          durationMs: Date.now() - startTime
        });
        return false;
      }
    }

    this.logger.warn('Failed to reserve nonce (already exists)', {
      nonce: shortNonce,
      durationMs: Date.now() - startTime
    });
    return false;
  }

  /**
   * Get nonce information
   */
  async getNonceInfo(nonce: string): Promise<any | null> {
    const key = this.keyPrefix + nonce;

    // Try Redis first
    const data = await this.redis.get(key);
    if (data) {
      return JSON.parse(data);
    }

    // Fallback to database
    const dbRecord = await this.db.getNonce(nonce);
    if (dbRecord) {
      return {
        address: dbRecord.address,
        network: dbRecord.network,
        timestamp: dbRecord.created_at.getTime(),
        status: dbRecord.status,
        transactionHash: dbRecord.transaction_hash
      };
    }

    return null;
  }

  /**
   * Setup periodic cleanup of expired nonces
   */
  private setupCleanup(intervalSeconds: number): void {
    this.cleanupInterval = setInterval(async () => {
      const startTime = Date.now();
      try {
        const cleaned = await this.db.cleanExpiredNonces();
        if (cleaned > 0) {
          this.logger.info('Cleaned expired nonces', {
            count: cleaned,
            durationMs: Date.now() - startTime
          });
        } else {
          this.logger.debug('No expired nonces to clean');
        }
      } catch (error) {
        this.logger.error('Cleanup error', {
          error: error instanceof Error ? error.message : error,
          durationMs: Date.now() - startTime
        });
      }
    }, intervalSeconds * 1000);
  }

  /**
   * Get statistics about nonce usage
   */
  async getStats(): Promise<{
    total: number;
    reserved: number;
    used: number;
    expired: number;
  }> {
    // Get all keys from Redis
    const pattern = this.keyPrefix + '*';
    const keys = await this.redis.keys(pattern);

    let reserved = 0;
    let used = 0;

    for (const key of keys) {
      const data = await this.redis.get(key);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.status === 'reserved') reserved++;
        else if (parsed.status === 'used') used++;
      }
    }

    return {
      total: keys.length,
      reserved,
      used,
      expired: 0 // Redis automatically removes expired keys
    };
  }

  /**
   * Clean up and close connections
   */
  async close(): Promise<void> {
    this.logger.info('Closing NonceManager connections');

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.logger.debug('Cleanup interval cleared');
    }

    await this.redis.quit();
    this.logger.debug('Redis connection closed');

    await this.db.close();
    this.logger.debug('Database connection closed');

    this.logger.info('NonceManager shut down successfully');
  }
}