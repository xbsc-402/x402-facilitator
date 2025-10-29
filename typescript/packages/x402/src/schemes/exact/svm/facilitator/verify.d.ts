import { VerifyResponse, PaymentPayload, PaymentRequirements, ExactSvmPayload } from "../../../../types/verify";
import { X402Config } from "../../../../types/config";
import { CompilableTransactionMessage, KeyPairSigner, SolanaRpcApiDevnet, SolanaRpcApiMainnet, RpcDevnet, RpcMainnet, Instruction, AccountLookupMeta, AccountMeta } from "@solana/kit";
import { parseTransferCheckedInstruction as parseTransferCheckedInstruction2022 } from "@solana-program/token-2022";
/**
 * Verify the payment payload against the payment requirements.
 *
 * @param signer - The signer that will sign and simulate the transaction
 * @param payload - The payment payload to verify
 * @param paymentRequirements - The payment requirements to verify against
 * @param config - Optional configuration for X402 operations (e.g., custom RPC URLs)
 * @returns A VerifyResponse indicating if the payment is valid and any invalidation reason
 */
export declare function verify(signer: KeyPairSigner, payload: PaymentPayload, paymentRequirements: PaymentRequirements, config?: X402Config): Promise<VerifyResponse>;
/**
 * Verify that the scheme and network are supported.
 *
 * @param payload - The payment payload to verify
 * @param paymentRequirements - The payment requirements to verify against
 */
export declare function verifySchemesAndNetworks(payload: PaymentPayload, paymentRequirements: PaymentRequirements): void;
/**
 * Perform transaction introspection to validate the transaction structure and transfer details.
 * This function handles decoding the transaction, validating the transfer instruction,
 * and verifying all transfer details against the payment requirements.
 *
 * @param svmPayload - The SVM payload containing the transaction
 * @param paymentRequirements - The payment requirements to verify against
 * @param config - Optional configuration for X402 operations (e.g., custom RPC URLs)
 */
export declare function transactionIntrospection(svmPayload: ExactSvmPayload, paymentRequirements: PaymentRequirements, config?: X402Config): Promise<void>;
/**
 * Verify that the transaction contains the expected instructions.
 *
 * @param transactionMessage - The transaction message to verify
 * @param paymentRequirements - The payment requirements to verify against
 * @param rpc - The RPC client to use for verifying account existence
 * @throws Error if the transaction does not contain the expected instructions
 */
export declare function verifyTransactionInstructions(transactionMessage: CompilableTransactionMessage, paymentRequirements: PaymentRequirements, rpc: RpcDevnet<SolanaRpcApiDevnet> | RpcMainnet<SolanaRpcApiMainnet>): Promise<void>;
/**
 * Verify that the compute limit instruction is valid.
 *
 * @param instruction - The compute limit instruction to verify
 * @throws Error if the compute limit instruction is invalid
 */
export declare function verifyComputeLimitInstruction(instruction: Instruction<string, readonly (AccountLookupMeta<string, string> | AccountMeta<string>)[]>): void;
/**
 * Verify that the compute price instruction is valid.
 * This function throws an error if the compute unit price is greater than 5 lamports,
 * to protect the facilitator against gas fee abuse from the client.
 *
 * @param instruction - The compute price instruction to verify
 * @throws Error if the compute price instruction is invalid
 */
export declare function verifyComputePriceInstruction(instruction: Instruction<string, readonly (AccountLookupMeta<string, string> | AccountMeta<string>)[]>): void;
/**
 * Verify that the create ATA instruction is valid.
 *
 * @param instruction - The create ATA instruction to verify
 * @param paymentRequirements - The payment requirements to verify against
 * @throws Error if the create ATA instruction is invalid
 */
export declare function verifyCreateATAInstruction(instruction: Instruction<string, readonly (AccountLookupMeta<string, string> | AccountMeta<string>)[]>, paymentRequirements: PaymentRequirements): void;
/**
 * Verify that the transfer instruction is valid.
 *
 * @param instruction - The transfer instruction to verify
 * @param paymentRequirements - The payment requirements to verify against
 * @param {object} options - The options for the verification of the transfer instruction
 * @param {boolean} options.txHasCreateDestATAInstruction - Whether the transaction has a create destination ATA instruction
 * @param rpc - The RPC client to use for verifying account existence
 * @throws Error if the transfer instruction is invalid
 */
export declare function verifyTransferInstruction(instruction: Instruction<string, readonly (AccountLookupMeta<string, string> | AccountMeta<string>)[]>, paymentRequirements: PaymentRequirements, { txHasCreateDestATAInstruction }: {
    txHasCreateDestATAInstruction: boolean;
}, rpc: RpcDevnet<SolanaRpcApiDevnet> | RpcMainnet<SolanaRpcApiMainnet>): Promise<void>;
/**
 * Verify that the transfer checked instruction is valid.
 *
 * @param parsedInstruction - The parsed transfer checked instruction to verify
 * @param paymentRequirements - The payment requirements to verify against
 * @param {object} options - The options for the verification of the transfer checked instruction
 * @param {boolean} options.txHasCreateDestATAInstruction - Whether the transaction has a create destination ATA instruction
 * @param rpc - The RPC client to use for verifying account existence
 * @throws Error if the transfer checked instruction is invalid
 */
export declare function verifyTransferCheckedInstruction(parsedInstruction: ReturnType<typeof parseTransferCheckedInstruction2022>, paymentRequirements: PaymentRequirements, { txHasCreateDestATAInstruction }: {
    txHasCreateDestATAInstruction: boolean;
}, rpc: RpcDevnet<SolanaRpcApiDevnet> | RpcMainnet<SolanaRpcApiMainnet>): Promise<void>;
/**
 * Inspect the decompiled transaction message to make sure that it is a valid
 * transfer instruction.
 *
 * @param instruction - The instruction to get the transfer instruction from
 * @returns The validated transfer instruction
 * @throws Error if the instruction is not a valid transfer checked instruction
 */
export declare function getValidatedTransferCheckedInstruction(instruction: Instruction<string, readonly (AccountLookupMeta<string, string> | AccountMeta<string>)[]>): import("@solana-program/token").ParsedTransferCheckedInstruction<string, readonly (AccountLookupMeta<string, string> | AccountMeta<string>)[]>;
//# sourceMappingURL=verify.d.ts.map