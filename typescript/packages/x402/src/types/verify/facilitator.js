import { z } from "zod";
import { safeBase64Decode, safeBase64Encode } from "../../shared";
import { PaymentRequirementsSchema } from "./x402Specs";
export const facilitatorRequestSchema = z.object({
    paymentHeader: z.string(),
    paymentRequirements: PaymentRequirementsSchema,
});
/**
 * Encodes a settlement response into a base64 header string
 *
 * @param response - The settlement response to encode
 * @returns A base64 encoded string containing the settlement response
 */
export function settleResponseHeader(response) {
    return safeBase64Encode(JSON.stringify(response));
}
/**
 * Decodes a base64 header string back into a settlement response
 *
 * @param header - The base64 encoded settlement response header
 * @returns The decoded settlement response object
 */
export function settleResponseFromHeader(header) {
    const decoded = safeBase64Decode(header);
    return JSON.parse(decoded);
}
//# sourceMappingURL=facilitator.js.map