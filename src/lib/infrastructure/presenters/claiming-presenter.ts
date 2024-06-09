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
        if (progress.type === "awaiting-transaction") {
            this.response.value.value = {
                ...this.response.value.value,
                status: "awaiting-transaction",
                amount: progress.amount,
            };
            return;
        }
        if(progress.type === "verifying") {
            this.response.value.value = {
                ...this.response.value.value,
                status: "verifying",
                amount: progress.amount,
                transaction: progress.transaction,
                attempt: progress.attempt,
            };
            return;
        }
    }

    presentSuccess(success: TClaimingSuccessResponse): void {
        this.response.value.value = {
            status: "success",
            amount: success.amount,
            transaction: success.transaction
        };  
    }

    presentError(error: TClaimingErrorResponse): void {
        this.response.value.value = {
            status: "error",
            message: error.message,
            amount: error.details.amount,
        };
    }
}