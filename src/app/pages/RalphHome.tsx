import { PageTemplate, type ToastProps } from "~/lib";
import { RalphWalletCard } from "../_components/RalphWalletCard";
import {
  type WalletInstance,
  useAddress,
  useDisconnect,
  useWallet,
} from "@thirdweb-dev/react";
import { RalphMintCard } from "../_components/RalphMintCard";
import { useQuery } from "@tanstack/react-query";
import BalanceCardPresenter from "~/lib/infrastructure/presenters/BalanceCardPresenter";
import type BalanceCardViewModel from "~/lib/infrastructure/view-models/BalanceCardViewModel";
import { RalphBalaceCard } from "../_components/RalphBalanceCard";
import { useSignal } from "@preact/signals-react";
import { useEffect } from "react";
import { DEFAULT_CHAIN, SUPPORTED_CHAINS, type TChainConfig } from "~/lib/infrastructure/config/chains";
import { useSignals } from "@preact/signals-react/runtime";

export const RalphHome = () => {
  useSignals();
  /**
   * Hooks and Wallet Information
   */
  const walletAddress = useAddress();
  const wallet: WalletInstance | undefined = useWallet();
  const disconnect = useDisconnect();
  const isWalletConnected = walletAddress !== undefined;

  /**
   * [Signal] Toasts: Store the toasts to be displayed on the screen.
   */
  const toasts = useSignal<ToastProps[]>([]);
  const activeNetwork = useSignal<TChainConfig>(DEFAULT_CHAIN);
  useEffect(() => {
    if (wallet) {
      wallet.on("disconnect", () => {
        toasts.value.push({
          title: "Wallet Disconnected!",
          message: "Hasta la vista, baby!",
          status: "warning",
          isPermanent: false,
        });
      });
      // wallet.on("change", () => {
      //   toasts.value.push({
      //     title: "Wallet and Account Connected!",
      //     message: "",
      //     status: "success",
      //     isPermanent: false,
      //   });
      // });
    }
  }, [wallet, toasts.value]);

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
      <PageTemplate toasts={toasts} supportedNetworks={SUPPORTED_CHAINS} activeNetwork={activeNetwork}>
        {!isWalletConnected && (
          <RalphWalletCard
            status={isWalletConnected ? "connected" : "disconnected"}
            walletAddress={walletAddress ? walletAddress : ""}
            walletId={wallet ? wallet.walletId : ""}
            onDisconnect={disconnect}
          />
        )}
        <RalphMintCard toasts={toasts} activeNetwork={activeNetwork}/>
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
