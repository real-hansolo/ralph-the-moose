import type { TBridgingControllerParameters } from "../controller-parameters/bridging-controller-parameters";

export default interface BridgingController<TWalletProviderWallet> {
    execute(controllerParameters: TBridgingControllerParameters<TWalletProviderWallet>): Promise<void>;
}