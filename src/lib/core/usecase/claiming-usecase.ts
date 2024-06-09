/* eslint-disable @typescript-eslint/no-explicit-any */
import type RalphReservoirOutputPort from "~/lib/core/ports/secondary/ralph-reservoir-output-port";
import type { ClaimingInputPort, ClaimingOutputPort } from "../ports/primary/claiming-primary-ports";
import type RalphTokenOutputPort from "../ports/secondary/ralph-token-output-port";
import type { TClaimingRequest } from "../usecase-models/claiming-usecase-models";
import { signalsContainer } from "~/lib/infrastructure/config/ioc/container";
import { SIGNALS } from "~/lib/infrastructure/config/ioc/symbols";
import type { TSignal, TTransactionGasStatus } from "../entity/signals";

export default class ClaimingUsecase implements ClaimingInputPort {
  presenter: ClaimingOutputPort<any>;
  ralphTokenGateway: RalphTokenOutputPort;
  ralphReservoirGateway: RalphReservoirOutputPort;

  constructor(presenter: ClaimingOutputPort<any>, ralphTokenGateway: RalphTokenOutputPort, ralphReservoirGateway: RalphReservoirOutputPort) {
    this.presenter = presenter;
    this.ralphTokenGateway = ralphTokenGateway;
    this.ralphReservoirGateway = ralphReservoirGateway;
  }

  async execute(request: TClaimingRequest): Promise<void> {
    const { wallet, network, amount } = request;
    const claimableAmountDTO = await this.ralphReservoirGateway.getClaimableAmount(wallet.activeAccount, network);
    if (!claimableAmountDTO.success) {
      this.presenter.presentError({
        status: "error",
        message: "Error getting claimable amount",
        details: {
          amount: amount,
          network: network,
          wallet: wallet,
        },
      });
      return;
    }
    const maxClaimableAmount = claimableAmountDTO.data.amount;
    if (amount > maxClaimableAmount) {
      this.presenter.presentError({
        status: "error",
        message: "Amount exceeds max claimable amount",
        details: {
          amount: amount,
          network: network,
          wallet: wallet,
        },
      });
      return;
    }
    const initialBalanceDTO = await this.ralphTokenGateway.getBalance(wallet.activeAccount, network);
    if (!initialBalanceDTO.success) {
      this.presenter.presentError({
        status: "error",
        message: "Error getting PR token balance",
        details: {
          amount: amount,
          network: network,
          wallet: wallet,
        },
      });
      return;
    }
    const intitialBalance = initialBalanceDTO.data.balance;
    const expectedBalance = intitialBalance + amount;

    const S_GAS_SIGNAL = signalsContainer.get<TSignal<TTransactionGasStatus>>(SIGNALS.TRANSACTION_GAS_STATUS);
    this.presenter.presentProgress({
      type: "awaiting-transaction",
      network: network,
      wallet: wallet,
      amount: amount,
      message: `Preparing to release ${amount} PR tokens to your wallet!`,
    });

    const claimDTO = await this.ralphReservoirGateway.claim(wallet, network, amount, S_GAS_SIGNAL);
    if (!claimDTO.success) {
      this.presenter.presentError({
        status: "error",
        message: `Error claiming PR tokens: ${claimDTO.data.message}`,
        details: {
          amount: amount,
          network: network,
          wallet: wallet,
        },
      });
      return;
    }
    this.presenter.presentProgress({
      amount: amount,
      type: "verifying",
      attempt: 1,
      transaction: claimDTO.data,
    });
    let currentBalanceDTO = await this.ralphTokenGateway.getBalance(wallet.activeAccount, network);
    if (!currentBalanceDTO.success) {
      this.presenter.presentError({
        status: "error",
        message: `Error getting PR token balance after claiming ${amount} PR tokens!. ${currentBalanceDTO.data.message}`,
        details: {
          amount: amount,
          network: network,
          wallet: wallet,
        },
      });
      return;
    }
    let currentBalance = currentBalanceDTO.data.balance;
    let attempt = 1;
    while (currentBalance < expectedBalance) {
      this.presenter.presentProgress({
        amount: amount,
        type: "verifying",
        attempt: attempt,
        transaction: claimDTO.data,
      });
      currentBalanceDTO = await this.ralphTokenGateway.getBalance(wallet.activeAccount, network);
      if (!currentBalanceDTO.success) {
        this.presenter.presentError({
          status: "error",
          message: "Error getting PR token balance",
          details: {
            amount: amount,
            network: network,
            wallet: wallet,
          },
        });
        return;
      }
      currentBalance = currentBalanceDTO.data.balance;
      attempt++;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    this.presenter.presentSuccess({
      status: "success",
      amount: amount,
      network: network,
      wallet: wallet,
      transaction: claimDTO.data,
      message: `Successfully claimed ${amount} PR tokens!`,
    });
  }
}
