import { signal, type Signal } from "@preact/signals-react";
import type BalanceCardViewModel from "../view-models/BalanceCardViewModel";
import type IndexerGateway from "../gateways/indexer";

export default class BalanceCardPresenter {
  public inscriptionBalance: Signal<number>;
  public wrappedBalance: Signal<number>;
  public fee: Signal<number>;
  private indexer: IndexerGateway;
  private walletAddress: string | undefined;
  constructor(indexer: IndexerGateway, walletAddress: string | undefined) {
    this.inscriptionBalance = signal(0);
    this.wrappedBalance = signal(0);
    this.fee = signal(0);
    this.indexer = indexer;
    this.walletAddress = walletAddress;
  }

  async __presentInscriptionBalance() {
    const latestBlock = await this.indexer.getLatestBlock();
    if(!latestBlock.success) {
        this.inscriptionBalance.value = 0;
        return;
    }
    if(!this.walletAddress) {
        this.inscriptionBalance.value = 0;
        return;
    }
    const balanceForAccount = await this.indexer.getBalanceForAccount(this.walletAddress, latestBlock.data.latest_block);
    if(!balanceForAccount.success) {
        this.inscriptionBalance.value = 0;
        return;
    }
    this.inscriptionBalance.value = balanceForAccount.data.balance / 1000000000;
  }
  async present(): Promise<BalanceCardViewModel> {
    await this.__presentInscriptionBalance();
    return {
      status: "success",
      data: {
        inscriptionBalance: this.inscriptionBalance,
        wrappedBalance: this.wrappedBalance,
        fee: this.fee,
      },
    };
  }
}
