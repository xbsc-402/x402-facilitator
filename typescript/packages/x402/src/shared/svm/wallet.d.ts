import { type KeyPairSigner, type RpcDevnet, type SolanaRpcApiDevnet, type RpcMainnet, type SolanaRpcApiMainnet } from "@solana/kit";
export type { KeyPairSigner } from "@solana/kit";
export type SvmConnectedClient = RpcDevnet<SolanaRpcApiDevnet> | RpcMainnet<SolanaRpcApiMainnet>;
export type SvmSigner = KeyPairSigner;
/**
 * Creates a public client configured for the specified SVM network
 *
 * @param network - The network to connect to
 * @returns A public client instance connected to the specified chain
 */
export declare function createSvmConnectedClient(network: string): SvmConnectedClient;
/**
 * Creates a Solana signer from a private key.
 *
 * @param privateKey - The base58 encoded private key to create a signer from.
 * @returns A Solana signer.
 */
export declare function createSignerFromBase58(privateKey: string): Promise<KeyPairSigner>;
/**
 * Checks if the given wallet is a solana KeyPairSigner wallet.
 *
 * @param wallet - The object wallet to check.
 * @returns True if the wallet is a solana KeyPairSigner wallet, false otherwise.
 */
export declare function isSignerWallet(wallet: SvmSigner): wallet is SvmSigner;
//# sourceMappingURL=wallet.d.ts.map