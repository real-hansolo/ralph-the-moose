import type RalphReservoirOutputPort from "~/lib/core/ports/secondary/ralph-reservoir-output-port";
import type {
  TContract,
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
import { injectable } from "inversify";
import type { TSignal, TTransactionGasStatus } from "~/lib/core/entity/signals";
import { callThirdWebContractUtil } from "~/lib/utils/transactionUtils";
import { client } from "../trpc/vanilla";

@injectable()
export default class RalphReservoirGateway implements RalphReservoirOutputPort {
  constructor(
  ) {}

  async __getEthContract(network: TNetwork): Promise<ethers.Contract> {
    const rpcUrlQuery = await client.rpc.getRpcProvider.query({
      networkId: network.chainId,
    });
    if(!rpcUrlQuery.success) {
      return Promise.reject(`Error fetching rpc provider for ${network.name}`);
    }
    const rpcUrl = rpcUrlQuery.data.url;
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

  async getClaimableAmount(
    walletAddress: string,
    network: TNetwork,
  ): Promise<ClaimableDTO> {
    const contract = await this.__getEthContract(network);
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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const executedTransactionDTO = await callThirdWebContractUtil(wallet, preparedContractCall, gasStatusSignal);
    if(!executedTransactionDTO.success) {
      return {
        success: false,
        data: {
          message: executedTransactionDTO.data.message,
          walletAddress: wallet.activeAccount ?? "address_not_known",
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
    const contract = await this.__getEthContract(network);
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
   

    const executedTransactionDTO = await callThirdWebContractUtil(wallet, contractCallDetails, gasStatusSignal);
    if(!executedTransactionDTO.success) {
      return {
        success: false,
        data: {
          message: executedTransactionDTO.data.message,
          walletAddress: wallet.activeAccount ?? "address_not_known",
          network: network.name,
        },
      };
    }
    return executedTransactionDTO;
  }
}
