import { MintingModal } from "@maany_shr/ralph-the-moose-ui-kit";
import type { Wallet } from "@maany_shr/thirdweb/wallets";
import { useSignal } from "@preact/signals-react";
import { useSignals } from "@preact/signals-react/runtime";
import React, { useEffect, useState } from "react";
import type { TNetwork, TWallet } from "~/lib/core/entity/models";
import type { TSignal } from "~/lib/core/entity/signals";
import type WalletProviderOutputPort from "~/lib/core/ports/secondary/wallet-provider-output-port";
import type { TMintingStatsViewModel } from "~/lib/core/view-models/minting-stats-view-model";
import type { TMintingViewModel } from "~/lib/core/view-models/minting-view-model";
import { clientContainer, signalsContainer } from "~/lib/infrastructure/config/ioc/container";
import { CONTROLLER, GATEWAYS, SIGNALS } from "~/lib/infrastructure/config/ioc/symbols";
import type MintingController from "~/lib/infrastructure/controllers/minting-controller";
import type MintingStatsController from "~/lib/infrastructure/controllers/minting-stats-controller";

export interface RalphMintingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RalphMintingModal({ isOpen, onClose }: RalphMintingModalProps) {
  useSignals();
  const log = (message: string) => {
    const timestamp = new Date().toISOString();
    return `[RalphMintingModal] [${timestamp}] ${message}`;
  };

  const [allocation, setAllocation] = useState<number>(0);
  const S_Minting_Status = {
    name: "Minting Status Signal",
    description: "Signal for Minting Status",
    value: useSignal<TMintingViewModel>({
      status: "request",
      message: "Initiating Minting",
      amount: allocation,
    }),
  };

  const S_Minting_Stats = signalsContainer.get<TSignal<TMintingStatsViewModel>>(SIGNALS.MINTING_STATS);
  const mintingStatsController = clientContainer.get<MintingStatsController>(CONTROLLER.MINTING_STATS_CONTROLLER);
  const S_IS_MINTING = signalsContainer.get<TSignal<boolean>>(SIGNALS.IS_MINTING);
  const S_ACTIVE_NETWORK = signalsContainer.get<TSignal<TNetwork>>(SIGNALS.ACTIVE_NETWORK);

  const walletProvider = clientContainer.get<WalletProviderOutputPort<Wallet>>(GATEWAYS.WALLET_PROVIDER);
  const activeWalletDTO = walletProvider.getActiveWallet();
  let activeWallet = undefined;
  if (activeWalletDTO.success) {
    activeWallet = activeWalletDTO.data;
  }
  mintingStatsController
    .execute({
      response: S_Minting_Stats,
    })
    .then(() => {
      if (S_Minting_Stats.value.value.status === "success") {
        setAllocation(S_Minting_Stats.value.value.allocation);
      } else {
        console.error(log(`${S_Minting_Stats.value.value.message}`));
      }
    })
    .catch((e) => {
      console.error(log("Failed to get minting stats"), e);
    });

  if (allocation > 0) {
    S_Minting_Status.value.value.amount = allocation;
  }

  useEffect(() => {
    if (isOpen && allocation > 0 && !S_IS_MINTING.value.value) {
      S_IS_MINTING.value.value = true;
      const mintingController = clientContainer.get<MintingController>(CONTROLLER.MINTING_CONTROLLER);
      mintingController
        .execute({
          response: S_Minting_Status,
          amount: allocation,
        })
        .then(() => {
          console.error(log("Minting Success" + JSON.stringify(S_Minting_Status.value.value)));
        })
        .catch((e) => {
          console.error(log("Minting Exception"), e);
          S_Minting_Status.value.value = {
            status: "error",
            type: "unknown-error",
            message: e.message,
            amount: allocation,
            network: S_ACTIVE_NETWORK.value.value,
            indexerBlockNumber: 1,
            initialIndexerBlockNumber: 1,
            wallet: activeWallet ?? (undefined as unknown as TWallet), // TODO: Fix this
          };
        })
        .finally(() => {
          S_IS_MINTING.value.value = false;
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);
  if (!isOpen) return null;
  return <MintingModal {...{ ...S_Minting_Status.value.value }} onClose={onClose} />;
}
