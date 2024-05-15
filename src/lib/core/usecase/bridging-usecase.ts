/* eslint-disable @typescript-eslint/no-explicit-any */
import type { BridgingInputPort, BridgingOutputPort } from "../ports/primary/bridging-primary-ports";
import type ElkBridgeHeadOutputPort from "../ports/secondary/elk-bridgehead-output-port";
import type RalphTokenOutputPort from "../ports/secondary/ralph-token-output-port";
import type { TBridgingRequest } from "../usecase-models/bridging-usecase-models";
import type { TPreparedContractCall } from "../entity/models";
import { clientContainer } from "~/lib/infrastructure/config/ioc/container";
import { SIGNALS } from "~/lib/infrastructure/config/ioc/symbols";
import { TSignal, TTransactionGasStatus } from "../entity/signals";
import { effect } from "@preact/signals-react";

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
        message: "Error getting PR token balance",
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

    const S_GAS_SIGNAL = clientContainer.get<TSignal<TTransactionGasStatus>>(SIGNALS.TRANSACTION_GAS_STATUS);
    const s_gas_signal = S_GAS_SIGNAL.value;
    effect(() => {
      return this.presenter.presentEstimatedGas({
        amount: amount,
        network: network,
        wallet: wallet,
        toNetwork: toNetwork,
        estimateGas: s_gas_signal.value.estimatedGas,
        message: "Estimating gas...",
      });
    });
    const bridgeTokensDTO = await this.elkBridgeHead.bridgeTokens(wallet, network, amount, toNetwork, S_GAS_SIGNAL);
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
