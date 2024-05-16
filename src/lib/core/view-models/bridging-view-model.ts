import { z } from "zod";
import { WalletSchema, NetworkSchema, ExecutedTransactionSchema } from "../entity/models";
import { BaseViewModelRequestSchema } from "~/sdk/view-model";

export const BridgingSuccessViewModelSchema = z.object({
    status: z.enum(["success"]),
    amount: z.number(),
    wallet: WalletSchema,
    network: NetworkSchema,
    toNetwork: NetworkSchema,
    message: z.string(),
    transaction: ExecutedTransactionSchema,
});

export const BridgingNonSuccessViewModelSchema = z.object({
    status: z.enum(["error", "in-progress", "estimate-gas"]),
    amount: z.number(),
    wallet: WalletSchema,
    network: NetworkSchema,
    toNetwork: NetworkSchema,
    message: z.string(),
    transaction: ExecutedTransactionSchema.optional(),
    estimateGas: z.number().optional(),
});

export const BridgingViewModelSchema = z.discriminatedUnion("status", [
    BridgingSuccessViewModelSchema,
    BridgingNonSuccessViewModelSchema,
    BaseViewModelRequestSchema,
]);

export type TBridgingViewModel = z.infer<typeof BridgingViewModelSchema>;