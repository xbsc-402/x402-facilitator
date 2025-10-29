/**
 * Database migration for Facilitator service
 * Handles automatic table creation and schema updates
 */

import { Pool } from 'pg';

export class DatabaseMigration {
  private pool: Pool;

  constructor(databaseUrl: string) {
    this.pool = new Pool({
      connectionString: databaseUrl,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  /**
   * Run all migrations
   */
  async migrate(): Promise<void> {
    console.log('Starting database migration...');

    try {
      // Create schema version table
      await this.createSchemaVersionTable();

      // Get current schema version
      const currentVersion = await this.getCurrentSchemaVersion();

      // Run migrations based on version
      if (currentVersion < 1) {
        await this.migration001_InitialSchema();
        await this.updateSchemaVersion(1);
      }

      // Future migrations can be added here
      // if (currentVersion < 2) {
      //   await this.migration002_AddNewFeature();
      //   await this.updateSchemaVersion(2);
      // }

      console.log('Database migration completed successfully');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  /**
   * Create schema version tracking table
   */
  private async createSchemaVersionTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS schema_versions (
        version INTEGER PRIMARY KEY,
        migrated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await this.pool.query(query);
  }

  /**
   * Get current schema version
   */
  private async getCurrentSchemaVersion(): Promise<number> {
    const query = `
      SELECT COALESCE(MAX(version), 0) as version
      FROM schema_versions;
    `;
    const result = await this.pool.query(query);
    return result.rows[0].version;
  }

  /**
   * Update schema version
   */
  private async updateSchemaVersion(version: number): Promise<void> {
    const query = `
      INSERT INTO schema_versions (version) VALUES ($1);
    `;
    await this.pool.query(query, [version]);
  }

  /**
   * Migration 001: Initial schema
   */
  private async migration001_InitialSchema(): Promise<void> {
    console.log('Running migration 001: Initial schema...');

    // Create nonces table
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS nonces (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nonce VARCHAR(66) UNIQUE NOT NULL,
        network VARCHAR(10) NOT NULL,
        address VARCHAR(42) NOT NULL,
        used_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        transaction_hash VARCHAR(66),
        status VARCHAR(20) NOT NULL DEFAULT 'reserved',
        expires_at TIMESTAMP NOT NULL
      );
    `);

    // Create indexes for nonces table
    await this.pool.query(`CREATE INDEX IF NOT EXISTS idx_nonces_nonce ON nonces(nonce);`);
    await this.pool.query(`CREATE INDEX IF NOT EXISTS idx_nonces_status ON nonces(status);`);
    await this.pool.query(`CREATE INDEX IF NOT EXISTS idx_nonces_expires ON nonces(expires_at);`);
    await this.pool.query(`CREATE INDEX IF NOT EXISTS idx_nonces_address ON nonces(address);`);

    // Create transactions table
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        request_hash VARCHAR(64) UNIQUE NOT NULL,
        network VARCHAR(10) NOT NULL,
        from_address VARCHAR(42) NOT NULL,
        to_address VARCHAR(42) NOT NULL,
        token_address VARCHAR(42) NOT NULL,
        amount VARCHAR(78) NOT NULL,
        nonce VARCHAR(66) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        attempts INTEGER DEFAULT 0,
        max_attempts INTEGER DEFAULT 3,
        payload JSONB NOT NULL,
        error_message TEXT,
        transaction_hash VARCHAR(66),
        block_number BIGINT,
        gas_used VARCHAR(78),
        gas_price VARCHAR(78),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        confirmed_at TIMESTAMP
      );
    `);

    // Create indexes for transactions table
    await this.pool.query(`CREATE INDEX IF NOT EXISTS idx_transactions_request_hash ON transactions(request_hash);`);
    await this.pool.query(`CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);`);
    await this.pool.query(`CREATE INDEX IF NOT EXISTS idx_transactions_from_address ON transactions(from_address);`);
    await this.pool.query(`CREATE INDEX IF NOT EXISTS idx_transactions_to_address ON transactions(to_address);`);
    await this.pool.query(`CREATE INDEX IF NOT EXISTS idx_transactions_token_address ON transactions(token_address);`);
    await this.pool.query(`CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);`);
    await this.pool.query(`CREATE INDEX IF NOT EXISTS idx_transactions_nonce ON transactions(nonce);`);

    // Create block heights table for tracking processed blocks
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS block_heights (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        network VARCHAR(20) UNIQUE NOT NULL,
        last_processed_block BIGINT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create trigger for updating updated_at
    await this.pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await this.pool.query(`
      CREATE TRIGGER update_transactions_updated_at
      BEFORE UPDATE ON transactions
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    // Create indexes for better query performance
    await this.pool.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_pending_status
      ON transactions(status, created_at)
      WHERE status IN ('pending', 'processing');
    `);

    await this.pool.query(`
      CREATE INDEX IF NOT EXISTS idx_nonces_active
      ON nonces(status, expires_at)
      WHERE status = 'reserved';
    `);

    console.log('Migration 001 completed');
  }

  /**
   * Check database connection
   */
  async checkConnection(): Promise<boolean> {
    try {
      await this.pool.query('SELECT 1');
      return true;
    } catch (error) {
      console.error('Database connection failed:', error);
      return false;
    }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    await this.pool.end();
  }
}