import { BalanceCard } from "@maany_shr/ralph-the-moose-ui-kit";
import { useSignals } from "@preact/signals-react/runtime";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { TSignal } from "~/lib/core/entity/signals";
import type { TBalanceInfoViewModel } from "~/lib/core/view-models/balance-info-view-model";
import { clientContainer, signalsContainer } from "~/lib/infrastructure/config/ioc/container";
import { CONTROLLER, SIGNALS } from "~/lib/infrastructure/config/ioc/symbols";
import type BalanceInfoController from "~/lib/infrastructure/controllers/balance-info-controller";
import RalphWrapClaimModal from "./RalphWrapClaimModal";
import RalphUnwrapModal from "./RalphUnwrapModal";
import RalphBridgeModal from "./RalphBridgeModal";
import type { TNetwork } from "~/lib/core/entity/models";

export const RalphBalanceCard = () => {
  useSignals();
  const log = (message: string) => {
    const timestamp = new Date().toISOString();
    return `[RalphBalanceCard] [${timestamp}] ${message}`;
  };
  const [variant, setVariant] = useState<"default" | "bridge" | "wrap-claim" | "unwrap">("default");
  // Signals
  const S_BALANCE_INFO = signalsContainer.get<TSignal<TBalanceInfoViewModel>>(SIGNALS.BALANCE_INFO);
  const balanceInfoController = clientContainer.get<BalanceInfoController>(CONTROLLER.BALANCE_INFO_CONTROLLER);

  const S_ACTIVE_NETWORK = signalsContainer.get<TSignal<TNetwork>>(SIGNALS.ACTIVE_NETWORK);
  const activeNetwork = S_ACTIVE_NETWORK.value.value;


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
    <div>
      <BalanceCard
        isLoading={isLoading}
        inscriptionBalance={balanceInfoViewModel.inscriptions}
        wrappedBalance={balanceInfoViewModel.wrapped}
        tokenShortName={"PR"}
        showBridgeVariant={() => {
          setVariant("bridge");
        }}
        showUnwrapVariant={() => {
          setVariant("unwrap");
        }}
        showWrapClaimVariant={() => {
          console.error(log("showWrapClaimVariant"));
          setVariant("wrap-claim");
        }}
        features={
          {
            inscriptionBalanceSection: activeNetwork.features.wrapClaim,
            unwrap: activeNetwork.features.unwrap,
            bridge: activeNetwork.features.bridge,
          }
        }
      />
      {variant === "wrap-claim" && (
        <RalphWrapClaimModal
          onClose={() => {
            setVariant("default");
          }}
        />
      )}
      {variant === "unwrap" && (
        <RalphUnwrapModal
          onClose={() => {
            setVariant("default");
          }}
        />
      )}
      {variant === "bridge" && (
        <RalphBridgeModal
          onClose={() => {
            setVariant("default");
          }}
        />
      )}
    </div>
  );
};
