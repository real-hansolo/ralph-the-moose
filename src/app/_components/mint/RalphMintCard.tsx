import { useMemo, useState } from "react";
import { MintCard } from "@maany_shr/ralph-the-moose-ui-kit";
import { clientContainer, signalsContainer } from "~/lib/infrastructure/config/ioc/container";
import { CONTROLLER, GATEWAYS, SIGNALS } from "~/lib/infrastructure/config/ioc/symbols";
import type { TSignal } from "~/lib/core/entity/signals";
import type { TNetwork } from "~/lib/core/entity/models";
import { effect } from "@preact/signals-react";
import { useQuery } from "@tanstack/react-query";
import type { TMintingStatsViewModel } from "~/lib/core/view-models/minting-stats-view-model";
import { useSignals } from "@preact/signals-react/runtime";
import type MintingStatsController from "~/lib/infrastructure/controllers/minting-stats-controller";
import { Wallet } from "ethers";
import WalletProviderOutputPort from "~/lib/core/ports/secondary/wallet-provider-output-port";

export const RalphMintCard = ({ showMintingModal }: { showMintingModal: () => void }) => {
  useSignals();
  const log = (message: string) => {
    const timestamp = new Date().toISOString();
    return `[RalphMintCard] [${timestamp}] ${message}`;
  };
  // Signals
  const S_ACTIVE_NETWORK = signalsContainer.get<TSignal<TNetwork>>(SIGNALS.ACTIVE_NETWORK);
  const S_IS_MINTING = signalsContainer.get<TSignal<boolean>>(SIGNALS.IS_MINTING);

  // State
  const [networkMintingEnabled, setNetworkMintingEnabled] = useState<boolean>(S_ACTIVE_NETWORK.value.value.publicMint.enabled);
  const [publicMintAmount, setPublicMintAmount] = useState<number>(S_ACTIVE_NETWORK.value.value.publicMint.amount);
  const [isMinting, setIsMinting] = useState<boolean>(S_IS_MINTING.value.value);

  // Wallet Provider
  const walletProvider = clientContainer.get<WalletProviderOutputPort<Wallet>>(GATEWAYS.WALLET_PROVIDER);
  const activeWalletDTO = walletProvider.getActiveWallet();
  const isWalletConnected = activeWalletDTO.success;
  console.log(log(`Wallet connected: ${isWalletConnected}`));

  effect(() => {
    if (S_ACTIVE_NETWORK.value.value.publicMint.enabled !== networkMintingEnabled) {
      setNetworkMintingEnabled(S_ACTIVE_NETWORK.value.value.publicMint.enabled);
    }
    if (S_ACTIVE_NETWORK.value.value.publicMint.amount !== publicMintAmount) {
      setPublicMintAmount(S_ACTIVE_NETWORK.value.value.publicMint.amount);
    }
    if (S_IS_MINTING.value.value !== isMinting) {
      setIsMinting(S_IS_MINTING.value.value);
    }
  });

  const S_Minting_Stats = signalsContainer.get<TSignal<TMintingStatsViewModel>>(SIGNALS.MINTING_STATS);

  const { data, isLoading, isError } = useQuery<TMintingStatsViewModel>({
    queryKey: ["MintStats"],
    queryFn: async () => {
      const mintingStatsController = clientContainer.get<MintingStatsController>(CONTROLLER.MINTING_STATS_CONTROLLER);

      await mintingStatsController.execute({
        response: S_Minting_Stats,
      });
      return S_Minting_Stats.value.value;
    },
    refetchInterval: 10,
  });

  const mintingStatsViewModel = useMemo(() => {
    const defaultData = {
      status: "success",
      totalSupply: 0,
      totalMinted: 0,
      percentage: 0,
      limit: 0,
      allocation: 0,
      network: S_ACTIVE_NETWORK.value.value,
    };

    // Add your logic here to create the MintCardViewModel object
    if (!data || isLoading) {
      console.info(log(`Querying for minting statistics for ${S_ACTIVE_NETWORK.value.value.name}`));
      return defaultData;
    }
    if (isError) {
      console.error(log(`Error querying minting statistics for ${S_ACTIVE_NETWORK.value.value.name}`));
      return defaultData;
    }
    if (data.status === "success") {
      return data;
    } else {
      console.log(log(`Error in minting stats response: ${data.message}`));
      return defaultData;
    }
  }, [data, isError, isLoading, S_ACTIVE_NETWORK.value.value]);

  return (
    <MintCard
      stats={{
        mintedPercentage: mintingStatsViewModel.percentage,
        mintLimit: mintingStatsViewModel.limit,
        totalSupply: mintingStatsViewModel.totalSupply,
        totalMinted: mintingStatsViewModel.totalMinted,
      }}
      disabled={!isWalletConnected || !networkMintingEnabled}
      isMinting={S_IS_MINTING.value.value}
      fee={S_ACTIVE_NETWORK.value.value.fee.minting}
      allocation={mintingStatsViewModel.allocation}
      token={{
        shortName: "PR", // TODO: hardcoded value
      }}
      callbacks={{
        onMint: () => {
          showMintingModal();
        },
      }}
      network={S_ACTIVE_NETWORK.value.value}
    ></MintCard>
  );
};
