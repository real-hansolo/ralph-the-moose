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
import { SUPPORTED_WALLETS } from "~/lib/infrastructure/config/wallets";
import { DEFAULT_CHAIN, SUPPORTED_CHAINS } from "~/lib/infrastructure/config/chains";
import { RalphHome } from "./_components/pages/Home";


export default function Home() {
  noStore();
  useSignals();
  return (
    <ThirdwebProvider
      activeChain={DEFAULT_CHAIN}
      supportedChains={SUPPORTED_CHAINS}
      supportedWallets={SUPPORTED_WALLETS}
    >
      <RalphHome />
    </ThirdwebProvider>
  );
}
