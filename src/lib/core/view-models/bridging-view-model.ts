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
export const BridgingProgressViewModelSchema = z.object({
    status: z.literal("in-progress"),
    type: z.enum(["awaiting-verification", "awaiting-approval", "sending-transaction", "gas", "update"]),
    amount: z.number(),
    wallet: WalletSchema,
    network: NetworkSchema,
    toNetwork: NetworkSchema,
    message: z.string(),
    estimateGas: z.number(),
    transaction: ExecutedTransactionSchema.optional(),
})

export const BridgingErrorViewModelSchema = z.object({
    status: z.enum(["error"]),
    type: z.enum(["balance-error", "approval-error", "transaction-error", "verification-error"]),
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
    BridgingErrorViewModelSchema,
    BridgingProgressViewModelSchema,
    BaseViewModelRequestSchema,
]);

export type TBridgingViewModel = z.infer<typeof BridgingViewModelSchema>;