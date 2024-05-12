import { z } from "zod";

export const NetworkSchema = z.object({
  chainId: z.number(),
  name: z.string(),
});

export type TNetwork = z.infer<typeof NetworkSchema>;

export const WalletSchema = z.object({
    name: z.string(),
    provider: z.string(),
    activeAccount: z.string(),
    availableAccounts: z.array(z.string()),
    activeNetwork: NetworkSchema,
  });

export type TWallet = z.infer<typeof WalletSchema>;