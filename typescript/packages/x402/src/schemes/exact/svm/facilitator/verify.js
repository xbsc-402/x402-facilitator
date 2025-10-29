import { ErrorReasons, } from "../../../../types/verify";
import { SupportedSVMNetworks } from "../../../../types/shared";
import { assertIsInstructionWithAccounts, assertIsInstructionWithData, decompileTransactionMessage, fetchEncodedAccounts, getCompiledTransactionMessageDecoder, } from "@solana/kit";
import { parseSetComputeUnitLimitInstruction, parseSetComputeUnitPriceInstruction, COMPUTE_BUDGET_PROGRAM_ADDRESS, } from "@solana-program/compute-budget";
import { findAssociatedTokenPda, identifyToken2022Instruction, parseCreateAssociatedTokenInstruction, parseTransferCheckedInstruction as parseTransferCheckedInstruction2022, Token2022Instruction, TOKEN_2022_PROGRAM_ADDRESS, } from "@solana-program/token-2022";
import { identifyTokenInstruction, parseTransferCheckedInstruction as parseTransferCheckedInstructionToken, TOKEN_PROGRAM_ADDRESS, TokenInstruction, } from "@solana-program/token";
import { decodeTransactionFromPayload, signAndSimulateTransaction, getTokenPayerFromTransaction, } from "../../../../shared/svm";
import { getRpcClient } from "../../../../shared/svm/rpc";
import { SCHEME } from "../../";
/**
 * Verify the payment payload against the payment requirements.
 *
 * @param signer - The signer that will sign and simulate the transaction
 * @param payload - The payment payload to verify
 * @param paymentRequirements - The payment requirements to verify against
 * @param config - Optional configuration for X402 operations (e.g., custom RPC URLs)
 * @returns A VerifyResponse indicating if the payment is valid and any invalidation reason
 */
export async function verify(signer, payload, paymentRequirements, config) {
    try {
        // verify that the scheme and network are supported
        verifySchemesAndNetworks(payload, paymentRequirements);
        // decode the base64 encoded transaction
        const svmPayload = payload.payload;
        const decodedTransaction = decodeTransactionFromPayload(svmPayload);
        const rpc = getRpcClient(paymentRequirements.network, config?.svmConfig?.rpcUrl);
        // perform transaction introspection to validate the transaction structure and details
        await transactionIntrospection(svmPayload, paymentRequirements, config);
        // simulate the transaction to ensure it will execute successfully
        const simulateResult = await signAndSimulateTransaction(signer, decodedTransaction, rpc);
        if (simulateResult.value?.err) {
            throw new Error(`invalid_exact_svm_payload_transaction_simulation_failed`);
        }
        return {
            isValid: true,
            invalidReason: undefined,
            payer: getTokenPayerFromTransaction(decodedTransaction),
        };
    }
    catch (error) {
        // if the error is one of the known error reasons, return the error reason
        if (error instanceof Error) {
            if (ErrorReasons.includes(error.message)) {
                return {
                    isValid: false,
                    invalidReason: error.message,
                    payer: (() => {
                        try {
                            const tx = decodeTransactionFromPayload(payload.payload);
                            return getTokenPayerFromTransaction(tx);
                        }
                        catch {
                            return undefined;
                        }
                    })(),
                };
            }
        }
        // if the error is not one of the known error reasons, return an unexpected error reason
        console.error(error);
        return {
            isValid: false,
            invalidReason: "unexpected_verify_error",
            payer: (() => {
                try {
                    const tx = decodeTransactionFromPayload(payload.payload);
                    return getTokenPayerFromTransaction(tx);
                }
                catch {
                    return undefined;
                }
            })(),
        };
    }
}
/**
 * Verify that the scheme and network are supported.
 *
 * @param payload - The payment payload to verify
 * @param paymentRequirements - The payment requirements to verify against
 */
export function verifySchemesAndNetworks(payload, paymentRequirements) {
    if (payload.scheme !== SCHEME || paymentRequirements.scheme !== SCHEME) {
        throw new Error("unsupported_scheme");
    }
    if (payload.network !== paymentRequirements.network ||
        !SupportedSVMNetworks.includes(paymentRequirements.network)) {
        throw new Error("invalid_network");
    }
}
/**
 * Perform transaction introspection to validate the transaction structure and transfer details.
 * This function handles decoding the transaction, validating the transfer instruction,
 * and verifying all transfer details against the payment requirements.
 *
 * @param svmPayload - The SVM payload containing the transaction
 * @param paymentRequirements - The payment requirements to verify against
 * @param config - Optional configuration for X402 operations (e.g., custom RPC URLs)
 */
