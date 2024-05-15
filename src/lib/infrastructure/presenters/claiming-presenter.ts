import type { TSignal } from "~/lib/core/entity/signals";
import type { ClaimingOutputPort } from "~/lib/core/ports/primary/claiming-primary-ports";
import type { TClaimingErrorResponse, TClaimingProgressResponse, TClaimingSuccessResponse } from "~/lib/core/usecase-models/claiming-usecase-models";
import type { TClaimingViewModel } from "~/lib/core/view-models/claiming-view-model";

export default class ClaimingPresenter implements ClaimingOutputPort<TSignal<TClaimingViewModel>> {
    response: TSignal<TClaimingViewModel>;
    constructor(response: TSignal<TClaimingViewModel>) {
        this.response = response;
    }

    presentProgress(progress: TClaimingProgressResponse): void {
        this.response.value.value = {
            ...this.response.value.value,
            status: "in-progress",
            amount: progress.amount,
            message: progress.message,
            transaction: progress.transaction,
        };
    }

    presentSuccess(success: TClaimingSuccessResponse): void {
        this.response.value.value = {
            status: "success",
            amount: success.amount,
            message: success.message,
            network: success.network,
            wallet: success.wallet,
            transaction: success.transaction
        };  
    }

    presentError(error: TClaimingErrorResponse): void {
        this.response.value.value = {
            status: "error",
            message: error.message,
            amount: error.details.amount,
            network: error.details.network,
            wallet: error.details.wallet
        };
    }
}