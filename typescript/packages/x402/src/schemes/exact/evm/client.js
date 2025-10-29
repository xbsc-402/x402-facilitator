import { isSignerWallet } from "../../../types/shared/evm";
import { createNonce, signAuthorization } from "./sign";
import { encodePayment } from "./utils/paymentUtils";
/**
 * Prepares an unsigned payment header with the given sender address and payment requirements.
 *
 * @param from - The sender's address from which the payment will be made
 * @param x402Version - The version of the X402 protocol to use
 * @param paymentRequirements - The payment requirements containing scheme and network information
 * @returns An unsigned payment payload containing authorization details
 */
export function preparePaymentHeader(from, x402Version, paymentRequirements) {
    const nonce = createNonce();
    const validAfter = BigInt(Math.floor(Date.now() / 1000) - 600).toString();
    const validBefore = BigInt(Math.floor(Date.now() / 1000 + paymentRequirements.maxTimeoutSeconds)).toString();
    return {
        x402Version,
        scheme: paymentRequirements.scheme,
        network: paymentRequirements.network,
        payload: {
            signature: undefined,
            authorization: {
                from,
                to: paymentRequirements.payTo,
                value: paymentRequirements.maxAmountRequired,
                validAfter: validAfter.toString(),
                validBefore: validBefore.toString(),
                nonce,
            },
        },
    };
}
/**
 * Signs a payment header using the provided client and payment requirements.
 *
 * @param client - The signer wallet instance used to sign the payment header
 * @param paymentRequirements - The payment requirements containing scheme and network information
 * @param unsignedPaymentHeader - The unsigned payment payload to be signed
 * @returns A promise that resolves to the signed payment payload
 */
export async function signPaymentHeader(client, paymentRequirements, unsignedPaymentHeader) {
    const { signature } = await signAuthorization(client, unsignedPaymentHeader.payload.authorization, paymentRequirements);
    return {
        ...unsignedPaymentHeader,
        payload: {
            ...unsignedPaymentHeader.payload,
            signature,
        },
    };
}
/**
 * Creates a complete payment payload by preparing and signing a payment header.
 *
 * @param client - The signer wallet instance used to create and sign the payment
 * @param x402Version - The version of the X402 protocol to use
 * @param paymentRequirements - The payment requirements containing scheme and network information
 * @returns A promise that resolves to the complete signed payment payload
 */
export async function createPayment(client, x402Version, paymentRequirements) {
    const from = isSignerWallet(client) ? client.account.address : client.address;
    const unsignedPaymentHeader = preparePaymentHeader(from, x402Version, paymentRequirements);
    return signPaymentHeader(client, paymentRequirements, unsignedPaymentHeader);
}
/**
 * Creates and encodes a payment header for the given client and payment requirements.
 *
 * @param client - The signer wallet instance used to create the payment header
 * @param x402Version - The version of the X402 protocol to use
 * @param paymentRequirements - The payment requirements containing scheme and network information
 * @returns A promise that resolves to the encoded payment header string
 */
export async function createPaymentHeader(client, x402Version, paymentRequirements) {
    const payment = await createPayment(client, x402Version, paymentRequirements);
    return encodePayment(payment);
}
//# sourceMappingURL=client.js.map