export async function transactionIntrospection(svmPayload, paymentRequirements, config) {
    const rpc = getRpcClient(paymentRequirements.network, config?.svmConfig?.rpcUrl);
    const decodedTransaction = decodeTransactionFromPayload(svmPayload);
    const compiledTransactionMessage = getCompiledTransactionMessageDecoder().decode(decodedTransaction.messageBytes);
    const transactionMessage = decompileTransactionMessage(compiledTransactionMessage);
    await verifyTransactionInstructions(transactionMessage, paymentRequirements, rpc);
}
/**
 * Verify that the transaction contains the expected instructions.
 *
 * @param transactionMessage - The transaction message to verify
 * @param paymentRequirements - The payment requirements to verify against
 * @param rpc - The RPC client to use for verifying account existence
 * @throws Error if the transaction does not contain the expected instructions
 */
export async function verifyTransactionInstructions(transactionMessage, paymentRequirements, rpc) {
    // validate the number of expected instructions
    if (transactionMessage.instructions.length !== 3 &&
        transactionMessage.instructions.length !== 4) {
        throw new Error(`invalid_exact_svm_payload_transaction_instructions_length`);
    }
    // verify that the compute limit and price instructions are valid
    verifyComputeLimitInstruction(transactionMessage.instructions[0]);
    verifyComputePriceInstruction(transactionMessage.instructions[1]);
    // verify that the transfer instruction is valid
    // this expects the destination ATA to already exist
    if (transactionMessage.instructions.length === 3) {
        await verifyTransferInstruction(transactionMessage.instructions[2], paymentRequirements, {
            txHasCreateDestATAInstruction: false,
        }, rpc);
    }
    // verify that the transfer instruction is valid
    // this expects the destination ATA to be created in the same transaction
    else {
        verifyCreateATAInstruction(transactionMessage.instructions[2], paymentRequirements);
        await verifyTransferInstruction(transactionMessage.instructions[3], paymentRequirements, {
            txHasCreateDestATAInstruction: true,
        }, rpc);
    }
}
/**
 * Verify that the compute limit instruction is valid.
 *
 * @param instruction - The compute limit instruction to verify
 * @throws Error if the compute limit instruction is invalid
 */
export function verifyComputeLimitInstruction(instruction) {
    try {
        if (instruction.programAddress.toString() !== COMPUTE_BUDGET_PROGRAM_ADDRESS.toString() ||
            instruction.data?.[0] !== 2 // discriminator of set compute unit limit instruction
        ) {
            throw new Error(`invalid_exact_svm_payload_transaction_instructions_compute_limit_instruction`);
        }
        parseSetComputeUnitLimitInstruction(instruction);
    }
    catch (error) {
        console.error(error);
        throw new Error(`invalid_exact_svm_payload_transaction_instructions_compute_limit_instruction`);
    }
}
/**
 * Verify that the compute price instruction is valid.
 * This function throws an error if the compute unit price is greater than 5 lamports,
 * to protect the facilitator against gas fee abuse from the client.
 *
 * @param instruction - The compute price instruction to verify
 * @throws Error if the compute price instruction is invalid
 */
export function verifyComputePriceInstruction(instruction) {
    if (instruction.programAddress.toString() !== COMPUTE_BUDGET_PROGRAM_ADDRESS.toString() ||
        instruction.data?.[0] !== 3 // discriminator of set compute unit price instruction
    ) {
        throw new Error(`invalid_exact_svm_payload_transaction_instructions_compute_price_instruction`);
    }
    const parsedInstruction = parseSetComputeUnitPriceInstruction(instruction);
    // TODO: allow the facilitator to pass in an optional max compute unit price
    if (parsedInstruction.data.microLamports > 5 * 1_000_000) {
        throw new Error(`invalid_exact_svm_payload_transaction_instructions_compute_price_instruction_too_high`);
    }
}
/**
 * Verify that the create ATA instruction is valid.
 *
 * @param instruction - The create ATA instruction to verify
 * @param paymentRequirements - The payment requirements to verify against
 * @throws Error if the create ATA instruction is invalid
 */
