import type { TWallet, TNetwork } from "~/lib/core/entity/models";
import type { TSignal } from "~/lib/core/entity/signals";
import type { UnWrappingInputPort } from "~/lib/core/ports/primary/unwrapping-primary-ports";
import { UnwrappingRequestSchema } from "~/lib/core/usecase-models/unwrapping-usecase-models";
import type { TUnwrappingViewModel } from "~/lib/core/view-models/unwrapping-view-model";
import { clientContainer } from "../config/ioc/container";
import { USECASE } from "../config/ioc/symbols";

export interface TUnwrappingControllerParameters {
    wallet: TWallet;
    network: TNetwork;
    amount: number;
    response: TSignal<TUnwrappingViewModel>;
}

export default class UnwrappingController {
    async execute(controllerParameters: TUnwrappingControllerParameters): Promise<void> {
        const unwrappingRequest = UnwrappingRequestSchema.parse({
            network: controllerParameters.network,
            wallet: controllerParameters.wallet,
            amount: controllerParameters.amount,
        });
        const usecaseFactory: (response: TSignal<TUnwrappingViewModel>) => UnWrappingInputPort = clientContainer.get(USECASE.UNWRAPPING_USECASE_FACTORY);
        const usecase = usecaseFactory(controllerParameters.response);
        await usecase.execute(unwrappingRequest);
    }
}