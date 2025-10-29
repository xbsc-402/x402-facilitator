import { Account, Address, Chain, Client, Transport } from "viem";
import { ChainConfig } from "../../types/shared/evm/config";
import { ConnectedClient } from "../../types/shared/evm/wallet";
/**
 * Gets the USDC contract address for the current chain from the client
 *
 * @param client - The Viem client instance connected to the blockchain
 * @returns The USDC contract address for the current chain
 */
export declare function getUsdcAddress<transport extends Transport, chain extends Chain | undefined = undefined, account extends Account | undefined = undefined>(client: Client<transport, chain, account>): Address;
/**
 * Gets the USDC contract address for a specific chain ID
 *
 * @deprecated Use `getUsdcChainConfigForChain` instead
 * @param chainId - The chain ID to get the USDC contract address for
 * @returns The USDC contract address for the specified chain
 */
export declare function getUsdcAddressForChain(chainId: number): Address;
/**
 * Gets the USDC address and eip712 domain name for a specific chain ID
 *
 * @param chainId - The chain ID
 * @returns The USDC contract address and eip712 domain name  for the specified chain
 */
export declare function getUsdcChainConfigForChain(chainId: number): ChainConfig | undefined;
/**
 * Gets the version of the USDC contract, using a cache to avoid repeated calls
 *
 * @param client - The Viem client instance connected to the blockchain
 * @returns A promise that resolves to the USDC contract version string
 */
export declare function getVersion<transport extends Transport, chain extends Chain, account extends Account | undefined = undefined>(client: ConnectedClient<transport, chain, account>): Promise<string>;
/**
 * Gets the USDC balance for a specific address
 *
 * @param client - The Viem client instance connected to the blockchain
 * @param address - The address to check the USDC balance for
 * @returns A promise that resolves to the USDC balance as a bigint
 */
export declare function getUSDCBalance<transport extends Transport, chain extends Chain, account extends Account | undefined = undefined>(client: ConnectedClient<transport, chain, account>, address: Address): Promise<bigint>;
//# sourceMappingURL=usdc.d.ts.map