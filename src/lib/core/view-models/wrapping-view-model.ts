import { z } from "zod";
import { ExecutedTransactionSchema, NetworkSchema, WalletSchema } from "../entity/models";


export const WrappingSuccessViewModelSchema = z.object({
    status: z.enum(["success"]),
    amount: z.number(),
    message: z.string(),
    wrapTransaction: ExecutedTransactionSchema,
})

export const WrappingNonSuccessViewModelSchema = z.object({
    status: z.enum(["error", "in-progress"]),
    message: z.string(),
    amount: z.number(),
    wrapTransaction: ExecutedTransactionSchema.optional(),
    wrapFound: z.boolean(),
})

export const WrappingTransactionGasStatusSchema = z.object({
    status: z.enum(["estimated-gas"]),
    estimatedGas: z.number(),
    amount: z.number(),
    network: NetworkSchema,
    wallet: WalletSchema,
})

export const WrappingViewModelSchema = z.discriminatedUnion("status", [
    WrappingSuccessViewModelSchema,
    WrappingNonSuccessViewModelSchema,
    WrappingNonSuccessViewModelSchema,
    WrappingTransactionGasStatusSchema,
])

export type TWrappingViewModel = z.infer<typeof WrappingViewModelSchema>