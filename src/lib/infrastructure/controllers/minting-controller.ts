import type { TNetwork, TWallet } from "~/lib/core/entity/models";
import type { TSignal } from "~/lib/core/entity/signals";
import { MintingRequestSchema } from "~/lib/core/usecase-models/minting-usecase-models";
import type { TMintingViewModel } from "~/lib/core/view-models/minting-view-model";
import { clientContainer } from "../config/ioc/container";
import { USECASE } from "../config/ioc/symbols";
import type { MintingInputPort } from "~/lib/core/ports/primary/minting-primary-ports";
import { injectable } from "inversify";

export interface TMintingControllerParameters {
  wallet: TWallet;
  network: TNetwork;
  amount: number;
  response: TSignal<TMintingViewModel>;
}

@injectable()
export default class MintingController {
  async execute(controllerParameters: TMintingControllerParameters): Promise<void> {
    const mintingRequest = MintingRequestSchema.parse({
      network: controllerParameters.network,
      wallet: controllerParameters.wallet,
      amount: controllerParameters.amount,
    });
    const usecaseFactory: (response: TSignal<TMintingViewModel>) => MintingInputPort = clientContainer.get(USECASE.MINTING_USECASE_FACTORY);
    const usecase = usecaseFactory(controllerParameters.response);
    await usecase.execute(mintingRequest);
  }
}
