import { z } from "zod";
import { DTOSchemaFactory } from "~/sdk/dto";
import { ExecutedTransactionSchema, NetworkSchema, WalletSchema } from "../entity/models";

export const BridgeTokensDTOSchema = DTOSchemaFactory(
    ExecutedTransactionSchema,
    z.object({
        wallet: WalletSchema,
        network: NetworkSchema,
        toNetwork: NetworkSchema,
        message: z.string(),
    }),
);

export type TBridgeTokensDTO = z.infer<typeof BridgeTokensDTOSchema>;