import { env } from "~/env";
import { IconNetworkBase } from "@maany_shr/ralph-the-moose-ui-kit";
import { type Chain } from "thirdweb";
import { base as Base, baseSepolia as BaseSepolia } from "thirdweb/chains";
import { type TChainConfig as ChainConfig } from "@maany_shr/ralph-the-moose-ui-kit";

export type TChainConfig = ChainConfig & {
  thirdWeb: Chain;
};

export const BASE_MAINNET: TChainConfig = {
  chainId: Base.id,
  name: "Base",
  rpcUrl: "https://mainnet.base.org",
  jsonRpcProvider: env.NEXT_PUBLIC_CHAIN_BASE_MAINNET_JSON_RPC,
  explorerUrl: "https://base.basescan.org/",
  explorerName: "BaseScan",
  gasLimit: 200000,
  icon: <IconNetworkBase />,
  networkCurrency: "ETH",
  mintingFee: 0.00123,
  wrappingFee: 0.00123,
  unwrappingFee: 0.00123,
  ralphReservoirAddress: "0x27e964E016B68EeFbe958Ace62174af0e1CeD053",
  ralphTokenAddress: "0x05F1938646a897008e813fb03CE7C575eAE45738",
  thirdWeb: Base,
};

export const BASE_SEPOLIA_TESTNET: TChainConfig = {
  chainId: BaseSepolia.id,
  name: "Base Sepolia",
  rpcUrl: env.NEXT_PUBLIC_CHAIN_BASE_SEPOLIA_JSON_RPC,
  jsonRpcProvider: env.NEXT_PUBLIC_CHAIN_BASE_SEPOLIA_JSON_RPC,
  explorerUrl: "https://sepolia.basescan.org/",
  explorerName: "BaseScan",
  gasLimit: 200000,
  icon: <IconNetworkBase />,
  networkCurrency: "ETH",
  mintingFee: 0.00123,
  wrappingFee: 0.00123,
  unwrappingFee: 0.00123,
  ralphReservoirAddress: "0x296271298780966bC0550a6B10c8e5BE60fE282f",
  ralphTokenAddress: "0xA415b2Df73D9E1D0415de58f012E2cB3E059F2E1",
  thirdWeb: BaseSepolia,
};

export const getSupportedChains = () => {
  const supportedChains: TChainConfig[] = [BASE_MAINNET];
  if (env.NEXT_PUBLIC_ENABLE_TESTNETS) {
    supportedChains.push(BASE_SEPOLIA_TESTNET);
  }
  return supportedChains;
};

export const SUPPORTED_CHAINS: TChainConfig[] = getSupportedChains();

/**
 * Retrieves the default chain configuration based on the value of the `NEXT_PUBLIC_ENABLE_TESTNETS` environment variable.
 * If `NEXT_PUBLIC_ENABLE_TESTNETS` is truthy, returns the `Base` configuration. Otherwise, returns the `ZksyncSepoliaTestnet` configuration.
 *
 * @returns The default chain configuration.
 */
export const getDefaultChain = () => {
  if (env.NEXT_PUBLIC_ENABLE_TESTNETS) {
    return BASE_SEPOLIA_TESTNET;
  }
  return BASE_MAINNET;
};

export const DEFAULT_CHAIN: TChainConfig = getDefaultChain();
