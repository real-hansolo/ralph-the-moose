import { z } from "zod";

export const NetworkSchema = z.object({
  chainId: z.number(),
  name: z.string(),
  icon: z.any().optional(),
  explorer: z.object({
    url: z.string().url(),
    name: z.string(),
  }),
  rpcProvider: z.enum(["infura", "alchemy"]).or(z.string().url()),
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
  indexer: z.object({
    url: z.string().url(),
    secure: z.boolean(),
  })
});

export type TNetwork = z.infer<typeof NetworkSchema>;

export const WalletSchema = z.object({
  name: z.string(),
  id: z.string(),
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

export const ExecutedTransactionSchema = PreparedTransactionSchema.merge(
  z.object({
    status: z.enum(["success", "error", "partial"]),
    hash: z.string(),
    blockNumber: z.number(),
    timestamp: z.string(),
    explorerUrl: z.string().url(),
    from: z.string(),
  }),
);

export type TExecutedTransaction = z.infer<typeof ExecutedTransactionSchema>;

export const PreparedContractCallSchema = z.object({
  contract: ContractSchema,
  method: z.object({
    inputs: z.array(
      z.object({
        name: z.string(),
        type: z.string(),
        internalType: z.string().optional(),
      }),
    ),
    name: z.string(),
    outputs: z.array(
      z.object({
        name: z.string(),
        type: z.string(),
        internalType: z.string().optional(),
      }),
    ),
    stateMutability: z.any(),
    type: z.any(),
  }),
  params: z.array(z.string().or(z.bigint()).or(z.boolean())),
  value: z.string(),
  data: z.string().optional(),
});

export type TPreparedContractCall = z.infer<typeof PreparedContractCallSchema>;