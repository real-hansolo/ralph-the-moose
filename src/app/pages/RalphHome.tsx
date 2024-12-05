"use client";
import { RalphWalletCard } from "../_components/RalphWalletCard";
import { PageTemplate } from "@maany_shr/ralph-the-moose-ui-kit";
import { useSignals } from "@preact/signals-react/runtime";
import { RalphMenu } from "../_components/RalphMenu";
import { RalphNetworkSelector } from "../_components/NetworkSelector";
import { RalphMintCard } from "../_components/mint/RalphMintCard";
import { useState } from "react";
import RalphMintingModal from "../_components/mint/RalphMintingModal";
import { RalphBalanceCard } from "../_components/balance/RalphBalanceCard";
import { signalsContainer } from "~/lib/infrastructure/config/ioc/container";
import { SIGNALS } from "~/lib/infrastructure/config/ioc/symbols";
import type { TNetwork, TWallet } from "~/lib/core/entity/models";
import type { TSignal } from "~/lib/core/entity/signals";

export const RalphHome = () => {
  useSignals();
  const [isMintingModalOpen, setIsMintingModalOpen] = useState<boolean>(false);
  const log = (message: string) => {
    const timestamp = new Date().toISOString();
    return `[RalphHome] [${timestamp}] ${message}`;
  };

  const S_ACTIVE_WALLET = signalsContainer.get<TSignal<TWallet | undefined>>(SIGNALS.ACTIVE_WALLET);

  /**
   * Hooks and Wallet Information
   */
  const walletInstance = S_ACTIVE_WALLET.value.value;
  const isWalletConnected = walletInstance !== undefined;

  /**
   * Network Config
   */
  const S_ACTIVE_NETWORK = signalsContainer.get<TSignal<TNetwork>>(SIGNALS.ACTIVE_NETWORK);
  const activeNetwork = S_ACTIVE_NETWORK.value.value;

  return (
    <div id="app-container">
      <PageTemplate menu={<RalphMenu />} networkSelector={<RalphNetworkSelector />} footerContent={""}>
        {!isWalletConnected && <RalphWalletCard />}
        {activeNetwork.features.mint && (
          <div>
            <RalphMintCard
              showMintingModal={() => {
                setIsMintingModalOpen(true);
              }}
            />
            <RalphMintingModal isOpen={isMintingModalOpen} onClose={() => setIsMintingModalOpen(false)} />
          </div>
        )}
        <RalphBalanceCard />
        {isWalletConnected && <RalphWalletCard />}
      </PageTemplate>
    </div>
  );
};
