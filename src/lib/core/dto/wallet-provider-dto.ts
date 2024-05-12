import { z } from "zod";
import { WalletSchema } from "~/lib/core/entity/models";
import { DTOSchemaFactory } from "~/sdk/dto";

const ActiveWalletDTOSchema = DTOSchemaFactory(
  WalletSchema,
  z.object({
    type: z.enum([
      "unknown_error",
      "wallet_not_connected",
      "wallet_not_supported",
    ]),
  }),
);

export type ActiveWalletDTO<TWallet> = z.infer<typeof ActiveWalletDTOSchema> & {
  walletInstance?: TWallet;
};

export const ConnectedWalletsDTOSchema = DTOSchemaFactory(
  z.array(WalletSchema),
  z.object({
    type: z.enum(["no_wallets_connected", "unknown_error"]),
  }),
);

export type ConnectedWalletsDTO = z.infer<typeof ConnectedWalletsDTOSchema>;

export const SupportedWalletsDTOSchema = DTOSchemaFactory(
  z.array(z.string()),
  z.object({
    type: z.enum(["no_wallets_supported", "unknown_error"]),
  }),
);

export type SupportedWalletsDTO<TWalletInstance> = z.infer<
  typeof SupportedWalletsDTOSchema
> & {walletInstances? : [{name: string, walletInstance: TWalletInstance}]};


export const DisconnectWalletDTOSchema = DTOSchemaFactory(z.object({
  name: z.string(),
  provider: z.string(),
  address: z.string(),
}), z.object({
  error: z.string(),
}));

export type DisconnectWalletDTO = z.infer<typeof DisconnectWalletDTOSchema>;