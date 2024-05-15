import type { TSignal } from "~/lib/core/entity/signals";
import type { TWrappingViewModel } from "~/lib/core/view-models/wrapping-view-model";
import type { TWallet, TNetwork } from "~/lib/core/entity/models";
import { WrappingRequestSchema } from "~/lib/core/usecase-models/wrapping-usecase-models";
import type { WrappingInputPort } from "~/lib/core/ports/primary/wrapping-primary-ports";
import { clientContainer } from "../config/ioc/container";
import { USECASE } from "../config/ioc/symbols";
import { injectable } from "inversify";

export interface TWrappingControllerParameters {
  wallet: TWallet;
  network: TNetwork;
  amount: number;
  response: TSignal<TWrappingViewModel>;
}

@injectable()
export default class WrappingController {
  async execute(controllerParameters: TWrappingControllerParameters): Promise<void> {
    const wrappingRequest = WrappingRequestSchema.parse({
      network: controllerParameters.network,
      wallet: controllerParameters.wallet,
      amount: controllerParameters.amount,
    });
    const usecaseFactory: (response: TSignal<TWrappingViewModel>) => WrappingInputPort = clientContainer.get(USECASE.WRAPPING_USECASE_FACTORY);
    const usecase = usecaseFactory(controllerParameters.response);
    await usecase.execute(wrappingRequest);
  }
}
