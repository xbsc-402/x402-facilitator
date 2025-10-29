import { createPublicClient, createWalletClient, http, publicActions } from "viem";
import type {
  Chain,
  Transport,
  Client,
  Account,
  RpcSchema,
  PublicActions,
  WalletActions,
  PublicClient,
  LocalAccount,
} from "viem";
import {
  bsc,
  avalancheFuji,
  base,
  sei,
  seiTestnet,
  polygon,
  polygonAmoy,
  peaq,
  avalanche,
  iotexTestnet,
  iotex,
} from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { Hex } from "viem";

export const BSC_RPC_LIST = [
  'https://rpc.ankr.com/bsc',
  'https://bsc.drpc.org',
  'https://bsc-dataseed1.defibit.io',
  'https://bsc-dataseed2.defibit.io',
  'https://bsc-dataseed3.defibit.io',
  'https://bsc-dataseed4.defibit.io',
  'https://bsc-dataseed1.ninicoin.io',
  'https://bsc-dataseed2.ninicoin.io',
  'https://bsc-dataseed3.ninicoin.io',
  'https://bsc-dataseed4.ninicoin.io',
  'https://bsc.rpc.blxrbdn.com',
  'https://1rpc.io/bnb',
  'https://binance.nodereal.io',
  'https://bsc-mainnet.public.blastapi.io',
  'https://bsc.publicnode.com',
  'https://bsc.meowrpc.com',
  'https://bsc-pokt.nodies.app',
  'https://rpc-bsc.48.club',
'https://lb.drpc.live/bsc/AoblK20ilErNoa-Q4ia8Ehv3qC6ArHQR8LlCQrxF2MGT',
];
export function getRandomBscRpc() {
  return BSC_RPC_LIST[Math.floor(Math.random() * BSC_RPC_LIST.length)];
}

// Create a public client for reading data
export type SignerWallet<
  chain extends Chain = Chain,
  transport extends Transport = Transport,
  account extends Account = Account,
> = Client<
  transport,
  chain,
  account,
  RpcSchema,
  PublicActions<transport, chain, account> & WalletActions<chain, account>
>;

export type ConnectedClient<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain,
  account extends Account | undefined = undefined,
> = PublicClient<transport, chain, account>;

export type EvmSigner = SignerWallet<Chain, Transport, Account> | LocalAccount;

/**
 * Creates a public client configured for the specified network
 *
 * @param network - The network to connect to
 * @returns A public client instance connected to the specified chain
 */
export function createConnectedClient(
  network: string,
): ConnectedClient<Transport, Chain, undefined> {
  const chain = getChainFromNetwork(network);

  // Configure RPC for BSC network
  let transport;
  if (network === 'bsc' || network === 'bsc-mainnet') {
    // Use Ankr RPC for BSC mainnet
    transport = http(getRandomBscRpc());
  } else {
    // Use default RPC for other networks
    transport = http();
  }

  return createPublicClient({
    chain,
    transport,
  }).extend(publicActions);
}

/**
 * Creates a public client configured for the Base Sepolia testnet
 *
 * @deprecated Use `createConnectedClient("bsc")` instead
 * @returns A public client instance connected to Base Sepolia
 */
export function createClientSepolia(): ConnectedClient<Transport, typeof bsc, undefined> {
  return createConnectedClient("bsc") as ConnectedClient<
    Transport,
    typeof bsc,
    undefined
  >;
}

/**
 * Creates a public client configured for the Avalanche Fuji testnet
 *
 * @deprecated Use `createConnectedClient("avalanche-fuji")` instead
 * @returns A public client instance connected to Avalanche Fuji
 */
export function createClientAvalancheFuji(): ConnectedClient<
  Transport,
  typeof avalancheFuji,
  undefined
> {
  return createConnectedClient("avalanche-fuji") as ConnectedClient<
    Transport,
    typeof avalancheFuji,
    undefined
  >;
}