export function verifyCreateATAInstruction(instruction, paymentRequirements) {
    let createATAInstruction;
    // validate and refine the type of the create ATA instruction
    try {
        assertIsInstructionWithAccounts(instruction);
        assertIsInstructionWithData(instruction);
        // parse the create ATA instruction
        createATAInstruction = parseCreateAssociatedTokenInstruction({
            ...instruction,
            data: new Uint8Array(instruction.data),
        });
    }
    catch (error) {
        console.error(error);
        throw new Error(`invalid_exact_svm_payload_transaction_create_ata_instruction`);
    }
    // verify that the ATA is created for the expected payee
    if (createATAInstruction.accounts.owner.address !== paymentRequirements.payTo) {
        throw new Error(`invalid_exact_svm_payload_transaction_create_ata_instruction_incorrect_payee`);
    }
    // verify that the ATA is created for the expected asset
    if (createATAInstruction.accounts.mint.address !== paymentRequirements.asset) {
        throw new Error(`invalid_exact_svm_payload_transaction_create_ata_instruction_incorrect_asset`);
    }
}
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
export async function verifyTransferInstruction(instruction, paymentRequirements, { txHasCreateDestATAInstruction }, rpc) {
    // get a validated and parsed transferChecked instruction
    const tokenInstruction = getValidatedTransferCheckedInstruction(instruction);
    await verifyTransferCheckedInstruction(tokenInstruction, paymentRequirements, {
        txHasCreateDestATAInstruction,
    }, rpc);
}
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
export async function verifyTransferCheckedInstruction(parsedInstruction, paymentRequirements, { txHasCreateDestATAInstruction }, rpc) {
    // get the token program address
    const tokenProgramAddress = parsedInstruction.programAddress.toString() === TOKEN_PROGRAM_ADDRESS.toString()
        ? TOKEN_PROGRAM_ADDRESS
        : TOKEN_2022_PROGRAM_ADDRESS;
    // get the expected receiver's ATA
    const payToATA = await findAssociatedTokenPda({
        mint: paymentRequirements.asset,
        owner: paymentRequirements.payTo,
        tokenProgram: tokenProgramAddress,
    });
    // verify that the transfer is to the expected ATA
    if (parsedInstruction.accounts.destination.address !== payToATA[0]) {
        throw new Error(`invalid_exact_svm_payload_transaction_transfer_to_incorrect_ata`);
    }
    // verify that the source and destination ATAs exist
    const addresses = [parsedInstruction.accounts.source.address, payToATA[0]];
    const maybeAccounts = await fetchEncodedAccounts(rpc, addresses);
    const missingAccounts = maybeAccounts.filter(a => !a.exists);
    for (const missingAccount of missingAccounts) {
        if (missingAccount.address === parsedInstruction.accounts.source.address) {
            throw new Error(`invalid_exact_svm_payload_transaction_sender_ata_not_found`);
        }
        if (missingAccount.address === payToATA[0] && !txHasCreateDestATAInstruction) {
            throw new Error(`invalid_exact_svm_payload_transaction_receiver_ata_not_found`);
        }
    }
    // verify that the amount is correct
    const instructionAmount = parsedInstruction.data.amount;
    const paymentRequirementsAmount = BigInt(paymentRequirements.maxAmountRequired);
    if (instructionAmount !== paymentRequirementsAmount) {
        throw new Error(`invalid_exact_svm_payload_transaction_amount_mismatch`);
    }
}
/**
 * Inspect the decompiled transaction message to make sure that it is a valid
 * transfer instruction.
 *
 * @param instruction - The instruction to get the transfer instruction from
 * @returns The validated transfer instruction
 * @throws Error if the instruction is not a valid transfer checked instruction
 */
export function getValidatedTransferCheckedInstruction(instruction) {
    try {
        assertIsInstructionWithData(instruction);
        assertIsInstructionWithAccounts(instruction);
    }
    catch (error) {
        console.error(error);
        throw new Error(`invalid_exact_svm_payload_transaction_instructions`);
    }
    let tokenInstruction;
    // spl-token program
    if (instruction.programAddress.toString() === TOKEN_PROGRAM_ADDRESS.toString()) {
        const identifiedInstruction = identifyTokenInstruction(instruction);
        if (identifiedInstruction !== TokenInstruction.TransferChecked) {
            throw new Error(`invalid_exact_svm_payload_transaction_instruction_not_spl_token_transfer_checked`);
        }
        tokenInstruction = parseTransferCheckedInstructionToken({
            ...instruction,
            data: new Uint8Array(instruction.data),
        });
    }
    // token-2022 program
    else if (instruction.programAddress.toString() === TOKEN_2022_PROGRAM_ADDRESS.toString()) {
        const identifiedInstruction = identifyToken2022Instruction(instruction);
        if (identifiedInstruction !== Token2022Instruction.TransferChecked) {
            throw new Error(`invalid_exact_svm_payload_transaction_instruction_not_token_2022_transfer_checked`);
        }
        tokenInstruction = parseTransferCheckedInstruction2022({
            ...instruction,
            data: new Uint8Array(instruction.data),
        });
    }
    // invalid instruction
    else {
        throw new Error(`invalid_exact_svm_payload_transaction_not_a_transfer_instruction`);
    }
    return tokenInstruction;
}
//# sourceMappingURL=verify.js.map