"use client";
import "reflect-metadata";
import { RalphWalletCard } from "../_components/RalphWalletCard";
import { RalphMintCard } from "../_components/RalphMintCard";
import { RalphBalaceCard } from "../_components/RalphBalanceCard";
import { useSignal } from "@preact/signals-react";
import {
  DEFAULT_CHAIN,
  SUPPORTED_CHAINS,
  type TChainConfig,
} from "~/lib/infrastructure/config/chains";
import {
  useActiveAccount,
  useActiveWallet,
  useActiveWalletChain,
} from "@maany_shr/thirdweb/react";
import { type Chain } from "@maany_shr/thirdweb";
import {
  PageTemplate,
  type ToastProps,
} from "@maany_shr/ralph-the-moose-ui-kit";
import { GATEWAYS } from "~/lib/infrastructure/config/ioc/symbols";
import type NetworkGatewayOutputPort from "~/lib/core/ports/secondary/network-gateway-output-port";
import { type TNetwork } from "~/lib/core/entity/models";
import type IndexerGatewayOutputPort from "~/lib/core/ports/secondary/indexer-gateway-output-port";
import { clientContainer } from "~/lib/infrastructure/config/ioc/container";

export const RalphHome = () => {
  /**
   * Hooks and Wallet Information
   */
  const connectedAccount = useActiveAccount();
  const connectedWallet = useActiveWallet();
  const connectedWalletNetwork: Chain | undefined = useActiveWalletChain();
  const isWalletConnected = connectedWallet !== undefined;

  const indexerFactory: (network: TNetwork) => IndexerGatewayOutputPort = clientContainer.get(GATEWAYS.INDEXER_GATEWAY_FACTORY);
  const networkGateway: NetworkGatewayOutputPort = clientContainer.get<NetworkGatewayOutputPort>(GATEWAYS.NETWORK_GATEWAY);
  const activeNetworkDTO = networkGateway.getActiveNetwork();
  if (!activeNetworkDTO.success) {
    throw new Error("Error getting active network");
  }
  const tempActiveNetwork = activeNetworkDTO.data;
  const indexer = indexerFactory(tempActiveNetwork);
  indexer.getAllMinted()
    .then((res) => {
      console.log(res);
    })
    .catch((e) => {
      console.log("Error fetching minted", e);
    });
  
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
          <RalphWalletCard/>
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
          <RalphWalletCard/>
        )}
      </PageTemplate>
    </div>
  );
};
