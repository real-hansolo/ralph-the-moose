import { z } from "zod";
import { ExecutedTransactionSchema, NetworkSchema, WalletSchema } from "../entity/models";

export const BridgingRequestSchema = z.object({
    network: NetworkSchema,
    wallet: WalletSchema,
    amount: z.number(),
    toNetwork: NetworkSchema
})

export type TBridgingRequest = z.infer<typeof BridgingRequestSchema>

export const BridgingSuccessResponseSchema = z.object({
    status: z.literal("success"),
    transaction: ExecutedTransactionSchema,
    network: NetworkSchema,
    wallet: WalletSchema,
    amount: z.number(),
    toNetwork: NetworkSchema,
    message: z.string()
})

export type TBridgingSuccessResponse = z.infer<typeof BridgingSuccessResponseSchema>

export const BridgingErrorResponseSchema = z.object({
    status: z.literal("error"),
    message: z.string(),
    details: z.object({
        network: NetworkSchema,
        wallet: WalletSchema,
        amount: z.number(),
        toNetwork: NetworkSchema,
        transaction: ExecutedTransactionSchema.optional()
    })
})

export type TBridgingErrorResponse = z.infer<typeof BridgingErrorResponseSchema>

export const BridgingProgressResponseSchema = z.object({
    transaction: ExecutedTransactionSchema.optional(),
    amount: z.number(),
    network: NetworkSchema,
    wallet: WalletSchema,
    toNetwork: NetworkSchema,
    estimateGas: z.number().optional(),
    message: z.string(),
})

export type TBridgingProgressResponse = z.infer<typeof BridgingProgressResponseSchema>