import type {
  ActiveWalletDTO,
  ConnectedWalletsDTO,
  DisconnectWalletDTO,
  FromWalletInstanceDTO,
  GetWalletInstanceDTO,
  SupportedWalletsDTO,
} from "../../dto/wallet-provider-dto";
import type { TWallet } from "../../entity/models";

export default interface WalletProviderOutputPort<TWalletInstance> {
  getName(): string;
  getConnectedWallets(): ConnectedWalletsDTO;
  getActiveWallet(): ActiveWalletDTO<TWalletInstance>;
  getSupportedWallets(): SupportedWalletsDTO;
  disconnect(wallet: TWalletInstance): DisconnectWalletDTO;
  getWalletInstance(wallet: TWallet): GetWalletInstanceDTO<TWalletInstance>;
  fromWalletInstance(walletInstance: TWalletInstance): FromWalletInstanceDTO;
}
