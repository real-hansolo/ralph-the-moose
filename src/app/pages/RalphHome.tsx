import { BalanceCard, MintCard, PageTemplate } from "~/lib";
import { RalphWalletCard } from "../_components/RalphWalletCard";
import { signal } from "@preact/signals-react";
import { useAddress, useDisconnect, useWallet } from "@thirdweb-dev/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const mintCard = (
  <MintCard
    mintedPercentage={0.5}
    mintLimit={100000}
    totalSupply={100000}
    totalMinted={50000}
    mintingFee={10}
    mintingDisabled={false}
    tokenShortName="PR"
    isMinting={signal(false)}
    onMint={() => console.log("mint")}
    // children={
    // <MintCompletedStatusFrame
    //   tokenShortName="PR"
    //   amountMinted={10000}
    //   timestamp="2024-02-14 @ 16:03"
    //   explorerLink="nowhere"
    // />
    // }
  />
);
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
        {mintCard}
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
