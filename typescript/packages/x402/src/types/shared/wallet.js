import * as evm from "./evm/wallet";
import * as svm from "../../shared/svm/wallet";
import { SupportedEVMNetworks, SupportedSVMNetworks } from "./network";
/**
 * Creates a public client configured for the specified network.
 *
 * @param network - The network to connect to.
 * @returns A public client instance connected to the specified chain.
 */
export function createConnectedClient(network) {
    if (SupportedEVMNetworks.find(n => n === network)) {
        return evm.createConnectedClient(network);
    }
    if (SupportedSVMNetworks.find(n => n === network)) {
        return svm.createSvmConnectedClient(network);
    }
    throw new Error(`Unsupported network: ${network}`);
}
/**
 * Creates a wallet client configured for the specified chain with a private key.
 *
 * @param network - The network to connect to.
 * @param privateKey - The private key to use for signing transactions. This should be a hex string for EVM or a base58 encoded string for SVM.
 * @returns A wallet client instance connected to the specified chain with the provided private key.
 */
export function createSigner(network, privateKey) {
    // evm
    if (SupportedEVMNetworks.find(n => n === network)) {
        return Promise.resolve(evm.createSigner(network, privateKey));
    }
    // svm
    if (SupportedSVMNetworks.find(n => n === network)) {
        return svm.createSignerFromBase58(privateKey);
    }
    throw new Error(`Unsupported network: ${network}`);
}
/**
 * Checks if the given wallet is an EVM signer wallet.
 *
 * @param wallet - The object wallet to check.
 * @returns True if the wallet is an EVM signer wallet, false otherwise.
 */
export function isEvmSignerWallet(wallet) {
    return evm.isSignerWallet(wallet) || evm.isAccount(wallet);
}
/**
 * Checks if the given wallet is an SVM signer wallet
 *
 * @param wallet - The object wallet to check
 * @returns True if the wallet is an SVM signer wallet, false otherwise
 */
export function isSvmSignerWallet(wallet) {
    return svm.isSignerWallet(wallet);
}
/**
 * Checks if the given wallet is a multi network signer wallet
 *
 * @param wallet - The object wallet to check
 * @returns True if the wallet is a multi network signer wallet, false otherwise
 */
export function isMultiNetworkSigner(wallet) {
    return "evm" in wallet && "svm" in wallet;
}
//# sourceMappingURL=wallet.js.map