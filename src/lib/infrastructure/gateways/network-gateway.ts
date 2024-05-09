import { type TChainConfig } from "@maany_shr/ralph-the-moose-ui-kit";

export default class NetworkGateway {
    async listSupportedNetworks(): Promise<TChainConfig[]> {
        return [];
    }

    async getActiveNetwork(): Promise<TChainConfig> {
        return {} as TChainConfig;
    }

    async setActiveNetwork(network: TChainConfig): Promise<void> {
        return;
    }
}