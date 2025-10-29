import { RpcDevnet, SolanaRpcApiDevnet, SolanaRpcApiMainnet, RpcMainnet, RpcSubscriptionsFromTransport, SolanaRpcSubscriptionsApi, RpcSubscriptionsTransportFromClusterUrl, ClusterUrl } from "@solana/kit";
import { Network } from "../../types/shared";
/**
 * Creates a Solana RPC client for the devnet network.
 *
 * @param url - Optional URL of the devnet network.
 * @returns A Solana RPC client.
 */
export declare function createDevnetRpcClient(url?: string): RpcDevnet<SolanaRpcApiDevnet>;
/**
 * Creates a Solana RPC client for the mainnet network.
 *
 * @param url - Optional URL of the mainnet network.
 * @returns A Solana RPC client.
 */
export declare function createMainnetRpcClient(url?: string): RpcMainnet<SolanaRpcApiMainnet>;
/**
 * Gets the RPC client for the given network.
 *
 * @param network - The network to get the RPC client for
 * @param url - Optional URL of the network. If not provided, the default URL will be used.
 * @returns The RPC client for the given network
 */
export declare function getRpcClient(network: Network, url?: string): RpcDevnet<SolanaRpcApiDevnet> | RpcMainnet<SolanaRpcApiMainnet>;
/**
 * Gets the RPC subscriptions for the given network.
 *
 * @param network - The network to get the RPC subscriptions for
 * @param url - Optional URL of the network. If not provided, the default URL will be used.
 * @returns The RPC subscriptions for the given network
 */
export declare function getRpcSubscriptions(network: Network, url?: string): RpcSubscriptionsFromTransport<SolanaRpcSubscriptionsApi, RpcSubscriptionsTransportFromClusterUrl<ClusterUrl>>;
//# sourceMappingURL=rpc.d.ts.map