import type { TSignal } from "~/lib/core/entity/signals";
import type { MintingOutputPort } from "~/lib/core/ports/primary/minting-primary-ports";
import type {
  TMintingErrorResponse,
  TMintingGasEstimationResponse,
  TMintingProgressResponse,
  TMintingSuccessResponse,
} from "~/lib/core/usecase-models/minting-usecase-models";
import type { TMintingViewModel } from "~/lib/core/view-models/minting-view-model";

export default class MintingPresenter implements MintingOutputPort<TSignal<TMintingViewModel>> {
  response: TSignal<TMintingViewModel>;
  constructor(response: TSignal<TMintingViewModel>) {
    this.response = response;
  }

  presentProgress(progress: TMintingProgressResponse): void {
    this.response.value.value = {
      status: "in-progress",
      type: progress.type,
      amount: progress.amount,
      transaction: progress.transaction,
      indexerBlockNumber: progress.indexerBlockNumber,
      initialIndexerBlockNumber: progress.initialIndexerBlockNumber,
      message: progress.message,
      network: progress.network,
      wallet: progress.wallet,
    };
  }

  presentEstimatedGas(gasEstimation: TMintingGasEstimationResponse): void {
    const estimatedGas = gasEstimation.estimateGas;
    if (estimatedGas === undefined) {
      this.presentError({
        status: "error",
        message: "Error getting estimated gas",
        details: {
          amount: gasEstimation.amount,
          type: "transaction-error",
          network: gasEstimation.network,
          wallet: gasEstimation.wallet,
          indexerBlockNumber: 0,
        },
      });
      return;
    }
    this.response.value.value = {
      status: "estimated-gas",
      amount: gasEstimation.amount,
      network: gasEstimation.network,
      wallet: gasEstimation.wallet,
      estimatedGas: estimatedGas,
      gasLimit: gasEstimation.gasLimit,
    };
  }

  presentError(error: TMintingErrorResponse): void {
    this.response.value.value = {
      status: "error",
      message: error.message,
      type: error.details.type,
      amount: error.details.amount,
      transaction: error.details.transaction,
      indexerBlockNumber: error.details.indexerBlockNumber,
      initialIndexerBlockNumber: error.details.indexerBlockNumber,
      network: error.details.network,
      wallet: error.details.wallet,
    };
  }
  presentSuccess(response: TMintingSuccessResponse): void {
    this.response.value.value = {
      status: "success",
      message: "Minting successful",
      amount: response.amount,
      mintTransaction: response.transaction,
      indexerBlockNumber: response.transaction.blockNumber,
    };
  }
}
