import type { TSignal } from "~/lib/core/entity/signals";
import type { BridgingOutputPort } from "~/lib/core/ports/primary/bridging-primary-ports";
import type { TBridgingErrorResponse, TBridgingProgressResponse, TBridgingSuccessResponse } from "~/lib/core/usecase-models/bridging-usecase-models";
import type { TBridgingViewModel } from "~/lib/core/view-models/bridging-view-model";

export default class BridgingPresenter implements BridgingOutputPort<TSignal<TBridgingViewModel>> {
  response: TSignal<TBridgingViewModel>;
  constructor(response: TSignal<TBridgingViewModel>) {
    this.response = response;
  }

  presentProgress(progress: TBridgingProgressResponse): void {
    this.response.value.value = {
      status: "in-progress",
      type: progress.type,
      message: progress.message,
      amount: progress.amount,
      wallet: progress.wallet,
      network: progress.network,
      toNetwork: progress.toNetwork,
      estimateGas: progress.estimateGas ?? 0,
    };
  }

  presentEstimatedGas(gasEstimation: TBridgingProgressResponse): void {
    const estimatedGas = gasEstimation.estimateGas;
    if (estimatedGas === undefined) {
      return;
    }
    this.response.value.value = {
      status: "in-progress",
      type: "gas",
      amount: gasEstimation.amount,
      network: gasEstimation.network,
      estimateGas: estimatedGas,
      wallet: gasEstimation.wallet,
      toNetwork: gasEstimation.toNetwork,
      transaction: gasEstimation.transaction,
      message: gasEstimation.message,
    };
  }

  presentError(error: TBridgingErrorResponse): void {
    this.response.value.value = {
      status: "error",
      type: error.details.type,
      amount: error.details.amount,
      message: error.message,
      wallet: error.details.wallet,
      network: error.details.network,
      toNetwork: error.details.toNetwork,
    };
  }

  presentSuccess(success: TBridgingSuccessResponse): void {
    this.response.value.value = {
      status: "success",
      message: success.message,
      amount: success.amount,
      wallet: success.wallet,
      network: success.network,
      toNetwork: success.toNetwork,
      transaction: success.transaction,
    };
  }
}
