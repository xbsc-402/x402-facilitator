import { Address, Hex } from "viem";
import { Network, Price, RoutePattern, ERC20TokenAmount, PaymentRequirements, PaymentPayload, SPLTokenAmount } from "../types";
import { RoutesConfig } from "../types";
/**
 * Computes the route patterns for the given routes config
 *
 * @param routes - The routes config to compute the patterns for
 * @returns The route patterns
 */
export declare function computeRoutePatterns(routes: RoutesConfig): RoutePattern[];
/**
 * Finds the matching route pattern for the given path and method
 *
 * @param routePatterns - The route patterns to search through
 * @param path - The path to match against
 * @param method - The HTTP method to match against
 * @returns The matching route pattern or undefined if no match is found
 */
export declare function findMatchingRoute(routePatterns: RoutePattern[], path: string, method: string): RoutePattern | undefined;
/**
 * Gets the default asset (USDC) for the given network
 *
 * @param network - The network to get the default asset for
 * @returns The default asset
 */
export declare function getDefaultAsset(network: Network): {
    address: `0x${string}` | import("@solana/kit").Address;
    decimals: number;
    eip712: {
        name: string;
        version: string;
    };
};
/**
 * Parses the amount from the given price
 *
 * @param price - The price to parse
 * @param network - The network to get the default asset for
 * @returns The parsed amount or an error message
 */
export declare function processPriceToAtomicAmount(price: Price, network: Network): {
    maxAmountRequired: string;
    asset: ERC20TokenAmount["asset"] | SPLTokenAmount["asset"];
} | {
    error: string;
};
/**
 * Finds the matching payment requirements for the given payment
 *
 * @param paymentRequirements - The payment requirements to search through
 * @param payment - The payment to match against
 * @returns The matching payment requirements or undefined if no match is found
 */
export declare function findMatchingPaymentRequirements(paymentRequirements: PaymentRequirements[], payment: PaymentPayload): {
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
} | undefined;
/**
 * Decodes the X-PAYMENT-RESPONSE header
 *
 * @param header - The X-PAYMENT-RESPONSE header to decode
 * @returns The decoded payment response
 */
export declare function decodeXPaymentResponse(header: string): {
    success: boolean;
    transaction: Hex;
    network: Network;
    payer: Address;
};
//# sourceMappingURL=middleware.d.ts.map