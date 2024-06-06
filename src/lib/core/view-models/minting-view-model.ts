import { z } from "zod";
import { ExecutedTransactionSchema, NetworkSchema, WalletSchema } from "../entity/models";
import { BaseViewModelRequestSchema } from "~/sdk/view-model";

export const MintingRequestViewModelSchema = BaseViewModelRequestSchema.merge(
  z.object({
    status: z.enum(["request"]),
    amount: z.number(),
  }),
);

export const MintingSuccessViewModelSchema = z.object({
  status: z.enum(["success"]),
  amount: z.number(),
  message: z.string(),
  mintTransaction: ExecutedTransactionSchema,
  indexerBlockNumber: z.number(),
});

export const MintingErrorViewModelSchema = z.object({
  status: z.enum(["error"]),
  type: z.enum(["indexer-error", "transaction-error", "verification-error", "unknown-error"]),
  message: z.string(),
  network: NetworkSchema,
  wallet: WalletSchema,
  amount: z.number(),
  transaction: ExecutedTransactionSchema.optional(),
  indexerBlockNumber: z.number(),
  initialIndexerBlockNumber: z.number(),
});


export const MintingProgressViewModelSchema = z.object({
  status: z.enum(["in-progress"]),
  type: z.enum(["awaiting-transaction", "awaiting-indexer", "awaiting-verification"]),
  transaction: ExecutedTransactionSchema.optional(),
  amount: z.number(),
  network: NetworkSchema,
  wallet: WalletSchema,
  indexerBlockNumber: z.number(),
  initialIndexerBlockNumber: z.number(),
  message: z.string(),
});

export const MintingTransactionGasStatusSchema = z.object({
  status: z.enum(["estimated-gas"]),
  estimatedGas: z.number(),
  gasLimit: z.number(),
  amount: z.number(),
  network: NetworkSchema,
  wallet: WalletSchema,
});

export const MintingViewModelSchema = z.discriminatedUnion("status", [
  MintingSuccessViewModelSchema,
  MintingErrorViewModelSchema,
  MintingProgressViewModelSchema,
  MintingTransactionGasStatusSchema,
  MintingRequestViewModelSchema,
]);

export type TMintingViewModel = z.infer<typeof MintingViewModelSchema>;
