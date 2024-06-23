import { clientContainer, signalsContainer } from "~/lib/infrastructure/config/ioc/container";
import { GATEWAYS, SIGNALS } from "~/lib/infrastructure/config/ioc/symbols";
import type NetworkGatewayOutputPort from "~/lib/core/ports/secondary/network-gateway-output-port";
import { type TWallet, type TNetwork } from "~/lib/core/entity/models";
import { type TSignal } from "~/lib/core/entity/signals";
import { NetworkSelector } from "@maany_shr/ralph-the-moose-ui-kit";
import type WalletProviderOutputPort from "~/lib/core/ports/secondary/wallet-provider-output-port";
import type { Wallet } from "@maany_shr/thirdweb/wallets";
import { useToast } from "@maany_shr/ralph-the-moose-ui-kit";
import { useSignal, useSignals } from "@preact/signals-react/runtime";
import { effect } from "@preact/signals-react";
import { useEffect } from "react";

export const RalphNetworkSelector = () => {
  useSignals();
  const networkGateway = clientContainer.get<NetworkGatewayOutputPort>(GATEWAYS.NETWORK_GATEWAY);
  const S_ACTIVE_NETWORK = signalsContainer.get<TSignal<TNetwork>>(SIGNALS.ACTIVE_NETWORK);
  const S_ACTIVE_WALLET_NETWORK = signalsContainer.get<TSignal<TNetwork | undefined | "unsupported-wallet-network">>(SIGNALS.ACTIVE_WALLET_NETWORK);
  const S_ACTIVE_WALLET = signalsContainer.get<TSignal<TWallet | undefined>>(SIGNALS.ACTIVE_WALLET);
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

  const walletProvider = clientContainer.get<WalletProviderOutputPort<Wallet>>(GATEWAYS.WALLET_PROVIDER);

  const S_WALLET_NETWORK_CHANGE_REQUESTED = useSignal<boolean>(false);

  effect(() => {
    if (S_ACTIVE_WALLET.value.value === undefined) {
      console.log(log("Wallet is not connected. Resetting wallet network change request flag"));
      S_WALLET_NETWORK_CHANGE_REQUESTED.value = false;
    }
    if (S_ACTIVE_WALLET_NETWORK.value.value === undefined) {
      return;
    }
    if (S_ACTIVE_WALLET_NETWORK.value.value === "unsupported-wallet-network") {
      return;
    }
    if (S_ACTIVE_NETWORK.value.value.chainId !== S_ACTIVE_WALLET_NETWORK.value.value.chainId) {
      console.log(log(`Wallet network is different from app network. Setting app network to wallet network i.e ${S_ACTIVE_WALLET_NETWORK.value.value.name}`));
      S_ACTIVE_NETWORK.value.value = S_ACTIVE_WALLET_NETWORK.value.value;
    }
  });

  useEffect(() => {
    if (S_ACTIVE_WALLET_NETWORK.value.value === undefined) {
      console.log(log("Wallet network is not set. Skipping network check"));
      return;
    }
    if (S_WALLET_NETWORK_CHANGE_REQUESTED.value) {
      console.log(log("Wallet network was already requested once during app load. Skipping network check"));
      return;
    }
    if (S_ACTIVE_WALLET_NETWORK.value.value === "unsupported-wallet-network") {
      console.log(log(`Wallet network is not supported. Switching wallet network to ${S_ACTIVE_NETWORK.value.value.name}`));
      if (!S_WALLET_NETWORK_CHANGE_REQUESTED.value) {
        S_WALLET_NETWORK_CHANGE_REQUESTED.value = true;
        walletProvider
          .switchActiveWalletNetwork(S_ACTIVE_NETWORK.value.value)
          .then((switchWalletNetworkDTO) => {
            if (!switchWalletNetworkDTO.success) {
              console.error(
                log(
                  `Wallet network is not supported. Error switching wallet network to ${S_ACTIVE_NETWORK.value.value.name}: ${switchWalletNetworkDTO.data.message}`,
                ),
              );
              toastService?.openToast(
                {
                  message: `Please switch your wallet network to ${S_ACTIVE_NETWORK.value.value.name}`,
                  title: "Network Error",
                  id: `network-error-${S_ACTIVE_NETWORK.value.value.name}`,
                  status: "warning",
                },
                10000,
              );
            } else {
              console.log(log(`Switched wallet network to ${S_ACTIVE_NETWORK.value.value.name}`));
              toastService?.openToast(
                {
                  message: `Connected to ${S_ACTIVE_NETWORK.value.value.name}`,
                  title: "Network Connected",
                  id: `network-connected-${S_ACTIVE_NETWORK.value.value.name}`,
                  status: "success",
                },
                5000,
              );
            }
          })
          .catch((error) => {
            console.error(log(`Error switching wallet network to ${S_ACTIVE_NETWORK.value.value.name}: ${(error as Error).message}`));
            toastService?.openToast(
              {
                message: `Please switch your wallet to ${S_ACTIVE_NETWORK.value.value.name}`,
                title: "Network Error",
                id: `network-error-${S_ACTIVE_NETWORK.value.value.name}`,
                status: "error",
              },
              5000,
            );
          })
          .finally(() => {
            // S_WALLET_NETWORK_CHANGE_REQUESTED.value = false;
          });
      }
    } else {
      // switch app network to wallet network
      if (S_ACTIVE_NETWORK.value.value.chainId !== S_ACTIVE_WALLET_NETWORK.value.value.chainId) {
        S_ACTIVE_NETWORK.value.value = S_ACTIVE_WALLET_NETWORK.value.value;
        toastService?.openToast(
          {
            message: `Connected to ${S_ACTIVE_NETWORK.value.value.name}`,
            title: "Network Connected",
            id: `network-connected-${S_ACTIVE_NETWORK.value.value.name}`,
            status: "success",
          },
          5000,
        );
        setTimeout(() => {
          console.log(log(`Switched app network to ${S_ACTIVE_NETWORK.value.value.name}`));
        }, 1000);
      }
    }
  }, [S_ACTIVE_WALLET_NETWORK.value.value, S_ACTIVE_WALLET.value.value, S_ACTIVE_NETWORK.value.value]);

  const handleNetworkChange = (network: { chainId: number; name: string }) => {
    const newNetworkDTO = networkGateway.getNetwork(network.chainId);
    if (!newNetworkDTO.success) {
      console.error(log(`Failed to get network config for ${network.name} ${network.chainId}`));
      return;
    }
    const newNetwork = newNetworkDTO.data;
    if (!S_ACTIVE_WALLET_NETWORK.value.value) {
      const setActiveNetworkDTO = networkGateway.setActiveNetwork(network.chainId);
      if (!setActiveNetworkDTO.success) {
        console.error(log(`Failed to set active network to ${network.name} ${network.chainId}`));
        return;
      }
      S_ACTIVE_NETWORK.value.value = newNetwork;
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
      return;
    }
    if (S_ACTIVE_WALLET_NETWORK.value.value === "unsupported-wallet-network" || S_ACTIVE_WALLET_NETWORK.value.value.chainId !== newNetwork.chainId) {
      console.error(log(`Switching wallet network to ${newNetwork.name}`));
      const walletProvider = clientContainer.get<WalletProviderOutputPort<unknown>>(GATEWAYS.WALLET_PROVIDER);
      walletProvider
        .switchActiveWalletNetwork(newNetwork)
        .then((switchWalletNetworkDTO) => {
          if (!switchWalletNetworkDTO.success) {
            console.error(log(`Failed to switch wallet network to ${network.name} ${network.chainId}`));
            toastService?.openToast(
              {
                status: "error",
                id: "network-switch-failed-toast" + new Date().getTime(),
                title: "Network Switch",
                message: `Could not switch network to ${network.name}`,
              },
              3000,
            );
            return;
          }
          toastService?.openToast(
            {
              status: "success",
              id: "network-switch-success-toast" + new Date().getTime(),
              title: "Network Switch",
              message: `Network switched to ${network.name}`,
            },
            3000,
          );
          S_ACTIVE_NETWORK.value.value = newNetwork;
          console.warn(log(`Network Change: ${network.name} ${network.chainId}`));
        })
        .catch((e) => {
          console.error(log(`Failed to switch wallet network to ${network.name}: ${(e as Error).message}`));
          toastService?.openToast(
            {
              status: "error",
              id: "network-switch-failed-toast" + new Date().getTime(),
              title: "Network Switch",
              message: `Could not switch network to ${network.name}!`,
            },
            5000,
          );
        });
    }
  };

  const supportedNetworks = getSupportedNetworks();

  return (
    <div className="z-50">
    <NetworkSelector
      supportedNetworks={supportedNetworks}
      activeNetwork={{
        chainId: S_ACTIVE_NETWORK.value.value.chainId,
        name: S_ACTIVE_NETWORK.value.value.name,
        icon: S_ACTIVE_NETWORK.value.value.icon ?? <></>,
      }}
      onNetworkChange={handleNetworkChange}
    />
  </div>
  );
};
