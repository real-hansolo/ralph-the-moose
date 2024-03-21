import { BalanceCard } from "~/lib";
import type BalanceCardViewModel from "~/lib/infrastructure/view-models/BalanceCardViewModel";



export const RalphBalaceCard = (props: BalanceCardViewModel) => {
  if (props.status === "success") {
    return (
      <BalanceCard
        inscriptionBalance={props.data.inscriptionBalance.value}
        wrappedBalance={props.data.wrappedBalance.value}
        tokenShortName="PR"
        icon={<div />}
        fee={props.data.fee.value}
        onWrap={() => {
          console.log("wrap");
        }}
        onUnwrap={() => {
          console.log("unwrap");
        }}
      />
    );
  } else if (props.status === "error") {
    // TODO: Implement error handling
    return (
      <div>
        <h1>Error</h1>
        <p>{props.message}</p>
      </div>
    );
  }
};
