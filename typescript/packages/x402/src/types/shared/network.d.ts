import { z } from "zod";
export declare const NetworkSchema: z.ZodEnum<["bsc", "base", "avalanche-fuji", "avalanche", "iotex", "solana-devnet", "solana", "sei", "sei-testnet", "polygon", "polygon-amoy", "peaq"]>;
export type Network = z.infer<typeof NetworkSchema>;
export declare const SupportedEVMNetworks: Network[];
export declare const EvmNetworkToChainId: Map<"bsc" | "avalanche-fuji" | "base" | "avalanche" | "sei" | "sei-testnet" | "polygon" | "polygon-amoy" | "peaq" | "iotex" | "solana-devnet" | "solana", number>;
export declare const SupportedSVMNetworks: Network[];
export declare const SvmNetworkToChainId: Map<"bsc" | "avalanche-fuji" | "base" | "avalanche" | "sei" | "sei-testnet" | "polygon" | "polygon-amoy" | "peaq" | "iotex" | "solana-devnet" | "solana", number>;
export declare const ChainIdToNetwork: Record<number, Network>;
//# sourceMappingURL=network.d.ts.map