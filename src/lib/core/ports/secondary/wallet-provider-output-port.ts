import type {
  ActiveWalletDTO,
  ConnectedWalletsDTO,
  DisconnectWalletDTO,
  SupportedWalletsDTO,
} from "../../dto/wallet-provider-dto";

export default interface WalletProviderOutputPort<TWalletInstance> {
  getName(): string;
  getConnectedWallets(): ConnectedWalletsDTO;
  getActiveWallet(): ActiveWalletDTO<TWalletInstance>;
  getSupportedWallets(): SupportedWalletsDTO<TWalletInstance>;
  disconnect(wallet: TWalletInstance): DisconnectWalletDTO;
}
