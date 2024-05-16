import type { TBridgeTokensDTO } from "~/lib/core/dto/elk-bridge-head-dto";
import type { TContract, TNetwork, TPreparedContractCall, TWallet } from "~/lib/core/entity/models";
import type ElkBridgeHeadOutputPort from "~/lib/core/ports/secondary/elk-bridgehead-output-port";
import ElkBridgeHeadABI from "../config/abi/ElkBridgeHead.json";
import { fromHumanReadableNumber } from "~/lib/utils/tokenUtils";
import type { TSignal, TTransactionGasStatus } from "~/lib/core/entity/signals";
import { callThirdWebContractUtil } from "~/lib/utils/transactionUtils";
import { injectable } from "inversify";

@injectable()
export default class ElkBridgeHeadGateway implements ElkBridgeHeadOutputPort {
  __getContract(network: TNetwork): TContract {
    return {
      name: "Elk Bridge Head",
      address: network.contracts.bridgeHeadAddress,
      abi: ElkBridgeHeadABI,
      network: network,
    };
  }
  async bridgeTokens(
    wallet: TWallet,
    network: TNetwork,
    amount: number,
    toNetwork: TNetwork,
    gasStatusSignal?: TSignal<TTransactionGasStatus>,
  ): Promise<TBridgeTokensDTO> {
    const contract = this.__getContract(network);
    const bridgeAmount = fromHumanReadableNumber(amount);
    const amountToThirdWeb = BigInt(bridgeAmount.toBigInt())
    const preparedContractCall: TPreparedContractCall = {
      contract: contract,
      method: {
        inputs: [
          {
            internalType: "uint32",
            name: "_chainId",
            type: "uint32",
          },
          {
            internalType: "address",
            name: "_receiver",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "_amount",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "_message",
            type: "bytes",
          },
        ],
        name: "bridgeTokens",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      params: [toNetwork.chainId, wallet.activeAccount, amountToThirdWeb, "0x"],
      value: network.fee.bridging.toString(),
    };
    const executedTransactionDTO = await callThirdWebContractUtil(wallet, preparedContractCall, gasStatusSignal);
    if (!executedTransactionDTO.success) {
      return {
        success: false,
        data: {
          message: executedTransactionDTO.data.message,
          wallet: wallet,
          network: network,
          toNetwork: toNetwork,
        },
      };
    }
    return executedTransactionDTO;
  }
}
