/* eslint-disable @typescript-eslint/no-explicit-any */
import type { MintingStatsInputPort, MintingStatsOutputPort } from "../ports/primary/minting-stats-primary-ports";
import type { TNetwork } from "../entity/models";
import type IndexerGatewayOutputPort from "../ports/secondary/indexer-gateway-output-port";
import type { TMintingStatsRequest } from "../usecase-models/minting-stats-usecase-models";
import type { TAllMintedDTO, TAllocationLimitDTO } from "../dto/indexer-gateway-dto";
export default class MintingStatsUsecase implements MintingStatsInputPort {
  presenter: MintingStatsOutputPort<any>;
  indexerGatewayFactory: (network: TNetwork) => IndexerGatewayOutputPort;
  constructor(presenter: MintingStatsOutputPort<any>, indexerGatewayFactory: (network: TNetwork) => IndexerGatewayOutputPort) {
    this.presenter = presenter;
    this.indexerGatewayFactory = indexerGatewayFactory;
  }

  async execute(request: TMintingStatsRequest): Promise<void> {
    const { network } = request;
    const indexerGateway = this.indexerGatewayFactory(network);
    const totalMinted = await this.__getAllMinted(indexerGateway);
    const mintLimit = await this.__getMintLimit(indexerGateway);
    const totalSupply = await this.__getTotalSupply();
    if (!totalMinted || !mintLimit || !totalSupply) {
      this.presenter.presentError({
        status: "error",
        message: "Indexer: Error getting mint stats.",
        network: network,
      });
      return;
    }
    let allocation = 0;
    if (request.walletAddress) {
      const allocationBasedOffIndexer = await this.__getAllocationForAddress(indexerGateway, request.walletAddress);
      if (allocationBasedOffIndexer !== undefined && allocationBasedOffIndexer > 0) {
        allocation = allocationBasedOffIndexer;
      } else {
        if (network.publicMint.enabled) {
          allocation = network.publicMint.amount;
        }
      }
    } else {
      if (network.publicMint.enabled) {
        allocation = network.publicMint.amount;
      }
    }
    const mintPercentage = this.__getMintPercentage(totalMinted, mintLimit);
    this.presenter.presentSuccess({
      status: "success",
      totalSupply: totalSupply,
      totalMinted: totalMinted,
      percentage: mintPercentage,
      limit: mintLimit,
      allocation: allocation,
      network: network,
    });
  }

  async __getAllMinted(indexerGateway: IndexerGatewayOutputPort) {
    const allMinted: TAllMintedDTO = await indexerGateway.getAllMinted();
    if (!allMinted.success) {
      return undefined;
    }
    return allMinted.data.total_minted;
  }

  async __getTotalSupply() {
    return 5000000; // TODO: hardcoded value
  }

  async __getMintLimit(indexerGateway: IndexerGatewayOutputPort) {
    const allocationLimits: TAllocationLimitDTO = await indexerGateway.getAllocationLimits();
    if (!allocationLimits.success) {
      return undefined;
    }
    return allocationLimits.data.total_mintable;
  }

  __getMintPercentage(totalMinted: number, mintLimit: number) {
    return parseFloat(((totalMinted / mintLimit) * 100).toFixed(2));
  }

  async __getAllocationForAddress(indexerGateway: IndexerGatewayOutputPort, walletAddress: string) {
    const allocationForAcountDTO = await indexerGateway.getAllocationForAddress(walletAddress);
    if (!allocationForAcountDTO.success) {
      return;
    }
    // TODO check balance, if balance is less than allocation, set allocation to (allocation - balance)
    const totalMintedDTO = await indexerGateway.getTotalMintedForAccount(walletAddress);
    if (!totalMintedDTO.success) {
      return;
    }
    // TODO: check if this is the correct value
    if (totalMintedDTO.data.minted >= allocationForAcountDTO.data.allocation_amount) {
      return;
    } else {
      return allocationForAcountDTO.data.allocation_amount - totalMintedDTO.data.minted;
    }
  }
}
