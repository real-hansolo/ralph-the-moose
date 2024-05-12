import { DTOSchemaFactory } from "~/sdk/dto";
import { z } from "zod";

export const GetRpcURLDTOSchema = DTOSchemaFactory(
  z.object({
    url: z.string().url(),
  }),
  z.object({
    type: z.enum(["network_not_supported", "rpc_provider_not_supported"]),
    message: z.string(),
  }),
);

export type TGetRpcURLDTO = z.infer<typeof GetRpcURLDTOSchema>;


export const GetTransactionByHashDTOSchema = DTOSchemaFactory(
    z.object({
        hash: z.string(),
        blockHash: z.string(),
        blockNumber: z.number(),
        from: z.string(),
        to: z.string(),
        value: z.string(),
        gas: z.string(),
        gasPrice: z.string(),
        input: z.string(),
        nonce: z.number(),
        transactionIndex: z.number(),
        v: z.string(),
        r: z.string(),
        s: z.string(),
    }),
    z.object({
        type: z.enum(["transaction_not_found", "unknown_error", "network_not_supported", "rpc_provider_not_supported"]),
        message: z.string(),
    }),
);

export type TGetTransactionByHashDTO = z.infer<typeof GetTransactionByHashDTOSchema>;