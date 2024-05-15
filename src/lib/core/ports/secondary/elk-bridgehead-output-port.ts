import type { TBridgeTokensDTO } from "../../dto/elk-bridge-head-dto";
import type { TNetwork, TWallet } from "../../entity/models";

export default interface ElkBridgeHeadOutputPort {
    bridgeTokens(wallet: TWallet, network: TNetwork, amount: number, toNetwork: TNetwork): Promise<TBridgeTokensDTO>;
}