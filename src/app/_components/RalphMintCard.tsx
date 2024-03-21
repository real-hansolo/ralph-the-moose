import { signal } from "@preact/signals-react";
import { MintCard } from "~/lib";
import type MintCardViewModel from "~/lib/infrastructure/view-models/MintCardViewModel";

export const RalphMintCard = (props: MintCardViewModel ) => {
  
  if (props.status === "success") {
    return (
      <MintCard
        mintedPercentage={props.data.mintedPercentage.value}
        mintLimit={props.data.mintLimit.value}
        totalSupply={props.data.totalSupply.value}
        totalMinted={props.data.totalMinted.value}
        mintingFee={10}
        mintingDisabled={false}
        tokenShortName="PR"
        isMinting={signal(false)}
        onMint={props.data.mint}
        // children={
        // <MintCompletedStatusFrame
        //   tokenShortName="PR"
        //   amountMinted={10000}
        //   timestamp="2024-02-14 @ 16:03"
        //   explorerLink="nowhere"
        // />
        // }
      />
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
