import { type Signal, useSignal, effect } from "@preact/signals-react";
import { useMemo } from "react";
import {
  IsMintingStatusFrame,
  MintCard,
  MintCompletedStatusFrame,
  MintEnabledStatusFrame,
  MintErrorStatusFrame,
  type ToastProps,
} from "~/lib";
import type MintCardViewModel from "~/lib/infrastructure/view-models/MintCardViewModel";
import { useAddress, useWallet } from "@thirdweb-dev/react";
import Web3Gateway from "~/lib/infrastructure/gateways/web3";
import { type MintResponseDTO } from "~/lib/infrastructure/dto/web3-dto";
import MintCardPresenter from "~/lib/infrastructure/presenters/MintCardPresenter";
import { useQuery } from "@tanstack/react-query";
import { env } from "~/env";
import IndexerGateway from "~/lib/infrastructure/gateways/indexer";
import { type TChainConfig } from "~/lib/infrastructure/config/chains";
import { MintWarningStatusFrame } from "~/lib/components/mint-card/MintWarningStatusFrame";

export const RalphMintCard = ({
  toasts,
  activeNetwork,
}: {
  activeNetwork: Signal<TChainConfig>;
  toasts: Signal<ToastProps[]>;
}) => {
  const wallet = useWallet();
  const walletAddress = useAddress();
  const indexerHost = env.NEXT_PUBLIC_INDEXER_URL;
  const indexerGateway = new IndexerGateway(indexerHost);
  const web3Gateway = new Web3Gateway(wallet, toasts);
  const mintCardPresenter = new MintCardPresenter(
    indexerGateway,
    walletAddress,
  );
  const { data, isLoading, isError } = useQuery<MintCardViewModel>({
    queryKey: ["MintCard"],
    queryFn: async () => {
      const viewModel = await mintCardPresenter.present();
      return viewModel;
    },
    refetchInterval: 1000,
  });

  // Signals
  const SdisableMinting = useSignal<boolean>(true);
  const SisMinting = useSignal<boolean>(false);
  const SStatusMessage = useSignal<string>("");

  // Status Frame Content Signals
  const statusFrame = useSignal<React.ReactNode>(<></>);
  const mintEnabledStatusFrame = useSignal<React.ReactNode>(<></>);

  // Effect to enable or disable minting
  effect(() => {
    if (!wallet) {
      console.log("[Mint - Disabled]: Wallet not connected");
      SdisableMinting.value = true;
      return;
    }
    if (!data || isLoading) {
      SdisableMinting.value = true;
      return;
    }
    if (isError) {
      SdisableMinting.value = true;
      return;
    }
    if (!data.status) {
      SdisableMinting.value = true;
      return;
    }
    if (data.status === "success") {
      SdisableMinting.value = false;
      return;
    }
    if (SisMinting.value) {
      SdisableMinting.value = true;
      return;
    }
    return true;
  });

  // Effect to update/disable the MintEnabledStatusFrame
  effect(() => {
    if (!data || isLoading) {
      mintEnabledStatusFrame.value = <></>;
      return;
    }
    if (data?.status !== "success") {
      mintEnabledStatusFrame.value = <></>;
      return;
    }
    if (SisMinting.value) {
      mintEnabledStatusFrame.value = <></>;
      return;
    }
    if (SdisableMinting.value) {
      mintEnabledStatusFrame.value = <></>;
      return;
    }
    mintEnabledStatusFrame.value = (
      <MintEnabledStatusFrame
        eligibleAmount={data.data.allocation.value}
        expectedReturn={data.data.allocation.value}
        fee={activeNetwork.value.mintingFee}
        feeCurrency={activeNetwork.value.mintingFeeCurrency}
        tokenShortName="PR" // TODO: hardcoded value
      />
    );
  });

  /**
   * Minting Controller
   */

  const pollIndexer = async (
    indexerGateway: IndexerGateway,
    transactionHash: string,
    numAttempts: number,
  ) => {
    for (let i = 0; i < numAttempts; i++) {
      const inscriptionStatus =
        await indexerGateway.getInscriptionStatus(transactionHash);
      console.log(`[Inscription Status]: ${i}/${numAttempts}`, inscriptionStatus);
      if (inscriptionStatus.success) {
        return inscriptionStatus;
      }
      // Wait for 0.5 second
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    throw new Error(
      `Transaction not detected by indexer after ${numAttempts} attempts.`,
    );
  };

  const mint = async () => {
    if (!data || data.status !== "success" || !wallet) {
      return;
    }
    const amount = data.data.allocation;

    const token = "PR"; // TODO: This is a hardcoded value. This should be dynamic
    statusFrame.value = (
      <IsMintingStatusFrame
        isMintingAmount={amount.value}
        tokenShortName={token}
        message={SStatusMessage.value}
      />
    );
    // mintEnabledStatusFrame.value = <></>;
    SisMinting.value = true;

    // Network Validation!
    const chain = activeNetwork;
    const walletChainID = await wallet.getChainId();
    if (walletChainID !== chain.value.chainId) {
      console.log(
        `[Mint - Error]: Wrong network detected. ${walletChainID} !== ${chain.value.chainId}`,
      );
      statusFrame.value = (
        <MintErrorStatusFrame
          error="Oh Snap!"
          message="You are on the wrong network."
        />
      );
      return;
    }

    const mintResponse: MintResponseDTO = await web3Gateway.sendMintTransaction(
      amount.value,
      chain.value,
      SStatusMessage,
    );

    if (!mintResponse.success) {
      statusFrame.value = (
        <MintErrorStatusFrame error="Oh Snap!" message={mintResponse.msg} />
      );
      SisMinting.value = false;
      return;
    }

    // Poll the indexer for transaction hash
    const maxAttempts = 20;
    try {
      const inscriptionStatus = await pollIndexer(
        indexerGateway,
        mintResponse.data.txHash,
        maxAttempts,
      );
      if (!inscriptionStatus.success) {
        statusFrame.value = (
          <MintWarningStatusFrame
            error="Come back later!"
            message={`Ralph is still looking for your transaction.`}
            explorerLink={mintResponse.data.explorerLink}
          />
        );
        // SisMinting.value = false;
        return;
      } else {
        if (inscriptionStatus.data.valid === 0) {
          statusFrame.value = (
            <MintErrorStatusFrame
              error="Oh Snap!"
              message="That looks like an invalid transaction!"
              explorerLink={mintResponse.data.explorerLink}
            />
          );
          SisMinting.value = false;
          return;
        } else if (inscriptionStatus.data.valid === 1) {
          statusFrame.value = (
            <MintCompletedStatusFrame
              timestamp={mintResponse.data.timestamp}
              amountMinted={mintResponse.data.amountMinted}
              tokenShortName={mintResponse.data.tokenShortName}
              explorerLink={mintResponse.data.explorerLink}
            />
          );
        }
      }
    } catch (e) {
      statusFrame.value = (
        <MintErrorStatusFrame
          error="Come back later!"
          message={`Ralph is still hunting for your transaction!`}
        />
      );
    }
    SisMinting.value = false;
  };

  const onMint = () => {
    mint()
      .then(() => {
        console.log("Minting");
      })
      .catch((e) => {
        console.log("Error minting man" + e);
      })
      .finally(() => {
        console.log("Minting completed");
      });
  };

  const mintCardViewModel: {
    mintedPercentage: number;
    mintLimit: number;
    totalSupply: number;
    totalMinted: number;
  } = useMemo(() => {
    const defaultData = {
      mintedPercentage: 0,
      mintLimit: 0,
      totalSupply: 0,
      totalMinted: 0,
    };

    // Add your logic here to create the MintCardViewModel object
    if (!data || isLoading) {
      // TODO: add a toast here
      return defaultData;
    }
    if (isError) {
      // TODO: add error card
      return defaultData;
    }
    if (!data.status) {
      // TODO: add a toast here
      return defaultData;
    }
    if (data.status === "success") {
      return {
        mintedPercentage: data.data.mintedPercentage.value ?? 0,
        mintLimit: data.data.mintLimit.value ?? 0,
        totalSupply: data.data.totalSupply.value ?? 0,
        totalMinted: data.data.totalMinted.value ?? 0,
      };
    } else {
      // add error card
      return defaultData;
    }
  }, [data, isError, isLoading]);
  return (
    <MintCard
      mintedPercentage={mintCardViewModel.mintedPercentage}
      mintLimit={mintCardViewModel.mintLimit}
      totalSupply={mintCardViewModel.totalSupply}
      totalMinted={mintCardViewModel.totalMinted}
      mintingFee={10} // TODO: add the minting fee
      mintingDisabled={false}
      tokenShortName="PR" // TODO: hardcoded
      isMinting={SisMinting}
      onMint={onMint}
    >
      {statusFrame.value}
      {mintEnabledStatusFrame.value}
    </MintCard>
  );
};
