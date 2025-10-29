import { z } from "zod";
import { SettleResponse } from "./x402Specs";
export declare const facilitatorRequestSchema: z.ZodObject<{
    paymentHeader: z.ZodString;
    paymentRequirements: z.ZodObject<{
        scheme: z.ZodEnum<["exact"]>;
        network: z.ZodEnum<["bsc", "base", "avalanche-fuji", "avalanche", "iotex", "solana-devnet", "solana", "sei", "sei-testnet", "polygon", "polygon-amoy", "peaq"]>;
        maxAmountRequired: z.ZodEffects<z.ZodString, string, string>;
        resource: z.ZodString;
        description: z.ZodString;
        mimeType: z.ZodString;
        outputSchema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        payTo: z.ZodUnion<[z.ZodString, z.ZodString]>;
        maxTimeoutSeconds: z.ZodNumber;
        asset: z.ZodUnion<[z.ZodString, z.ZodString]>;
        extra: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        scheme: "exact";
        asset: string;
        maxAmountRequired: string;
        network: "bsc" | "avalanche-fuji" | "base" | "avalanche" | "sei" | "sei-testnet" | "polygon" | "polygon-amoy" | "peaq" | "iotex" | "solana-devnet" | "solana";
        resource: string;
        mimeType: string;
        payTo: string;
        maxTimeoutSeconds: number;
        outputSchema?: Record<string, any> | undefined;
        extra?: Record<string, any> | undefined;
    }, {
        description: string;
        scheme: "exact";
        asset: string;
        maxAmountRequired: string;
        network: "bsc" | "avalanche-fuji" | "base" | "avalanche" | "sei" | "sei-testnet" | "polygon" | "polygon-amoy" | "peaq" | "iotex" | "solana-devnet" | "solana";
        resource: string;
        mimeType: string;
        payTo: string;
        maxTimeoutSeconds: number;
        outputSchema?: Record<string, any> | undefined;
        extra?: Record<string, any> | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    paymentRequirements: {
        description: string;
        scheme: "exact";
        asset: string;
        maxAmountRequired: string;
        network: "bsc" | "avalanche-fuji" | "base" | "avalanche" | "sei" | "sei-testnet" | "polygon" | "polygon-amoy" | "peaq" | "iotex" | "solana-devnet" | "solana";
        resource: string;
        mimeType: string;
        payTo: string;
        maxTimeoutSeconds: number;
        outputSchema?: Record<string, any> | undefined;
        extra?: Record<string, any> | undefined;
    };
    paymentHeader: string;
}, {
    paymentRequirements: {
        description: string;
        scheme: "exact";
        asset: string;
        maxAmountRequired: string;
        network: "bsc" | "avalanche-fuji" | "base" | "avalanche" | "sei" | "sei-testnet" | "polygon" | "polygon-amoy" | "peaq" | "iotex" | "solana-devnet" | "solana";
        resource: string;
        mimeType: string;
        payTo: string;
        maxTimeoutSeconds: number;
        outputSchema?: Record<string, any> | undefined;
        extra?: Record<string, any> | undefined;
    };
    paymentHeader: string;
}>;
export type FacilitatorRequest = z.infer<typeof facilitatorRequestSchema>;
/**
 * Encodes a settlement response into a base64 header string
 *
 * @param response - The settlement response to encode
 * @returns A base64 encoded string containing the settlement response
 */
export declare function settleResponseHeader(response: SettleResponse): string;
/**
 * Decodes a base64 header string back into a settlement response
 *
 * @param header - The base64 encoded settlement response header
 * @returns The decoded settlement response object
 */
export declare function settleResponseFromHeader(header: string): SettleResponse;
//# sourceMappingURL=facilitator.d.ts.map