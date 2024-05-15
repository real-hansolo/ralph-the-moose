import type { TBridgeTokensDTO } from "../../dto/elk-bridge-head-dto";
import type { TNetwork, TWallet } from "../../entity/models";
import type { TSignal, TTransactionGasStatus } from "../../entity/signals";

export default interface ElkBridgeHeadOutputPort {
  bridgeTokens(
    wallet: TWallet,
    network: TNetwork,
    amount: number,
    toNetwork: TNetwork,
    gasStatusSignal: TSignal<TTransactionGasStatus>,
  ): Promise<TBridgeTokensDTO>;
}
