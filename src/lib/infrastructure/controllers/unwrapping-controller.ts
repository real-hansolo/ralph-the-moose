import type { TNetwork } from "~/lib/core/entity/models";
import type { TSignal } from "~/lib/core/entity/signals";
import type { UnWrappingInputPort } from "~/lib/core/ports/primary/unwrapping-primary-ports";
import { UnwrappingRequestSchema } from "~/lib/core/usecase-models/unwrapping-usecase-models";
import type { TUnwrappingViewModel } from "~/lib/core/view-models/unwrapping-view-model";
import { clientContainer, signalsContainer } from "../config/ioc/container";
import { GATEWAYS, SIGNALS, USECASE } from "../config/ioc/symbols";
import { injectable } from "inversify";
import type WalletProviderOutputPort from "~/lib/core/ports/secondary/wallet-provider-output-port";

export interface TUnwrappingControllerParameters {
    amount: number;
    response: TSignal<TUnwrappingViewModel>;
}

@injectable()
export default class UnwrappingController {
    async execute(controllerParameters: TUnwrappingControllerParameters): Promise<void> {
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
        const unwrappingRequest = UnwrappingRequestSchema.parse({
            network: activeNetwork,
            wallet: activeWallet,
            amount: controllerParameters.amount,
        });
        const usecaseFactory: (response: TSignal<TUnwrappingViewModel>) => UnWrappingInputPort = clientContainer.get(USECASE.UNWRAPPING_USECASE_FACTORY);
        const usecase = usecaseFactory(controllerParameters.response);
        await usecase.execute(unwrappingRequest);
    }
}