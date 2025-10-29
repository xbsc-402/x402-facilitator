import { ExactSvmPayload } from "../../types/verify/x402Specs";
import { KeyPairSigner, RpcDevnet, SolanaRpcApiDevnet, RpcMainnet, SolanaRpcApiMainnet, Transaction } from "@solana/kit";
/**
 * Given an object with a base64 encoded transaction, decode the
 * base64 encoded transaction into a solana transaction object.
 *
 * @param svmPayload - The SVM payload to decode
 * @returns The decoded transaction
 */
export declare function decodeTransactionFromPayload(svmPayload: ExactSvmPayload): Transaction;
/**
 * Extract the token sender (owner of the source token account)
 * from the TransferChecked instruction.
 *
 * @param transaction - The transaction to extract the token payer from
 * @returns The token payer address as a base58 string
 */
export declare function getTokenPayerFromTransaction(transaction: Transaction): string;
/**
 * Sign and simulate a transaction.
 *
 * @param signer - The signer that will sign the transaction
 * @param transaction - The transaction to sign and simulate
 * @param rpc - The RPC client to use to simulate the transaction
 * @returns The transaction simulation result
 */
export declare function signAndSimulateTransaction(signer: KeyPairSigner, transaction: Transaction, rpc: RpcDevnet<SolanaRpcApiDevnet> | RpcMainnet<SolanaRpcApiMainnet>): Promise<Readonly<{
    context: Readonly<{
        slot: import("@solana/kit").Slot;
    }>;
    value: Readonly<{
        readonly accounts: null;
    }> & Readonly<{
        err: import("@solana/kit").TransactionError | null;
        logs: string[] | null;
        returnData: Readonly<{
            data: import("@solana/kit").Base64EncodedDataResponse;
            programId: import("@solana/kit").Address;
        }> | null;
        unitsConsumed?: bigint;
    }>;
}>>;
//# sourceMappingURL=transaction.d.ts.map