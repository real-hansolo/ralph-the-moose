import { BalanceCard, PageTemplate } from "~/lib";
import { RalphWalletCard } from "../_components/RalphWalletCard";
import { useAddress, useDisconnect, useWallet } from "@thirdweb-dev/react";
import { RalphMintCard } from "../_components/RalphMintCard";
import MintCardPresenter from "~/lib/infrastructure/presenters/MintCardPresenter";
import { useQuery } from "@tanstack/react-query";
import MintCardViewModel from "~/lib/infrastructure/view-models/MintCardViewModel";


const balanceCard = (
  <BalanceCard
    inscriptionBalance={80000}
    wrappedBalance={20000}
    tokenShortName="PR"
    icon={<div />}
    fee={2}
    onWrap={() => {
      console.log("wrap");
    }}
    onUnwrap={() => {
      console.log("unwrap");
    }}
  />
);
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
  // const queryClient = useQueryClient();
  // const query = useQuery("totalSupply", () => {
  //   return 100000;
  // });
  const mintCardPresenter = new MintCardPresenter();
  const { data: mintCardViewModel } = useQuery<MintCardViewModel>({
    queryKey: ["mintCard"],
    queryFn: async () => {
       return mintCardPresenter.getViewModel();
    },
  });

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
        {mintCardViewModel && <RalphMintCard {...mintCardViewModel}/>}
        {balanceCard}
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
