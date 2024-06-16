import React from "react";
import { Button, LightFrame } from "@maany_shr/ralph-the-moose-ui-kit";
import { clientContainer } from "~/lib/infrastructure/config/ioc/container";
import type { Wallet } from "@maany_shr/thirdweb/wallets";
import { CONTROLLER } from "~/lib/infrastructure/config/ioc/symbols";
import { useSignal } from "@preact/signals-react";
import type { TBridgingViewModel } from "~/lib/core/view-models/bridging-view-model";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const BridgeTest = (props: { walletInstance: Wallet }) => {
  // const bridgingViewModel = useSignal<TBridgingViewModel>({
  //   status: "request",
  //   message: "Starting Bridge Test...",
  // });
  return (
    <LightFrame>
      This can be deleted 
      {/* <Button
        variant="primary"
        label="Bridge"
        onClick={() => {
          const bridgingController = clientContainer.get<BridgingController<Wallet>>(CONTROLLER.BRIDGING_CONTROLLER);
          bridgingController
            .execute({
              wallet: props.walletInstance,
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
      <div>{bridgingViewModel.value.message}</div> */}
    </LightFrame> 
  );
};
