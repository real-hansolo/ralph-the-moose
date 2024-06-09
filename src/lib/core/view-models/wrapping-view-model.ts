import { z } from "zod";
import { ExecutedTransactionSchema, NetworkSchema, WalletSchema } from "../entity/models";
import { BaseViewModelRequestSchema } from "~/sdk/view-model";

export const WrappingSuccessViewModelSchema = z.object({
  status: z.enum(["success"]),
  amount: z.number(),
  message: z.string(),
  wrapTransaction: ExecutedTransactionSchema,
});
export const WrappingAwaitingTransactionViewModelSchema = z.object({
  status: z.enum(["awaiting-transaction"]),
  amount: z.number(),
  network: NetworkSchema,
  wallet: WalletSchema,
});

export const WrappingErrorViewModelSchema = z.object({
  status: z.enum(["error"]),
  message: z.string(),
  amount: z.number(),
  wrapTransaction: ExecutedTransactionSchema.optional(),
  network: NetworkSchema.optional(),
  wallet: WalletSchema.optional(),
});

export const WrappingVerificationViewModelSchema = z.object({
  status: z.enum(["verifying"]),
  amount: z.number(),
  wrapTransaction: ExecutedTransactionSchema,
  network: NetworkSchema,
  wallet: WalletSchema,
  attempt: z.number(),
});

export const WrappingTransactionGasStatusSchema = z.object({
  status: z.enum(["estimating-gas"]),
  estimatedGas: z.number(),
  gasLimit: z.number(),
  amount: z.number(),
});

export const WrappingViewModelSchema = z.discriminatedUnion("status", [
  WrappingSuccessViewModelSchema,
  WrappingAwaitingTransactionViewModelSchema,
  WrappingErrorViewModelSchema,
  WrappingVerificationViewModelSchema,
  WrappingTransactionGasStatusSchema,
  BaseViewModelRequestSchema,
]);

export type TWrappingViewModel = z.infer<typeof WrappingViewModelSchema>;
