import { Address } from "viem";
import { Address as SolanaAddress } from "@solana/kit";
export declare const config: Record<string, ChainConfig>;
export type ChainConfig = {
    usdcAddress: Address | SolanaAddress;
    usdcName: string;
};
//# sourceMappingURL=config.d.ts.map