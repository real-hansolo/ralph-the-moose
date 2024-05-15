import type { TSignal } from "~/lib/core/entity/signals";
import type { WrappingOutputPort } from "~/lib/core/ports/primary/wrapping-primary-ports";
import type { TWrappingErrorResponse, TWrappingProgressResponse, TWrappingSuccessResponse } from "~/lib/core/usecase-models/wrapping-usecase-models";
import type { TWrappingViewModel } from "~/lib/core/view-models/wrapping-view-model";

export default class WrappingPresenter implements WrappingOutputPort<TSignal<TWrappingViewModel>> {
  response: TSignal<TWrappingViewModel>;
  constructor(response: TSignal<TWrappingViewModel>) {
    this.response = response;
  }

  presentProgress(progress: TWrappingProgressResponse): void {
    this.response.value.value = {
      status: "in-progress",
      message: progress.message,
      amount: progress.amount,
      wrapTransaction: progress.transaction,
      wrapFound: progress.wrapFound,
    };
  }

  presentEstimatedGas(gasEstimation: TWrappingProgressResponse): void {
    const estimatedGas = gasEstimation.estimatedGas;
    if (estimatedGas === undefined) {
      this.presentError({
        status: "error",
        message: "Error getting estimated gas",
        details: {
          amount: gasEstimation.amount,
          network: gasEstimation.network,
          wallet: gasEstimation.wallet,
          wrapFound: false,
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
    };
  }

  presentError(error: TWrappingErrorResponse): void {
    this.response.value.value = {
      status: "error",
      message: error.message,
      amount: error.details.amount,
      wrapTransaction: error.details.transaction,
      wrapFound: error.details.wrapFound,
    };
  }

  presentSuccess(success: TWrappingSuccessResponse): void {
    this.response.value.value = {
      status: "success",
      message: "Wrapping successful",
      amount: success.amount,
      wrapTransaction: success.transaction,
    };
  }
}
