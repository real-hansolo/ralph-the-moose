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
import { env } from "~/env";

export default function Home() {
  noStore();
  useSignals();

  // const supportedChains  = Object.values(SUPPORTED_CHAINS).map((chain) => chain.thirdWeb);
  return (
    <ThirdwebProvider
      supportedWallets={SUPPORTED_WALLETS}
      clientId={env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}
    >
      <RalphHome />
    </ThirdwebProvider>
  );
}
