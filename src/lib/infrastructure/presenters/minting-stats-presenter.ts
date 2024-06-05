import type { TSignal } from "~/lib/core/entity/signals";
import type { MintingStatsOutputPort } from "~/lib/core/ports/primary/minting-stats-primary-ports";
import type { TMintingStatsResponse, TMintingStatsErrorResponse } from "~/lib/core/usecase-models/minting-stats-usecase-models";
import type { TMintingStatsViewModel } from "~/lib/core/view-models/minting-stats-view-model";

export default class MintingStatsPresenter implements MintingStatsOutputPort<TSignal<TMintingStatsViewModel>> {
  response: TSignal<TMintingStatsViewModel>;
  constructor(response: TSignal<TMintingStatsViewModel>) {
    this.response = response;
  }

  presentSuccess(response: TMintingStatsResponse): void {
    this.response.value.value = {
      status: "success",
      totalSupply: response.totalSupply,
      totalMinted: response.totalMinted,
      percentage: response.percentage,
      limit: response.limit,
      allocation: response.allocation,
      network: response.network,
    };
  }

  presentError(response: TMintingStatsErrorResponse): void {
    this.response.value.value = {
      status: "error",
      message: response.message,
      network: response.network,
    };
  }
}