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
    const mintTransaction = progress.transaction;
    if (!mintTransaction) {
      this.presentError({
        status: "error",
        message: "Minting transaction not found",
        details: {
          network: progress.network,
          wallet: progress.wallet,
          amount: progress.amount,
          indexerBlockNumber: progress.indexerBlockNumber,
        },
      });
      return;
    }
    this.response.value.value = {
      ...this.response.value.value,
      status: "in-progress",
      amount: progress.amount,
      mintTransaction: mintTransaction,
      indexerBlockNumber: progress.indexerBlockNumber,
      initialIndexerBlockNumber: progress.intialIndexerBlockNumber,
      message: "Waiting for indexer to confirm transaction",
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
