import { injectable } from "inversify";
import type { TNetwork } from "~/lib/core/entity/models";
import type { TSignal } from "~/lib/core/entity/signals";
import type { TBalanceInfoViewModel } from "~/lib/core/view-models/balance-info-view-model";
import { clientContainer, signalsContainer } from "../config/ioc/container";
import { GATEWAYS, SIGNALS, USECASE } from "../config/ioc/symbols";
import type WalletProviderOutputPort from "~/lib/core/ports/secondary/wallet-provider-output-port";
import type { BalanceInfoInputPort } from "~/lib/core/ports/primary/balance-info-primary-ports";

export interface TBalanceInfoControllerParameters {
  response: TSignal<TBalanceInfoViewModel>;
}

@injectable()
export default class BalanceInfoController {
  async execute(controllerParameters: TBalanceInfoControllerParameters): Promise<void> {
    const response = controllerParameters.response;
    const S_ActiveNetwork = signalsContainer.get<TSignal<TNetwork>>(SIGNALS.ACTIVE_NETWORK);
    const activeNetwork = S_ActiveNetwork.value.value;
    if (activeNetwork === undefined) {
      return Promise.reject(new Error("Could not determine active network!"));
    }
    const walletProvider = clientContainer.get<WalletProviderOutputPort<unknown>>(GATEWAYS.WALLET_PROVIDER);
    const activeWalletDTO = walletProvider.getActiveWallet();
    if (!activeWalletDTO.success) {
      return Promise.reject(new Error("Could not find a connected wallet!"));
    }
    const activeWallet = activeWalletDTO.data;

    const balanceInfoRequest = {
      network: activeNetwork,
      wallet: activeWallet,
    };

    const usecaseFactory: (response: TSignal<TBalanceInfoViewModel>) => BalanceInfoInputPort = clientContainer.get(USECASE.BALANCE_INFO_USECASE_FACTORY);
    const usecase = usecaseFactory(response);
    await usecase.execute(balanceInfoRequest);
  }
}
