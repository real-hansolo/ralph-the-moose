import type { TSignal } from "~/lib/core/entity/signals";
import type { BridgingOutputPort } from "~/lib/core/ports/primary/bridging-primary-ports";
import type { TBridgingErrorResponse, TBridgingEstimateGasResponse, TBridgingProgressResponse, TBridgingSuccessResponse } from "~/lib/core/usecase-models/bridging-usecase-models";
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
      fromNetwork: progress.network,
      toNetwork: progress.toNetwork,
    };
  }

  presentEstimatedGas(gasEstimation: TBridgingEstimateGasResponse): void {
    const estimatedGas = gasEstimation.estimatedGas;
    if (estimatedGas === undefined) {
      return;
    }
    this.response.value.value = {
      status: "in-progress",
      type: "estimated-gas",
      amount: gasEstimation.amount,
      estimatedGas: estimatedGas,
      gasLimit: gasEstimation.gasLimit,
    };
  }

  presentError(error: TBridgingErrorResponse): void {
    this.response.value.value = {
      status: "error",
      type: error.details.type,
      amount: error.details.amount,
      message: error.message,
      wallet: error.details.wallet,
      fromNetwork: error.details.network,
      toNetwork: error.details.toNetwork,
    };
  }

  presentSuccess(success: TBridgingSuccessResponse): void {
    this.response.value.value = {
      status: "success",
      message: success.message,
      amount: success.amount,
      wallet: success.wallet,
      fromNetwork: success.network,
      toNetwork: success.toNetwork,
      transaction: success.transaction,
    };
  }
}
