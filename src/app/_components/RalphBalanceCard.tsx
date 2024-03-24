import { useSignal, type Signal } from "@preact/signals-react";
import { useQuery } from "@tanstack/react-query";
import { useAddress, useChainId, useWallet } from "@thirdweb-dev/react";
import { useMemo } from "react";
import { env } from "~/env";
import { BalanceCard, type ToastProps } from "~/lib";
import { RalphLogo } from "~/lib/components/ralph-logo";
import { type TChainConfig } from "~/lib/infrastructure/config/chains";
import IndexerGateway from "~/lib/infrastructure/gateways/indexer";
import Web3Gateway from "~/lib/infrastructure/gateways/web3";
import BalanceCardPresenter from "~/lib/infrastructure/presenters/BalanceCardPresenter";
import type BalanceCardViewModel from "~/lib/infrastructure/view-models/BalanceCardViewModel";
import { wrap } from "./controllers/WrapController";
import { toHex } from "thirdweb";

export const RalphBalaceCard = ({
  toasts,
  activeNetwork,
}: {
  activeNetwork: Signal<TChainConfig>;
  toasts: Signal<ToastProps[]>;
}) => {
  const wallet = useWallet();
  const walletAddress = useAddress();
  const walletChainID = useChainId();
  const indexerHost = env.NEXT_PUBLIC_INDEXER_URL;
  const indexerGateway = new IndexerGateway(indexerHost);

  const web3Gateway = new Web3Gateway(wallet, toasts);
  const balanceCardPresenter = new BalanceCardPresenter(
    indexerGateway,
    web3Gateway,
    walletAddress,
    walletChainID,
    activeNetwork,
  );
  const { data, isLoading, isError } = useQuery<BalanceCardViewModel>({
    queryKey: ["BalanceCard"],
    queryFn: async () => {
      const viewModel = await balanceCardPresenter.present();
      console.log(`[Balance View Model]: ${JSON.stringify(viewModel)}`);
      return viewModel;
    },
    refetchInterval: 1000,
  });
  const amountToWrap = useSignal<number>(0);
  const amountToUnwrap = useSignal<number>(0);

  const SWrapStatusMessage = useSignal<string>("");
  const SWrapCardView = useSignal<"wrapping" | "claiming" | "default">(
    "default",
  );

  const onWrap = () => {
    SWrapCardView.value = "wrapping";
    // check wallet
    if (!wallet || !walletAddress || !walletChainID) {
      toasts.value.push({
        message: "Please connect your wallet",
        title: "Wall-E.T.",
        status: "error",
      });
      return;
    }
    if(toHex(activeNetwork.value.chainId) !== toHex(walletChainID)) {
      toasts.value = [{
        message: "Please connect to the correct network",
        title: "Network Error",
        status: "error",
      }];
      return;
    }
    wrap(
      web3Gateway,
      amountToWrap.value,
      activeNetwork.value,
      SWrapStatusMessage,
    )
      .then((result) => {
        if (result) {
          SWrapStatusMessage.value = "Looking good! Come back later to claim your PRs!";
          // wait 2 seconds
          setTimeout(() => {
          }, 2000);
          toasts.value.push({
            message: `You wrapd' ${amountToWrap.value} PR, like its hot!`,
            title: "It's a wrap!",
            status: "success",
          });
        }
      })
      .catch((error) => {
        console.error("[WRAP] Wrap failed", error);
        SWrapStatusMessage.value = "Shit happens! Try again later";
        setTimeout(() => {
        }, 2000);
        toasts.value.push({
          message: `You wrapd' ${amountToWrap.value} PR, like its hot!`,
          title: "It's a wrap!",
          status: "error",
        });
      })
      .finally(() => {
        SWrapCardView.value = "default";
      });
  };
  const balanceCardViewModel: {
    inscriptionBalance: number;
    wrappedBalance: number;
    fee: number;
    claimableInscriptions: number;
    tokenShortName: string;
    icon: React.ReactNode;
  } = useMemo(() => {
    const defaultData = {
      inscriptionBalance: 0,
      wrappedBalance: 0,
      fee: 0,
      claimableInscriptions: 0,
      tokenShortName: "PR", // TODO: hardcoded value,
      icon: <RalphLogo variant="icon" />, // TODO: hardcoded value,
    };
    if (!data || isLoading) {
      return defaultData;
    }
    if (isError) {
      return defaultData;
    }
    if (!data.status) {
      return defaultData;
    }
    if (data.status === "error") {
      return defaultData;
    }
    if (data.status === "success") {
      return {
        inscriptionBalance: data.data.inscriptionBalance.value ?? 0,
        wrappedBalance: data.data.wrappedBalance.value ?? 0,
        fee: data.data.fee.value ?? 0,
        claimableInscriptions: data.data.claimableInscriptions.value ?? 0,
        tokenShortName: "PR", // TODO: hardcoded value,
        icon: <RalphLogo variant="icon" />, // TODO: hardcoded value,
      };
    }
    return defaultData;
  }, [data, isLoading, isError]);

  return (
    <BalanceCard
      inscriptionBalance={balanceCardViewModel.inscriptionBalance}
      wrappedBalance={balanceCardViewModel.wrappedBalance}
      claimableAmount={balanceCardViewModel.claimableInscriptions}
      fee={balanceCardViewModel.fee}
      tokenShortName={balanceCardViewModel.tokenShortName}
      icon={balanceCardViewModel.icon}
      onWrap={onWrap}
      onUnwrap={() => {}} // TODO: implement
      onClaim={() => {}} // TODO: implement
      amountToWrap={amountToWrap}
      amountToUnwrap={amountToUnwrap}
      SWrapStatusMessage={SWrapStatusMessage}
      SWrapCardView={SWrapCardView}
    />
  );
};
