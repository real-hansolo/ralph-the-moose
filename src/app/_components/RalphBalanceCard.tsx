import { useSignal, type Signal } from "@preact/signals-react";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { env } from "~/env";
import { BalanceCard, type ToastProps } from "~/lib";
import { RalphLogo } from "~/lib/components/ralph-logo";
import { type TChainConfig } from "~/lib/infrastructure/config/chains";
import IndexerGateway from "~/lib/infrastructure/gateways/indexer";
import Web3Gateway from "~/lib/infrastructure/gateways/web3";
import BalanceCardPresenter from "~/lib/infrastructure/presenters/BalanceCardPresenter";
import type BalanceCardViewModel from "~/lib/infrastructure/view-models/BalanceCardViewModel";
import { claim, wrap } from "./controllers/WrapController";
import { type Chain, toHex } from "thirdweb";
import { type Account, type Wallet } from "thirdweb/wallets";
import { type BaseErrorViewModel } from "~/lib/infrastructure/view-models/base";

export const RalphBalaceCard = ({
  toasts,
  activeNetwork,
  connectedWallet,
  connectedAccount,
  connectedWalletNetwork,
}: {
  activeNetwork: Signal<TChainConfig>;
  toasts: Signal<ToastProps[]>;
  /**
   * The connected wallet
   */
  connectedWallet?: Wallet;
  /**
   * The connected account
   */
  connectedAccount?: Account;
  /**
   * Connected Wallet's Network
   */
  connectedWalletNetwork: Chain | undefined;
}) => {
  const indexerHost = env.NEXT_PUBLIC_INDEXER_URL;
  const indexerGateway = new IndexerGateway(indexerHost);

  const web3Gateway = new Web3Gateway();

  const balanceCardPresenter = new BalanceCardPresenter(
    indexerGateway,
    web3Gateway,
    connectedAccount?.address ?? "",
    connectedWalletNetwork?.id ?? 0,
    activeNetwork,
  );
  const { data, isLoading, isError } = useQuery<BalanceCardViewModel>({
    queryKey: ["BalanceCard"],
    queryFn: async () => {
      if(!connectedWallet || !connectedAccount || !connectedWalletNetwork) {
        return {
          status: "error",
          title: "Wallet not connected!",
          message: "Could not fetch balance data. Please connect your wallet."
        } as BaseErrorViewModel;
      }
      if(toHex(connectedWalletNetwork.id) !== toHex(activeNetwork.value.chainId)) {
        return {
          status: "error",
          title: "Network Error",
          message: `Please connect your wallet to the correct network. Expected ${activeNetwork.value.name} but connected to ${connectedWalletNetwork.name}`
        } as BaseErrorViewModel;
      }
      const viewModel = await balanceCardPresenter.present();
      console.log(`[Balance View Model]: ${JSON.stringify(viewModel)}`);
      return viewModel;
    },
    refetchInterval: 1000,
  });
  const amountToWrap = useSignal<number>(0);
  const amountToUnwrap = useSignal<number>(0);

  const SWrapStatusMessage = useSignal<string>("");
  const SClaimStatusMessage = useSignal<string>("");
  const SWrapCardView = useSignal<"wrapping" | "claiming" | "default">(
    "default",
  );

  const onClaim = () => {
    // check wallet
    // if (!wallet || !walletAddress || !walletChainID) {
    //   toasts.value.push({
    //     message: "Please connect your wallet",
    //     title: "Wall-E.T.",
    //     status: "error",
    //   });
    //   return;
    // }
    // if(toHex(activeNetwork.value.chainId) !== toHex(walletChainID)) {
    //   toasts.value = [{
    //     message: "Please connect to the correct network",
    //     title: "Network Error",
    //     status: "error",
    //   }];
    //   return;
    // }
    if(!data || isLoading || isError || !data.status || data.status !== "success") {
      toasts.value.push({
        message: "Tryin' to claim, but something went wrong!",
        title: "Try again later",
        status: "error",
      });
      return;
    }
    
    if(data.data.claimableInscriptions.value === 0) {
      toasts.value.push({
        message: "You have no PR to claim",
        title: "No PR",
        status: "error",
      });
      return;
    }

    SWrapCardView.value = "claiming";

    claim(
      web3Gateway,
      data.data.claimableInscriptions.value,
      activeNetwork.value,
      SClaimStatusMessage,
    )
      .then(async (result) => {
        if (result) {
          SWrapStatusMessage.value = "All's good in the hood!";
          // wait 2 seconds
          await new Promise(resolve => setTimeout(resolve, 2000));
          toasts.value.push({
            message: `You claimed' ${amountToUnwrap.value} PR!`,
            title: "You own it!",
            status: "success",
          });
        }
      })
      .catch(async (error) => {
        console.error("[CLAIM] Claim failed", error);
        SWrapStatusMessage.value = error;
        toasts.value.push({
          message: `Get in touch and we can work this out!`,
          title: "Claim failed!",
          status: "error",
        });
        await new Promise(resolve => setTimeout(resolve, 2000));
      })
      .finally(() => {
        SWrapCardView.value = "default";
      });
  }
    
  const onWrap = () => {
    SWrapCardView.value = "wrapping";
    // check wallet
    if (!connectedAccount || !connectedWallet || !connectedWalletNetwork) {
      toasts.value.push({
        message: "Please connect your wallet",
        title: "Wall-E.T.",
        status: "error",
      });
      return;
    }
    if(toHex(activeNetwork.value.chainId) !== toHex(connectedWalletNetwork.id)) {
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
      connectedWallet,
      connectedAccount,
      activeNetwork.value,
      SWrapStatusMessage,
    )
      .then(async (result) => {
        if (result) {
          SWrapStatusMessage.value = "Looking good! Come back later to claim your PRs!";
          // wait 2 seconds
          await new Promise(resolve => setTimeout(resolve, 2000));
          toasts.value.push({
            message: `You wrapd' ${amountToWrap.value} PR, like its hot!`,
            title: "It's a wrap!",
            status: "success",
          });
        }
      })
      .catch(async (error) => {
        console.error("[WRAP] Wrap failed", error);
        SWrapStatusMessage.value = "Shit happens! Try again later";
        await new Promise(resolve => setTimeout(resolve, 2000));
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
      onClaim={onClaim}
      amountToWrap={amountToWrap}
      amountToUnwrap={amountToUnwrap}
      SWrapStatusMessage={SWrapStatusMessage}
      SWrapCardView={SWrapCardView}
      SClaimStatusMessage={SClaimStatusMessage}
    />
  );
};
