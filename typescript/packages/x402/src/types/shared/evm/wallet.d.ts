import type { Chain, Transport, Client, Account, RpcSchema, PublicActions, WalletActions, PublicClient, LocalAccount } from "viem";
import { bsc, avalancheFuji } from "viem/chains";
import { Hex } from "viem";
export type SignerWallet<chain extends Chain = Chain, transport extends Transport = Transport, account extends Account = Account> = Client<transport, chain, account, RpcSchema, PublicActions<transport, chain, account> & WalletActions<chain, account>>;
export type ConnectedClient<transport extends Transport = Transport, chain extends Chain | undefined = Chain, account extends Account | undefined = undefined> = PublicClient<transport, chain, account>;
export type EvmSigner = SignerWallet<Chain, Transport, Account> | LocalAccount;
/**
 * Creates a public client configured for the specified network
 *
 * @param network - The network to connect to
 * @returns A public client instance connected to the specified chain
 */
export declare function createConnectedClient(network: string): ConnectedClient<Transport, Chain, undefined>;
/**
 * Creates a public client configured for the Base Sepolia testnet
 *
 * @deprecated Use `createConnectedClient("bsc")` instead
 * @returns A public client instance connected to Base Sepolia
 */
export declare function createClientSepolia(): ConnectedClient<Transport, typeof bsc, undefined>;
/**
 * Creates a public client configured for the Avalanche Fuji testnet
 *
 * @deprecated Use `createConnectedClient("avalanche-fuji")` instead
 * @returns A public client instance connected to Avalanche Fuji
 */
export declare function createClientAvalancheFuji(): ConnectedClient<Transport, typeof avalancheFuji, undefined>;
/**
 * Creates a wallet client configured for the specified chain with a private key
 *
 * @param network - The network to connect to
 * @param privateKey - The private key to use for signing transactions
 * @returns A wallet client instance connected to the specified chain with the provided private key
 */
export declare function createSigner(network: string, privateKey: Hex): SignerWallet<Chain>;
/**
 * Creates a wallet client configured for the Base Sepolia testnet with a private key
 *
 * @deprecated Use `createSigner("bsc", privateKey)` instead
 * @param privateKey - The private key to use for signing transactions
 * @returns A wallet client instance connected to Base Sepolia with the provided private key
 */
export declare function createSignerSepolia(privateKey: Hex): SignerWallet<typeof bsc>;
/**
 * Creates a wallet client configured for the Avalanche Fuji testnet with a private key
 *
 * @deprecated Use `createSigner("avalanche-fuji", privateKey)` instead
 * @param privateKey - The private key to use for signing transactions
 * @returns A wallet client instance connected to Avalanche Fuji with the provided private key
 */
export declare function createSignerAvalancheFuji(privateKey: Hex): SignerWallet<typeof avalancheFuji>;
/**
 * Checks if a wallet is a signer wallet
 *
 * @param wallet - The wallet to check
 * @returns True if the wallet is a signer wallet, false otherwise
 */
export declare function isSignerWallet<TChain extends Chain = Chain, TTransport extends Transport = Transport, TAccount extends Account = Account>(wallet: SignerWallet<TChain, TTransport, TAccount> | LocalAccount): wallet is SignerWallet<TChain, TTransport, TAccount>;
/**
 * Checks if a wallet is an account
 *
 * @param wallet - The wallet to check
 * @returns True if the wallet is an account, false otherwise
 */
export declare function isAccount<TChain extends Chain = Chain, TTransport extends Transport = Transport, TAccount extends Account = Account>(wallet: SignerWallet<TChain, TTransport, TAccount> | LocalAccount): wallet is LocalAccount;
/**
 * Maps network strings to Chain objects
 *
 * @param network - The network string to convert to a Chain object
 * @returns The corresponding Chain object
 */
export declare function getChainFromNetwork(network: string | undefined): Chain;
//# sourceMappingURL=wallet.d.ts.map