/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TNetwork } from "../entity/models";
import type { BalanceInfoInputPort, BalanceInfoOutputPort } from "../ports/primary/balance-info-primary-ports";
import type IndexerGatewayOutputPort from "../ports/secondary/indexer-gateway-output-port";
import type RalphReservoirOutputPort from "../ports/secondary/ralph-reservoir-output-port";
import type RalphTokenOutputPort from "../ports/secondary/ralph-token-output-port";
import type { TBalanceInfoRequest } from "../usecase-models/balance-info-usecase-models";

export default class BalanceInfoUsecase implements BalanceInfoInputPort {
  presenter: BalanceInfoOutputPort<any>;
  ralphTokenGateway: RalphTokenOutputPort;
  ralphReservoirGateway: RalphReservoirOutputPort;
  indexerGatewayFactory: (network: TNetwork) => IndexerGatewayOutputPort;

  constructor(
    presenter: BalanceInfoOutputPort<any>,
    ralphTokenGateway: RalphTokenOutputPort,
    ralphReservoirGateway: RalphReservoirOutputPort,
    indexerGatewayFactory: (network: TNetwork) => IndexerGatewayOutputPort,
  ) {
    this.presenter = presenter;
    this.ralphTokenGateway = ralphTokenGateway;
    this.ralphReservoirGateway = ralphReservoirGateway;
    this.indexerGatewayFactory = indexerGatewayFactory;
  }

  async execute(request: TBalanceInfoRequest): Promise<void> {
    const { wallet, network } = request;
    const indexerGateway = this.indexerGatewayFactory(network);
    const wrappedBalanceDTO = await this.ralphTokenGateway.getBalance(wallet.activeAccount, network);
    if (!wrappedBalanceDTO.success) {
      this.presenter.presentError({
        status: "error",
        message: `Error getting PR token balance on ${network.name} for wallet ${wallet.activeAccount}. If you're like a nerd or sth, here's the message from the backend: ${wrappedBalanceDTO.data.message}`,
        details: {
          network: network,
          wallet: wallet,
        },
      });
      return;
    }
    const wrappedBalance = wrappedBalanceDTO.data.balance;

    // const inscriptionBalanceDTO = await indexerGateway.getBalanceForAccount(wallet.activeAccount);
    // if (!inscriptionBalanceDTO.success) {
    //   this.presenter.presentError({
    //     status: "error",
    //     message: `Error getting inscription balance on ${network.name} for wallet ${wallet.activeAccount}. If you're like a nerd or sth, here's the message from the backend: ${inscriptionBalanceDTO.data.msg}`,
    //     details: {
    //       network: network,
    //       wallet: wallet,
    //     },
    //   });
    //   return;
    // }

    const inscriptionBalance = 0 //inscriptionBalanceDTO.data.balance;

    // const claimableAmountDTO = await this.ralphReservoirGateway.getClaimableAmount(wallet.activeAccount, network);
    // if (!claimableAmountDTO.success) {
    //   this.presenter.presentError({
    //     status: "error",
    //     message: `Error getting claimable amount on ${network.name} for wallet ${wallet.activeAccount}. If you're like a nerd or sth, here's the message from the backend: ${claimableAmountDTO.data.message}`,
    //     details: {
    //       network: network,
    //       wallet: wallet,
    //     },
    //   });
    //   return;
    // }

    const claimableAmount = 0 //claimableAmountDTO.data.amount;

    this.presenter.presentSuccess({
      status: "success",
      balance: {
        inscriptions: inscriptionBalance,
        wrapped: wrappedBalance,
        claimable: claimableAmount,
      },
      network: network,
      wallet: wallet,
    });
  }
}
