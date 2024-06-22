import type { TNetwork } from "~/lib/core/entity/models";
import type { TSignal } from "~/lib/core/entity/signals";
import type { ClaimingInputPort } from "~/lib/core/ports/primary/claiming-primary-ports";
import { ClaimingRequestSchema } from "~/lib/core/usecase-models/claiming-usecase-models";
import type { TClaimingViewModel } from "~/lib/core/view-models/claiming-view-model";
import { clientContainer, signalsContainer } from "../config/ioc/container";
import { GATEWAYS, SIGNALS, USECASE } from "../config/ioc/symbols";
import { injectable } from "inversify";
import type WalletProviderOutputPort from "~/lib/core/ports/secondary/wallet-provider-output-port";

export interface TClaimingControllerParameters {
  amount: number;
  response: TSignal<TClaimingViewModel>;
}

@injectable()
export default class ClaimingController {
  async execute(controllerParameters: TClaimingControllerParameters): Promise<void> {
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
    const claimingRequest = ClaimingRequestSchema.parse({
      amount: controllerParameters.amount,
      network: activeNetwork,
      wallet: activeWallet,
    });
    const usecaseFactory: (response: TSignal<TClaimingViewModel>) => ClaimingInputPort = clientContainer.get(USECASE.CLAIMING_USECASE_FACTORY);
    const usecase = usecaseFactory(controllerParameters.response);
    await usecase.execute(claimingRequest);
  }
}
