import type {
  ApproveReservoirDTO,
  BalanceDTO,
} from "~/lib/core/dto/ralph-token-dto";
import type {
  TContract,
  TNetwork,
  TPreparedContractCall,
  TWallet,
} from "~/lib/core/entity/models";
import type RalphTokenOutputPort from "~/lib/core/ports/secondary/ralph-token-output-port";
import RalphABI from "../config/abi/Ralph.json";
import { callThirdWebContractUtil } from "~/lib/utils/transactionUtils";
import { api } from "../trpc/react";
import { BigNumber, ethers } from "ethers";
import { toHumanReadableNumber } from "~/lib/utils/tokenUtils";

export default class RalphTokenGateway implements RalphTokenOutputPort {
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
      RalphABI,
      provider,
    );
  }

  __getContract(network: TNetwork): TContract {
    return {
      name: "Ralph Token",
      address: network.contracts.ralphReservoirAddress,
      abi: RalphABI,
      network: network,
    };
  }

  async approveReservoir(
    wallet: TWallet,
    network: TNetwork,
    amount?: number,
  ): Promise<ApproveReservoirDTO> {
    const bigAmount =
      amount ??
      `115792089237316195423570985008687907853269984665640564039457584007913129639935`;
    const contract = this.__getContract(network);
    const preparedContractCall: TPreparedContractCall = {
      contract: contract,
      method: {
        inputs: [
          {
            internalType: "address",
            name: "spender",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
        ],
        name: "approve",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      params: [network.contracts.ralphReservoirAddress, BigInt(bigAmount)],
      value: "0",
    };

    const executedTransactionDTO = await callThirdWebContractUtil(
      wallet,
      preparedContractCall,
    );
    if (!executedTransactionDTO.success) {
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
  async getBalance(
    walletAddress: string,
    network: TNetwork,
  ): Promise<BalanceDTO> {
    const contract = this.__getEthContract(network);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const balance = await contract.balanceOf(walletAddress);
      return {
        success: true,
        data: {
          balance: toHumanReadableNumber(BigNumber.from(balance)),
        },
      };
    } catch (e) {
      return {
        success: false,
        data: {
          message: (e as Error).message,
          walletAddress: walletAddress,
          network: network.name,
        },
      };
    }
  }
}
