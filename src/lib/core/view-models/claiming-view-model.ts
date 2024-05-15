import { z } from "zod";
import { ExecutedTransactionSchema, NetworkSchema, WalletSchema } from "../entity/models";

export const ClaimingSuccessViewModelSchema = z.object({
    status: z.enum(["success"]),
    amount: z.number(),
    wallet: WalletSchema,
    network: NetworkSchema,
    message: z.string(),
    contractCall: ExecutedTransactionSchema,
});

export const ClaimingNonSuccessViewModelSchema = z.object({
    status: z.enum(["error", "in-progress"]),
    amount: z.number(),
    wallet: WalletSchema,
    network: NetworkSchema,
    message: z.string(),
    contractCall: ExecutedTransactionSchema.optional(),
});

export const ClaimingViewModelSchema = z.discriminatedUnion("status", [
    ClaimingSuccessViewModelSchema,
    ClaimingNonSuccessViewModelSchema,
]);

export type TClaimingViewModel = z.infer<typeof ClaimingViewModelSchema>;