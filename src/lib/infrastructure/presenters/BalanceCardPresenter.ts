import { Signal, signal } from "@preact/signals-react";
import type BalanceCardViewModel from "../view-models/BalanceCardViewModel";
import type IndexerGateway from "../gateways/indexer";
import { DEFAULT_CHAIN, type TChainConfig } from "../config/chains";

export default class BalanceCardPresenter {
  public inscriptionBalance: Signal<number>;
  public wrappedBalance: Signal<number>;
  public fee: Signal<number>;
  private indexer: IndexerGateway;
  private walletAddress: string | undefined;
  private walletChainId: number | undefined;
  private activeChain = new Signal<TChainConfig>(DEFAULT_CHAIN);
  constructor(indexer: IndexerGateway, walletAddress: string | undefined, walletChainID: number | undefined) {
    this.inscriptionBalance = signal(0);
    this.wrappedBalance = signal(0);
    this.fee = signal(0);
    this.indexer = indexer;
    this.walletAddress = walletAddress;
    this.walletChainId = walletChainID;
  }

  async __presentInscriptionBalance() {
    this.inscriptionBalance.value = 0;
    if(!this.walletChainId || !this.walletAddress || !this.activeChain.value) {
        return;
    }
    // TODO: the minted/{address} endpoint should take the chainId as a parameter
    if(this.walletChainId !== this.activeChain.value.chainId) {
        return;
    }
    const latestBlock = await this.indexer.getLatestBlock();
    if(!latestBlock.success) {
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
