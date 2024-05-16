/* eslint-disable @typescript-eslint/no-explicit-any */
import type { BridgingInputPort, BridgingOutputPort } from "../ports/primary/bridging-primary-ports";
import type ElkBridgeHeadOutputPort from "../ports/secondary/elk-bridgehead-output-port";
import type RalphTokenOutputPort from "../ports/secondary/ralph-token-output-port";
import type { TBridgingRequest } from "../usecase-models/bridging-usecase-models";
import { signalsContainer } from "~/lib/infrastructure/config/ioc/container";
import { SIGNALS } from "~/lib/infrastructure/config/ioc/symbols";
import { type TSignal, type TTransactionGasStatus } from "../entity/signals";
import { effect } from "@preact/signals-react";
// import { effect } from "@preact/signals-react";

export default class BridgingUsecase implements BridgingInputPort {
  presenter: BridgingOutputPort<any>;
  elkBridgeHead: ElkBridgeHeadOutputPort;
  ralphTokenGateway: RalphTokenOutputPort;
  constructor(presenter: BridgingOutputPort<any>, elkBridgeHead: ElkBridgeHeadOutputPort, ralphTokenGateway: RalphTokenOutputPort) {
    this.presenter = presenter;
    this.elkBridgeHead = elkBridgeHead;
    this.ralphTokenGateway = ralphTokenGateway;
  }

  async execute(request: TBridgingRequest): Promise<void> {
    const { wallet, network, amount, toNetwork } = request;
    const balanceDTO = await this.ralphTokenGateway.getBalance(wallet.activeAccount, network);
    if (!balanceDTO.success) {
      this.presenter.presentError({
        status: "error",
        message: "Error getting PR token balance KHAFASDFHK",
        details: {
          amount: amount,
          network: network,
          wallet: wallet,
          toNetwork: toNetwork,
        },
      });
      return;
    }
    const balance = balanceDTO.data.balance;
    if (amount > balance) {
      this.presenter.presentError({
        status: "error",
        message: "Amount exceeds balance",
        details: {
          amount: amount,
          network: network,
          wallet: wallet,
          toNetwork: toNetwork,
        },
      });
      return;
    }
    this.presenter.presentProgress({
      amount: amount,
      network: network,
      wallet: wallet,
      toNetwork: toNetwork,
      message: "Bridging in progress...",
    });

    // TODO: check approval for reservoir
   
    const bridgeTokensDTO = await this.elkBridgeHead.bridgeTokens(wallet, network, amount, toNetwork);
    if (!bridgeTokensDTO.success) {
      this.presenter.presentError({
        status: "error",
        message: bridgeTokensDTO.data.message,
        details: {
          amount: amount,
          network: network,
          wallet: wallet,
          toNetwork: toNetwork,
        },
      });
      return;
    }
    // TODO: check if the balance updated on the other chain

    this.presenter.presentSuccess({
      status: "success",
      message: "Bridging successful",
      amount: amount,
      network: network,
      wallet: wallet,
      toNetwork: toNetwork,
      transaction: bridgeTokensDTO.data,
    });
  }
}
