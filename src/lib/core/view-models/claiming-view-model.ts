import { z } from "zod";
import { ExecutedTransactionSchema } from "../entity/models";
import { BaseViewModelRequestSchema } from "~/sdk/view-model";

   
export const ClaimingSuccessViewModelSchema = z.object({
    status: z.enum(["success"]),
    amount: z.number(),
    transaction: ExecutedTransactionSchema,
});

export const ClaimingProgressAwaitingTransactionViewModelSchema = z.object({
    status: z.enum(["awaiting-transaction"]),
    amount: z.number(),
});

export const ClaimingProgressVerifyingViewModelSchema = z.object({
    status: z.enum(["verifying"]),
    amount: z.number(),
    attempt: z.number(),
    transaction: ExecutedTransactionSchema,
});

export const ClaimingErrorViewModelSchema = z.object({
    status: z.enum(["error"]),
    amount: z.number(),
    message: z.string(),
    transaction: ExecutedTransactionSchema.optional(),
});

export const ClaimingViewModelSchema = z.discriminatedUnion("status", [
    ClaimingSuccessViewModelSchema,
    ClaimingProgressAwaitingTransactionViewModelSchema,
    ClaimingProgressVerifyingViewModelSchema,
    ClaimingErrorViewModelSchema,
    BaseViewModelRequestSchema,
]);

export type TClaimingViewModel = z.infer<typeof ClaimingViewModelSchema>;