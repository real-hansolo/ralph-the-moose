import type { TMintingErrorResponse, TMintingProgressResponse, TMintingRequest, TMintingSuccessResponse } from "../../usecase-models/minting-usecase-models"

export interface MintingInputPort {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    presenter: MintingOutputPort<any>
    execute(request: TMintingRequest): Promise<void>
}

export interface MintingOutputPort<TResponse> {
    response: TResponse
    presentProgress(progress: TMintingProgressResponse): void
    presentSuccess(error: TMintingSuccessResponse): void
    presentError(response: TMintingErrorResponse): void
}