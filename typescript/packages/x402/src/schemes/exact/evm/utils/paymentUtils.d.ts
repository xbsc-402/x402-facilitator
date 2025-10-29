import { PaymentPayload } from "../../../../types/verify";
/**
 * Encodes a payment payload into a base64 string, ensuring bigint values are properly stringified
 *
 * @param payment - The payment payload to encode
 * @returns A base64 encoded string representation of the payment payload
 */
export declare function encodePayment(payment: PaymentPayload): string;
/**
 * Decodes a base64 encoded payment string back into a PaymentPayload object
 *
 * @param payment - The base64 encoded payment string to decode
 * @returns The decoded and validated PaymentPayload object
 */
export declare function decodePayment(payment: string): PaymentPayload;
//# sourceMappingURL=paymentUtils.d.ts.map