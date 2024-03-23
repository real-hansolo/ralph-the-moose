import { type Signal, signal } from "@preact/signals-react";
import type BalanceCardViewModel from "../view-models/BalanceCardViewModel";
import type IndexerGateway from "../gateways/indexer";
import { type TChainConfig } from "../config/chains";
import type Web3Gateway from "../gateways/web3";

export default class BalanceCardPresenter {
  public inscriptionBalance: Signal<number>;
  public wrappedBalance: Signal<number>;
  public fee: Signal<number>;
  public claimableWrappedBalance: Signal<number>;
  
  
  private indexer: IndexerGateway;
  private web3Gateway: Web3Gateway;
  
  private walletAddress: string | undefined;
  private walletChainId: number | undefined;
  private activeNetwork: Signal<TChainConfig>;

  constructor(indexer: IndexerGateway, web3Gateway: Web3Gateway, walletAddress: string | undefined, walletChainID: number | undefined, activeNetwork: Signal<TChainConfig>) {
    this.activeNetwork = activeNetwork;
    this.inscriptionBalance = signal(0);
    this.wrappedBalance = signal(0);
    this.fee = signal(0);
    this.claimableWrappedBalance = signal(0);

    this.indexer = indexer;
    this.web3Gateway = web3Gateway;
    
    this.walletAddress = walletAddress;
    this.walletChainId = walletChainID;
  }

  async __presentInscriptionBalance() {
    this.inscriptionBalance.value = 0;
    if(!this.walletChainId || !this.walletAddress || !this.activeNetwork.value) {
        return;
    }
    // TODO: the minted/{address} endpoint should take the chainId as a parameter
    if(this.walletChainId !== this.activeNetwork.value.chainId) {
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

  async __presentClaimableWrappedBalance() {
    this.claimableWrappedBalance.value = 0;
    if(!this.walletChainId || !this.walletAddress || !this.activeNetwork.value) {
        return;
    }
    const claimableBalance = await this.web3Gateway.fetchClaimableAmount(this.activeNetwork.value);
    if(!claimableBalance.success) {
      return;
    }
    this.claimableWrappedBalance.value = claimableBalance.data.amount / 1000000000;
  }

  async present(): Promise<BalanceCardViewModel> {
    await this.__presentInscriptionBalance();
    await this.__presentClaimableWrappedBalance();
    return {
      status: "success",
      data: {
        inscriptionBalance: this.inscriptionBalance,
        wrappedBalance: this.wrappedBalance,
        fee: this.fee,
        claimableWrappedBalance: this.claimableWrappedBalance,
      },
    };
  }
}
