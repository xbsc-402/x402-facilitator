import { ListDiscoveryResourcesRequest, ListDiscoveryResourcesResponse, FacilitatorConfig, SupportedPaymentKindsResponse } from "../types";
import { PaymentPayload, PaymentRequirements, SettleResponse, VerifyResponse } from "../types/verify";
export type CreateHeaders = () => Promise<{
    verify: Record<string, string>;
    settle: Record<string, string>;
    supported: Record<string, string>;
    list?: Record<string, string>;
}>;
/**
 * Creates a facilitator client for interacting with the X402 payment facilitator service
 *
 * @param facilitator - The facilitator config to use. If not provided, the default facilitator will be used.
 * @returns An object containing verify and settle functions for interacting with the facilitator
 */
export declare function useFacilitator(facilitator?: FacilitatorConfig): {
    verify: (payload: PaymentPayload, paymentRequirements: PaymentRequirements) => Promise<VerifyResponse>;
    settle: (payload: PaymentPayload, paymentRequirements: PaymentRequirements) => Promise<SettleResponse>;
    supported: () => Promise<SupportedPaymentKindsResponse>;
    list: (config?: ListDiscoveryResourcesRequest) => Promise<ListDiscoveryResourcesResponse>;
};
export declare const verify: (payload: PaymentPayload, paymentRequirements: PaymentRequirements) => Promise<VerifyResponse>, settle: (payload: PaymentPayload, paymentRequirements: PaymentRequirements) => Promise<SettleResponse>, supported: () => Promise<SupportedPaymentKindsResponse>, list: (config?: ListDiscoveryResourcesRequest) => Promise<ListDiscoveryResourcesResponse>;
//# sourceMappingURL=useFacilitator.d.ts.map