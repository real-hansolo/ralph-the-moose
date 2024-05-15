/* eslint-disable @typescript-eslint/no-explicit-any */

import type { UnWrappingInputPort, UnWrappingOutputPort } from "../ports/primary/unwrapping-primary-ports";
import type RalphReservoirOutputPort from "../ports/secondary/ralph-reservoir-output-port";
import type RalphTokenOutputPort from "../ports/secondary/ralph-token-output-port";
import type { TUnwrappingRequest } from "../usecase-models/unwrapping-usecase-models";
import type { TSignal, TTransactionGasStatus } from "../entity/signals";
import { clientContainer } from "~/lib/infrastructure/config/ioc/container";
import { SIGNALS } from "~/lib/infrastructure/config/ioc/symbols";
import { effect } from "@preact/signals-react";

export default class UnwrappingUsecase implements UnWrappingInputPort {
  presenter: UnWrappingOutputPort<any>;
  ralphTokenGateway: RalphTokenOutputPort;
  ralphReservoirGateway: RalphReservoirOutputPort;
  constructor(presenter: any, ralphTokenGateway: RalphTokenOutputPort, ralphReservoirGateway: RalphReservoirOutputPort) {
    this.presenter = presenter;
    this.ralphTokenGateway = ralphTokenGateway;
    this.ralphReservoirGateway = ralphReservoirGateway;
  }

  async execute(request: TUnwrappingRequest): Promise<void> {
    // Implement the unwrapping usecase here
    const { wallet, network, amount } = request;
    const S_GAS_STATUS = clientContainer.get<TSignal<TTransactionGasStatus>>(SIGNALS.TRANSACTION_GAS_STATUS);
    const s_gas_signal = S_GAS_STATUS.value;
    const balanceDTO = await this.ralphTokenGateway.getBalance(wallet.activeAccount, network);
    if (!balanceDTO.success) {
      this.presenter.presentError({
        status: "error",
        message: `Couldn't get Ralph Token balance`,
        details: {
          amount: amount,
          network: network,
          wallet: wallet,
          approvalError: false,
          verificationError: false,
        },
      });
      return;
    }
    const initialBalance = balanceDTO.data.balance;
    const allowanceDTO = await this.ralphReservoirGateway.getSpendingAllowance(wallet, network);
    if (!allowanceDTO.success) {
      this.presenter.presentProgress({
        status: "in-progress",
        message: "Approving spending allowance",
        amount: amount,
        network: network,
        wallet: wallet,
      });
      const approvalDTO = await this.ralphTokenGateway.approveReservoir(wallet, network);
      if (!approvalDTO.success) {
        this.presenter.presentError({
          status: "error",
          message: "Couldn't approve Ralph Reservoir to unwrap your PR Tokens",
          details: {
            amount: amount,
            network: network,
            wallet: wallet,
            approvalError: true,
            verificationError: false,
          },
        });
        return;
      }
    }

    effect(() => {
      return this.presenter.presentEstimatedGas({
        status: "in-progress",
        network: network,
        wallet: wallet,
        message: "Estimating gas for unwrapping",
        estimatedGas: s_gas_signal.value?.estimatedGas,
        amount: amount,
      });
    });

    const unwrapDTO = await this.ralphReservoirGateway.unwrap(wallet, network, amount, S_GAS_STATUS);
    if (!unwrapDTO.success) {
      this.presenter.presentError({
        status: "error",
        message: `Failed to Unwrap! ${unwrapDTO.data.message}`,
        details: {
          amount: amount,
          network: network,
          wallet: wallet,
          approvalError: false,
          verificationError: false,
        },
      });
      return;
    }
    let attempt = 1;
    const maxAttempts = 600;
    this.presenter.presentProgress({
      status: "in-progress",
      message: `Verifying balance update. Attempt ${attempt}!`,
      amount: amount,
      network: network,
      wallet: wallet,
      transaction: unwrapDTO.data,
    });
    let newBalanceDTO = await this.ralphTokenGateway.getBalance(wallet.activeAccount, network);
    let balance = initialBalance;
    const expectedBalance = initialBalance + amount;
    while (balance <= expectedBalance && attempt <= maxAttempts) {
      newBalanceDTO = await this.ralphTokenGateway.getBalance(wallet.activeAccount, network);
      if (!newBalanceDTO.success) {
        this.presenter.presentError({
          status: "error",
          message: `Couldn't get Ralph Token balance`,
          details: {
            amount: amount,
            network: network,
            wallet: wallet,
            approvalError: false,
            verificationError: true,
          },
        });
        return;
      }
      balance = newBalanceDTO.data.balance;
      this.presenter.presentProgress({
        status: "in-progress",
        message: `Verifying balance update. Attempt ${attempt}!`,
        amount: amount,
        network: network,
        wallet: wallet,
        transaction: unwrapDTO.data,
      });
      attempt++;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    if (attempt > maxAttempts) {
      this.presenter.presentError({
        status: "error",
        message: `Could not to verify unwrap! Wait time exceeded!`,
        details: {
          amount: amount,
          network: network,
          wallet: wallet,
          approvalError: false,
          verificationError: true,
          transaction: unwrapDTO.data,
        },
      });
      return;
    }
    this.presenter.presentSuccess({
      status: "success",
      message: "Unwrapping successful",
      amount: amount,
      transaction: unwrapDTO.data,
    });
  }
}
