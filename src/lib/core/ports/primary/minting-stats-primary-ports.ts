import type { TMintingStatsErrorResponse, TMintingStatsRequest, TMintingStatsResponse } from "../../usecase-models/minting-stats-usecase-models";

export interface MintingStatsInputPort {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  presenter: MintingStatsOutputPort<any>;
  execute(request: TMintingStatsRequest): Promise<void>;
}

export interface MintingStatsOutputPort<TResponse> {
  response: TResponse;
  presentSuccess(response: TMintingStatsResponse): void;
  presentError(response: TMintingStatsErrorResponse): void;
}
