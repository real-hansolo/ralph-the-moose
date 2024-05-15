import { z } from "zod";
import { ExecutedTransactionSchema } from "../entity/models";


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
    s_gas_status: z.any().optional(),
})

export const WrappingViewModelSchema = z.discriminatedUnion("status", [
    WrappingSuccessViewModelSchema,
    WrappingNonSuccessViewModelSchema
])

export type TWrappingViewModel = z.infer<typeof WrappingViewModelSchema>