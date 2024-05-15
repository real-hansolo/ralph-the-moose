import type { TWallet, TNetwork } from "~/lib/core/entity/models";
import type { TSignal } from "~/lib/core/entity/signals";
import type { TBridgingViewModel } from "~/lib/core/view-models/bridging-view-model";
import type { BridgingInputPort } from "~/lib/core/ports/primary/bridging-primary-ports";
import { clientContainer } from "../config/ioc/container";
import { USECASE } from "../config/ioc/symbols";
import { injectable } from "inversify";

export interface TBridgingControllerParameters {
    wallet: TWallet;
    network: TNetwork;
    toNetwork: TNetwork;
    amount: number;
    response: TSignal<TBridgingViewModel>;
}

@injectable()
export default class BridgingController {
    async execute(controllerParameters: TBridgingControllerParameters): Promise<void> {
        const bridgingRequest = {
            wallet: controllerParameters.wallet,
            network: controllerParameters.network,
            toNetwork: controllerParameters.toNetwork,
            amount: controllerParameters.amount,
        };
        const usecaseFactory: (response: TSignal<TBridgingViewModel>) => BridgingInputPort = clientContainer.get(USECASE.BRIDGING_USECASE_FACTORY);
        const usecase = usecaseFactory(controllerParameters.response);
        await usecase.execute(bridgingRequest);
    }
}