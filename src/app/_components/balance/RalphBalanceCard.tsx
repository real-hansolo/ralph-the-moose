import { BalanceCard } from "@maany_shr/ralph-the-moose-ui-kit";
import { useSignals } from "@preact/signals-react/runtime";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { TSignal } from "~/lib/core/entity/signals";
import type { TBalanceInfoViewModel } from "~/lib/core/view-models/balance-info-view-model";
import { clientContainer, signalsContainer } from "~/lib/infrastructure/config/ioc/container";
import { CONTROLLER, SIGNALS } from "~/lib/infrastructure/config/ioc/symbols";
import type BalanceInfoController from "~/lib/infrastructure/controllers/balance-info-controller";

export const RalphBalanceCard = () => {
  useSignals();
  const log = (message: string) => {
    const timestamp = new Date().toISOString();
    return `[RalphBalanceCard] [${timestamp}] ${message}`;
  };
  // Signals
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

  return (
    <BalanceCard
      inscriptionBalance={balanceInfoViewModel.inscriptions}
      wrappedBalance={balanceInfoViewModel.wrapped}
      tokenShortName={"PR"}
      showBridgeVariant={() => {}}
      showUnwrapVariant={() => {}}
      showWrapClaimVariant={() => {}}
    />
  );
};
