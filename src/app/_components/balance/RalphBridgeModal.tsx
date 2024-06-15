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

  const supportedChains = supportedChainsDTO.data;

  const handleBridging = (destinationChainId: number, amount: number) => {
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
          setAmount(amount);
          setDestinationChain(destinationChain);
        } else {
          console.error(log(`${S_Bridging_Status.value.value.message}`));
        }
      })
      .catch((error) => {
        console.error(log("Failed to bridge"), (error as Error).message);
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
            inscriptions: balanceInfoViewModel.inscriptions,
          }}
          callbacks={{
            onBridge: handleBridging,
            onClose: onClose,
          }}
          supportedChains={supportedChains}
        />
      )}
      {S_IS_BRIDGING.value.value && destinationChain && (
        <BridgeModalBridgingVariant
          amount={amount}
          fromNetwork={S_ACTIVE_NETWORK.value.value}
          onClose={onClose}
          status="success"
          toNetwork={destinationChain}
          transaction={{
            blockNumber: 123456,
            explorerUrl: "https://etherscan.io/tx/0x1234567890",
            from: "0x1234567890",
            hash: "0x1234567890",
            network: {
              chainId: 1,
              name: "Ethereum",
            },
            status: "error",
            timestamp: 1234567890,
          }}
        />
      )}
    </div>
  );
}
