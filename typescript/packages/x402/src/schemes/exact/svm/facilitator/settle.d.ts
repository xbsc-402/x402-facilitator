import { SettleResponse, PaymentPayload, PaymentRequirements, ErrorReasons } from "../../../../types/verify";
import { X402Config } from "../../../../types/config";
import { KeyPairSigner, SendTransactionApi, signTransaction, SolanaRpcApiDevnet, SolanaRpcApiMainnet, RpcDevnet, RpcMainnet } from "@solana/kit";
import { getRpcSubscriptions } from "../../../../shared/svm/rpc";
/**
 * Settle the payment payload against the payment requirements.
 * TODO: handle durable nonce lifetime transactions
 *
 * @param signer - The signer that will sign the transaction
 * @param payload - The payment payload to settle
 * @param paymentRequirements - The payment requirements to settle against
 * @param config - Optional configuration for X402 operations (e.g., custom RPC URLs)
 * @returns A SettleResponse indicating if the payment is settled and any error reason
 */
export declare function settle(signer: KeyPairSigner, payload: PaymentPayload, paymentRequirements: PaymentRequirements, config?: X402Config): Promise<SettleResponse>;
/**
 * Send a signed transaction to the RPC.
 * TODO: should this be moved to the shared/svm/rpc.ts file?
 *
 * @param signedTransaction - The signed transaction to send
 * @param rpc - The RPC client to use to send the transaction
 * @param sendTxConfig - The configuration for the transaction send
 * @returns The signature of the sent transaction
 */
export declare function sendSignedTransaction(signedTransaction: Awaited<ReturnType<typeof signTransaction>>, rpc: RpcDevnet<SolanaRpcApiDevnet> | RpcMainnet<SolanaRpcApiMainnet>, sendTxConfig?: Parameters<SendTransactionApi["sendTransaction"]>[1]): Promise<string>;
/**
 * Confirm a signed transaction.
 * TODO: can some of this be refactored to be moved to the shared/svm/rpc.ts file?
 * TODO: should the commitment and the timeout be passed in as parameters?
 *
 * @param signedTransaction - The signed transaction to confirm
 * @param rpc - The RPC client to use to confirm the transaction
 * @param rpcSubscriptions - The RPC subscriptions to use to confirm the transaction
 * @returns The success and signature of the confirmed transaction
 */
export declare function confirmSignedTransaction(signedTransaction: Awaited<ReturnType<typeof signTransaction>>, rpc: RpcDevnet<SolanaRpcApiDevnet> | RpcMainnet<SolanaRpcApiMainnet>, rpcSubscriptions: ReturnType<typeof getRpcSubscriptions>): Promise<{
    success: boolean;
    errorReason?: (typeof ErrorReasons)[number];
    signature: string;
}>;
/**
 * Send and confirm a signed transaction.
 *
 * @param signedTransaction - The signed transaction to send and confirm
 * @param rpc - The RPC client to use to send and confirm the transaction
 * @param rpcSubscriptions - The RPC subscriptions to use to send and confirm the transaction
 * @returns The success and signature of the confirmed transaction
 */
export declare function sendAndConfirmSignedTransaction(signedTransaction: Awaited<ReturnType<typeof signTransaction>>, rpc: RpcDevnet<SolanaRpcApiDevnet> | RpcMainnet<SolanaRpcApiMainnet>, rpcSubscriptions: ReturnType<typeof getRpcSubscriptions>): Promise<{
    success: boolean;
    errorReason?: (typeof ErrorReasons)[number];
    signature: string;
}>;
//# sourceMappingURL=settle.d.ts.map