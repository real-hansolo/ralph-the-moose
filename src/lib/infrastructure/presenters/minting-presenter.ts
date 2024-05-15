import type { TSignal } from "~/lib/core/entity/signals";
import type { MintingOutputPort } from "~/lib/core/ports/primary/minting-primary-ports";
import type {
  TMintingErrorResponse,
  TMintingProgressResponse,
  TMintingSuccessResponse,
} from "~/lib/core/usecase-models/minting-usecase-models";
import type { TMintingViewModel } from "~/lib/core/view-models/minting-view-model";

export default class MintingPresenter
  implements MintingOutputPort<TSignal<TMintingViewModel>>
{
  response: TSignal<TMintingViewModel>;
  constructor(response: TSignal<TMintingViewModel>) {
    this.response = response;
  }

  presentProgress(progress: TMintingProgressResponse): void {
    this.response.value.value = {
      ...this.response.value.value,
      status: "in-progress",
      amount: progress.amount,
      mintTransaction: progress.transaction,
      indexerBlockNumber: progress.indexerBlockNumber,
      initialIndexerBlockNumber: progress.intialIndexerBlockNumber,
      message: progress.message,
    };
  }

  presentEstimatedGas(gasEstimation: TMintingProgressResponse): void {
    const estimatedGas = gasEstimation.estimateGas;
    if (estimatedGas === undefined) {
      this.presentError({
        status: "error",
        message: "Error getting estimated gas",
        details: {
          amount: gasEstimation.amount,
          network: gasEstimation.network,
          wallet: gasEstimation.wallet,
          indexerBlockNumber: 0,
        },
      });
      return;
    }
    this.response.value.value = {
      ...this.response.value.value,
      status: "estimated-gas",
      amount: gasEstimation.amount,
      network: gasEstimation.network,
      wallet: gasEstimation.wallet,
      estimatedGas: estimatedGas,
    };
  }
  presentError(error: TMintingErrorResponse): void {
    this.response.value.value = {
      status: "error",
      message: error.message,
      amount: error.details.amount,
      mintTransaction: error.details.transaction,
      indexerBlockNumber: error.details.indexerBlockNumber,
      initialIndexerBlockNumber: 0, // Replace 0 with the appropriate value
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
