import { inject, injectable } from "inversify";
import type {
  TGetTransactionByHashDTO,
  TGetRpcURLDTO,
} from "~/lib/core/dto/rpc-gateway-dto";
import type RPCGatewayOutputPort from "~/lib/core/ports/secondary/rpc-gateway-output-port";
import { GATEWAYS } from "../config/ioc/symbols";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type NetworkGatewayOutputPort from "~/lib/core/ports/secondary/network-gateway-output-port";
import { env } from "~/env";
import axios from "axios";
import https from 'https';

@injectable()
export default class RpcGateway implements RPCGatewayOutputPort {
  constructor(
    @inject(GATEWAYS.NETWORK_GATEWAY)
    private networkGateway: NetworkGatewayOutputPort,
  ) {}
  getRpcURL(networkId: number): TGetRpcURLDTO {
    const networkDTO = this.networkGateway.getNetwork(networkId);
    if (!networkDTO.success) {
      return {
        success: false,
        data: {
          type: "network_not_supported",
          message: `Network with id ${networkId} not supported! No rpc url available!`,
        },
      };
    }
    const network = networkDTO.data;
    switch (network.name.toUpperCase()) {
      case "BASE":
        if (network.rpcProvider === "alchemy") {
          return {
            success: true,
            data: {
              url: `https://base-mainnet.g.alchemy.com/v2/${env.ALCHEMY_BASE_API_KEY}`,
            },
          };
        }
        return {
          success: false,
          data: {
            type: "rpc_provider_not_supported",
            message: `rpcProvider ${network.rpcProvider} not supported for network ${network.name}`,
          },
        };
      case "BASE SEPOLIA":
        if (network.rpcProvider === "alchemy") {
          return {
            success: true,
            data: {
              url: `https://base-sepolia.g.alchemy.com/v2/${env.ALCHEMY_BASE_SEPOLIA_API_KEY}`,
            },
          };
        }
        return {
          success: false,
          data: {
            type: "rpc_provider_not_supported",
            message: `rpcProvider ${network.rpcProvider} not supported for network ${network.name}`,
          },
        };
      case "AVALANCHE":
        if (network.rpcProvider === "infura") {
          return {
            success: true,
            data: {
              url: `https://avalanche-mainnet.infura.io/v3/${env.INFURA_API_KEY}`,
            },
          };
        }
        return {
          success: false,
          data: {
            type: "rpc_provider_not_supported",
            message: `rpcProvider ${network.rpcProvider} not supported for network ${network.name}`,
          },
        };
      case "AVALANCHE_FUJI":
        if (network.rpcProvider === "infura") {
          return {
            success: true,
            data: {
              url: `https://avalanche-fuji.infura.io/v3/${env.INFURA_API_KEY}`,
            },
          };
        }
        return {
          success: false,
          data: {
            type: "rpc_provider_not_supported",
            message: `rpcProvider ${network.rpcProvider} not supported for network ${network.name}`,
          },
        };
      default:
        return {
          success: false,
          data: {
            type: "network_not_supported",
            message: `Cannot get rpc details. Network ${network.name} not supported!`,
          },
        };
    }
  }

  async getTransactionByHash(
    networkId: number,
    hash: string,
  ): Promise<TGetTransactionByHashDTO> {
    const getRpcUrlDTO = this.getRpcURL(networkId);
    if (!getRpcUrlDTO.success) {
      return getRpcUrlDTO;
    }
    try {
      const rpcUrl = getRpcUrlDTO.data.url;
      console.log(rpcUrl)
      const instance = axios.create({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        httpsAgent: new https.Agent({
            rejectUnauthorized: false,
            }),
        });
      const response = await instance.post(rpcUrl, {
        jsonrpc: "2.0",
        method: "eth_getTransactionByHash",
        params: [hash],
        id: 1,
      });
      return {
        success: true,
        data: response.data,
      } as TGetTransactionByHashDTO;
    } catch (error: unknown) {
      return {
        success: false,
        data: {
          type: "transaction_not_found",
          message: `Error fetching transaction details: ${(error as Error).message}`,
        },
      };
    }
  }
}
