import type RalphReservoirOutputPort from "~/lib/core/ports/secondary/ralph-reservoir-output-port";
import type {
  TContract,
  TExecutedTransaction,
  TNetwork,
  TPreparedContractCall,
  TWallet,
} from "~/lib/core/entity/models";
import type {
  ClaimDTO,
  ClaimableDTO,
  SpendingAllowanceDTO,
  UnwrapDTO,
} from "~/lib/core/dto/ralph-reservoir-dto";
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
import { api } from "../trpc/react";
import type { TExecutedTransactionDTO } from "~/lib/core/dto/web3-gateway-dto";
import type { TSignal, TTransactionGasStatus } from "~/lib/core/entity/signals";

@injectable()
export default class RalphReservoirGateway implements RalphReservoirOutputPort {
  constructor(
    @inject(GATEWAYS.WEB3_GATEWAY)
    private web3Gateway: Web3GatewayOutputPort<unknown, unknown, unknown>,
  ) {}

  __getEthContract(network: TNetwork): ethers.Contract {
    const rpcUrlQuery = api.rpc.getRpcProvider.useQuery({
      networkId: network.chainId,
    });
    if (rpcUrlQuery.error ?? !rpcUrlQuery.data ?? !rpcUrlQuery.data.success) {
      throw new Error("Error fetching rpc provider");
    }
    const rpcUrl = rpcUrlQuery.data.data.url;
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    return new ethers.Contract(
      network.contracts.ralphReservoirAddress,
      RalphReservoirABI,
      provider,
    );
  }

  __getContract(network: TNetwork): TContract {
    return {
      name: "RalphReservoir",
      address: network.contracts.ralphReservoirAddress,
      abi: RalphReservoirABI,
      network: network,
    };
  }

  async __callContract(
    wallet: TWallet,
    preparedContractCall: TPreparedContractCall,
    gasStatusSignal: TSignal<TTransactionGasStatus>,
  ): Promise<TExecutedTransactionDTO> {
    const preparedTransactionDTO =
      this.web3Gateway.prepareContractCall(preparedContractCall);
    if (!preparedTransactionDTO.success) {
      return {
        success: false,
        data: {
          from: wallet.activeAccount,
          to: preparedContractCall.contract.address,
          value: preparedContractCall.value,
          data: preparedContractCall.data,
          network: preparedContractCall.contract.network,
          message: "Error preparing contract call",
          type: "transaction_error",
        },
      };
    }
    const web3GatewayPreparedContractCall =
      preparedTransactionDTO.preparedContractCall;

    const estimatedGasDTO = await this.web3Gateway.estimateGas(
      web3GatewayPreparedContractCall,
    );
    if (estimatedGasDTO.success) {
      gasStatusSignal
    }

    const executedTransactionDTO = await this.web3Gateway.callContract(
      web3GatewayPreparedContractCall,
      preparedContractCall,
      wallet,
    );
    if (!executedTransactionDTO.success) {
      return {
        success: false,
        data: {
          from: wallet.activeAccount,
          to: preparedContractCall.contract.address,
          value: preparedContractCall.value,
          data: preparedContractCall.data,
          network: preparedContractCall.contract.network,
          message: `Error executing contract call. ${executedTransactionDTO.data.message}`,
          type: "transaction_error",
          
        },
      };
    }
    return executedTransactionDTO;
  }


  async getClaimableAmount(
    walletAddress: string,
    network: TNetwork,
  ): Promise<ClaimableDTO> {
    const contract = this.__getEthContract(network);
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
    gasStatusSignal: TSignal<TTransactionGasStatus>,
  ): Promise<ClaimDTO> {
    const amountToClaim = fromHumanReadableNumber(amount);
    const preparedContractCall: TPreparedContractCall = {
      contract: this.__getContract(network),
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

    const executedTransactionDTO = await this.__callContract(wallet, preparedContractCall, gasStatusSignal);
    if(!executedTransactionDTO.success) {
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

  async getSpendingAllowance(
    wallet: TWallet,
    network: TNetwork,
  ): Promise<SpendingAllowanceDTO> {
    const contract = this.__getEthContract(network);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const spendingAllowance = await contract.allowance(wallet.activeAccount);
      return {
        success: true,
        data: {
          allowance: toHumanReadableNumber(BigNumber.from(spendingAllowance)),
        },
      };
    } catch (e) {
      console.error(e as Error);
      return {
        success: false,
        data: {
          message: `Error fetching spending allowance. ${(e as Error).message}`,
          walletAddress: wallet.activeAccount,
          network: network.name,
        },
      };
    }
  }

  async unwrap(
    wallet: TWallet,
    network: TNetwork,
    amount: number,
    gasStatusSignal: TSignal<TTransactionGasStatus>,
  ): Promise<UnwrapDTO> {
    const amountToUnwrap = fromHumanReadableNumber(amount);
    const contract = this.__getContract(network);
    const contractCallDetails: TPreparedContractCall = {
      contract: contract,
      method: {
        inputs: [
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
        ],
        name: "unwrap",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      params: [BigInt(amountToUnwrap.toBigInt())],
      value: network.fee.unwrapping.toString(),
    };
   

    const executedTransactionDTO = await this.__callContract(wallet, contractCallDetails, gasStatusSignal);
    if(!executedTransactionDTO.success) {
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
