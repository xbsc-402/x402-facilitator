import { Account, Address, Chain, Transport } from "viem";
import { ConnectedClient } from "../../types/shared/evm/wallet";
/**
 * Gets the USDC balance for a specific address
 *
 * @param client - The Viem client instance connected to the blockchain
 * @param erc20Address - The address of the ERC20 contract
 * @param address - The address to check the USDC balance for
 * @returns A promise that resolves to the USDC balance as a bigint
 */
export declare function getERC20Balance<transport extends Transport, chain extends Chain, account extends Account | undefined = undefined>(client: ConnectedClient<transport, chain, account>, erc20Address: Address, address: Address): Promise<bigint>;
//# sourceMappingURL=erc20.d.ts.map