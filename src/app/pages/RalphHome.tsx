import { PageTemplate } from "~/lib";
import { RalphWalletCard } from "../_components/RalphWalletCard";
import {
  type WalletInstance,
  useAddress,
  useDisconnect,
  useWallet,
} from "@thirdweb-dev/react";
import { RalphMintCard } from "../_components/RalphMintCard";
import MintCardPresenter from "~/lib/infrastructure/presenters/MintCardPresenter";
import { useQuery } from "@tanstack/react-query";
import type MintCardViewModel from "~/lib/infrastructure/view-models/MintCardViewModel";
import BalanceCardPresenter from "~/lib/infrastructure/presenters/BalanceCardPresenter";
import type BalanceCardViewModel from "~/lib/infrastructure/view-models/BalanceCardViewModel";
import { RalphBalaceCard } from "../_components/RalphBalanceCard";
import { toasts } from "~/lib/infrastructure/signals";
import { useEffect } from "react";

export const RalphHome = () => {
  /**
   * Hooks and Wallet Information
   */
  const walletAddress = useAddress();
  const wallet: WalletInstance | undefined = useWallet();
  const disconnect = useDisconnect();
  const isWalletConnected = walletAddress !== undefined;

  useEffect(() => {
    if (wallet) {
      wallet.on("disconnect", () => {
        toasts.value = [{
          title: "Wallet Disconnected!",
          message: "Hasta la vista, baby!",
          status: "warning",
          isPermanent: false,
        }];
      });
      wallet.on("change", () => {
        toasts.value = [{
          title: "Wallet Changed!",
          message: "Wallet has been changed!",
          status: "warning",
          isPermanent: false,
        }];
      });
    }
  }, [wallet]);
  /**
   * Query Clients
   */
  // 1. query for current network, return a signal with current network
  // 2. query for network mismatch, return a signal checking the wallet netowkr and the current network
  // 3. Signal for toasts
  const mintCardPresenter = new MintCardPresenter(wallet);
  const { data: mintCardViewModel } = useQuery<MintCardViewModel>({
    queryKey: ["MintCard"],
    queryFn: async () => {
      const viewModel = await mintCardPresenter.present();
      return viewModel;
    },
    refetchInterval: 3000,
  });

  const balanceCardPresenter = new BalanceCardPresenter();
  const { data: balanceCardViewModel } = useQuery<BalanceCardViewModel>({
    queryKey: ["BalanceCard"],
    queryFn: async () => {
      const viewModel = await balanceCardPresenter.present();
      return viewModel;
    },
    refetchInterval: 1000,
  });

  return (
    <div id="app-container">
      <PageTemplate toasts={toasts}>
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
