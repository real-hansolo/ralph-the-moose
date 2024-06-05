import { z } from "zod";
import { NetworkSchema } from "../entity/models";

export const MintingStatsRequestSchema = z.object({
  network: NetworkSchema,
  walletAddress: z.string().optional(),
});

export type TMintingStatsRequest = z.infer<typeof MintingStatsRequestSchema>;

export const MintingStatsResponseSchema = z.object({
  status: z.literal("success"),
  totalSupply: z.number(),
  totalMinted: z.number(),
  percentage: z.number(),
  allocation: z.number(),
  limit: z.number(),
  network: NetworkSchema,
  walletAddress: z.string().optional(),
});

export type TMintingStatsResponse = z.infer<typeof MintingStatsResponseSchema>;

export const MintingStatsErrorResponseSchema = z.object({
  status: z.literal("error"),
  message: z.string(),
  network: NetworkSchema,
});

export type TMintingStatsErrorResponse = z.infer<typeof MintingStatsErrorResponseSchema>;
