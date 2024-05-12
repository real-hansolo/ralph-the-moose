"use client";
import { RalphWalletCard } from "../_components/RalphWalletCard";
import { RalphMintCard } from "../_components/RalphMintCard";
import { RalphBalaceCard } from "../_components/RalphBalanceCard";
import { useSignal } from "@preact/signals-react";
import {
  DEFAULT_CHAIN,
  SUPPORTED_CHAINS,
  type TChainConfig,
} from "~/lib/infrastructure/config/chains";
// import { useSignals } from "@preact/signals-react/runtime";
import {
  useActiveAccount,
  useActiveWallet,
  useActiveWalletChain,
  useDisconnect,
} from "@maany_shr/thirdweb/react";
import { type Chain } from "@maany_shr/thirdweb";
import {
  PageTemplate,
  type ToastProps,
} from "@maany_shr/ralph-the-moose-ui-kit";
import type WalletProviderOutputPort from "~/lib/core/ports/secondary/wallet-provider-output-port";
import { type Wallet } from "@maany_shr/thirdweb/wallets";
import { appContainer } from "~/lib/infrastructure/config/ioc/container";
import { GATEWAYS } from "~/lib/infrastructure/config/ioc/symbols";

export const RalphHome = () => {
  // useSignals();
  /**
   * Hooks and Wallet Information
   */
  const walletProvider: WalletProviderOutputPort<Wallet> =
    appContainer.get<WalletProviderOutputPort<Wallet>>(GATEWAYS.WALLET_PROVIDER);
  // console.log(walletProvider.getActiveWallet());
  console.log(walletProvider.getConnectedWallets());
  const connectedAccount = useActiveAccount();
  const connectedWallet = useActiveWallet();
  const connectedWalletNetwork: Chain | undefined = useActiveWalletChain();
  const { disconnect } = useDisconnect();
  const onDisconnect = () => {
    if (!connectedWallet) return;
    disconnect(connectedWallet);
  };
  const isWalletConnected = connectedWallet !== undefined;

  /**
   * [Signal] Toasts: Store the toasts to be displayed on the screen.
   */
  const toasts = useSignal<ToastProps[]>([]);
  const activeNetwork = useSignal<TChainConfig>(DEFAULT_CHAIN);

  return (
    <div id="app-container">
      <PageTemplate
        toasts={toasts}
        supportedNetworks={SUPPORTED_CHAINS}
        activeNetwork={activeNetwork}
      >
        {!isWalletConnected && (
          <RalphWalletCard
            activeNetwork={activeNetwork}
            status={isWalletConnected ? "connected" : "disconnected"}
            onDisconnect={onDisconnect}
            connectedWallet={connectedWallet}
            connectedAccount={connectedAccount}
            connectedWalletNetwork={connectedWalletNetwork}
          />
        )}

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
        {isWalletConnected && (
          <RalphWalletCard
            activeNetwork={activeNetwork}
            status={isWalletConnected ? "connected" : "disconnected"}
            onDisconnect={onDisconnect}
            connectedWallet={connectedWallet}
            connectedAccount={connectedAccount}
            connectedWalletNetwork={connectedWalletNetwork}
          />
        )}
      </PageTemplate>
    </div>
  );
};
