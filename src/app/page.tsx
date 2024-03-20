"use client";
import { signal } from "@preact/signals-react";
import { unstable_noStore as noStore } from "next/cache";
import {
  MintCard,
  BalanceCard,
  PageTemplate,
} from "~/lib";

import {
  ThirdwebProvider,
} from "@thirdweb-dev/react";
import { useSignals } from "@preact/signals-react/runtime";
import { RalphWalletCard } from "./_components/RalphWalletCard";
import { SUPPORTED_WALLETS } from "~/lib/infrastructure/config/wallets";
import { DEFAULT_CHAIN, SUPPORTED_CHAINS } from "~/lib/infrastructure/config/chains";

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
export default function Home() {
  noStore();
  useSignals();
  return (
    <ThirdwebProvider
      activeChain={DEFAULT_CHAIN}
      supportedChains={SUPPORTED_CHAINS}
      supportedWallets={SUPPORTED_WALLETS}
    >
      <div id="app-container">
        <PageTemplate>
          <RalphWalletCard />
          {mintCard}
          {balanceCard}
        </PageTemplate>
      </div>
    </ThirdwebProvider>
  );
}
