import { env } from "~/env";
import { Base, ZksyncSepoliaTestnet } from "@thirdweb-dev/chains";

/**
 * Retrieves the chain configuration base based on the value of the `NEXT_PUBLIC_USE_MAINNETS` environment variable.
 * If `NEXT_PUBLIC_USE_MAINNETS` is truthy, returns the `Base` configuration. Otherwise, returns the `ZksyncSepoliaTestnet` configuration.
 *
 * @returns The chain configuration for Base.
 */
const getChainConfigBase = () => {
  const useMainNets = env.NEXT_PUBLIC_USE_MAINNETS;
  if (useMainNets) {
    return Base;
  } else {
    return ZksyncSepoliaTestnet;
  }
};

/**
 * An array of supported chains.
 */
export const SUPPORTED_CHAINS = [
  getChainConfigBase(),
  // Add more chains here
];

/**
 * Retrieves the default chain configuration based on the value of the `NEXT_PUBLIC_USE_MAINNETS` environment variable.
 * If `NEXT_PUBLIC_USE_MAINNETS` is truthy, returns the `Base` configuration. Otherwise, returns the `ZksyncSepoliaTestnet` configuration.
 *
 * @returns The default chain configuration.
 */
export const getDefaultChain = () => {
  return getChainConfigBase();
};

export const DEFAULT_CHAIN = getDefaultChain();
