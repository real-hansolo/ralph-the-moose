import { PageTemplate } from "~/lib";
import { RalphWalletCard } from "../_components/RalphWalletCard";
import { useAddress, useDisconnect, useWallet } from "@thirdweb-dev/react";
import { RalphMintCard } from "../_components/RalphMintCard";
import MintCardPresenter from "~/lib/infrastructure/presenters/MintCardPresenter";
import { useQuery } from "@tanstack/react-query";
import type MintCardViewModel from "~/lib/infrastructure/view-models/MintCardViewModel";
import BalanceCardPresenter from "~/lib/infrastructure/presenters/BalanceCardPresenter";
import type BalanceCardViewModel from "~/lib/infrastructure/view-models/BalanceCardViewModel";
import { RalphBalaceCard } from "../_components/RalphBalanceCard";


export const RalphHome = () => {
  /**
   * Hooks and Wallet Information
   */
  const walletAddress = useAddress();
  const wallet = useWallet();
  const disconnect = useDisconnect();
  const isWalletConnected = walletAddress !== undefined;

  /**
   * Query Clients
   */
  // 1. query for current network, return a signal with current network
  // 2. query for network mismatch, return a signal checking the wallet netowkr and the current network
  // 3. Signal for toasts
  const mintCardPresenter = new MintCardPresenter();
  const { data: mintCardViewModel } = useQuery<MintCardViewModel>({
    queryKey: ["MintCard"],
    queryFn: async () => {
      const viewModel = await mintCardPresenter.present();
      return viewModel;
    },
    refetchInterval: 1000,
  });

  const balanceCardPresenter = new BalanceCardPresenter();
  const {data: balanceCardViewModel} = useQuery<BalanceCardViewModel>({
    queryKey: ["BalanceCard"],
    queryFn: async () => {
      const viewModel = await balanceCardPresenter.present();
      return viewModel;
    },
    refetchInterval: 1000,
  })
  return (
    <div id="app-container">
      <PageTemplate>
        {!isWalletConnected && (
          <RalphWalletCard
            status={isWalletConnected ? "connected" : "disconnected"}
            walletAddress={walletAddress ? walletAddress : ""}
            walletId={wallet ? wallet.walletId : ""}
            onDisconnect={disconnect}
          />
        )}
        {mintCardViewModel && <RalphMintCard {...mintCardViewModel} />}
        {balanceCardViewModel && <RalphBalaceCard {...balanceCardViewModel} />}
        {isWalletConnected && (
          <RalphWalletCard
            status={isWalletConnected ? "connected" : "disconnected"}
            walletAddress={walletAddress ? walletAddress : ""}
            walletId={wallet ? wallet.walletId : ""}
            onDisconnect={disconnect}
          />
        )}
      </PageTemplate>
    </div>
  );
};
