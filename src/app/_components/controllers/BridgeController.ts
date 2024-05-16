import type { Wallet } from "@maany_shr/thirdweb/wallets";
import { signal } from "@preact/signals-react";
import type { TSignal } from "~/lib/core/entity/signals";
import type NetworkGatewayOutputPort from "~/lib/core/ports/secondary/network-gateway-output-port";
import type WalletProviderOutputPort from "~/lib/core/ports/secondary/wallet-provider-output-port";
import type { TBridgingViewModel } from "~/lib/core/view-models/bridging-view-model";
import { clientContainer } from "~/lib/infrastructure/config/ioc/container";
import { CONTROLLER, GATEWAYS } from "~/lib/infrastructure/config/ioc/symbols";
import type { TBridgingControllerParameters } from "~/lib/infrastructure/controllers/bridging-controller";
import type BridgingController from "~/lib/infrastructure/controllers/bridging-controller";
import type { TBaseViewModelRequest } from "~/sdk/view-model";

export const bridge = async (wallet: Wallet | undefined): Promise<void> => {
  const walletProvider = clientContainer.get<WalletProviderOutputPort<Wallet>>(GATEWAYS.WALLET_PROVIDER);
  if(wallet === undefined) {
    throw new Error("Wallet is undefined");
  }
  const convertedWalletDTO = walletProvider.fromWalletInstance(wallet);
  if (!convertedWalletDTO.success) {
    throw new Error("Error converting wallet");    
  }
  const convertedWallet = convertedWalletDTO.data;
  const networkGateway = clientContainer.get<NetworkGatewayOutputPort>(GATEWAYS.NETWORK_GATEWAY);
  const networkAvalancheDTO = networkGateway.getNetwork(43114);
  if (!networkAvalancheDTO.success) {
    throw new Error("Error getting network avalanche");
  }

  const networkAvalanche = networkAvalancheDTO.data;
  
  const baseDTO = networkGateway.getNetwork(8453);
  if (!baseDTO.success) {
    throw new Error("Error getting network base");
  }

  const base = baseDTO.data;
  const viewModel: TBaseViewModelRequest = {
    status: "request",
    message: "Starting Bridge Test...",
  };

  const response: TSignal<TBridgingViewModel> = {
    name: "Bridge Test",
    description: "Bridge Test from Base to Avalanche",
    value: signal(viewModel),
  }
  const controllerParameters: TBridgingControllerParameters = {
    wallet: convertedWallet,
    network: base,
    toNetwork: networkAvalanche,
    amount: 5,
    response: response,
  };
  const controller: BridgingController = clientContainer.get(CONTROLLER.BRIDGING_CONTROLLER);
  await controller.execute(controllerParameters);
};