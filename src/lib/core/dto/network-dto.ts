import { z } from "zod";
import { DTOSchemaFactory } from "~/sdk/dto";
import { NetworkSchema } from "../entity/models";

export const NetworkDTOSchema = DTOSchemaFactory(
  NetworkSchema,
  z.object({
    type: z.enum(["network_config_not_found", "network_config_invalid"]),
    message: z.string(),
  }),
);

export type TNetworkDTO = z.infer<typeof NetworkDTOSchema>;

export const NetworkListDTOSchema = DTOSchemaFactory(
  z.array(NetworkSchema),
  z.object({
    type: z.enum(["network_config_not_found", "network_config_invalid"]),
    message: z.string(),
  }),
);

export type TListNetworkDTO = z.infer<typeof NetworkListDTOSchema>;

export const TNetworkSwitchDTOSchema = DTOSchemaFactory(
  z.string(),
  z.object({
    type: z.enum(["network_switch_error", "wallet_on_wrong_network"]),
    message: z.string(),
  }),
);

export type TNetworkSwitchDTO = z.infer<typeof TNetworkSwitchDTOSchema>;