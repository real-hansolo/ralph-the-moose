import type RalphReservoirOutputPort from "~/lib/core/ports/secondary/ralph-reservoir-output-port";
import type {
  TContract,
  TNetwork,
  TPreparedContractCall,
  TWallet,
} from "~/lib/core/entity/models";
import type { ClaimDTO, ClaimableDTO } from "~/lib/core/dto/ralph-reservoir-dto";
import RalphReservoirABI from "../config/abi/RalphReservoir.json";
import { BigNumber, ethers } from "ethers";
import {
  fromHumanReadableNumber,
  toHumanReadableNumber,
} from "~/lib/utils/tokenUtils";
import { inject, injectable } from "inversify";
import { GATEWAYS } from "../config/ioc/symbols";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type Web3GatewayOutputPort from "~/lib/core/ports/secondary/web3-gateway-output-port";
import { ThirdwebWalletProvider } from "~/app/api/web3/thirdweb-wallet-provider";

@injectable()
export default class RalphReservoirGateway implements RalphReservoirOutputPort {
  constructor(
    @inject(GATEWAYS.WEB3_GATEWAY)
    private web3Gateway: Web3GatewayOutputPort<unknown, unknown, unknown>,
    @inject(GATEWAYS.WALLET_PROVIDER)
    private walletProvider: ThirdwebWalletProvider,
  ) {}
  getEthContract(network: TNetwork): ethers.Contract {
    const provider = new ethers.providers.JsonRpcProvider(network.rpcProvider);
    return new ethers.Contract(
      network.contracts.ralphReservoirAddress,
      RalphReservoirABI,
      provider,
    );
  }

  getContract(network: TNetwork): TContract {
    return {
      name: "RalphReservoir",
      address: network.contracts.ralphReservoirAddress,
      abi: RalphReservoirABI,
      network: network,
    };
  }
  async claimable(
    walletAddress: string,
    network: TNetwork,
  ): Promise<ClaimableDTO> {
    const contract = this.getEthContract(network);
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

  async claim(
    wallet: TWallet,
    network: TNetwork,
    amount: number,
  ): Promise<ClaimDTO> {
    const amountToClaim = fromHumanReadableNumber(amount);
    const preparedContractCall: TPreparedContractCall = {
      contract: this.getContract(network),
      method: {
        inputs: [
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
        ],
        name: "claim",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      params: [BigInt(amountToClaim.toBigInt())],
      value: "0",
    };
    const preparedTransactionDTO =
      this.web3Gateway.prepareContractCall(preparedContractCall);
    if (!preparedTransactionDTO.success) {
      return {
        success: false,
        data: {
          message: preparedTransactionDTO.data.message,
          walletAddress: wallet.activeAccount,
          network: network.name,
        },
      };
    }
    const web3GatewayPreparedContractCall =
      preparedTransactionDTO.preparedContractCall;
    const executedTransactionDTO = await this.web3Gateway.callContract(
      web3GatewayPreparedContractCall,
      preparedContractCall,
      wallet,
    );
    if (!executedTransactionDTO.success) {
      return {
        success: false,
        data: {
          message: executedTransactionDTO.data.message,
          walletAddress: wallet.activeAccount,
          network: network.name,
        },
      };
    }
    return executedTransactionDTO;
  }
}
