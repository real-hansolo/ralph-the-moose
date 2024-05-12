import { z } from "zod";
import { DTOSchemaFactory } from "~/sdk/dto";

export const ClaimableDTOSchema = DTOSchemaFactory(
    z.object({
        amount: z.number(),
    }),
    z.object({
        walletAddress: z.string(),
        network: z.string(),
        message: z.string(),
    }),
);

export type ClaimableDTO = z.infer<typeof ClaimableDTOSchema>;