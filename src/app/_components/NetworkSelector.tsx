import { clientContainer, signalsContainer } from "~/lib/infrastructure/config/ioc/container";
import { GATEWAYS, SIGNALS } from "~/lib/infrastructure/config/ioc/symbols";
import type NetworkGatewayOutputPort from "~/lib/core/ports/secondary/network-gateway-output-port";
import { type TNetwork } from "~/lib/core/entity/models";
import { type TSignal } from "~/lib/core/entity/signals";
import { NetworkSelector } from "@maany_shr/ralph-the-moose-ui-kit";
import { effect } from "@preact/signals-react";
import { useEffect, useState } from "react";
import WalletProviderOutputPort from "~/lib/core/ports/secondary/wallet-provider-output-port";
import { Wallet } from "@maany_shr/thirdweb/wallets";
import { useToast } from "@maany_shr/ralph-the-moose-ui-kit";

export const RalphNetworkSelector = () => {
  const networkGateway = clientContainer.get<NetworkGatewayOutputPort>(GATEWAYS.NETWORK_GATEWAY);
  const S_ActiveNetwork = signalsContainer.get<TSignal<TNetwork>>(SIGNALS.ACTIVE_NETWORK);
  const [activeNetwork, setActiveNetwork] = useState<TNetwork>(S_ActiveNetwork.value.value);
  const toastService = useToast();
  const getSupportedNetworks = () => {
    const supportedNetworksDTO = networkGateway.getSupportedNetworks();
    if (!supportedNetworksDTO.success) {
      console.error(log("Failed to get supported networks"));
      return [];
    }
    const networks = supportedNetworksDTO.data;
    const networksWithIcon = networks.map((network) => {
      return {
        chainId: network.chainId,
        name: network.name,
        icon: network.icon ?? <></>,
      };
    });
    return networksWithIcon;
  };

  const log = (message: string) => {
    const timestamp = new Date().toISOString();
    return `[NetworkSelector] [${timestamp}] ${message}`;
  };

  useEffect(() => {
    setActiveNetwork(S_ActiveNetwork.value.value);
  }, [S_ActiveNetwork.value.value]);

  const handleNetworkChange = (network: { chainId: number; name: string }) => {
    const activeNetworkDTO = networkGateway.getNetwork(network.chainId);
    const walletProvider = clientContainer.get<WalletProviderOutputPort<Wallet>>(GATEWAYS.WALLET_PROVIDER);
    if (!activeNetworkDTO.success) {
      console.error(log(`Failed to get network configuration for ${network.name} ${network.chainId}`));
      return;
    }
    const setActiveNetworkDTO = networkGateway.setActiveNetwork(network.chainId);
    if (!setActiveNetworkDTO.success) {
      console.error(log(`Failed to set active network to ${network.name} ${network.chainId}`));
      return;
    }
    S_ActiveNetwork.value.value = activeNetworkDTO.data
    console.warn(log(`App Network Change: ${network.name} ${network.chainId}`));
    toastService?.openToast(
      {
        status: "success",
        id: "network-switch-success-toast" + new Date().getTime(),
        title: "App Network",
        message: `Network switched to ${network.name}`,
      },
      3000,
    );
    const activeWalletDTO = walletProvider.getActiveWallet();
    if(!activeWalletDTO.success) {
      return;
    }
    // only if wallet is connected
    walletProvider
      .switchActiveWalletNetwork(activeNetworkDTO.data)
      .then((switchWalletNetworkDTO) => {
        if (!switchWalletNetworkDTO.success) {
          console.error(log(`Failed to switch wallet network to ${network.name} ${network.chainId}`));
          toastService?.openToast(
            {
              status: "error",
              id: "network-switch-failed-toast" + new Date().getTime(),
              title: "Wallet Network",
              message: `Failed to switch wallet network to ${network.name}`,
            },
            3000,
          );
          return;
        }
        toastService?.openToast(
          {
            status: "success",
            id: "network-switch-success-toast" + new Date().getTime(),
            title: "Wallet Network",
            message: `Network switched to ${network.name}`,
          },
          3000,
        );
        console.warn(log(`Wallet Network Change: ${network.name} ${network.chainId}`));
      })
      .catch((e) => {
        console.error(log(`Failed to switch wallet network to ${network.name}`));
        toastService?.openToast(
          {
            status: "error",
            id: "network-switch-failed-toast" + new Date().getTime(),
            title: "Wallet Network",
            message: `Failed to switch wallet network!`,
          },
          5000,
        );
      });
  };

  const supportedNetworks = getSupportedNetworks();

  return (
    <NetworkSelector
      supportedNetworks={supportedNetworks}
      activeNetwork={{
        chainId: S_ActiveNetwork.value.value.chainId,
        name: S_ActiveNetwork.value.value.name,
        icon: S_ActiveNetwork.value.value.icon ?? <></>,
      }}
      onNetworkChange={handleNetworkChange}
    />
  );
};
