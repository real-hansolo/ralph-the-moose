import { DTOSchemaFactory } from "~/sdk/dto";
import {
  ContractSchema,
  ExecutedTransactionSchema,
  NetworkSchema,
  PreparedTransactionSchema,
} from "../entity/models";
import { z } from "zod";

export const ContractDTOSchema = DTOSchemaFactory(
  ContractSchema,
  z.object({
    type: z.enum(["contract_not_found", "unknown_error"]),
    message: z.string(),
    network: NetworkSchema,
  }),
);

export type TContractDTO = z.infer<typeof ContractDTOSchema>;

export const TPreparedTransactionDTOSchema = DTOSchemaFactory(
  PreparedTransactionSchema,
  z.object({
    type: z.enum(["prepared_transaction_error"]),
    message: z.string(),
    to: z.string(),
    value: z.string(),
    data: z.string().optional(),
    network: NetworkSchema,
  }),
);

export type TPreparedTransactionDTO<TProviderPreparedTransaction> = z.infer<
  typeof TPreparedTransactionDTOSchema
>  & { preparedTransaction?: TProviderPreparedTransaction };

export const TExecutedTransactionDTOSchema = DTOSchemaFactory(
  ExecutedTransactionSchema,
  z.object({
    type: z.enum([
      "transaction_error",
      "gas_limit",
      "insufficient_funds",
      "unknown_error",
    ]),
    message: z.string(),
    from: z.string(),
    to: z.string(),
    value: z.string(),
    data: z.string().optional(),
    network: NetworkSchema,
  }),
);

export type TExecutedTransactionDTO = z.infer<
  typeof TExecutedTransactionDTOSchema
>;

export const EstimateGasDTOSchema = DTOSchemaFactory(
  z.bigint(),
  z.object({
    type: z.enum(["estimate_gas_error"]),
    message: z.string(),
    preparedTransaction: PreparedTransactionSchema,
  }),
);

export type TEstimateGasDTO = z.infer<typeof EstimateGasDTOSchema>;
