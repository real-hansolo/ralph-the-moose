import { type Signal } from "@preact/signals-react";
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
      console.log(`[Balance View Model]: ${JSON.stringify(viewModel)}`)
      return viewModel;
    },
    refetchInterval: 1000,
  });

  const balanceCardViewModel: {
    inscriptionBalance: number;
    wrappedBalance: number;
    fee: number;
    claimableWrappedBalance: number;
    tokenShortName: string;
    icon: React.ReactNode;
  } = useMemo(() => {
    const defaultData = {
      inscriptionBalance: 0,
      wrappedBalance: 0,
      fee: 0,
      claimableWrappedBalance: 0,
      tokenShortName: "PR", // TODO: hardcoded value,
      icon: <RalphLogo variant="icon" /> // TODO: hardcoded value,
    };
    if(!data || isLoading) {
      return defaultData;
    }
    if(isError) {
      return defaultData;
    }
    if(!data.status) {
      return defaultData;
    }
    if(data.status === "error") {
      return defaultData;
    }
    if(data.status === "success") {
      return {
        inscriptionBalance: data.data.inscriptionBalance.value ?? 0,
        wrappedBalance: data.data.wrappedBalance.value ?? 0,
        fee: data.data.fee.value ?? 0,
        claimableWrappedBalance: data.data.claimableWrappedBalance.value ?? 0,
        tokenShortName: "PR", // TODO: hardcoded value,
        icon: <RalphLogo variant="icon" /> // TODO: hardcoded value,
      }
    }
    return defaultData;
    
    }, [data, isLoading, isError]);

  return(
    <BalanceCard
      inscriptionBalance={balanceCardViewModel.inscriptionBalance}
      wrappedBalance={balanceCardViewModel.wrappedBalance}
      claimableAmount={balanceCardViewModel.claimableWrappedBalance}
      fee={balanceCardViewModel.fee}
      tokenShortName={balanceCardViewModel.tokenShortName}
      icon={balanceCardViewModel.icon} 
      onWrap={() => {}} // TODO: implement
      onUnwrap={() => {}} // TODO: implement
      onClaim={() => {}} // TODO: implement
    />
  )
};
