import { env } from "~/env";
import { Base, BaseSepoliaTestnet } from "@thirdweb-dev/chains";
import { IconNetworkBase } from "~/lib/components";

export type TChainConfig = {
  chainId: number;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  explorerName: string;
  gasLimit: number;
  icon: React.ReactNode;
  mintingFeeCurrency: string;
  mintingFee: number;
};

export const BASE_MAINNET: TChainConfig = {
  chainId: Base.chainId,
  name: "Base",
  rpcUrl: Base.rpc[1],
  explorerUrl: Base.explorers[0].url,
  explorerName: Base.explorers[0].name,
  gasLimit: 23000,
  icon: <IconNetworkBase />,
  mintingFeeCurrency: "ETH",
  mintingFee: 0.00123,
};


export const BASE_SEPOLIA_TESTNET: TChainConfig = {
  chainId: BaseSepoliaTestnet.chainId,
  name: "Base Sepolia Testnet",
  rpcUrl: "https://sepolia.base.org",
  explorerUrl: BaseSepoliaTestnet.explorers[0].url,
  explorerName: BaseSepoliaTestnet.explorers[0].name,
  gasLimit: 23000,
  icon: <IconNetworkBase />,
  mintingFeeCurrency: "ETH",
  mintingFee: 0.00123,
};

export const getSupportedChains = () => {
  const supportedChains: TChainConfig[] = [BASE_MAINNET];
  if(env.NEXT_PUBLIC_ENABLE_TESTNETS) {
    supportedChains.push(BASE_SEPOLIA_TESTNET);
  }
  return supportedChains;
}

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
