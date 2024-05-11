import { connectionManager } from "@maany_shr/thirdweb/react";
import { type Wallet } from "@maany_shr/thirdweb/wallets";
import { type TNetwork } from "~/lib/core/models";
import type WalletProviderOutputPort from "~/lib/core/ports/secondary/wallet-provider-output-port";
import { type BaseDTO } from "~/sdk/dto";

export class ThirdwebWalletProvider implements WalletProviderOutputPort<Wallet> {
  getSupportedWallets(): Promise<BaseDTO<Wallet[]>> {
    throw new Error("Method not implemented.");
  }
  getActiveWallet(): Promise<BaseDTO<Wallet>> {
    throw new Error("Method not implemented.");
  }
  getActiveWalletNetwork(): Promise<BaseDTO<TNetwork>> {
    throw new Error("Method not implemented.");
  }
  setActiveWallet(wallet: Wallet): Promise<BaseDTO<void>> {
    throw new Error("Method not implemented.");
  }

}