import { z } from "zod";
import { WalletSchema } from "~/lib/core/models";
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
  wallet?: TWallet;
};

const ConnectedWalletsDTOSchema = DTOSchemaFactory(
  z.array(WalletSchema),
  z.object({
    type: z.enum(["no_wallets_connected", "unknown_error"]),
  }),
);

export type ConnectedWalletsDTO = z.infer<typeof ConnectedWalletsDTOSchema>;

const SupportedWalletsDTOSchema = DTOSchemaFactory(
  z.array(z.string()),
  z.object({
    type: z.enum(["no_wallets_supported", "unknown_error"]),
  }),
);

export type SupportedWalletsDTO<TWalletInstance> = z.infer<
  typeof SupportedWalletsDTOSchema
> & {walletInstances? : [{name: string, walletInstance: TWalletInstance}]};