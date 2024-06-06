import type { TNetwork } from "~/lib/core/entity/models";
import type { TSignal } from "~/lib/core/entity/signals";
import { MintingRequestSchema } from "~/lib/core/usecase-models/minting-usecase-models";
import type { TMintingViewModel } from "~/lib/core/view-models/minting-view-model";
import { clientContainer, signalsContainer } from "../config/ioc/container";
import { GATEWAYS, SIGNALS, USECASE } from "../config/ioc/symbols";
import type { MintingInputPort } from "~/lib/core/ports/primary/minting-primary-ports";
import { injectable } from "inversify";
import type WalletProviderOutputPort from "~/lib/core/ports/secondary/wallet-provider-output-port";

export interface TMintingControllerParameters {
  amount: number;
  response: TSignal<TMintingViewModel>;
}

@injectable()
export default class MintingController {
  async execute(controllerParameters: TMintingControllerParameters): Promise<void> {
    const walletProvider = clientContainer.get<WalletProviderOutputPort<unknown>>(GATEWAYS.WALLET_PROVIDER);
    const activeWalletDTO = walletProvider.getActiveWallet();
    if (!activeWalletDTO.success) {
      return Promise.reject(new Error("Could not find a connected wallet!"));
    }
    const S_ActiveNetwork = signalsContainer.get<TSignal<TNetwork>>(SIGNALS.ACTIVE_NETWORK);
    const activeNetwork = S_ActiveNetwork.value.value;
    if (activeNetwork === undefined) {
      return Promise.reject(new Error("Could not determine active network!"));
    }
    const activeWallet = activeWalletDTO.data;
    const walletNetworkDTO = walletProvider.getActiveWalletNetwork();
    if (!walletNetworkDTO.success) {
      return Promise.reject(new Error("Could not determine active wallet network!"));
    }
    const walletNetwork = walletNetworkDTO.data;

    if (walletNetwork.chainId !== activeNetwork.chainId) {
      return Promise.reject(new Error(`Wallet's on ${walletNetwork.name}! Please switch to ${activeNetwork.name}!`));
    }
    const mintingRequest = MintingRequestSchema.parse({
      network: activeNetwork,
      amount: controllerParameters.amount,
      wallet: activeWallet,
    });
    const usecaseFactory: (response: TSignal<TMintingViewModel>) => MintingInputPort = clientContainer.get(USECASE.MINTING_USECASE_FACTORY);
    const usecase = usecaseFactory(controllerParameters.response);
    await usecase.execute(mintingRequest);
  }
}
