import type { TWrappingErrorResponse, TWrappingProgressResponse, TWrappingRequest, TWrappingSuccessResponse } from "../../usecase-models/wrapping-usecase-models"

export interface WrappingInputPort {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    presenter: WrappingOutputPort<any>
    execute(request: TWrappingRequest): Promise<void>
}

export interface WrappingOutputPort<TResponse> {
    response: TResponse
    presentProgress(progress: TWrappingProgressResponse): void
    presentSuccess(error: TWrappingSuccessResponse): void
    presentError(response: TWrappingErrorResponse): void
}