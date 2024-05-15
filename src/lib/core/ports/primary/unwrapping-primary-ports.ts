import type { TUnwrappingErrorResponse, TUnwrappingProgressResponse, TUnwrappingRequest, TUnwrappingSuccessResponse } from "../../usecase-models/unwrapping-usecase-models"

export interface UnWrappingInputPort {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    presenter: UnWrappingOutputPort<any>
    execute(request: TUnwrappingRequest): Promise<void>
}

export interface UnWrappingOutputPort<TResponse> {
    response: TResponse
    presentProgress(progress: TUnwrappingProgressResponse): void
    presentSuccess(error: TUnwrappingSuccessResponse): void
    presentError(response: TUnwrappingErrorResponse): void
    presentEstimatedGas(response: TUnwrappingProgressResponse): void
}

