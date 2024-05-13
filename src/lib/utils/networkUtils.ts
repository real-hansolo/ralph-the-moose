"use client";
import { type Chain } from "@maany_shr/thirdweb";
import { avalanche, avalancheFuji, base, baseSepolia } from "@maany_shr/thirdweb/chains";
import type { TNetwork } from "../core/entity/models";
import { GATEWAYS } from "../infrastructure/config/ioc/symbols";
import type NetworkGatewayOutputPort from "../core/ports/secondary/network-gateway-output-port";
import { clientContainer } from "../infrastructure/config/ioc/container";
import type { TNetworkDTO } from "../core/dto/network-dto";

export function getThirdWebChain(name: string): Chain {
    switch (name) {
        case "Base":
            return base;
        case "Base Sepolia":
            return baseSepolia;
        case "Avalanche":
            return avalanche;
        case "Avalanche Fuji":
            return avalancheFuji; 
        default:
            throw new Error(`Config Error: Could not find thirdweb chain ${name} `);
    }
}

export function getNetworkFromThirdwebChain(chain: Chain): TNetwork {
    const networkGateway = clientContainer.get<NetworkGatewayOutputPort>(GATEWAYS.NETWORK_GATEWAY);
    const walletNetworkDTO: TNetworkDTO = networkGateway.getNetwork(
        chain.id,
      );
      if (!walletNetworkDTO.success) {
        throw new Error(
          `Wallet network ${chain.name}: ${chain.id} is not supported!`,
        );
      }
      return walletNetworkDTO.data;
}