import { type Signal, signal } from "@preact/signals-react";
import type MintCardViewModel from "../view-models/MintCardViewModel";
import IndexerGateway from "../gateways/indexer";
import { env } from "~/env";
import {
  type GetAllocationLimitDTO,
  type GetAllMintedDTO,
} from "../dto/indexer-dto";
import Web3Gateway from "../gateways/web3";
import { type WalletInstance } from "@thirdweb-dev/react";
import { type MintResponseDTO } from "../dto/web3-dto";
import { toasts } from "../signals";
import { ToastProps } from "~/lib";

export default class MintCardPresenter {
  public mintedPercentage: Signal<number>;
  public mintLimit: Signal<number>;
  public totalSupply: Signal<number>;
  public totalMinted: Signal<number>;
  private indexer: IndexerGateway;
  private web3Gateway: Web3Gateway;
  constructor(wallet: WalletInstance | undefined) {
    // set up necessary gateways
    this.mintLimit = signal(0);
    this.mintedPercentage = signal(0);
    this.totalSupply = signal(0);
    this.totalMinted = signal<number>(0);
    const indexerHost = env.NEXT_PUBLIC_INDEXER_URL;
    this.indexer = new IndexerGateway(indexerHost);
    this.web3Gateway = new Web3Gateway(wallet, toasts);
  }

  mint = async () => {
    const mintResponse: MintResponseDTO =
      await this.web3Gateway.mintRequest(1230000000000000);
    if (mintResponse.success) {
      console.log("Minted");
      toasts.value.push({
        title: "Minting",
        message: "Minting successful!",
        status: "success",
        isPermanent: false,
      } as ToastProps);
    } else {
      console.log("Error minting", mintResponse.msg);
      toasts.value.push({
        title: "Minting failed",
        message: mintResponse.msg,
        status: "error",
        isPermanent: false,
      });
    }
  };

  async present(): Promise<MintCardViewModel> {
    // present the view model
    const allMinted: GetAllMintedDTO = await this.indexer.getAllMinted();
    if (!allMinted.success) {
      return {
        status: "error",
        message: allMinted.msg,
      } as MintCardViewModel;
    } else if (allMinted.success) {
      this.totalMinted.value = allMinted.data.total_minted / 1000000000; // TODO: check if this is the correct value
    }

    this.totalSupply.value = 5000000;

    const allocationLimits: GetAllocationLimitDTO =
      await this.indexer.getAllocationLimits();
    if (!allocationLimits.success) {
      return {
        status: "error",
        message: allocationLimits.msg,
      } as MintCardViewModel;
    } else if (allocationLimits.success) {
      this.mintLimit.value = allocationLimits.data.total_mintable / 1000000000; // TODO: check if this is the correct value
    }

    this.mintedPercentage.value = parseFloat(
      ((this.totalMinted.value / this.mintLimit.value) * 100).toFixed(2),
    );

    return {
      status: "success",
      data: {
        mintedPercentage: this.mintedPercentage,
        mintLimit: this.mintLimit,
        totalSupply: this.totalSupply,
        totalMinted: this.totalMinted,
        mint: () => {
          this.mint()
            .then(() => {
              console.log("Minted");
            })
            .catch((e) => {
              console.log("Error minting", e);
            });
        },
      },
    } as MintCardViewModel;
  }
}
