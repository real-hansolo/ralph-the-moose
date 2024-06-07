import { TSignal } from "~/lib/core/entity/signals";
import { BalanceInfoOutputPort } from "~/lib/core/ports/primary/balance-info-primary-ports";
import { TBalanceInfoSuccessResponse, TBalanceInfoErrorResponse } from "~/lib/core/usecase-models/balance-info-usecase-models";
import { TBalanceInfoViewModel } from "~/lib/core/view-models/balance-info-view-model";

export default class BalanceInfoPresenter implements BalanceInfoOutputPort<TSignal<TBalanceInfoViewModel>> {
  response: TSignal<TBalanceInfoViewModel>;
  constructor(response: TSignal<TBalanceInfoViewModel>) {
    this.response = response;
  }

  presentSuccess(response: TBalanceInfoSuccessResponse): void {
    this.response.value.value = {
      status: "success",
      balance: {
        inscriptions: response.balance.inscriptions,
        wrapped: response.balance.wrapped,
        claimable: response.balance.claimable,
      },
      network: response.network,
      wallet: response.wallet,
    };
  }

  presentError(response: TBalanceInfoErrorResponse): void {
    this.response.value.value = {
      status: "error",
      data: {
        message: response.message,
        wallet: response.details.wallet,
        network: response.details.network,
      },
    };
  }
}
