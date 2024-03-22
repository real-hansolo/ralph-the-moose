import { signal } from "@preact/signals-react";
import { useMemo, useState } from "react";
import { MintCard, type ToastProps } from "~/lib";
import type MintCardViewModel from "~/lib/infrastructure/view-models/MintCardViewModel";
import { toasts } from "~/lib/infrastructure/signals";
import { useWallet } from "@thirdweb-dev/react";
import Web3Gateway from "~/lib/infrastructure/gateways/web3";
import { type MintResponseDTO } from "~/lib/infrastructure/dto/web3-dto";

export const RalphMintCard = (props: MintCardViewModel) => {
  const [mintStatusCard, setMintStatusCard] = useState<React.ReactNode>(<></>);
  const wallet = useWallet();
  const mint = async () => {
    const web3Gateway = new Web3Gateway(wallet, toasts);
    const mintResponse: MintResponseDTO =
      await web3Gateway.mintRequest(1230000000000000);
    if (mintResponse.success) {
      console.log("Minted");
      toasts.value.push({
        title: "Minting",
        message: "Minting successful!",
        status: "success",
        isPermanent: false,
      } as ToastProps);
    } else {
      console.log("Error minting", mintResponse.msg);
      toasts.value.push({
        title: "Minting failed",
        message: mintResponse.msg,
        status: "error",
        isPermanent: false,
      });
    }
  };

  const onMint = () => {
    toasts.value.push(
      {
        title: "License to Mint",
        message: "Minting request has been initiated!",
        status: "success",
        isPermanent: false,
      },
    );
    console.log("[DEBUG]: RalphMintCard: onMint")
    // mint()
    //   .then(() => {
    //     console.log("Minting");
    //   })
    //   .catch(() => {
    //     console.log("Error minting");
    //   })
    //   .finally(() => {
    //     console.log("Minting completed");
    //   });
  };
  const mintCardProps: {
    mintedPercentage: number;
    mintLimit: number;
    totalSupply: number;
    totalMinted: number;
  } = useMemo(() => {
    // Add your logic here to create the MintCardViewModel object
    if (props.status === "error" || props.status === "warning") {
      return {
        mintedPercentage: 0,
        mintLimit: 0,
        totalSupply: 0,
        totalMinted: 0,
      };
    }
    return {
      mintedPercentage: props.data.mintedPercentage.value ?? 0,
      mintLimit: props.data.mintLimit.value ?? 0,
      totalSupply: props.data.totalSupply.value ?? 0,
      totalMinted: props.data.totalMinted.value ?? 0,
    };
  }, [props]);
  if (props.status === "success") {
    return (
      <MintCard
        mintedPercentage={mintCardProps.mintedPercentage}
        mintLimit={mintCardProps.mintLimit}
        totalSupply={mintCardProps.totalSupply}
        totalMinted={mintCardProps.totalMinted}
        mintingFee={10}
        mintingDisabled={false}
        tokenShortName="PR"
        isMinting={signal(false)}
        onMint={onMint}
      >
        {mintStatusCard}
      </MintCard>
    );
  } else if (props.status === "error") {
    return (
      <div>
        <h1>Error</h1>
        <p>{props.message}</p>
      </div>
    );
  } else if (props.status === "warning") {
    return (
      <div>
        <h1>Warning</h1>
        <p>{props.message}</p>
      </div>
    );
  }
};
