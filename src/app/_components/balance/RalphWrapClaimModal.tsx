import { RalphLogo, WrapClaimModal } from "@maany_shr/ralph-the-moose-ui-kit";
import { useSignal, useSignals } from "@preact/signals-react/runtime";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { TSignal } from "~/lib/core/entity/signals";
import type { TBalanceInfoViewModel } from "~/lib/core/view-models/balance-info-view-model";
import type { TWrappingViewModel } from "~/lib/core/view-models/wrapping-view-model";
import { clientContainer, signalsContainer } from "~/lib/infrastructure/config/ioc/container";
import { CONTROLLER, SIGNALS } from "~/lib/infrastructure/config/ioc/symbols";
import type BalanceInfoController from "~/lib/infrastructure/controllers/balance-info-controller";
import type WrappingController from "~/lib/infrastructure/controllers/wrapping-controller";
import { useToast } from "@maany_shr/ralph-the-moose-ui-kit";
import { TNetwork } from "~/lib/core/entity/models";
import { effect } from "@preact/signals-react";
import ClaimingController from "~/lib/infrastructure/controllers/claiming-controller";
import { TClaimingViewModel } from "~/lib/core/view-models/claiming-view-model";

export interface RalphMingintModalProps {
  onClose: () => void;
}

export default function RalphWrapClaimModal({ onClose }: RalphMingintModalProps) {
  useSignals();
  const [view, setView] = useState<"wrap" | "wrapping" | "claim" | "claiming">("wrap");
  const toast = useToast();
  const log = (message: string) => {
    const timestamp = new Date().toISOString();
    return `[RalphWrapClaimModal] [${timestamp}] ${message}`;
  };

  const S_ACTIVE_NETWORK = signalsContainer.get<TSignal<TNetwork>>(SIGNALS.ACTIVE_NETWORK);
  const S_IS_WRAPPING = signalsContainer.get<TSignal<boolean>>(SIGNALS.IS_WRAPPING);
  const S_IS_CLAIMING = signalsContainer.get<TSignal<boolean>>(SIGNALS.IS_CLAIMING);

  const S_Wrapping_Status = {
    name: "Wrapping Status Signal",
    description: "Signal for Wrapping Status",
    value: useSignal<TWrappingViewModel>({
      status: "request",
      message: "Initiating Wrapping",
    }),
  };
  const S_Claiming_Status = {
    name: "Claiming Status Signal",
    description: "Signal for Claiming Status",
    value: useSignal<TClaimingViewModel>({
      status: "request",
      message: "Initiating Claiming",
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

  const handleWrapping = (amount: number) => {
    S_IS_WRAPPING.value.value = true;
    const wrappingController = clientContainer.get<WrappingController>(CONTROLLER.WRAPPING_CONTROLLER);
    wrappingController
      .execute({
        amount,
        response: S_Wrapping_Status,
      })
      .then(() => {
        if (S_Wrapping_Status.value.value.status === "success") {
          console.info(log("Wrapping Successful" + JSON.stringify(S_Wrapping_Status.value.value)));
        }
        toast?.openToast(
          {
            message: `You have successfully wrapped ${S_Wrapping_Status.value.value.status === "success" ? S_Wrapping_Status.value.value.amount : amount} PR. `,
            status: "success",
            id: `wrapping-${S_Wrapping_Status.value.value.status}-${Date.now()}`,
            title: "It's a Wrap!",
          },
          5000,
        );
      })
      .catch((e) => {
        console.error(log("Wrapping Exception"), e);
        S_Wrapping_Status.value.value = {
          status: "error",
          message: `${(e as Error).message} `,
          amount: amount,
        };
        toast?.openToast(
          {
            message: `Failed to wrap ${amount} PR.} `,
            status: "error",
            id: `wrapping-${S_Wrapping_Status.value.value.status}-${Date.now()}`,
            title: "Wrapping Failed!",
          },
          5000,
        );
      })
      .finally(() => {
        setTimeout(() => {
          S_IS_WRAPPING.value.value = false;
        }, 5000);
      });
  };
  const handleClaiming = (amount: number) => {
    S_IS_CLAIMING.value.value = true;
    const claimingController = clientContainer.get<ClaimingController>(CONTROLLER.CLAIMING_CONTROLLER);
    claimingController
      .execute({
        amount,
        response: S_Claiming_Status,
      })
      .then(() => {
        if (S_Claiming_Status.value.value.status === "success") {
          console.info(log("Claiming Successful" + JSON.stringify(S_Claiming_Status.value.value)));
          toast?.openToast(
            {
              message: `You have successfully claimed ${S_Claiming_Status.value.value.status === "success" ? S_Claiming_Status.value.value.amount : amount} PR. `,
              status: "success",
              id: `claiming-${S_Claiming_Status.value.value.status}-${Date.now()}`,
              title: "Claimed!",
            },
            5000,
          );
        } else if (S_Claiming_Status.value.value.status === "error") {
          console.error(log(`${S_Claiming_Status.value.value.message}`));
          toast?.openToast(
            {
              message: `Failed to claim ${amount} PR. `,
              status: "error",
              id: `claiming-${S_Claiming_Status.value.value.status}-${Date.now()}`,
              title: "Claiming Failed!",
            },
            5000,
          );
        }
      })
      .catch((e) => {
        console.error(log("Claiming Exception"), e);
        S_Claiming_Status.value.value = {
          status: "error",
          message: `${(e as Error).message} `,
          amount: amount,
        };
        toast?.openToast(
          {
            message: `Failed to claim ${amount} PR.} `,
            status: "error",
            id: `claiming-${S_Claiming_Status.value.value.status}-${Date.now()}`,
            title: "Claiming Failed!",
          },
          5000,
        );
      })
      .finally(() => {
        setTimeout(() => {
          S_IS_CLAIMING.value.value = false;
        }, 5000);
      });
  };

  effect(() => {
    if (S_IS_WRAPPING.value.value) {
      if (view !== "wrapping") setView("wrapping");
    } else if (S_IS_CLAIMING.value.value) {
      if (view != "claiming") setView("claiming");
    } else if (balanceInfoViewModel.claimable > 0) {
      if (view !== "claim") setView("claim");
    } else {
      if (view !== "wrap") setView("wrap");
    }
  });
  return (
    <div>
      {view === "claim" && (
        <WrapClaimModal
          claimableAmount={balanceInfoViewModel.claimable}
          network={{
            chainId: S_ACTIVE_NETWORK.value.value.chainId,
            name: S_ACTIVE_NETWORK.value.value.name,
          }}
          onClaim={handleClaiming}
          token={{
            icon: <RalphLogo variant="icon" />,
            shortName: "PR",
          }}
          variant="claim"
          onClose={onClose}
        />
      )}
      {view === "claiming" && (
        <WrapClaimModal
          claimableAmount={balanceInfoViewModel.claimable}
          network={S_ACTIVE_NETWORK.value.value}
          token={{
            icon: <RalphLogo variant="icon" />,
            shortName: "PR",
          }}
          status={S_Claiming_Status.value.value}
          variant="claiming"
          onClose={onClose}
        />
      )}
      {view === "wrapping" && (
        <div>
          (
          <WrapClaimModal
            fee={{
              amount: S_ACTIVE_NETWORK.value.value.fee.wrapping,
              currency: S_ACTIVE_NETWORK.value.value.nativeCurrency,
            }}
            network={S_ACTIVE_NETWORK.value.value}
            status={S_Wrapping_Status.value.value}
            token={{
              icon: <RalphLogo variant="icon" />,
              shortName: "PR",
            }}
            variant="wrapping"
            onClose={onClose}
          />
        </div>
      )}
      {view === "wrap" && (
        <WrapClaimModal
          fee={{
            amount: S_ACTIVE_NETWORK.value.value.fee.wrapping,
            currency: S_ACTIVE_NETWORK.value.value.nativeCurrency,
          }}
          inscriptionBalance={balanceInfoViewModel.inscriptions}
          onWrap={handleWrapping}
          token={{
            icon: <RalphLogo variant="icon" />,
            shortName: "PR",
          }}
          variant="wrap"
          onClose={onClose}
        />
      )}
    </div>
  );
}
