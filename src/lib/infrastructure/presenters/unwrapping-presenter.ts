import type { TSignal } from "~/lib/core/entity/signals";
import type { UnWrappingOutputPort } from "~/lib/core/ports/primary/unwrapping-primary-ports";
import type { TUnwrappingProgressResponse, TUnwrappingErrorResponse, TUnwrappingSuccessResponse } from "~/lib/core/usecase-models/unwrapping-usecase-models";
import type { TUnwrappingViewModel } from "~/lib/core/view-models/unwrapping-view-model";

export default class UnwrappingPresenter implements UnWrappingOutputPort<TSignal<TUnwrappingViewModel>>{
    response: TSignal<TUnwrappingViewModel>;
    constructor(response: TSignal<TUnwrappingViewModel>) {
        this.response = response;
    }

    presentProgress(progress: TUnwrappingProgressResponse): void {
        this.response.value.value = {
            status: "in-progress",
            message: progress.message,
            amount: progress.amount,
            unwrapTransaction: progress.transaction,

        };
    }

    presentEstimatedGas(gasEstimation: TUnwrappingProgressResponse): void {
        const estimatedGas = gasEstimation.estimatedGas;
        if (estimatedGas === undefined) {
            this.presentError({
                status: "error",
                message: "Error getting estimated gas",
                details: {
                    amount: gasEstimation.amount,
                    network: gasEstimation.network,
                    wallet: gasEstimation.wallet,
                    approvalError: false
                },
            });
            return;
        }
        this.response.value.value = {
            status: "estimated-gas",
            amount: gasEstimation.amount,
            network: gasEstimation.network,
            estimatedGas: estimatedGas,
            wallet: gasEstimation.wallet,
        };
    }

    presentError(error: TUnwrappingErrorResponse): void {
        this.response.value.value = {
            status: "error",
            message: error.message,
            amount: error.details.amount,
            unwrapTransaction: error.details.transaction,
            
        };
    }

    presentSuccess(success: TUnwrappingSuccessResponse): void {
        this.response.value.value = {
            status: "success",
            message: "Unwrapping successful",
            amount: success.amount,
            unwrapTransaction: success.transaction,
        };
    }

}
