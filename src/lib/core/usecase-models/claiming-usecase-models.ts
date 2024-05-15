import { z } from "zod";
import { ExecutedTransactionSchema, NetworkSchema, WalletSchema } from "../entity/models";

export const ClaimingRequestSchema = z.object({
    network: NetworkSchema,
    wallet: WalletSchema,
    amount: z.number()
})

export type TClaimingRequest = z.infer<typeof ClaimingRequestSchema>

export const ClaimingSuccessResponseSchema = z.object({
    status: z.literal("success"),
    network: NetworkSchema,
    wallet: WalletSchema,
    amount: z.number(),
    message: z.string(),
    transaction: ExecutedTransactionSchema 
})

export type TClaimingSuccessResponse = z.infer<typeof ClaimingSuccessResponseSchema>

export const ClaimingErrorResponseSchema = z.object({
    status: z.literal("error"),
    message: z.string(),
    details: z.object({
        network: NetworkSchema,
        wallet: WalletSchema,
        amount: z.number(),
    })
})

export type TClaimingErrorResponse = z.infer<typeof ClaimingErrorResponseSchema>

export const ClaimingProgressResponseSchema = z.object({
    amount: z.number(),
    network: NetworkSchema,
    wallet: WalletSchema,
    message: z.string(),
    transaction: ExecutedTransactionSchema.optional()
})

export type TClaimingProgressResponse = z.infer<typeof ClaimingProgressResponseSchema>
