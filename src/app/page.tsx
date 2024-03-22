"use client";
import { unstable_noStore as noStore } from "next/cache";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { useSignals } from "@preact/signals-react/runtime";
import { SUPPORTED_WALLETS } from "~/lib/infrastructure/config/wallets";
// import {
//   DEFAULT_CHAIN,
//   SUPPORTED_CHAINS,
// } from "~/lib/infrastructure/config/chains";
import { RalphHome } from "./pages/RalphHome";

export default function Home() {
  noStore();
  useSignals();

  // const supportedChains  = Object.values(SUPPORTED_CHAINS).map((chain) => chain.thirdWeb);
  return (
    <ThirdwebProvider
      // activeChain={DEFAULT_CHAIN.thirdWeb} // Fix: Cast DEFAULT_CHAIN to type Chain
      // supportedChains={supportedChains}
      supportedWallets={SUPPORTED_WALLETS}
    >
      <RalphHome />
    </ThirdwebProvider>
  );
}
