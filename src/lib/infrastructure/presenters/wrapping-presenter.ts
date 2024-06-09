import type { TSignal } from "~/lib/core/entity/signals";
import type { WrappingOutputPort } from "~/lib/core/ports/primary/wrapping-primary-ports";
import type {
  TWrappingErrorResponse,
  TWrappingEstimatedGasResponse,
  TWrappingProgressResponse,
  TWrappingSuccessResponse,
} from "~/lib/core/usecase-models/wrapping-usecase-models";
import type { TWrappingViewModel } from "~/lib/core/view-models/wrapping-view-model";

export default class WrappingPresenter implements WrappingOutputPort<TSignal<TWrappingViewModel>> {
  response: TSignal<TWrappingViewModel>;
  constructor(response: TSignal<TWrappingViewModel>) {
    this.response = response;
  }

  presentProgress(progress: TWrappingProgressResponse): void {
    if (progress.type === "awaiting-transaction") {
      this.response.value.value = {
        status: progress.type,
        amount: progress.amount,
        network: progress.network,
        wallet: progress.wallet,
      };
      return;
    } else if (progress.type === "estimated-gas") {
      this.presentEstimatedGas(progress);
      return;
    } else if (progress.type === "verifying") {
      this.response.value.value = {
        status: progress.type,
        amount: progress.amount,
        network: progress.network,
        wallet: progress.wallet,
        wrapTransaction: progress.transaction,
        attempt: progress.attempt,
      };
    }
  }

  presentEstimatedGas(gasEstimation: TWrappingEstimatedGasResponse): void {
    const estimatedGas = gasEstimation.estimatedGas;
    if (estimatedGas === undefined) {
      this.presentError({
        status: "error",
        message: "Error getting estimated gas",
        details: {
          amount: gasEstimation.amount,
          network: gasEstimation.network,
          wallet: gasEstimation.wallet,
        },
      });
      return;
    }
    this.response.value.value = {
      status: "estimating-gas",
      estimatedGas: estimatedGas,
      gasLimit: gasEstimation.network.gasLimit,
      amount: gasEstimation.amount,
    };
  }

  presentError(error: TWrappingErrorResponse): void {
    this.response.value.value = {
      status: "error",
      message: error.message,
      amount: error.details.amount,
      wrapTransaction: error.details.transaction,
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
