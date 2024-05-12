import type RalphReservoirOutputPort from "~/lib/core/ports/secondary/ralph-reservoir-output-port";
import type { TNetwork } from "~/lib/core/entity/models";
import type { ClaimableDTO } from "~/lib/core/dto/ralph-reservoir-dto";
import RalphReservoirABI from "../config/abi/RalphReservoir.json";
import { BigNumber, ethers } from "ethers";
import { toHumanReadableNumber } from "~/lib/utils/tokenUtils";
import { inject, injectable } from "inversify";
import { GATEWAYS } from "../config/ioc/symbols";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type Web3GatewayOutputPort from "~/lib/core/ports/secondary/web3-gateway-output-port";

@injectable()
export default class RalphReservoirGateway implements RalphReservoirOutputPort {
    constructor(
        @inject(GATEWAYS.WEB3_GATEWAY) private web3Gateway: Web3GatewayOutputPort<unknown, unknown>,
    ) {
    }
  getContract(network: TNetwork): ethers.Contract {
    const provider = new ethers.providers.JsonRpcProvider(network.rpcProvider);
    return new ethers.Contract(
      network.contracts.ralphReservoirAddress,
      RalphReservoirABI,
      provider,
    );
  }

  async claimable(walletAddress: string, network: TNetwork): Promise<ClaimableDTO> {
    const contract = this.getContract(network);
    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const claimable = await contract.claimable(walletAddress);
        return {
          success: true,
          data: {
            amount: toHumanReadableNumber(BigNumber.from(claimable)),
          },
        };
      } catch (e) {
        console.error(e as Error);
        return {
          success: false,
          data: {
            message: `Error fetching claimable amount`,
            walletAddress: walletAddress,
            network: network.name,
          },
        };
      }
  }


}
