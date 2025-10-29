import { toJsonSafe } from "../shared";
const DEFAULT_FACILITATOR_URL = "https://x402.org/facilitator";
/**
 * Creates a facilitator client for interacting with the X402 payment facilitator service
 *
 * @param facilitator - The facilitator config to use. If not provided, the default facilitator will be used.
 * @returns An object containing verify and settle functions for interacting with the facilitator
 */
export function useFacilitator(facilitator) {
    /**
     * Verifies a payment payload with the facilitator service
     *
     * @param payload - The payment payload to verify
     * @param paymentRequirements - The payment requirements to verify against
     * @returns A promise that resolves to the verification response
     */
    async function verify(payload, paymentRequirements) {
        const url = facilitator?.url || DEFAULT_FACILITATOR_URL;
        let headers = { "Content-Type": "application/json" };
        if (facilitator?.createAuthHeaders) {
            const authHeaders = await facilitator.createAuthHeaders();
            headers = { ...headers, ...authHeaders.verify };
        }
        const res = await fetch(`${url}/verify`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                x402Version: payload.x402Version,
                paymentPayload: toJsonSafe(payload),
                paymentRequirements: toJsonSafe(paymentRequirements),
            }),
        });
        if (res.status !== 200) {
            throw new Error(`Failed to verify payment: ${res.statusText}`);
        }
        const data = await res.json();
        return data;
    }
    /**
     * Settles a payment with the facilitator service
     *
     * @param payload - The payment payload to settle
     * @param paymentRequirements - The payment requirements for the settlement
     * @returns A promise that resolves to the settlement response
     */
    async function settle(payload, paymentRequirements) {
        const url = facilitator?.url || DEFAULT_FACILITATOR_URL;
        let headers = { "Content-Type": "application/json" };
        if (facilitator?.createAuthHeaders) {
            const authHeaders = await facilitator.createAuthHeaders();
            headers = { ...headers, ...authHeaders.settle };
        }
        const res = await fetch(`${url}/settle`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                x402Version: payload.x402Version,
                paymentPayload: toJsonSafe(payload),
                paymentRequirements: toJsonSafe(paymentRequirements),
            }),
        });
        if (res.status !== 200) {
            const text = res.statusText;
            throw new Error(`Failed to settle payment: ${res.status} ${text}`);
        }
        const data = await res.json();
        return data;
    }
    /**
     * Gets the supported payment kinds from the facilitator service.
     *
     * @returns A promise that resolves to the supported payment kinds
     */
    async function supported() {
        const url = facilitator?.url || DEFAULT_FACILITATOR_URL;
        let headers = { "Content-Type": "application/json" };
        if (facilitator?.createAuthHeaders) {
            const authHeaders = await facilitator.createAuthHeaders();
            headers = { ...headers, ...authHeaders.supported };
        }
        const res = await fetch(`${url}/supported`, {
            method: "GET",
            headers,
        });
        if (res.status !== 200) {
            throw new Error(`Failed to get supported payment kinds: ${res.statusText}`);
        }
        const data = await res.json();
        return data;
    }
    /**
     * Lists the discovery items with the facilitator service
     *
     * @param config - The configuration for the discovery list request
     * @returns A promise that resolves to the discovery list response
     */
    async function list(config = {}) {
        const url = facilitator?.url || DEFAULT_FACILITATOR_URL;
        let headers = { "Content-Type": "application/json" };
        if (facilitator?.createAuthHeaders) {
            const authHeaders = await facilitator.createAuthHeaders();
            if (authHeaders.list) {
                headers = { ...headers, ...authHeaders.list };
            }
        }
        const urlParams = new URLSearchParams(Object.entries(config)
            .filter(([_, value]) => value !== undefined)
            .map(([key, value]) => [key, value.toString()]));
        const res = await fetch(`${url}/discovery/resources?${urlParams.toString()}`, {
            method: "GET",
            headers,
        });
        if (res.status !== 200) {
            const text = res.statusText;
            throw new Error(`Failed to list discovery: ${res.status} ${text}`);
        }
        const data = await res.json();
        return data;
    }
    return { verify, settle, supported, list };
}
export const { verify, settle, supported, list } = useFacilitator();
//# sourceMappingURL=useFacilitator.js.map