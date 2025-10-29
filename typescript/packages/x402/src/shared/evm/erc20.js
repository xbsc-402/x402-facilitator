import { usdcABI as erc20PermitABI } from "../../types/shared/evm/erc20PermitABI";
/**
 * Gets the USDC balance for a specific address
 *
 * @param client - The Viem client instance connected to the blockchain
 * @param erc20Address - The address of the ERC20 contract
 * @param address - The address to check the USDC balance for
 * @returns A promise that resolves to the USDC balance as a bigint
 */
export async function getERC20Balance(client, erc20Address, address) {
    const balance = await client.readContract({
        address: erc20Address,
        abi: erc20PermitABI,
        functionName: "balanceOf",
        args: [address],
    });
    return balance;
}
//# sourceMappingURL=erc20.js.map