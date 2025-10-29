import { z } from "zod";
export const NetworkSchema = z.enum([
    "bsc",
    "base",
    "avalanche-fuji",
    "avalanche",
    "iotex",
    "solana-devnet",
    "solana",
    "sei",
    "sei-testnet",
    "polygon",
    "polygon-amoy",
    "peaq",
]);
// evm
export const SupportedEVMNetworks = [
    "bsc",
    "base",
    "avalanche-fuji",
    "avalanche",
    "iotex",
    "sei",
    "sei-testnet",
    "polygon",
    "polygon-amoy",
    "peaq",
];
export const EvmNetworkToChainId = new Map([
    ["bsc", 56],
    ["base", 8453],
    ["avalanche-fuji", 43113],
    ["avalanche", 43114],
    ["iotex", 4689],
    ["sei", 1329],
    ["sei-testnet", 1328],
    ["polygon", 137],
    ["polygon-amoy", 80002],
    ["peaq", 3338],
]);
// svm
export const SupportedSVMNetworks = ["solana-devnet", "solana"];
export const SvmNetworkToChainId = new Map([
    ["solana-devnet", 103],
    ["solana", 101],
]);
export const ChainIdToNetwork = Object.fromEntries([...SupportedEVMNetworks, ...SupportedSVMNetworks].map(network => [
    EvmNetworkToChainId.get(network),
    network,
]));
//# sourceMappingURL=network.js.map