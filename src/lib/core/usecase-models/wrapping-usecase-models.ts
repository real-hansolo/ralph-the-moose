/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { ExecutedTransactionSchema, NetworkSchema, WalletSchema } from "../entity/models";

export const WrappingRequestSchema = z.object({
  network: NetworkSchema,
  wallet: WalletSchema,
  amount: z.number(),
});

export type TWrappingRequest = z.infer<typeof WrappingRequestSchema>;

export const WrappingSuccessResponseSchema = z.object({
  status: z.literal("success"),
  transaction: ExecutedTransactionSchema,
  network: NetworkSchema,
  wallet: WalletSchema,
  amount: z.number(),
});

export type TWrappingSuccessResponse = z.infer<typeof WrappingSuccessResponseSchema>;

export const WrappingErrorResponseSchema = z.object({
  status: z.literal("error"),
  message: z.string(),
  details: z.object({
    network: NetworkSchema,
    wallet: WalletSchema,
    amount: z.number(),
    transaction: ExecutedTransactionSchema.optional(),
  }),
});

export type TWrappingErrorResponse = z.infer<typeof WrappingErrorResponseSchema>;

export const WrappingAwaitingTransactionResponseSchema = z.object({
  type: z.literal("awaiting-transaction"),
  amount: z.number(),
  network: NetworkSchema,
  wallet: WalletSchema,
});

export type TWrappingAwaitingTransactionResponse = z.infer<typeof WrappingAwaitingTransactionResponseSchema>;

export const WrappingEstimatedGasResponseSchema = z.object({
  type: z.literal("estimated-gas"),
  amount: z.number(),
  network: NetworkSchema,
  wallet: WalletSchema,
  estimatedGas: z.number(),
});

export type TWrappingEstimatedGasResponse = z.infer<typeof WrappingEstimatedGasResponseSchema>;

export const WrappingVerificationResponseSchema = z.object({
  type: z.literal("verifying"),
  amount: z.number(),
  network: NetworkSchema,
  wallet: WalletSchema,
  transaction: ExecutedTransactionSchema,
  attempt: z.number(),
});

export type TWrappingVerificationResponse = z.infer<typeof WrappingVerificationResponseSchema>;

export const WrappingProgressResponseSchema = z.discriminatedUnion("type", [
  WrappingAwaitingTransactionResponseSchema,
  WrappingVerificationResponseSchema,
  WrappingEstimatedGasResponseSchema,
]);

export type TWrappingProgressResponse = z.infer<typeof WrappingProgressResponseSchema>;
