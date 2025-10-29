import * as evm from "./evm/wallet";
import * as svm from "../../shared/svm/wallet";
import { Hex } from "viem";
export type ConnectedClient = evm.ConnectedClient | svm.SvmConnectedClient;
export type Signer = evm.EvmSigner | svm.SvmSigner;
export type MultiNetworkSigner = {
    evm: evm.EvmSigner;
    svm: svm.SvmSigner;
};
/**
 * Creates a public client configured for the specified network.
 *
 * @param network - The network to connect to.
 * @returns A public client instance connected to the specified chain.
 */
export declare function createConnectedClient(network: string): ConnectedClient;
/**
 * Creates a wallet client configured for the specified chain with a private key.
 *
 * @param network - The network to connect to.
 * @param privateKey - The private key to use for signing transactions. This should be a hex string for EVM or a base58 encoded string for SVM.
 * @returns A wallet client instance connected to the specified chain with the provided private key.
 */
export declare function createSigner(network: string, privateKey: Hex | string): Promise<Signer>;
/**
 * Checks if the given wallet is an EVM signer wallet.
 *
 * @param wallet - The object wallet to check.
 * @returns True if the wallet is an EVM signer wallet, false otherwise.
 */
export declare function isEvmSignerWallet(wallet: Signer): wallet is evm.EvmSigner;
/**
 * Checks if the given wallet is an SVM signer wallet
 *
 * @param wallet - The object wallet to check
 * @returns True if the wallet is an SVM signer wallet, false otherwise
 */
export declare function isSvmSignerWallet(wallet: Signer): wallet is svm.SvmSigner;
/**
 * Checks if the given wallet is a multi network signer wallet
 *
 * @param wallet - The object wallet to check
 * @returns True if the wallet is a multi network signer wallet, false otherwise
 */
export declare function isMultiNetworkSigner(wallet: object): wallet is MultiNetworkSigner;
//# sourceMappingURL=wallet.d.ts.map