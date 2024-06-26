import type { TSignal } from "~/lib/core/entity/signals";
import type { TBridgingViewModel } from "~/lib/core/view-models/bridging-view-model";
import type { BridgingInputPort } from "~/lib/core/ports/primary/bridging-primary-ports";
import { clientContainer } from "../config/ioc/container";
import { GATEWAYS, USECASE } from "../config/ioc/symbols";
import { injectable } from "inversify";
import type WalletProviderOutputPort from "~/lib/core/ports/secondary/wallet-provider-output-port";
import type NetworkGatewayOutputPort from "~/lib/core/ports/secondary/network-gateway-output-port";

export interface TBridgingControllerParameters {
    networkId: number;
    toNetworkId: number;
    amount: number;
    response: TSignal<TBridgingViewModel>;
}

@injectable()
export default class BridgingController {
  async execute(controllerParameters: TBridgingControllerParameters): Promise<void> {
    const { networkId, toNetworkId, amount, response } = controllerParameters;
    const walletProvider = clientContainer.get<WalletProviderOutputPort<unknown>>(GATEWAYS.WALLET_PROVIDER);
    const networkGateway = clientContainer.get<NetworkGatewayOutputPort>(GATEWAYS.NETWORK_GATEWAY);

    const activeWalletDTO = walletProvider.getActiveWallet();
    if (!activeWalletDTO.success) {
      return Promise.reject(new Error("Could not find a connected wallet!"));
    }
    const activeWallet = activeWalletDTO.data;

    const networkDTO = networkGateway.getNetwork(networkId);
    if (!networkDTO.success) {
      return Promise.reject(new Error(`Error getting network configuration for networkId: ${networkId}`));
    }

    const network = networkDTO.data;

    const toNetworkDTO = networkGateway.getNetwork(toNetworkId);
    if (!toNetworkDTO.success) {
      return Promise.reject(new Error(`Error getting network configuration for networkId: ${toNetworkId}`));
    }

    const toNetwork = toNetworkDTO.data;

    const activeWalletNetwork = activeWallet.activeNetwork;
    if(activeWalletNetwork === "unsupported-wallet-network") {
      const switchWalletNetworkDTO = await walletProvider.switchActiveWalletNetwork(network);
      if (!switchWalletNetworkDTO.success) {
        return Promise.reject(new Error(`Error switching wallet network to ${network.name}`));
      }
    }

    const bridgingRequest = {
      wallet: activeWallet,
      network: network,
      toNetwork: toNetwork,
      amount: amount,
    };
    const usecaseFactory: (response: TSignal<TBridgingViewModel>) => BridgingInputPort = clientContainer.get(USECASE.BRIDGING_USECASE_FACTORY);
    const usecase = usecaseFactory(response);
    await usecase.execute(bridgingRequest);
  }
}
