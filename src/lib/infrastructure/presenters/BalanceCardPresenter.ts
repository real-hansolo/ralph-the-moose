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
    this.inscriptionBalance.value = 0;
  }
  async present(): Promise<BalanceCardViewModel> {
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
