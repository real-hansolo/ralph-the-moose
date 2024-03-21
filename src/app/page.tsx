"use client";
import { unstable_noStore as noStore } from "next/cache";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { useSignals } from "@preact/signals-react/runtime";
import { SUPPORTED_WALLETS } from "~/lib/infrastructure/config/wallets";
import {
  DEFAULT_CHAIN,
  SUPPORTED_CHAINS,
} from "~/lib/infrastructure/config/chains";
import { RalphHome } from "./_components/pages/RalphHome";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function Home() {
  noStore();
  useSignals();

  const queryClient = new QueryClient();
  return (
    <ThirdwebProvider
      activeChain={DEFAULT_CHAIN}
      supportedChains={SUPPORTED_CHAINS}
      supportedWallets={SUPPORTED_WALLETS}
    >
      <QueryClientProvider client={queryClient}>
        <RalphHome />
      </QueryClientProvider>
    </ThirdwebProvider>
  );
}
