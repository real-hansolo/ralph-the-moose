import type React from "react";
import { z } from "zod";
import { type TWallet, WalletSchema, type TNetwork } from "~/lib/core/entity/models";
import { DTOSchemaFactory } from "~/sdk/dto";

const ActiveWalletDTOSchema = DTOSchemaFactory(
  WalletSchema.merge(z.object({
    activeAccount: z.string(),
  })),
  z.object({
    type: z.enum([
      "unknown_error",
      "wallet_not_connected",
      "wallet_not_supported",
    ]),
  }),
);

export type ActiveWalletDTO<TWalletInstance> = z.infer<typeof ActiveWalletDTOSchema> & {
  walletInstance?: TWalletInstance;
};

export const ConnectedWalletsDTOSchema = DTOSchemaFactory(
  z.array(WalletSchema),
  z.object({
    type: z.enum(["no_wallets_connected", "unknown_error"]),
  }),
);

export type ConnectedWalletsDTO = z.infer<typeof ConnectedWalletsDTOSchema>;



export type SupportedWalletsDTO = {
  success: true;
  data: {
    name: string;
    icon: React.ReactNode;
    id: string;
    provider: string;
  }[];
} | {
  success: false;
  data: {
    type: "wallet_provider_error";
    message: string;
  }
}



export const DisconnectWalletDTOSchema = DTOSchemaFactory(z.object({
  name: z.string(),
  provider: z.string(),
  address: z.string(),
}), z.object({
  error: z.string(),
}));

export type DisconnectWalletDTO = z.infer<typeof DisconnectWalletDTOSchema>;

export type GetWalletInstanceDTO<TWalletInstance> = {
  success: true;
  data: TWalletInstance;
} | {
  success: false;
  data: {
    type: "wallet_provider_error";
    message: string;
  };
};


export type FromWalletInstanceDTO = {
  success: true;
  data: TWallet;
} | {
  success: false;
  data: {
    type: "wallet_provider_error";
    message: string;
  };
};

export type SwitchActiveWalletNetworkDTO = {
  success: true;
} | {
  success: false;
  data: {
    type: "wallet_provider_error";
    message: string;
  };
};


export type GetActiveWalletNetworkDTO = {
  success: true;
  data: TNetwork;
} | {
  success: false;
  data: {
    type: "wallet_provider_error";
    message: string;
  };
};