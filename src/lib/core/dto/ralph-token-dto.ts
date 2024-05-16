import { z } from "zod";
import { ExecutedTransactionSchema } from "../entity/models";
import { DTOSchemaFactory } from "~/sdk/dto";

export const ApproveReservoirDTOSchema = DTOSchemaFactory(
    ExecutedTransactionSchema,
    z.object({
        walletAddress: z.string(),
        network: z.string(),
        message: z.string(),
    }),
);

export type ApproveReservoirDTO = z.infer<typeof ApproveReservoirDTOSchema>;


export const BalanceDTOSchema = DTOSchemaFactory(
    z.object({
        balance: z.number()
    }),
    z.object({
        walletAddress: z.string(),
        network: z.string(),
        message: z.string(),
    }),
);

export type BalanceDTO = z.infer<typeof BalanceDTOSchema>;


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