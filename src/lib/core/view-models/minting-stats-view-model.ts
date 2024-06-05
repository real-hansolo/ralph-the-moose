import { z } from "zod";
import { NetworkSchema } from "../entity/models";

export const MintingStatsSuccessViewModelSchema = z.object({
  status: z.literal("success"),
  totalSupply: z.number(),
  totalMinted: z.number(),
  percentage: z.number(),
  limit: z.number(),
  allocation: z.number(),
  network: NetworkSchema,
  walletAddress: z.string().optional(),
});

export const MintingStatsNonSuccessViewModelSchema = z.object({
  status: z.literal("error"),
  message: z.string(),
  network: NetworkSchema.optional(),
});

export const MintingStatsViewModelSchema = z.discriminatedUnion("status", [MintingStatsSuccessViewModelSchema, MintingStatsNonSuccessViewModelSchema]);

export type TMintingStatsViewModel = z.infer<typeof MintingStatsViewModelSchema>;
