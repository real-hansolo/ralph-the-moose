import { RalphLogo, WrapClaimModal } from "@maany_shr/ralph-the-moose-ui-kit";
import { useSignals } from "@preact/signals-react/runtime";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { TSignal } from "~/lib/core/entity/signals";
import type { TBalanceInfoViewModel } from "~/lib/core/view-models/balance-info-view-model";
import { clientContainer, signalsContainer } from "~/lib/infrastructure/config/ioc/container";
import { CONTROLLER, SIGNALS } from "~/lib/infrastructure/config/ioc/symbols";
import type BalanceInfoController from "~/lib/infrastructure/controllers/balance-info-controller";

export interface RalphMingintModalProps {
  onClose: () => void;
}

export default function RalphMintClaimModal({ onClose }: RalphMingintModalProps) {
  useSignals();
  const log = (message: string) => {
    const timestamp = new Date().toISOString();
    return `[RalphMintClaimModal] [${timestamp}] ${message}`;
  };

  const S_IS_WRAPPING = signalsContainer.get<TSignal<boolean>>(SIGNALS.IS_WRAPPING);
  const S_IS_CLAIMING = signalsContainer.get<TSignal<boolean>>(SIGNALS.IS_CLAIMING);

  const S_BALANCE_INFO = signalsContainer.get<TSignal<TBalanceInfoViewModel>>(SIGNALS.BALANCE_INFO);
  const balanceInfoController = clientContainer.get<BalanceInfoController>(CONTROLLER.BALANCE_INFO_CONTROLLER);

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
      claimable: 0,
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

  if (S_IS_WRAPPING.value.value) {
    return (
      <WrapClaimModal
        amountToWrap={10}
        fee={{
          amount: 0.00123,
          currency: "ETH",
        }}
        network={{
          chainId: 1,
          name: "Ethereum",
        }}
        status={{
          message: "Please confirm the transaction in your wallet.",
          type: "awaiting-transaction",
        }}
        token={{
          icon: <RalphLogo variant="icon" />,
          shortName: "PR",
        }}
        variant="wrapping"
        onClose={onClose}
      />
    );
  }

  if (S_IS_CLAIMING.value.value) {
    return (
      <WrapClaimModal
        claimableAmount={1000}
        network={{
          chainId: 1,
          name: "Ethereum",
        }}
        status={{
          message: "Please confirm the transaction in your wallet.",
          type: "awaiting-transaction",
        }}
        token={{
          icon: <RalphLogo variant="icon" />,
          shortName: "PR",
        }}
        variant="claiming"
        onClose={onClose}
      />
    );
  }

  if (balanceInfoViewModel.claimable > 0) {
    return (
      <WrapClaimModal
        claimableAmount={100000}
        network={{
          chainId: 1,
          name: "Ethereum",
        }}
        onClaim={() => {}}
        token={{
          icon: <RalphLogo variant="icon" />,
          shortName: "PR",
        }}
        variant="claim"
        onClose={onClose}
      />
    );
  }

  return (
    <WrapClaimModal
      fee={{
        amount: 0.00123,
        currency: "ETH",
      }}
      inscriptionBalance={balanceInfoViewModel.inscriptions}
      onWrap={() => {}}
      token={{
        icon: <RalphLogo variant="icon" />,
        shortName: "PR",
      }}
      variant="wrap"
      onClose={onClose}
    />
  );
}
