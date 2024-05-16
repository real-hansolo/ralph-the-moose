"use client";
import "reflect-metadata";
import { RalphWalletCard } from "../_components/RalphWalletCard";
import { RalphMintCard } from "../_components/RalphMintCard";
import { RalphBalaceCard } from "../_components/RalphBalanceCard";
import { useSignal } from "@preact/signals-react";
import { DEFAULT_CHAIN, SUPPORTED_CHAINS, type TChainConfig } from "~/lib/infrastructure/config/chains";
import { useActiveAccount, useActiveWallet, useActiveWalletChain } from "@maany_shr/thirdweb/react";
import { type Chain } from "@maany_shr/thirdweb";
import { Button, LightFrame, PageTemplate, type ToastProps } from "@maany_shr/ralph-the-moose-ui-kit";
import { clientContainer } from "~/lib/infrastructure/config/ioc/container";
import type BridgingController from "~/lib/core/controller/bridging-controller-ports";
import type { Wallet } from "@maany_shr/thirdweb/wallets";
import { CONTROLLER } from "~/lib/infrastructure/config/ioc/symbols";
import type { TBridgingViewModel } from "~/lib/core/view-models/bridging-view-model";

export const RalphHome = () => {
  /**
   * Hooks and Wallet Information
   */
  const connectedAccount = useActiveAccount();
  const connectedWallet = useActiveWallet();
  const connectedWalletNetwork: Chain | undefined = useActiveWalletChain();
  const isWalletConnected = connectedWallet !== undefined;

  /**
   * [Signal] Toasts: Store the toasts to be displayed on the screen.
   */
  const toasts = useSignal<ToastProps[]>([]);
  const activeNetwork = useSignal<TChainConfig>(DEFAULT_CHAIN);
  const bridgingViewModel = useSignal<TBridgingViewModel>({
    status: "request",
    message: "Starting Bridge Test...",
  });
  return (
    <div id="app-container">
      <PageTemplate toasts={toasts} supportedNetworks={SUPPORTED_CHAINS} activeNetwork={activeNetwork}>
        {!isWalletConnected && <RalphWalletCard />}
        <LightFrame>
          <Button
            variant="primary"
            label="Bridge"
            onClick={() => {
              const bridgingController = clientContainer.get<BridgingController<Wallet>>(CONTROLLER.BRIDGING_CONTROLLER);
              bridgingController
                .execute({
                  wallet: connectedWallet,
                  networkId: 8453,
                  toNetworkId: 43114,
                  amount: 5,
                  response: {
                    name: "Bridge Test",
                    description: "Bridge Test from Base to Avalanche",
                    value: bridgingViewModel,
                  },
                })
                .then(() => {
                  console.log("Bridge Success");
                })
                .catch((e) => {
                  console.log("Bridge Error", e);
                });
            }}
          />
          <div>{bridgingViewModel.value.message}</div>
        </LightFrame>

        <RalphMintCard
          toasts={toasts}
          activeNetwork={activeNetwork}
          connectedWallet={connectedWallet}
          connectedAccount={connectedAccount}
          connectedWalletNetwork={connectedWalletNetwork}
        />
        {
          <RalphBalaceCard
            toasts={toasts}
            activeNetwork={activeNetwork}
            connectedWallet={connectedWallet}
            connectedAccount={connectedAccount}
            connectedWalletNetwork={connectedWalletNetwork}
          />
        }
        {isWalletConnected && <RalphWalletCard />}
      </PageTemplate>
    </div>
  );
};
