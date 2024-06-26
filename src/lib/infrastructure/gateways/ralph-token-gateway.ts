import type { ApproveReservoirDTO, BalanceDTO, SpendingAllowanceDTO } from "~/lib/core/dto/ralph-token-dto";
import type { TContract, TNetwork, TPreparedContractCall, TWallet } from "~/lib/core/entity/models";
import type RalphTokenOutputPort from "~/lib/core/ports/secondary/ralph-token-output-port";
import RalphABI from "../config/abi/Ralph.json";
import { callThirdWebContractUtil } from "~/lib/utils/transactionUtils";
import { client } from "../trpc/vanilla";
import { BigNumber, ethers } from "ethers";
import { toHumanReadableNumber } from "~/lib/utils/tokenUtils";
import { injectable } from "inversify";

@injectable()
export default class RalphTokenGateway implements RalphTokenOutputPort {
  async __getEthContract(network: TNetwork): Promise<ethers.Contract> {
    const rpcUrlQuery = await client.rpc.getRpcProvider.query({
      networkId: network.chainId,
    });
    if (!rpcUrlQuery.success) {
      return Promise.reject(`Error fetching rpc provider for ${network.name}`);
    }
    const rpcUrl = rpcUrlQuery.data.url;
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    return new ethers.Contract(network.contracts.ralphTokenAddress, RalphABI, provider);
  }

  __getContract(network: TNetwork): TContract {
    return {
      name: "Ralph Token",
      address: network.contracts.ralphTokenAddress,
      abi: RalphABI,
      network: network,
    };
  }

  async approveReservoir(wallet: TWallet, network: TNetwork, amount?: number): Promise<ApproveReservoirDTO> {
    const bigAmount = amount ?? `115792089237316195423570985008687907853269984665640564039457584007913129639935`;
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

    const executedTransactionDTO = await callThirdWebContractUtil(wallet, preparedContractCall);
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

  async getSpendingAllowance(wallet: TWallet, network: TNetwork): Promise<SpendingAllowanceDTO> {
    const contract = await this.__getEthContract(network);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const spendingAllowance = await contract.allowance(wallet.activeAccount, network.contracts.ralphReservoirAddress);
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

  async getBalance(walletAddress: string, network: TNetwork): Promise<BalanceDTO> {
    const contract = await this.__getEthContract(network);
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
