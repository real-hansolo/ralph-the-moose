import { z } from "zod";
import { ExecutedTransactionSchema, NetworkSchema, WalletSchema } from "../entity/models";

export const MintingRequestSchema = z.object({
    network: NetworkSchema,
    wallet: WalletSchema,
    amount: z.number()
})

export type TMintingRequest = z.infer<typeof MintingRequestSchema>

export const MintingSuccessResponseSchema = z.object({
    status: z.literal("success"),
    transaction: ExecutedTransactionSchema,
    network: NetworkSchema,
    wallet: WalletSchema,
    amount: z.number()
})

export type TMintingSuccessResponse = z.infer<typeof MintingSuccessResponseSchema>

export const MintingErrorResponseSchema = z.object({
    status: z.literal("error"),
    message: z.string(),
    details: z.object({
        network: NetworkSchema,
        wallet: WalletSchema,
        amount: z.number(),
        transaction: ExecutedTransactionSchema.optional(),
        indexerBlockNumber: z.number()
    })
})
export type TMintingErrorResponse = z.infer<typeof MintingErrorResponseSchema>

export const MintingProgressResponseSchema = z.object({
    transaction: ExecutedTransactionSchema.optional(),
    amount: z.number(),
    network: NetworkSchema,
    wallet: WalletSchema,
    indexerBlockNumber: z.number(),
    intialIndexerBlockNumber: z.number(),
    estimateGas: z.number().optional(),
    message: z.string()
})

export type TMintingProgressResponse = z.infer<typeof MintingProgressResponseSchema>