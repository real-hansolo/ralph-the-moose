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
        type: z.enum(["approval-error", "transaction-error", "verification-error", "balance-error"]),
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
    type: z.enum(["awaiting-verification", "awaiting-approval", "sending-transaction", "update"]),
    amount: z.number(),
    network: NetworkSchema,
    wallet: WalletSchema,
    toNetwork: NetworkSchema,
    estimateGas: z.number().optional(),
    message: z.string(),
})
export type TBridgingProgressResponse = z.infer<typeof BridgingProgressResponseSchema>


export const BridgingEstimateGasResponseSchema = z.object({
    status: z.literal("in-progress"),
    type: z.literal("estimated-gas"),
    amount: z.number(),
    estimatedGas: z.number(),
    gasLimit: z.number()
})

export type TBridgingEstimateGasResponse = z.infer<typeof BridgingEstimateGasResponseSchema>