/**
 * Database schema definitions for Facilitator service
 */

export interface NonceRecord {
  id: string;
  nonce: string;
  network: 'bsc' | 'evm';
  address: string;
  used_at: Date;
  created_at: Date;
  transaction_hash?: string;
  status: 'reserved' | 'used' | 'expired';
  expires_at: Date;
}

export interface TransactionRecord {
  id: string;
  request_hash: string;
  network: 'bsc' | 'evm';
  from_address: string;
  to_address: string;
  token_address: string;  // Token contract address
  amount: string;
  nonce: string;
  status: 'pending' | 'processing' | 'confirmed' | 'failed';
  attempts: number;
  max_attempts: number;
  payload: any; // JSON storage for complete payment payload
  error_message?: string;
  transaction_hash?: string;
  block_number?: number;
  gas_used?: string;
  gas_price?: string;
  created_at: Date;
  updated_at: Date;
  confirmed_at?: Date;
}

export interface BlockHeightRecord {
  id: string;
  network: string;
  last_processed_block: number;
  updated_at: Date;
}

export const SCHEMA_VERSION = 1;