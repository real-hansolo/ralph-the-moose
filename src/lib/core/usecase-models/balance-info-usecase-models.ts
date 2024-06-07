import { z } from "zod";
import { NetworkSchema, WalletSchema } from "../entity/models";

export const BalanceInfoRequestSchema = z.object({
    network: NetworkSchema,
    wallet: WalletSchema
})

export type TBalanceInfoRequest = z.infer<typeof BalanceInfoRequestSchema>

export const BalanceInfoSuccessResponseSchema = z.object({
    status: z.literal("success"),
    balance: z.object({
        inscriptions: z.number(),
        wrapped: z.number(),
        claimable: z.number(),
    }),
    network: NetworkSchema,
    wallet: WalletSchema
})

export type TBalanceInfoSuccessResponse = z.infer<typeof BalanceInfoSuccessResponseSchema>

export const BalanceInfoErrorResponseSchema = z.object({
    status: z.literal("error"),
    message: z.string(),
    details: z.object({
        wallet: WalletSchema,
        network: NetworkSchema,
    })
})

export type TBalanceInfoErrorResponse = z.infer<typeof BalanceInfoErrorResponseSchema>