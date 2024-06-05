import type { TNetwork } from "~/lib/core/entity/models";
import type { TSignal } from "~/lib/core/entity/signals";
import { MintingRequestSchema } from "~/lib/core/usecase-models/minting-usecase-models";
import type { TMintingViewModel } from "~/lib/core/view-models/minting-view-model";
import { clientContainer } from "../config/ioc/container";
import { GATEWAYS, USECASE } from "../config/ioc/symbols";
import type { MintingInputPort } from "~/lib/core/ports/primary/minting-primary-ports";
import { injectable } from "inversify";
import type WalletProviderOutputPort from "~/lib/core/ports/secondary/wallet-provider-output-port";

export interface TMintingControllerParameters {
  network: TNetwork;
  amount: number;
  response: TSignal<TMintingViewModel>;
}

@injectable()
export default class MintingController {
  async execute(controllerParameters: TMintingControllerParameters): Promise<void> {
    const walletProvider = clientContainer.get<WalletProviderOutputPort<unknown>>(GATEWAYS.WALLET_PROVIDER);
    const activeWalletDTO = walletProvider.getActiveWallet();
    if(!activeWalletDTO.success) {
      await Promise.reject("[Controller]-[Minting]: Could not determine active wallet!");
    }
    const activeWallet = activeWalletDTO.data;
    const mintingRequest = MintingRequestSchema.parse({
      network: controllerParameters.network,
      amount: controllerParameters.amount,
      wallet: activeWallet
    });
    const usecaseFactory: (response: TSignal<TMintingViewModel>) => MintingInputPort = clientContainer.get(USECASE.MINTING_USECASE_FACTORY);
    const usecase = usecaseFactory(controllerParameters.response);
    await usecase.execute(mintingRequest);
  }
}
