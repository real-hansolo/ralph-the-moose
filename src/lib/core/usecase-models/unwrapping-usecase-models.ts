import { z } from "zod";
import { ExecutedTransactionSchema, NetworkSchema, WalletSchema } from "../entity/models";

export const UnwrappingRequestSchema = z.object({
    network: NetworkSchema,
    wallet: WalletSchema,
    amount: z.number()
})

export type TUnwrappingRequest = z.infer<typeof UnwrappingRequestSchema>

export const UnwrappingSuccessResponseSchema = z.object({
    status: z.literal("success"),
    transaction: ExecutedTransactionSchema,
    message: z.string(),
})

export type TUnwrappingSuccessResponse = z.infer<typeof UnwrappingSuccessResponseSchema>

export const UnwrappingErrorResponseSchema = z.object({
    status: z.literal("error"),
    message: z.string(),
    details: z.object({
        network: NetworkSchema,
        wallet: WalletSchema,
        amount: z.number(),
        transaction: ExecutedTransactionSchema.optional(),
        approvalError: z.boolean().default(false),
    })
})


export type TUnwrappingErrorResponse = z.infer<typeof UnwrappingErrorResponseSchema>

export const UnwrappingProgressResponseSchema = z.object({
    transaction: ExecutedTransactionSchema.optional(),
    amount: z.number(),
    network: NetworkSchema,
    wallet: WalletSchema,
    estimatedGas: z.number().optional(),
    message: z.string(),
})

export type TUnwrappingProgressResponse = z.infer<typeof UnwrappingProgressResponseSchema>

export const UnwrappingTransactionGasStatusSchema = z.object({
    status: z.literal("estimated-gas"),
    estimatedGas: z.number(),
    amount: z.number(),
})

export type TUnwrappingTransactionGasStatus = z.infer<typeof UnwrappingTransactionGasStatusSchema>