import type { TSignal } from "../entity/signals";
import type { TBridgingViewModel } from "../view-models/bridging-view-model";

export interface TBridgingControllerParameters<TWalletProviderWallet> {
    wallet: TWalletProviderWallet | undefined;
    networkId: number;
    toNetworkId: number;
    amount: number;
    response: TSignal<TBridgingViewModel>;
}
