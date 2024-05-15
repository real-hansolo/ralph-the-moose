import type { TBridgingRequest, TBridgingProgressResponse, TBridgingSuccessResponse, TBridgingErrorResponse } from "../../usecase-models/bridging-usecase-models"

export interface BridgingInputPort {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    presenter: BridgingOutputPort<any>
    execute(request: TBridgingRequest): Promise<void>
}

export interface BridgingOutputPort<TResponse> {
    response: TResponse
    presentProgress(progress: TBridgingProgressResponse): void
    presentSuccess(error: TBridgingSuccessResponse): void
    presentError(response: TBridgingErrorResponse): void
    presentEstimatedGas(response: TBridgingProgressResponse): void
}