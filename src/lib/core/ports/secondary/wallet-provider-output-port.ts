import type {
  ActiveWalletDTO,
  ConnectedWalletsDTO,
  DisconnectWalletDTO,
  FromWalletInstanceDTO,
  GetActiveWalletNetworkDTO,
  GetWalletInstanceDTO,
  SupportedWalletsDTO,
  SwitchActiveWalletNetworkDTO,
} from "../../dto/wallet-provider-dto";
import type { TNetwork, TWallet } from "../../entity/models";

export default interface WalletProviderOutputPort<TWalletInstance> {
  getName(): string;
  getConnectedWallets(): ConnectedWalletsDTO;
  getActiveWallet(): ActiveWalletDTO<TWalletInstance>;
  getSupportedWallets(): SupportedWalletsDTO;
  disconnect(wallet: TWalletInstance): DisconnectWalletDTO;
  getWalletInstance(wallet: TWallet): GetWalletInstanceDTO<TWalletInstance>;
  fromWalletInstance(walletInstance: TWalletInstance): FromWalletInstanceDTO;
  switchActiveWalletNetwork(network: TNetwork): Promise<SwitchActiveWalletNetworkDTO>;
  getActiveWalletNetwork(): GetActiveWalletNetworkDTO;
}
