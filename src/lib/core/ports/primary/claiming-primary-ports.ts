import type { TClaimingRequest, TClaimingProgressResponse, TClaimingSuccessResponse, TClaimingErrorResponse } from "../../usecase-models/claiming-usecase-models"

export interface ClaimingInputPort {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    presenter: ClaimingOutputPort<any>
    execute(request: TClaimingRequest): Promise<void>
}

export interface ClaimingOutputPort<TResponse> {
    response: TResponse
    presentProgress(progress: TClaimingProgressResponse): void
    presentSuccess(error: TClaimingSuccessResponse): void
    presentError(response: TClaimingErrorResponse): void
}