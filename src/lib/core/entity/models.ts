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

export type TNetwork = z.infer<typeof NetworkSchema>;

export const WalletSchema = z.object({
  name: z.string(),
  provider: z.string(),
  activeAccount: z.string(),
  availableAccounts: z.array(z.string()),
  activeNetwork: NetworkSchema,
});

export type TWallet = z.infer<typeof WalletSchema>;

export const ContractSchema = z.object({
  name: z.string(),
  address: z.string(),
  abi: z.any(),
  network: NetworkSchema,
});

export type TContract = z.infer<typeof ContractSchema>;

export const PreparedTransactionSchema = z.object({
  to: z.string(),
  value: z.string(),
  data: z.string().optional(),
  network: NetworkSchema,
});

export type TPreparedTransaction = z.infer<typeof PreparedTransactionSchema>;

export const ExecutedTransactionSchema = PreparedTransactionSchema.merge(z.object({
  status: z.string(),
  hash: z.string(),
  blockNumber: z.number(),
  timestamp: z.string(),
  explorerUrl: z.string().url(),
  from: z.string(),
}));

export type TExecutedTransaction = z.infer<typeof ExecutedTransactionSchema>;
