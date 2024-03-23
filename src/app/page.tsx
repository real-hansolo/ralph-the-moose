"use client";
import { unstable_noStore as noStore } from "next/cache";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { Base, BaseSepoliaTestnet } from "@thirdweb-dev/chains";
import { useSignals } from "@preact/signals-react/runtime";
import { SUPPORTED_WALLETS } from "~/lib/infrastructure/config/wallets";
import {
} from "~/lib/infrastructure/config/chains";
import { RalphHome } from "./pages/RalphHome";
import { env } from "~/env";

export default function Home() {
  noStore();
  useSignals();
  const  defaultChain = env.NEXT_PUBLIC_ENABLE_TESTNETS ? BaseSepoliaTestnet : Base;
  return (
    <ThirdwebProvider
      supportedWallets={SUPPORTED_WALLETS}
      supportedChains={[Base, BaseSepoliaTestnet]}
      clientId={env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}
      activeChain={defaultChain}
    >
      <RalphHome />
    </ThirdwebProvider>
  );
}
