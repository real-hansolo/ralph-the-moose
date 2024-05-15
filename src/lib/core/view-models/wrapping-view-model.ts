import { z } from "zod";
import { ExecutedTransactionSchema } from "../entity/models";


export const WrappingSuccessViewModelSchema = z.object({
    status: z.enum(["success"]),
    amount: z.number(),
    message: z.string(),
    wrapTransaction: ExecutedTransactionSchema,
})

export const WrappingProgressViewModelSchema = z.object({
    status: z.enum(["error", "in-progress"]),
    message: z.string(),
    amount: z.number(),
    wrapTransaction: ExecutedTransactionSchema,
    wrapFound: z.boolean(),
})

export const WrappingViewModelSchema = z.discriminatedUnion("status", [
    WrappingSuccessViewModelSchema,
    WrappingProgressViewModelSchema
])

export type TWrappingViewModel = z.infer<typeof WrappingViewModelSchema>