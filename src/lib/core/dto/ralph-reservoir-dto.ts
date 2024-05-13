import { z } from "zod";
import { DTOSchemaFactory } from "~/sdk/dto";
import { ExecutedTransactionSchema } from "../entity/models";

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


export const ClaimDTOSchema = DTOSchemaFactory(
    ExecutedTransactionSchema,
    z.object({
        walletAddress: z.string(),
        network: z.string(),
        message: z.string(),
    }),
);

export type ClaimDTO = z.infer<typeof ClaimDTOSchema>;


export const SpendingAllowanceDTOSchema = DTOSchemaFactory(
    z.object({
        allowance: z.number()
    }),
    z.object({
        walletAddress: z.string(),
        network: z.string(),
        message: z.string(),
    }),
);

export type SpendingAllowanceDTO = z.infer<typeof SpendingAllowanceDTOSchema>;


export const UnwrapDTOSchema = DTOSchemaFactory(
    ExecutedTransactionSchema,
    z.object({
        walletAddress: z.string(),
        network: z.string(),
        message: z.string(),
    }),
);

export type UnwrapDTO = z.infer<typeof UnwrapDTOSchema>;