/**
 * Creates a wallet client configured for the specified chain with a private key
 *
 * @param network - The network to connect to
 * @param privateKey - The private key to use for signing transactions
 * @returns A wallet client instance connected to the specified chain with the provided private key
 */
export function createSigner(network: string, privateKey: Hex): SignerWallet<Chain> {
  const chain = getChainFromNetwork(network);

  // Configure RPC for BSC network
  let transport;
  if (network === 'bsc' || network === 'bsc-mainnet') {
    // Use Ankr RPC for BSC mainnet
    transport = http(getRandomBscRpc());
  } else {
    // Use default RPC for other networks
    transport = http();
  }

  return createWalletClient({
    chain,
    transport,
    account: privateKeyToAccount(privateKey),
  }).extend(publicActions);
}

/**
 * Creates a wallet client configured for the Base Sepolia testnet with a private key
 *
 * @deprecated Use `createSigner("bsc", privateKey)` instead
 * @param privateKey - The private key to use for signing transactions
 * @returns A wallet client instance connected to Base Sepolia with the provided private key
 */
export function createSignerSepolia(privateKey: Hex): SignerWallet<typeof bsc> {
  return createSigner("bsc", privateKey) as SignerWallet<typeof bsc>;
}

/**
 * Creates a wallet client configured for the Avalanche Fuji testnet with a private key
 *
 * @deprecated Use `createSigner("avalanche-fuji", privateKey)` instead
 * @param privateKey - The private key to use for signing transactions
 * @returns A wallet client instance connected to Avalanche Fuji with the provided private key
 */
export function createSignerAvalancheFuji(privateKey: Hex): SignerWallet<typeof avalancheFuji> {
  return createSigner("avalanche-fuji", privateKey) as SignerWallet<typeof avalancheFuji>;
}

/**
 * Checks if a wallet is a signer wallet
 *
 * @param wallet - The wallet to check
 * @returns True if the wallet is a signer wallet, false otherwise
 */
export function isSignerWallet<
  TChain extends Chain = Chain,
  TTransport extends Transport = Transport,
  TAccount extends Account = Account,
>(
  wallet: SignerWallet<TChain, TTransport, TAccount> | LocalAccount,
): wallet is SignerWallet<TChain, TTransport, TAccount> {
  return (
    typeof wallet === "object" && wallet !== null && "chain" in wallet && "transport" in wallet
  );
}

/**
 * Checks if a wallet is an account
 *
 * @param wallet - The wallet to check
 * @returns True if the wallet is an account, false otherwise
 */
export function isAccount<
  TChain extends Chain = Chain,
  TTransport extends Transport = Transport,
  TAccount extends Account = Account,
>(wallet: SignerWallet<TChain, TTransport, TAccount> | LocalAccount): wallet is LocalAccount {
  const w = wallet as LocalAccount;
  return (
    typeof wallet === "object" &&
    wallet !== null &&
    typeof w.address === "string" &&
    typeof w.type === "string" &&
    // Check for essential signing capabilities
    typeof w.sign === "function" &&
    typeof w.signMessage === "function" &&
    typeof w.signTypedData === "function" &&
    // Check for transaction signing (required by LocalAccount)
    typeof w.signTransaction === "function"
  );
}

/**
 * Maps network strings to Chain objects
 *
 * @param network - The network string to convert to a Chain object
 * @returns The corresponding Chain object
 */
export function getChainFromNetwork(network: string | undefined): Chain {
  if (!network) {
    throw new Error("NETWORK environment variable is not set");
  }

  switch (network) {
    case "base":
      return base;
    case "bsc":
      return bsc;
    case "avalanche":
      return avalanche;
    case "avalanche-fuji":
      return avalancheFuji;
    case "sei":
      return sei;
    case "sei-testnet":
      return seiTestnet;
    case "polygon":
      return polygon;
    case "polygon-amoy":
      return polygonAmoy;
    case "peaq":
      return peaq;
    case "iotex":
      return iotex;
    case "iotex-testnet":
      return iotexTestnet;
    default:
      throw new Error(`Unsupported network: ${network}`);
  }
}
