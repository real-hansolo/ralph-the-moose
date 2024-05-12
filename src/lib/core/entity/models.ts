import { z } from "zod";

export const NetworkSchema = z.object({
  chainId: z.number(),
  name: z.string(),
  icon: z.any().optional(),
  explorer: z.object({
    url: z.string().url(),
    name: z.string(),
  }),
  rpc: z.string().url(),
  nativeCurrency: z.string(),
  gasLimit: z.number(),
  fee: z.object({
    minting: z.number(),
    wrapping: z.number(),
    unwrapping: z.number(),
  }),
  contracts: z.object({
    ralphReservoirAddress: z.string(),
    ralphTokenAddress: z.string(),
  }),
});

export type TNetwork = z.infer<typeof NetworkSchema>

export const WalletSchema = z.object({
    name: z.string(),
    provider: z.string(),
    activeAccount: z.string(),
    availableAccounts: z.array(z.string()),
    activeNetwork: NetworkSchema,
  });

export type TWallet = z.infer<typeof WalletSchema>;


export const KeyValueStore = z.object({
  activeNetwork: NetworkSchema,
  supportedNetworks: z.array(NetworkSchema),
  activeWallet: WalletSchema,
  connectedWallets: z.array(WalletSchema),
  supportedWallets: z.array(z.string()),
});