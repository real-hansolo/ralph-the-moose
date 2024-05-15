import { z } from "zod";
import { ExecutedTransactionSchema, NetworkSchema, WalletSchema } from "../entity/models";

export const WrappingRequestSchema = z.object({
    network: NetworkSchema,
    wallet: WalletSchema,
    amount: z.number()
})

export type TWrappingRequest = z.infer<typeof WrappingRequestSchema>

export const WrappingSuccessResponseSchema = z.object({
    status: z.literal("success"),
    transaction: ExecutedTransactionSchema,
    network: NetworkSchema,
    wallet: WalletSchema,
    amount: z.number()
})

export type TWrappingSuccessResponse = z.infer<typeof WrappingSuccessResponseSchema>

export const WrappingErrorResponseSchema = z.object({
    status: z.literal("error"),
    message: z.string(),
    details: z.object({
        network: NetworkSchema,
        wallet: WalletSchema,
        amount: z.number(),
        transaction: ExecutedTransactionSchema.optional(),
    })
})

export type TWrappingErrorResponse = z.infer<typeof WrappingErrorResponseSchema>

export const WrappingProgressResponseSchema = z.object({
    transaction: ExecutedTransactionSchema.optional(),
    amount: z.number(),
    network: NetworkSchema,
    wallet: WalletSchema,
    s_gas_status: z.any().optional()
})

export type TWrappingProgressResponse = z.infer<typeof WrappingProgressResponseSchema>