import { Account, Chain, Transport } from "viem";
import { ConnectedClient, SignerWallet } from "../../../types/shared/evm";
import { PaymentPayload, PaymentRequirements, SettleResponse, VerifyResponse } from "../../../types/verify";
/**
 * Verifies a payment payload against the required payment details
 *
 * This function performs several verification steps:
 * - Verifies protocol version compatibility
 * - Validates the permit signature
 * - Confirms USDC contract address is correct for the chain
 * - Checks permit deadline is sufficiently in the future
 * - Verifies client has sufficient USDC balance
 * - Ensures payment amount meets required minimum
 *
 * @param client - The public client used for blockchain interactions
 * @param payload - The signed payment payload containing transfer parameters and signature
 * @param paymentRequirements - The payment requirements that the payload must satisfy
 * @returns A ValidPaymentRequest indicating if the payment is valid and any invalidation reason
 */
export declare function verify<transport extends Transport, chain extends Chain, account extends Account | undefined>(client: ConnectedClient<transport, chain, account>, payload: PaymentPayload, paymentRequirements: PaymentRequirements): Promise<VerifyResponse>;
/**
 * Settles a payment by executing a USDC transferWithAuthorization transaction
 *
 * This function executes the actual USDC transfer using the signed authorization from the user.
 * The facilitator wallet submits the transaction but does not need to hold or transfer any tokens itself.
 *
 * @param wallet - The facilitator wallet that will submit the transaction
 * @param paymentPayload - The signed payment payload containing the transfer parameters and signature
 * @param paymentRequirements - The original payment details that were used to create the payload
 * @returns A PaymentExecutionResponse containing the transaction status and hash
 */
export declare function settle<transport extends Transport, chain extends Chain>(wallet: SignerWallet<chain, transport>, paymentPayload: PaymentPayload, paymentRequirements: PaymentRequirements): Promise<SettleResponse>;
//# sourceMappingURL=facilitator.d.ts.map