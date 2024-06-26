/* eslint-disable @typescript-eslint/no-explicit-any */

import type { UnWrappingInputPort, UnWrappingOutputPort } from "../ports/primary/unwrapping-primary-ports";
import type RalphReservoirOutputPort from "../ports/secondary/ralph-reservoir-output-port";
import type RalphTokenOutputPort from "../ports/secondary/ralph-token-output-port";
import type { TUnwrappingRequest } from "../usecase-models/unwrapping-usecase-models";
import { approveRalphReservoir } from "~/lib/utils/transactionUtils";

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
    const approvalResult  = await approveRalphReservoir(amount, wallet, network);
    if(approvalResult && !approvalResult.success) {
      this.presenter.presentError({
        status: "error",
        message: `Error approving reservoir for unwrapping`,
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

    const unwrapDTO = await this.ralphReservoirGateway.unwrap(wallet, network, amount);
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
    const expectedBalance = initialBalance - amount;
    while (balance > expectedBalance && attempt <= maxAttempts) {
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
