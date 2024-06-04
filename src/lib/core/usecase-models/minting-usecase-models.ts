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
        type: z.enum(["indexer-error", "transaction-error", "verification-error"]),
        wallet: WalletSchema,
        amount: z.number(),
        transaction: ExecutedTransactionSchema.optional(),
        indexerBlockNumber: z.number()
    })
})
export type TMintingErrorResponse = z.infer<typeof MintingErrorResponseSchema>

export const MintingProgressResponseSchema = z.object({
    transaction: ExecutedTransactionSchema.optional(),
    type: z.enum(["awaiting-transaction", "awaiting-indexer", "awaiting-verification"]),
    amount: z.number(),
    network: NetworkSchema,
    wallet: WalletSchema,
    indexerBlockNumber: z.number(),
    initialIndexerBlockNumber: z.number(),
    message: z.string()
})

export type TMintingProgressResponse = z.infer<typeof MintingProgressResponseSchema>

export const MintingGasEstimationResponseSchema = z.object({
    estimateGas: z.number(),
    gasLimit: z.number(),
    amount: z.number(),
    network: NetworkSchema,
    wallet: WalletSchema,
})

export type TMintingGasEstimationResponse = z.infer<typeof MintingGasEstimationResponseSchema>