import type { TWallet, TNetwork } from "~/lib/core/entity/models";
import type { TSignal } from "~/lib/core/entity/signals";
import type { ClaimingInputPort } from "~/lib/core/ports/primary/claiming-primary-ports";
import { ClaimingRequestSchema } from "~/lib/core/usecase-models/claiming-usecase-models";
import type { TClaimingViewModel } from "~/lib/core/view-models/claiming-view-model";
import { clientContainer } from "../config/ioc/container";
import { USECASE } from "../config/ioc/symbols";

export interface TClaimingControllerParameters {
  wallet: TWallet;
  network: TNetwork;
  amount: number;
  response: TSignal<TClaimingViewModel>;
}

export default class ClaimingController {
  async execute(controllerParameters: TClaimingControllerParameters): Promise<void> {
    const claimingRequest = ClaimingRequestSchema.parse({
      network: controllerParameters.network,
      wallet: controllerParameters.wallet,
      amount: controllerParameters.amount,
    });
    const usecaseFactory: (response: TSignal<TClaimingViewModel>) => ClaimingInputPort = clientContainer.get(USECASE.CLAIMING_USECASE_FACTORY);
    const usecase = usecaseFactory(controllerParameters.response);
    await usecase.execute(claimingRequest);
  }
}
