import { z } from "zod";
import { ExecutedTransactionSchema, NetworkSchema, WalletSchema } from "../entity/models";

export const ClaimingRequestSchema = z.object({
  network: NetworkSchema,
  wallet: WalletSchema,
  amount: z.number(),
});

export type TClaimingRequest = z.infer<typeof ClaimingRequestSchema>;

export const ClaimingSuccessResponseSchema = z.object({
  status: z.literal("success"),
  network: NetworkSchema,
  wallet: WalletSchema,
  amount: z.number(),
  message: z.string(),
  transaction: ExecutedTransactionSchema,
});

export type TClaimingSuccessResponse = z.infer<typeof ClaimingSuccessResponseSchema>;

export const ClaimingErrorResponseSchema = z.object({
  status: z.literal("error"),
  message: z.string(),
  details: z.object({
    network: NetworkSchema,
    wallet: WalletSchema,
    amount: z.number(),
  }),
});

export type TClaimingErrorResponse = z.infer<typeof ClaimingErrorResponseSchema>;

export const ClaimingProgressAwaitingTransactionResponseSchema = z.object({
  amount: z.number(),
  type: z.enum(["awaiting-transaction"]),
  network: NetworkSchema,
  wallet: WalletSchema,
  message: z.string(),
  transaction: ExecutedTransactionSchema.optional(),
});

export const ClaimingProgressVerifyingViewModelSchema = z.object({
  type: z.enum(["verifying"]),
  amount: z.number(),
  attempt: z.number(),
  transaction: ExecutedTransactionSchema,
});

export const ClaimingProgressUpdateSchema  = z.object({
    type: z.enum(["update"]),
    message: z.string(),
});

export type TClaimingProgressResponse =
  | z.infer<typeof ClaimingProgressAwaitingTransactionResponseSchema>
  | z.infer<typeof ClaimingProgressVerifyingViewModelSchema>
  | z.infer<typeof ClaimingProgressUpdateSchema>;
