/**
 * Blockchain Query Service
 * Fetches on-chain data with caching to reduce RPC calls
 */

import { createConnectedClient, ConnectedClient } from 'x402/types';
import { createLogger } from '../utils/logger.js';

interface CachedValue<T> {
  value: T;
  timestamp: number;
  ttl: number;
}

export class BlockchainQueryService {
  private client: ConnectedClient;
  private logger = createLogger('BlockchainQuery');
  private cache: Map<string, CachedValue<any>> = new Map();
  private network: string;

  // ABI for the mint-related functions
  // You'll need to replace this with your actual contract ABI
  private mintControllerAbi = [
    {
      "inputs": [],
      "name": "remainingMintableAmount",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalMinted",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "maxSupply",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  constructor(network: string) {
    this.network = network;
    this.client = createConnectedClient(network);
    this.logger.info('Blockchain query service initialized', { network });
  }

  /**
   * Get remaining mintable amount from the contract
   * @param contractAddress The token contract address to query
   * @param cacheTtl Cache time-to-live in seconds (default: 10 seconds)
   */
  async getRemainingMintableAmount(contractAddress: string, cacheTtl: number = 10): Promise<number> {
    const cacheKey = `remaining_mintable_${this.network}_${contractAddress}`;
    const startTime = Date.now();

    // Check cache first
    const cached = this.getCachedValue<number>(cacheKey);
    if (cached !== null) {
      this.logger.debug('Returning cached remaining mintable amount', {
        value: cached,
        contractAddress: contractAddress.substring(0, 10) + '...',
        cacheAge: Date.now() - (this.cache.get(cacheKey)?.timestamp || 0)
      });
      return cached;
    }

    try {
      if (!contractAddress) {
        throw new Error(`Contract address is required`);
      }

      this.logger.info('Fetching remaining mintable amount from chain', {
        network: this.network,
        contractAddress: contractAddress.substring(0, 10) + '...'
      });

      // Query the contract - this will vary based on your actual contract
      // Option 1: If contract has a remainingMintableAmount function
      let remainingAmount: bigint;

      try {
        // Try to call remainingMintableAmount directly if it exists
        const result = await (this.client as any).readContract({
          address: contractAddress,
          abi: this.mintControllerAbi,
          functionName: 'remainingMintableAmount',
        });
        remainingAmount = BigInt(result);
      } catch (error) {
        // Fallback: Calculate from maxSupply - totalMinted
        this.logger.debug('Falling back to calculate from maxSupply - totalMinted');

        const [maxSupply, totalMinted] = await Promise.all([
          (this.client as any).readContract({
            address: contractAddress,
            abi: this.mintControllerAbi,
            functionName: 'maxSupply',
          }),
          (this.client as any).readContract({
            address: contractAddress,
            abi: this.mintControllerAbi,
            functionName: 'totalMinted',
          })
        ]);

        remainingAmount = BigInt(maxSupply) - BigInt(totalMinted);
      }

      // Convert from wei or smallest unit if needed
      // Assuming the contract returns the value in the smallest unit
      const remainingCount = Number(remainingAmount);

      // Cache the result
      this.setCachedValue(cacheKey, remainingCount, cacheTtl);

      this.logger.info('Fetched remaining mintable amount from chain', {
        remainingAmount: remainingCount,
        network: this.network,
        durationMs: Date.now() - startTime,
        cachedFor: cacheTtl
      });

      return remainingCount;

    } catch (error) {
      this.logger.error('Failed to fetch remaining mintable amount', {
        network: this.network,
        error: error instanceof Error ? error.message : error,
        durationMs: Date.now() - startTime
      });

      // Return a safe default or throw based on your requirements
      // For safety, we'll throw to prevent accepting transactions when we can't verify capacity
      throw new Error(`Failed to fetch on-chain data: ${error instanceof Error ? error.message : error}`);
    }
  }

  /**
   * Get total minted amount from the contract
   * @param contractAddress The token contract address to query
   * @param cacheTtl Cache time-to-live in seconds (default: 10 seconds)
   */
  async getTotalMinted(contractAddress: string, cacheTtl: number = 10): Promise<number> {
    const cacheKey = `total_minted_${this.network}_${contractAddress}`;

    // Check cache first
    const cached = this.getCachedValue<number>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    try {
      if (!contractAddress) {
        throw new Error(`Contract address is required`);
      }

      const result = await (this.client as any).readContract({
        address: contractAddress,
        abi: this.mintControllerAbi,
        functionName: 'totalMinted',
      });

      const totalMinted = Number(BigInt(result));

      // Cache the result
      this.setCachedValue(cacheKey, totalMinted, cacheTtl);

      return totalMinted;
    } catch (error) {
      this.logger.error('Failed to fetch total minted', {
        network: this.network,
        error: error instanceof Error ? error.message : error
      });
      throw error;
    }
  }

  /**
   * Get max supply from the contract
   * @param contractAddress The token contract address to query
   * @param cacheTtl Cache time-to-live in seconds (default: 60 seconds)
   */
  async getMaxSupply(contractAddress: string, cacheTtl: number = 60): Promise<number> {
    const cacheKey = `max_supply_${this.network}_${contractAddress}`;

    // Check cache first
    const cached = this.getCachedValue<number>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    try {
      if (!contractAddress) {
        throw new Error(`Contract address is required`);
      }

      const result = await (this.client as any).readContract({
        address: contractAddress,
        abi: this.mintControllerAbi,
        functionName: 'maxSupply',
      });

      const maxSupply = Number(BigInt(result));

      // Cache the result (max supply rarely changes, so longer TTL)
      this.setCachedValue(cacheKey, maxSupply, cacheTtl);

      return maxSupply;
    } catch (error) {
      this.logger.error('Failed to fetch max supply', {
        network: this.network,
        error: error instanceof Error ? error.message : error
      });
      throw error;
    }
  }

  /**
   * Clear all cached values
   */
  clearCache(): void {
    this.cache.clear();
    this.logger.debug('Cache cleared');
  }

  /**
   * Get a value from cache if it exists and hasn't expired
   */
  private getCachedValue<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) {
      return null;
    }

    const age = Date.now() - cached.timestamp;
    if (age > cached.ttl * 1000) {
      // Expired
      this.cache.delete(key);
      return null;
    }

    return cached.value as T;
  }

  /**
   * Set a value in cache
   */
  private setCachedValue<T>(key: string, value: T, ttlSeconds: number): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl: ttlSeconds
    });
  }
}