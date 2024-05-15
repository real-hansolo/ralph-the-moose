import { z } from "zod";
import { WalletSchema, NetworkSchema, ExecutedTransactionSchema } from "../entity/models";

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
    status: z.enum(["error", "in-progress"]),
    amount: z.number(),
    wallet: WalletSchema,
    network: NetworkSchema,
    toNetwork: NetworkSchema,
    message: z.string(),
    transaction: ExecutedTransactionSchema.optional(),
});

export const BridgingViewModelSchema = z.discriminatedUnion("status", [
    BridgingSuccessViewModelSchema,
    BridgingNonSuccessViewModelSchema,
]);

export type TBridgingViewModel = z.infer<typeof BridgingViewModelSchema>;