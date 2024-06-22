import { RalphLogo, UnwrapModalDefaultVariant, UnwrapModalUnwrappingVariant, useToast } from "@maany_shr/ralph-the-moose-ui-kit";
import { useSignal, useSignals } from "@preact/signals-react/runtime";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { TNetwork } from "~/lib/core/entity/models";
import type { TSignal } from "~/lib/core/entity/signals";
import type { TBalanceInfoViewModel } from "~/lib/core/view-models/balance-info-view-model";
import type { TUnwrappingViewModel } from "~/lib/core/view-models/unwrapping-view-model";
import { clientContainer, signalsContainer } from "~/lib/infrastructure/config/ioc/container";
import { CONTROLLER, SIGNALS } from "~/lib/infrastructure/config/ioc/symbols";
import type BalanceInfoController from "~/lib/infrastructure/controllers/balance-info-controller";
import type UnwrappingController from "~/lib/infrastructure/controllers/unwrapping-controller";

export interface RalphUnwrapModalProps {
  onClose: () => void;
}

export default function RalphUnwrapModal({ onClose }: RalphUnwrapModalProps) {
  useSignals();
  //   const [view, setView] = useState<"unwrap" | "unwrapping">("unwrap");
  const log = (message: string) => {
    const timestamp = new Date().toISOString();
    return `[RalphUnwrapModal] [${timestamp}] ${message}`;
  };
  const toast = useToast();
  const [unwrapAmount, setUnwrapAmount] = useState<number>(0);

  const S_IS_UNWRAPPING = signalsContainer.get<TSignal<boolean>>(SIGNALS.IS_UNWRAPPING);
  const S_ACTIVE_NETWORK = signalsContainer.get<TSignal<TNetwork>>(SIGNALS.ACTIVE_NETWORK);

  const S_Unwrapping_Status = {
    name: "Unwrapping Status Signal",
    description: "Signal for Unwrapping Status",
    value: useSignal<TUnwrappingViewModel>({
      status: "request",
      message: "Initiating Unwrapping",
      amount: unwrapAmount,
      type: "request",
    }),
  };
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

  const handleUnwrap = (amount: number) => {
    setUnwrapAmount(amount);
    S_IS_UNWRAPPING.value.value = true;
    const unwrapController = clientContainer.get<UnwrappingController>(CONTROLLER.UNWRAPPING_CONTROLLER);
    unwrapController
      .execute({
        response: S_Unwrapping_Status,
        amount: amount,
      })
      .then(() => {
        toast?.openToast({
          message: "Your presents are in your wallet. Enjoy!",
          status: "success",
          id: `unwrap-success-${Date.now()}`,
          title: "It's Unwrapped!",
        }, 5000);
      })
      .catch((e) => {
        S_Unwrapping_Status.value.value = {
          status: "error",
          message: (e as Error).message,
          amount: amount,
          type: "unknown",
        };
        // wait for 5 seconds before showing the toast
        setTimeout(() => {
        }, 10000);
        toast?.openToast({
          message: `Couldn't unwrap ${amount} PR. Please try again.`,
          status: "error",
          id: `unwrap-failed-${Date.now()}`,
          title: "Unwrapping Failed",
        }, 5000);
      })
      .finally(() => {
        setTimeout(() => {
          S_IS_UNWRAPPING.value.value = false;
        }, 5000);
      });
  };
  return (
    <div>
      {!S_IS_UNWRAPPING.value.value && (
        <UnwrapModalDefaultVariant
          balance={{
            inscriptions: balanceInfoViewModel.inscriptions,
            wrapped: balanceInfoViewModel.wrapped,
          }}
          callbacks={{
            onUnwrap: handleUnwrap,
            onClose: onClose,
          }}
          fee={S_ACTIVE_NETWORK.value.value.fee.unwrapping}
          network={S_ACTIVE_NETWORK.value.value}
          token={{
            icon: <RalphLogo variant="icon" />,
            shortName: "PR",
          }}
        />
      )}
      {S_IS_UNWRAPPING.value.value && <UnwrapModalUnwrappingVariant {...{ ...S_Unwrapping_Status.value.value }} onClose={onClose} />}
    </div>
  );
}
