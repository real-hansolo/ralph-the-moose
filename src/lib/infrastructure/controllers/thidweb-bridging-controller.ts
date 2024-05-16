import type { TSignal } from "~/lib/core/entity/signals";
import type { TBridgingViewModel } from "~/lib/core/view-models/bridging-view-model";
import type { BridgingInputPort } from "~/lib/core/ports/primary/bridging-primary-ports";
import { clientContainer } from "../config/ioc/container";
import { GATEWAYS, USECASE } from "../config/ioc/symbols";
import { injectable } from "inversify";
import type BridgingController from "~/lib/core/controller/bridging-controller-ports";
import type { Wallet } from "@maany_shr/thirdweb/wallets";
import type { TBridgingControllerParameters } from "~/lib/core/controller-parameters/bridging-controller-parameters";
import type WalletProviderOutputPort from "~/lib/core/ports/secondary/wallet-provider-output-port";
import type NetworkGatewayOutputPort from "~/lib/core/ports/secondary/network-gateway-output-port";

@injectable()
export default class ThirdwebBridgingController implements BridgingController<Wallet> {
  async execute(controllerParameters: TBridgingControllerParameters<Wallet>): Promise<void> {
    const { wallet, networkId, toNetworkId, amount, response } = controllerParameters;
    const walletProvider = clientContainer.get<WalletProviderOutputPort<Wallet>>(GATEWAYS.WALLET_PROVIDER);
    const networkGateway = clientContainer.get<NetworkGatewayOutputPort>(GATEWAYS.NETWORK_GATEWAY);
    if (wallet === undefined) {
      return Promise.reject(new Error("Wallet is not connected!"));
    }
    const convertedWalletDTO = walletProvider.fromWalletInstance(wallet);
    if (!convertedWalletDTO.success) {
      return Promise.reject(new Error("Error converting wallet to appropriate format"));
    }
    const convertedWallet = convertedWalletDTO.data;

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

    const bridgingRequest = {
      wallet: convertedWallet,
      network: network,
      toNetwork: toNetwork,
      amount: amount,
    };
    const usecaseFactory: (response: TSignal<TBridgingViewModel>) => BridgingInputPort = clientContainer.get(USECASE.BRIDGING_USECASE_FACTORY);
    const usecase = usecaseFactory(response);
    await usecase.execute(bridgingRequest);
  }
}
