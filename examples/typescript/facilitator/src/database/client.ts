/**
 * Database client for PostgreSQL operations
 */

import { Pool, PoolClient } from 'pg';
import { NonceRecord, TransactionRecord } from './schema.js';

export class DatabaseClient {
  private pool: Pool;

  constructor(databaseUrl: string) {
    this.pool = new Pool({
      connectionString: databaseUrl,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Log connection errors
    this.pool.on('error', (err) => {
      console.error('Unexpected database error:', err);
    });
  }

  /**
   * Execute a query with automatic connection handling
   */
  async query<T = any>(text: string, params?: any[]): Promise<T[]> {
    const result = await this.pool.query(text, params);
    return result.rows;
  }

  /**
   * Execute a single query in a transaction
   */
  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Insert a nonce record
   */
  async insertNonce(nonce: Omit<NonceRecord, 'id' | 'created_at'>): Promise<NonceRecord> {
    const query = `
      INSERT INTO nonces (nonce, network, address, status, expires_at, transaction_hash)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [
      nonce.nonce,
      nonce.network,
      nonce.address,
      nonce.status,
      nonce.expires_at,
      nonce.transaction_hash || null
    ];
    const [result] = await this.query<NonceRecord>(query, values);
    return result;
  }

  /**
   * Get nonce by value
   */
  async getNonce(nonceValue: string): Promise<NonceRecord | null> {
    const query = `
      SELECT * FROM nonces WHERE nonce = $1;
    `;
    const [result] = await this.query<NonceRecord>(query, [nonceValue]);
    return result || null;
  }

  /**
   * Update nonce status
   */
  async updateNonceStatus(
    nonceValue: string,
    status: NonceRecord['status'],
    transactionHash?: string
  ): Promise<boolean> {
    const query = `
      UPDATE nonces
      SET status = $2,
          used_at = CASE WHEN $2 = 'used' THEN CURRENT_TIMESTAMP ELSE used_at END,
          transaction_hash = COALESCE($3, transaction_hash)
      WHERE nonce = $1
      RETURNING *;
    `;
    const result = await this.query(query, [nonceValue, status, transactionHash || null]);
    return result.length > 0;
  }

  /**
   * Clean expired nonces
   */
  async cleanExpiredNonces(): Promise<number> {
    const query = `
      DELETE FROM nonces
      WHERE expires_at < CURRENT_TIMESTAMP
        AND status = 'reserved'
      RETURNING id;
    `;
    const result = await this.query(query);
    return result.length;
  }

  /**
   * Insert a transaction record
   */
  async insertTransaction(
    transaction: Omit<TransactionRecord, 'id' | 'created_at' | 'updated_at'>
  ): Promise<TransactionRecord> {
    const query = `
      INSERT INTO transactions (
        request_hash, network, from_address, to_address,
        amount, nonce, status, attempts, max_attempts,
        payload, error_message
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (request_hash) DO NOTHING
      RETURNING *;
    `;
    const values = [
      transaction.request_hash,
      transaction.network,
      transaction.from_address,
      transaction.to_address,
      transaction.amount,
      transaction.nonce,
      transaction.status,
      transaction.attempts,
      transaction.max_attempts,
      transaction.payload,
      transaction.error_message || null
    ];
    const [result] = await this.query<TransactionRecord>(query, values);
    return result;
  }

  /**
   * Get transaction by request hash
   */
  async getTransactionByHash(requestHash: string): Promise<TransactionRecord | null> {
    const query = `
      SELECT * FROM transactions WHERE request_hash = $1;
    `;
    const [result] = await this.query<TransactionRecord>(query, [requestHash]);
    return result || null;
  }

  /**
   * Get transaction by ID
   */
  async getTransaction(id: string): Promise<TransactionRecord | null> {
    const query = `
      SELECT * FROM transactions WHERE id = $1;
    `;
    const [result] = await this.query<TransactionRecord>(query, [id]);
    return result || null;
  }

  /**
   * Update transaction status
   */
  async updateTransactionStatus(
    id: string,
    status: TransactionRecord['status'],
    data?: {
      error_message?: string;
      transaction_hash?: string;
      block_number?: number;
      gas_used?: string;
      gas_price?: string;
    }
  ): Promise<boolean> {
    const query = `
      UPDATE transactions
      SET status = $2,
          attempts = attempts + 1,
          error_message = COALESCE($3, error_message),
          transaction_hash = COALESCE($4, transaction_hash),
          block_number = COALESCE($5, block_number),
          gas_used = COALESCE($6, gas_used),
          gas_price = COALESCE($7, gas_price),
          confirmed_at = CASE WHEN $2 = 'confirmed' THEN CURRENT_TIMESTAMP ELSE confirmed_at END
      WHERE id = $1
      RETURNING *;
    `;
    const values = [
      id,
      status,
      data?.error_message || null,
      data?.transaction_hash || null,
      data?.block_number || null,
      data?.gas_used || null,
      data?.gas_price || null
    ];
    const result = await this.query(query, values);
    return result.length > 0;
  }

  /**
   * Get pending transactions
   */
  async getPendingTransactions(limit: number = 10): Promise<TransactionRecord[]> {
    const query = `
      SELECT * FROM transactions
      WHERE status IN ('pending', 'processing')
        AND attempts < max_attempts
      ORDER BY created_at ASC
      LIMIT $1;
    `;
    return await this.query<TransactionRecord>(query, [limit]);
  }

  /**
   * Get failed transactions for retry
   */
  async getFailedTransactionsForRetry(limit: number = 5): Promise<TransactionRecord[]> {
    const query = `
      SELECT * FROM transactions
      WHERE status = 'failed'
        AND attempts < max_attempts
        AND updated_at < (CURRENT_TIMESTAMP - INTERVAL '5 minutes')
      ORDER BY updated_at ASC
      LIMIT $1;
    `;
    return await this.query<TransactionRecord>(query, [limit]);
  }

  /**
   * Get transaction statistics
   */
  async getTransactionStats(network?: string): Promise<any> {
    const whereClause = network ? 'WHERE network = $1' : '';
    const query = `
      SELECT
        status,
        COUNT(*) as count,
        MIN(created_at) as oldest,
        MAX(created_at) as newest
      FROM transactions
      ${whereClause}
      GROUP BY status;
    `;
    const params = network ? [network] : [];
    return await this.query(query, params);
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    await this.pool.end();
  }
}