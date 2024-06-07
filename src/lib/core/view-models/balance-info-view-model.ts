import { z } from "zod";
import { NetworkSchema, WalletSchema } from "../entity/models";
export const BalanceInfoSuccessViewModelSchema = z.object({
  status: z.literal("success"),
  balance: z.object({
    inscriptions: z.number(),
    wrapped: z.number(),
    claimable: z.number(),
  }),
  network: NetworkSchema,
  wallet: WalletSchema,
});

export const BalanceInfoErrorViewModelSchema = z.object({
  status: z.literal("error"),
  data: z.object({
      message: z.string(),
      wallet: WalletSchema.optional(),
      network: NetworkSchema.optional(),
  }),
});

export const BalanceInfoViewModelSchema = z.discriminatedUnion("status", [BalanceInfoSuccessViewModelSchema, BalanceInfoErrorViewModelSchema]);

export type TBalanceInfoViewModel = z.infer<typeof BalanceInfoViewModelSchema>;
