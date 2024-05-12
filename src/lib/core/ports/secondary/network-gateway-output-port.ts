import type { TListNetworkDTO, TNetworkDTO, TNetworkSwitchDTO } from "../../dto/network-dto";

export default interface NetworkGatewayOutputPort {
    getSupportedNetworks(): TListNetworkDTO;
    getDefaultNetwork(): TNetworkDTO;
    getActiveNetwork(): TNetworkDTO;
    getNetwork(networkId: number): TNetworkDTO;
    setActiveNetwork(networkId: number): TNetworkSwitchDTO;
}