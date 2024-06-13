import { z } from "zod";
import { ExecutedTransactionSchema, NetworkSchema } from "../entity/models";
import { BaseViewModelRequestSchema } from "~/sdk/view-model";

export const UnwrappingRequestSchema = BaseViewModelRequestSchema.merge(
  z.object({
    amount: z.number(),
    type: z.literal("request"),
  }),
);

export const UnwrappingSuccessViewModelSchema = z.object({
  status: z.literal("success"),
  amount: z.number(),
  message: z.string(),
  unwrapTransaction: ExecutedTransactionSchema,
});

export const UnwrappingNonSuccessViewModelSchema = z.object({
  status: z.enum(["error", "in-progress"]),
  message: z.string(),
  amount: z.number(),
  unwrapTransaction: ExecutedTransactionSchema.optional(),
  type: z.enum(["approval-error", "verification-error", "progress", "unknown"]).optional().default("unknown"),
});

export const UnwrappingTransactionGasStatusSchema = z.object({
  status: z.literal("estimated-gas"),
  network: NetworkSchema,
  estimatedGas: z.number(),
  gasLimit: z.number(),
  amount: z.number(),
});

export const UnwrappingViewModelSchema = z.discriminatedUnion("status", [
  UnwrappingSuccessViewModelSchema,
  UnwrappingNonSuccessViewModelSchema,
  UnwrappingTransactionGasStatusSchema,
  UnwrappingRequestSchema,
]);

export type TUnwrappingViewModel = z.infer<typeof UnwrappingViewModelSchema>;
