import { type KeyPairSigner } from "@solana/kit";
import { PaymentPayload, PaymentRequirements } from "../../../types/verify";
import { X402Config } from "../../../types/config";
/**
 * Creates and encodes a payment header for the given client and payment requirements.
 *
 * @param client - The signer instance used to create the payment header
 * @param x402Version - The version of the X402 protocol to use
 * @param paymentRequirements - The payment requirements containing scheme and network information
 * @param config - Optional configuration for X402 operations (e.g., custom RPC URLs)
 * @returns A promise that resolves to a base64 encoded payment header string
 */
export declare function createPaymentHeader(client: KeyPairSigner, x402Version: number, paymentRequirements: PaymentRequirements, config?: X402Config): Promise<string>;
/**
 * Creates and signs a payment for the given client and payment requirements.
 *
 * @param client - The signer instance used to create and sign the payment tx
 * @param x402Version - The version of the X402 protocol to use
 * @param paymentRequirements - The payment requirements
 * @param config - Optional configuration for X402 operations (e.g., custom RPC URLs)
 * @returns A promise that resolves to a payment payload containing a base64 encoded solana token transfer tx
 */
export declare function createAndSignPayment(client: KeyPairSigner, x402Version: number, paymentRequirements: PaymentRequirements, config?: X402Config): Promise<PaymentPayload>;
//# sourceMappingURL=client.d.ts.map