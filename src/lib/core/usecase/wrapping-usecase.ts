/* eslint-disable @typescript-eslint/no-explicit-any */
import { signalsContainer } from "~/lib/infrastructure/config/ioc/container";
import type { WrappingInputPort, WrappingOutputPort } from "../ports/primary/wrapping-primary-ports";
import type IndexerGatewayOutputPort from "../ports/secondary/indexer-gateway-output-port";
import type Web3GatewayOutputPort from "../ports/secondary/web3-gateway-output-port";
import type { TWrappingRequest } from "../usecase-models/wrapping-usecase-models";
import { SIGNALS } from "~/lib/infrastructure/config/ioc/symbols";
import type { TSignal, TTransactionGasStatus } from "../entity/signals";
import { fromHumanReadableNumber } from "~/lib/utils/tokenUtils";
import type { BigNumber } from "ethers";
import { effect } from "@preact/signals-react";
import type { TNetwork, TPreparedTransaction } from "../entity/models";
import { sendThirdWebTransactionUtil } from "~/lib/utils/transactionUtils";

export default class WrappingUsecase implements WrappingInputPort {
  presenter: WrappingOutputPort<any>;
  indexerGatewayFactory: (network: TNetwork) => IndexerGatewayOutputPort;
  web3Gateway: Web3GatewayOutputPort<any, any, any>;
  constructor(
    presenter: WrappingOutputPort<any>,
    indexerGatewayFactory: (network: TNetwork) => IndexerGatewayOutputPort,
    web3Gateway: Web3GatewayOutputPort<any, any, any>,
  ) {
    this.presenter = presenter;
    this.indexerGatewayFactory = indexerGatewayFactory;
    this.web3Gateway = web3Gateway;
  }

  __generateHexFromWrapMessage = (amount: BigNumber, ralphReservoirAddress: string): string => {
    const json = `{"p": "elkrc-404", "op": "transfer", "tick": "PR", "to": "${ralphReservoirAddress}", "amount": ${amount.toString()}}`;
    const hex = Buffer.from(json, "utf8").toString("hex");
    return hex;
  };

  async execute(request: TWrappingRequest): Promise<void> {
    const { wallet, network, amount } = request;
    const indexerGateway = this.indexerGatewayFactory(network);
    const wrapAmount = fromHumanReadableNumber(amount);
    const message = this.__generateHexFromWrapMessage(wrapAmount, network.contracts.ralphReservoirAddress);
    const S_GAS_STATUS = signalsContainer.get<TSignal<TTransactionGasStatus>>(SIGNALS.TRANSACTION_GAS_STATUS);
    const s_gas_signal = S_GAS_STATUS.value;

    this.presenter.presentProgress({
      type: "awaiting-transaction",
      network: network,
      wallet: wallet,
      amount: amount,
    });
    console.log("[DEBUG DEBUG] : Time to show awaiting transaction")
    effect(() => {
      return this.presenter.presentProgress({
        type: "estimated-gas",
        network: network,
        wallet: wallet,
        estimatedGas: s_gas_signal.value?.estimatedGas,
        amount: amount,
      });
    });

    const preparedWrapTransaction: TPreparedTransaction = {
      to: network.contracts.ralphReservoirAddress,
      value: `${network.fee.wrapping}`,
      data: `0x${message}`,
      network: network,
    };

    const wrapTransactionDTO = await sendThirdWebTransactionUtil(wallet, preparedWrapTransaction, S_GAS_STATUS);

    if (!wrapTransactionDTO.success) {
      this.presenter.presentError({
        status: "error",
        message: "Error sending wrap transaction",
        details: {
          amount: amount,
          network: network,
          wallet: wallet,
        },
      });
      return;
    }

    let wrapStatusDTO = await indexerGateway.getWrapStatus(wrapTransactionDTO.data.hash);
    let attempt = 1;
    while (!wrapStatusDTO.success) {
      wrapStatusDTO = await indexerGateway.getWrapStatus(wrapTransactionDTO.data.hash);
      this.presenter.presentProgress({
        type: "verifying",
        amount: amount,
        network: network,
        wallet: wallet,
        transaction: wrapTransactionDTO.data,
        attempt: attempt,
      });
      attempt++;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    this.presenter.presentSuccess({
      status: "success",
      transaction: wrapTransactionDTO.data,
      network: network,
      wallet: wallet,
      amount: amount,
    });
  }
}
