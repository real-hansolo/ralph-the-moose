import type { TSignal } from "~/lib/core/entity/signals";
import type { TWrappingViewModel } from "~/lib/core/view-models/wrapping-view-model";
import type { TNetwork } from "~/lib/core/entity/models";
import type { WrappingInputPort } from "~/lib/core/ports/primary/wrapping-primary-ports";
import { WrappingRequestSchema } from "~/lib/core/usecase-models/wrapping-usecase-models";
import { clientContainer, signalsContainer } from "../config/ioc/container";
import { GATEWAYS, SIGNALS, USECASE } from "../config/ioc/symbols";
import { injectable } from "inversify";
import type WalletProviderOutputPort from "~/lib/core/ports/secondary/wallet-provider-output-port";

export interface TWrappingControllerParameters {
  amount: number;
  response: TSignal<TWrappingViewModel>;
}

@injectable()
export default class WrappingController {
  async execute(controllerParameters: TWrappingControllerParameters): Promise<void> {
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

    const activeWalletNetwork = activeWallet.activeNetwork;
    if (activeWalletNetwork.chainId !== activeNetwork.chainId) {
      const switchWalletNetworkDTO = await walletProvider.switchActiveWalletNetwork(activeNetwork);
      if (!switchWalletNetworkDTO.success) {
        return Promise.reject(new Error(`Error switching wallet network to ${activeNetwork.name}`));
      }
    }
    const wrappingRequest = WrappingRequestSchema.parse({
      amount: controllerParameters.amount,
      network: activeNetwork,
      wallet: activeWallet,
    });
    const usecaseFactory: (response: TSignal<TWrappingViewModel>) => WrappingInputPort = clientContainer.get(USECASE.WRAPPING_USECASE_FACTORY);
    const usecase = usecaseFactory(controllerParameters.response);
    await usecase.execute(wrappingRequest);
  }
}
