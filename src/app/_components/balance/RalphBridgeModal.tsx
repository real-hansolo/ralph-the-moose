import { BridgeModalBridgingVariant, BridgeModalDefaultVariant, RalphLogo, useToast } from "@maany_shr/ralph-the-moose-ui-kit";
import { useSignal, useSignals } from "@preact/signals-react/runtime";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { TNetwork } from "~/lib/core/entity/models";
import type { TSignal } from "~/lib/core/entity/signals";
import type NetworkGatewayOutputPort from "~/lib/core/ports/secondary/network-gateway-output-port";
import type { TBalanceInfoViewModel } from "~/lib/core/view-models/balance-info-view-model";
import type { TBridgingViewModel } from "~/lib/core/view-models/bridging-view-model";
import { clientContainer, signalsContainer } from "~/lib/infrastructure/config/ioc/container";
import { CONTROLLER, GATEWAYS, SIGNALS } from "~/lib/infrastructure/config/ioc/symbols";
import type BalanceInfoController from "~/lib/infrastructure/controllers/balance-info-controller";
import type BridgingController from "~/lib/infrastructure/controllers/bridging-controller";

export interface RalphBridgeModal {
  onClose: () => void;
}

export default function RalphBridgeModal({ onClose }: RalphBridgeModal) {
  useSignals();
  const toast = useToast();

  const networkGateway = clientContainer.get<NetworkGatewayOutputPort>(GATEWAYS.NETWORK_GATEWAY);
  const supportedChainsDTO = networkGateway.getSupportedNetworks();

  const [amount, setAmount] = useState<number>(0);
  const [destinationChain, setDestinationChain] = useState<TNetwork>();
  const log = (message: string) => {
    const timestamp = new Date().toISOString();
    return `[RalphBridgeModal] [${timestamp}] ${message}`;
  };

  const S_ACTIVE_NETWORK = signalsContainer.get<TSignal<TNetwork>>(SIGNALS.ACTIVE_NETWORK);
  const S_IS_BRIDGING = signalsContainer.get<TSignal<boolean>>(SIGNALS.IS_BRIDGING);
  const S_BALANCE_INFO = signalsContainer.get<TSignal<TBalanceInfoViewModel>>(SIGNALS.BALANCE_INFO);
  const balanceInfoController = clientContainer.get<BalanceInfoController>(CONTROLLER.BALANCE_INFO_CONTROLLER);

  const S_Bridging_Status = {
    name: "Bridging Status Signal",
    description: "Signal for Bridging Status",
    value: useSignal<TBridgingViewModel>({
      status: "request",
      message: "Initiating Bridging",
      fromNetwork: S_ACTIVE_NETWORK.value.value,
      toNetwork: S_ACTIVE_NETWORK.value.value,
      amount: amount,
    }),
  };

  const { data, isLoading, isError } = useQuery<TBalanceInfoViewModel>({
    queryKey: ["BalanceInfo"],
    queryFn: async () => {
      await balanceInfoController.execute({
        response: S_BALANCE_INFO,
      });
      return S_BALANCE_INFO.value.value;
    },
    refetchInterval: 10,
  });

  const balanceInfoViewModel = useMemo(() => {
    const defaultBalanceInfo = {
      inscriptions: 0,
      wrapped: 0,
    };

    if (!data || isLoading) {
      console.log(log("Querying balance info..."));
      return defaultBalanceInfo;
    }
    if (isError) {
      console.error(log("Query Failed to get balance info"));
      return defaultBalanceInfo;
    }
    if (data.status === "success") {
      return data.balance;
    }
    console.error(log(data.data.message));
    return defaultBalanceInfo;
  }, [data, isLoading, isError]);

  if (!supportedChainsDTO.success) {
    console.error(`Error getting supported networks`);
    toast?.openToast(
      {
        status: "error",
        id: "network-configuration-error",
        title: "Network Configuration Error",
        message: "Error getting supported networks",
      },
      5000,
    );
    return;
  }

  const supportedChains = supportedChainsDTO.data.map((network) => ({
    ...network,
    bridgingFee: network.fee.bridging,
    nativeCurrency: network.nativeCurrency,
  }));

  const handleBridging = (destinationChainId: number, amount: number) => {
    S_IS_BRIDGING.value.value = true;
    setAmount(amount);
    const destinationChainDTO = networkGateway.getNetwork(destinationChainId);
    if (!destinationChainDTO.success) {
      console.error(log(`Error getting network configuration for networkId: ${destinationChainId}`));
      toast?.openToast(
        {
          status: "error",
          id: "network-configuration-error",
          title: "Network Configuration Error",
          message: `Error getting network configuration for networkId: ${destinationChainId}`,
        },
        5000,
      );
      return;
    }
    setDestinationChain(destinationChainDTO.data);
    const bridgingController = clientContainer.get<BridgingController>(CONTROLLER.BRIDGING_CONTROLLER);
    bridgingController
      .execute({
        networkId: S_ACTIVE_NETWORK.value.value.chainId,
        toNetworkId: destinationChainId,
        amount,
        response: S_Bridging_Status,
      })
      .then(() => {
        if (S_Bridging_Status.value.value.status === "success") {
          toast?.openToast(
            {
              status: "success",
              id: `bridging-success-${new Date().getTime()}`,
              title: "Bridging Success",
              message: `Successfully bridged ${amount} PR from ${S_ACTIVE_NETWORK.value.value.name} to ${destinationChainDTO.data.name}`,
            },
            5000,
          );
        } else if (S_Bridging_Status.value.value.status === "error") {
          console.error(log(`${S_Bridging_Status.value.value.message}`));
          toast?.openToast(
            {
              status: "error",
              id: `bridging-error-${new Date().getTime()}`,
              title: "Bridging Error",
              message: S_Bridging_Status.value.value.message,
            },
            5000,
          );
        }
      })
      .catch((error) => {
        console.error(log("Failed to bridge"), (error as Error).message);
        S_Bridging_Status.value.value = {
          status: "error",
          type: "generic-error",
          message: (error as Error).message,
          amount: amount,
          fromNetwork: S_ACTIVE_NETWORK.value.value,
          toNetwork: destinationChainDTO.data,
        };
        toast?.openToast(
          {
            status: "error",
            id: `bridging-error-${new Date().getTime()}`,
            title: "Bridging Error",
            message: (error as Error).message,
          },
          5000,
        );
      })
      .finally(() => {
        setTimeout(() => {
          S_IS_BRIDGING.value.value = false;
        }, 5000);
      });
  };

  return (
    <div>
      {!S_IS_BRIDGING.value.value && (
        <BridgeModalDefaultVariant
          activeChain={{
            ...S_ACTIVE_NETWORK.value.value,
            bridgingFee: S_ACTIVE_NETWORK.value.value.fee.bridging,
            nativeCurrency: S_ACTIVE_NETWORK.value.value.nativeCurrency,
          }}
          token={{
            shortName: "PR",
            icon: <RalphLogo variant="icon" />,
          }}
          balance={{
            inscriptions: balanceInfoViewModel.wrapped,
          }}
          callbacks={{
            onBridge: handleBridging,
            onClose: onClose,
          }}
          supportedChains={supportedChains}
        />
      )}
      {S_IS_BRIDGING.value.value && destinationChain && <BridgeModalBridgingVariant {...{ ...S_Bridging_Status.value.value }} onClose={onClose} />}
    </div>
  );
}
