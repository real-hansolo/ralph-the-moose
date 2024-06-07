import { TBalanceInfoRequest, TBalanceInfoSuccessResponse, TBalanceInfoErrorResponse } from "../../usecase-models/balance-info-usecase-models";

export interface BalanceInfoInputPort {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    presenter: BalanceInfoOutputPort<any>;
    execute(request: TBalanceInfoRequest): Promise<void>;
}

export interface BalanceInfoOutputPort<TResponse> {
    response: TResponse;
    presentSuccess(response: TBalanceInfoSuccessResponse): void;
    presentError(response: TBalanceInfoErrorResponse): void;
}