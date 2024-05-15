import { z } from "zod";
import { ExecutedTransactionSchema, NetworkSchema, WalletSchema } from "../entity/models";

export const MintingSuccessViewModelSchema = z.object({
    status: z.enum(["success"]),
    amount: z.number(),
    message: z.string(),
    mintTransaction: ExecutedTransactionSchema,
    indexerBlockNumber: z.number(),
})
export const MintingNonSuccessViewModelSchema = z.object({
    status: z.enum(["error", "in-progress"]),
    message: z.string(),
    amount: z.number(),
    mintTransaction: ExecutedTransactionSchema.optional(),
    indexerBlockNumber: z.number(),
    initialIndexerBlockNumber: z.number(),
    estimatedGas: z.number().optional(),
})

export const MintingTransactionGasStatusSchema = z.object({
    status: z.enum(["estimated-gas"]),
    estimatedGas: z.number(),
    amount: z.number(),
    network: NetworkSchema,
    wallet: WalletSchema,
})

export const MintingViewModelSchema = z.discriminatedUnion("status", [
    MintingSuccessViewModelSchema,
    MintingNonSuccessViewModelSchema,
    MintingTransactionGasStatusSchema,
])

export type TMintingViewModel = z.infer<typeof MintingViewModelSchema>