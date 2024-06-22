import { injectable } from "inversify";
import type NetworkGatewayOutputPort from "~/lib/core/ports/secondary/network-gateway-output-port";
import { type Signal, signal } from "@preact/signals-react";
import { type TNetwork } from "~/lib/core/entity/models";
import type { TListNetworkDTO, TNetworkDTO, TNetworkSwitchDTO } from "~/lib/core/dto/network-dto";
import { AVALANCHE, BASE, BASE_SEPOLIA } from "../config/network-config";
import { env } from "~/env";
import { signalsContainer } from "../config/ioc/container";
import { SIGNALS } from "../config/ioc/symbols";
import type { TSignal } from "~/lib/core/entity/signals";

@injectable()
export default class NetworkGateway implements NetworkGatewayOutputPort {
  private activeNetwork: Signal<TNetwork> | undefined;
  constructor(
  ) {
    const defaultNetworkDTO = this.getDefaultNetwork();
    if (defaultNetworkDTO.success) {
      this.activeNetwork = signal<TNetwork>(defaultNetworkDTO.data);
    }
  }

  getDefaultNetwork(): TNetworkDTO {
    let defaultNetwork = BASE;
    if (env.NEXT_PUBLIC_ENABLE_TESTNETS) {
      defaultNetwork = BASE_SEPOLIA;
    }
    return {
      success: true,
      data: defaultNetwork,
    };
  }

  getSupportedNetworks(): TListNetworkDTO {
    return {
      success: true,
      data: [BASE, AVALANCHE],
    };
  }

  getActiveNetwork(): TNetworkDTO {
    const S_ACTIVE_NETWORK = signalsContainer.get<TSignal<TNetwork>>(SIGNALS.ACTIVE_NETWORK);
    return {
      success: true,
      data: S_ACTIVE_NETWORK.value.value,
    };
  }

  getNetwork(networkId: number): TNetworkDTO {
    const supportedNetworksDTO = this.getSupportedNetworks();
    if (!supportedNetworksDTO.success) {
      return {
        success: false,
        data: { 
            type: "network_config_not_found",
            message: "Error loading configured networks!"
        },
      };
    }
    const network = supportedNetworksDTO.data.find((n) => n.chainId === networkId);
    if (!network) {
      return {
        success: false,
        data: { 
            type: "network_config_not_found",
            message: `Network ${networkId} not found in configured networks!`
        },
      };
    }
    return {
      success: true,
      data: network,
    };
  }

  setActiveNetwork(networkId: number): TNetworkSwitchDTO {
    const networkDTO = this.getNetwork(networkId);
    if (!networkDTO.success) {
      return {
        success: false,
        data: {
            type: "network_switch_error",
            message: `Network ${networkId} is not supported!`
        }
      }
    }
    const S_ACTIVE_NETWORK = signalsContainer.get<TSignal<TNetwork>>(SIGNALS.ACTIVE_NETWORK);
    S_ACTIVE_NETWORK.value.value  = networkDTO.data;
    return {
      success: true,
      data: `Switched to ${networkDTO.data.name} successfully!`
    }
  }
}
