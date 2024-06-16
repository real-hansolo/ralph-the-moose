import { z } from "zod";
import { WalletSchema, NetworkSchema, ExecutedTransactionSchema } from "../entity/models";
import { BaseViewModelRequestSchema } from "~/sdk/view-model";

export const BridgingRequestViewModelSchema = BaseViewModelRequestSchema.extend({
  amount: z.number(),
  fromNetwork: NetworkSchema,
  toNetwork: NetworkSchema,
});

export const BridgingSuccessViewModelSchema = z.object({
  status: z.enum(["success"]),
  transaction: ExecutedTransactionSchema,
  amount: z.number(),
  wallet: WalletSchema,
  fromNetwork: NetworkSchema,
  toNetwork: NetworkSchema,
  message: z.string(),
});
export const BridgingProgressViewModelSchema = z.object({
  status: z.literal("in-progress"),
  type: z.enum(["awaiting-verification", "awaiting-approval", "sending-transaction", "update"]),
  transaction: ExecutedTransactionSchema.optional(),
  amount: z.number(),
  message: z.string(),
  wallet: WalletSchema,
  fromNetwork: NetworkSchema,
  toNetwork: NetworkSchema,
});

export const BridgingEstimateGasViewModelSchema = z.object({
  status: z.literal("in-progress"),
  type: z.literal("estimated-gas"),
  amount: z.number(),
  estimatedGas: z.number(),
  gasLimit: z.number(),
});

export const BridgingErrorViewModelSchema = z.object({
  status: z.enum(["error"]),
  type: z.enum(["balance-error", "approval-error", "transaction-error", "verification-error"]),
  amount: z.number(),
  wallet: WalletSchema,
  fromNetwork: NetworkSchema,
  toNetwork: NetworkSchema,
  message: z.string(),
  transaction: ExecutedTransactionSchema.optional(),
  estimateGas: z.number().optional(),
});

export const BridgingErrorGenericViewModelSchema = z.object({
  status: z.enum(["error"]),
  type: z.enum(["generic-error"]),
  message: z.string(),
  amount: z.number(),
  fromNetwork: NetworkSchema,
  toNetwork: NetworkSchema,
});


export const BridgingViewModelSchema = z.discriminatedUnion("status", [
  BridgingRequestViewModelSchema,
  BridgingSuccessViewModelSchema,
  BridgingErrorViewModelSchema,
  BridgingErrorGenericViewModelSchema,
  BridgingProgressViewModelSchema,
  BridgingEstimateGasViewModelSchema,
]);

export type TBridgingViewModel = z.infer<typeof BridgingViewModelSchema>;
