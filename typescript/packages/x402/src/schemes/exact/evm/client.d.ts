import { Address, Chain, LocalAccount, Transport } from "viem";
import { SignerWallet } from "../../../types/shared/evm";
import { PaymentPayload, PaymentRequirements, UnsignedPaymentPayload } from "../../../types/verify";
/**
 * Prepares an unsigned payment header with the given sender address and payment requirements.
 *
 * @param from - The sender's address from which the payment will be made
 * @param x402Version - The version of the X402 protocol to use
 * @param paymentRequirements - The payment requirements containing scheme and network information
 * @returns An unsigned payment payload containing authorization details
 */
export declare function preparePaymentHeader(from: Address, x402Version: number, paymentRequirements: PaymentRequirements): UnsignedPaymentPayload;
/**
 * Signs a payment header using the provided client and payment requirements.
 *
 * @param client - The signer wallet instance used to sign the payment header
 * @param paymentRequirements - The payment requirements containing scheme and network information
 * @param unsignedPaymentHeader - The unsigned payment payload to be signed
 * @returns A promise that resolves to the signed payment payload
 */
export declare function signPaymentHeader<transport extends Transport, chain extends Chain>(client: SignerWallet<chain, transport> | LocalAccount, paymentRequirements: PaymentRequirements, unsignedPaymentHeader: UnsignedPaymentPayload): Promise<PaymentPayload>;
/**
 * Creates a complete payment payload by preparing and signing a payment header.
 *
 * @param client - The signer wallet instance used to create and sign the payment
 * @param x402Version - The version of the X402 protocol to use
 * @param paymentRequirements - The payment requirements containing scheme and network information
 * @returns A promise that resolves to the complete signed payment payload
 */
export declare function createPayment<transport extends Transport, chain extends Chain>(client: SignerWallet<chain, transport> | LocalAccount, x402Version: number, paymentRequirements: PaymentRequirements): Promise<PaymentPayload>;
/**
 * Creates and encodes a payment header for the given client and payment requirements.
 *
 * @param client - The signer wallet instance used to create the payment header
 * @param x402Version - The version of the X402 protocol to use
 * @param paymentRequirements - The payment requirements containing scheme and network information
 * @returns A promise that resolves to the encoded payment header string
 */
export declare function createPaymentHeader(client: SignerWallet | LocalAccount, x402Version: number, paymentRequirements: PaymentRequirements): Promise<string>;
//# sourceMappingURL=client.d.ts.map