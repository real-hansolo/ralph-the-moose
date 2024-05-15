import { z } from "zod";
import { ExecutedTransactionSchema, NetworkSchema, WalletSchema } from "../entity/models";

export const UnwrappingSuccessViewModelSchema = z.object({
    status: z.literal("success"),
    amount: z.number(),
    message: z.string(),
    unwrapTransaction: ExecutedTransactionSchema,
})

export const UnwrappingNonSuccessViewModelSchema = z.object({
    status: z.enum(["error", "in-progress"]),
    message: z.string(),
    amount: z.number(),
    unwrapTransaction: ExecutedTransactionSchema.optional(),
    type: z.enum(["approval-error", "verification-error", "progress", "unknown"]).optional().default("unknown"),
})

export const UnwrappingTransactionGasStatusSchema = z.object({
    status: z.literal("estimated-gas"),
    network: NetworkSchema,
    wallet: WalletSchema,
    estimatedGas: z.number(),
    amount: z.number(),
})

export const UnwrappingViewModelSchema = z.discriminatedUnion("status", [
    UnwrappingSuccessViewModelSchema,
    UnwrappingNonSuccessViewModelSchema,
    UnwrappingTransactionGasStatusSchema,
])

export type TUnwrappingViewModel = z.infer<typeof UnwrappingViewModelSchema>