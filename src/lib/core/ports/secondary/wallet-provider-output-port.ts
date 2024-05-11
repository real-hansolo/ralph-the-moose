import { type BaseDTO } from "~/sdk/dto";
import { type TNetwork } from "../../models";

export default interface WalletProviderOutputPort<TWallet> {
    getSupportedWallets(): Promise<BaseDTO<TWallet[]>>;
    getActiveWallet(): Promise<BaseDTO<TWallet>>;
    getActiveWalletNetwork(): Promise<BaseDTO<TNetwork>>;
    setActiveWallet(wallet: TWallet): Promise<BaseDTO<void>>;
}