import { safeBase64Encode, safeBase64Decode } from "../../../../shared";
import { SupportedEVMNetworks, SupportedSVMNetworks } from "../../../../types";
import { PaymentPayloadSchema, } from "../../../../types/verify";
/**
 * Encodes a payment payload into a base64 string, ensuring bigint values are properly stringified
 *
 * @param payment - The payment payload to encode
 * @returns A base64 encoded string representation of the payment payload
 */
export function encodePayment(payment) {
    let safe;
    // evm
    if (SupportedEVMNetworks.includes(payment.network)) {
        const evmPayload = payment.payload;
        safe = {
            ...payment,
            payload: {
                ...evmPayload,
                authorization: Object.fromEntries(Object.entries(evmPayload.authorization).map(([key, value]) => [
                    key,
                    typeof value === "bigint" ? value.toString() : value,
                ])),
            },
        };
        return safeBase64Encode(JSON.stringify(safe));
    }
    // svm
    if (SupportedSVMNetworks.includes(payment.network)) {
        safe = { ...payment, payload: payment.payload };
        return safeBase64Encode(JSON.stringify(safe));
    }
    throw new Error("Invalid network");
}
/**
 * Decodes a base64 encoded payment string back into a PaymentPayload object
 *
 * @param payment - The base64 encoded payment string to decode
 * @returns The decoded and validated PaymentPayload object
 */
export function decodePayment(payment) {
    const decoded = safeBase64Decode(payment);
    const parsed = JSON.parse(decoded);
    let obj;
    // evm
    if (SupportedEVMNetworks.includes(parsed.network)) {
        obj = {
            ...parsed,
            payload: parsed.payload,
        };
    }
    // svm
    else if (SupportedSVMNetworks.includes(parsed.network)) {
        obj = {
            ...parsed,
            payload: parsed.payload,
        };
    }
    else {
        throw new Error("Invalid network");
    }
    const validated = PaymentPayloadSchema.parse(obj);
    return validated;
}
//# sourceMappingURL=paymentUtils.js.map