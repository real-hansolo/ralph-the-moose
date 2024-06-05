import { injectable } from "inversify";
import type { TNetwork } from "~/lib/core/entity/models";
import { MintingStatsRequestSchema } from "~/lib/core/usecase-models/minting-stats-usecase-models";
import { clientContainer, signalsContainer } from "../config/ioc/container";
import type WalletProviderOutputPort from "~/lib/core/ports/secondary/wallet-provider-output-port";
import { GATEWAYS, SIGNALS, USECASE } from "../config/ioc/symbols";
import type { Wallet } from "@maany_shr/thirdweb/wallets";
import type { TSignal } from "~/lib/core/entity/signals";
import type { TMintingStatsViewModel } from "~/lib/core/view-models/minting-stats-view-model";
import type { MintingStatsInputPort } from "~/lib/core/ports/primary/minting-stats-primary-ports";

export interface TMintingStatsControllerParameters {
  response: TSignal<TMintingStatsViewModel>;
}

@injectable()
export default class MintingStatsController {
  async execute(controllerParameters: TMintingStatsControllerParameters): Promise<void> {
    const walletProvider = clientContainer.get<WalletProviderOutputPort<Wallet>>(GATEWAYS.WALLET_PROVIDER);
    const activeWalletDTO = walletProvider.getActiveWallet();
    let walletAddress = undefined;
    if (activeWalletDTO.success) {
      walletAddress = activeWalletDTO.data.activeAccount;
    }

    const S_ActiveNetwork = signalsContainer.get<TSignal<TNetwork>>(SIGNALS.ACTIVE_NETWORK);
    const activeNetwork = S_ActiveNetwork.value.value;

    if (activeNetwork === undefined) {
      await Promise.reject("[Controller]-[Minting Stats]: Could not determine active network!");
    }
    const mintingStatsRequest = MintingStatsRequestSchema.parse({
      network: activeNetwork,
      walletAddress: walletAddress,
    });
    const usecaseFactory: (response: TSignal<TMintingStatsViewModel>) => MintingStatsInputPort = clientContainer.get(USECASE.MINTING_STATS_USECASE_FACTORY);
    const usecase = usecaseFactory(controllerParameters.response);
    await usecase.execute(mintingStatsRequest);
  }
}
