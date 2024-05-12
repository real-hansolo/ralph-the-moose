import {
  type ThirdwebClient,
  createThirdwebClient,
  toWei,
  prepareTransaction,
  estimateGas,
  sendTransaction,
  type PreparedTransaction,
} from "@maany_shr/thirdweb";
import { type Wallet } from "@maany_shr/thirdweb/wallets";
import { getThirdWebChain } from "~/lib/utils/networkUtils";
import { env } from "~/env";
import type {
  TPreparedTransactionDTO,
  TExecutedTransactionDTO,
  TEstimateGasDTO,
} from "~/lib/core/dto/web3-gateway-dto";
import type { TNetwork, TPreparedTransaction } from "~/lib/core/entity/models";
import type Web3GatewayOutputPort from "~/lib/core/ports/secondary/web3-gateway-output-port";
import { api } from "~/lib/infrastructure/trpc/react";


export default class ThirdwebWeb3Gateway
  implements Web3GatewayOutputPort<Wallet, PreparedTransaction>
{
  private thirdWebClient: ThirdwebClient;
  constructor() {
    this.thirdWebClient = createThirdwebClient({
      clientId: env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
    });
  }


  async prepareTransaction(
    to: string,
    network: TNetwork,
    value: string,
    data: string,
  ): Promise<TPreparedTransactionDTO<PreparedTransaction>> {
    try {
      const chain = getThirdWebChain(network.name);
      const thirdWebTx = prepareTransaction({
        to: to,
        value: toWei(value),
        data: `0x${data}`,
        chain: chain,
        client: this.thirdWebClient,
      });
      return {
        success: true,
        data: {
          to: to,
          value: value,
          data: data,
          network: network,
        },
        preparedTransaction: thirdWebTx as PreparedTransaction,
      };
    } catch (e) {
      return {
        success: false,
        data: {
          type: "prepared_transaction_error",
          message: `Error preparing transaction using Thirdweb`,
          to: to,
          value: value,
          data: data,
          network: network,
        },
      };
    }
  }

  async sendTransaction(
    preparedTransaction: PreparedTransaction,
    transactionDetails: TPreparedTransaction,
    wallet: Wallet,
  ): Promise<TExecutedTransactionDTO> {
    const thirdwebAccount = wallet.getAccount();
    if (!thirdwebAccount) {
      return {
        success: false,
        data: {
          type: "transaction_error",
          message: `No active account found in wallet`,
          from: "",
          to: transactionDetails.to,
          value: transactionDetails.value,
          data: transactionDetails.data,
          network: transactionDetails.network,
        },
      };
    }
    const { transactionHash } = await sendTransaction({
      account: thirdwebAccount,
      transaction: preparedTransaction,
    });
    const explorerLink = `${transactionDetails.network.explorer.url}/tx/${transactionHash}`;
    const timestamp = new Date().toLocaleDateString();

    const txDetailsDTOQuery = api.rpc.getTransaction.useQuery({
      hash: transactionHash,
      networkId: transactionDetails.network.chainId,
    })
    const txDetailsDTO = txDetailsDTOQuery.data;
    if(txDetailsDTOQuery.error ?? !txDetailsDTO ?? !txDetailsDTO.success ?? !txDetailsDTO.data) {
      return {
        success: true,
        data: {
          status: "partial",
          blockNumber: -1,
          hash: transactionHash,
          explorerUrl: explorerLink,
          timestamp: timestamp,
          from: thirdwebAccount.address,
          to: transactionDetails.to,
          value: transactionDetails.value,
          data: transactionDetails.data,
          network: transactionDetails.network,
        },
      };
    }
    const blockNumber = txDetailsDTO.data.blockNumber;
    return {
      success: true,
      data: {
        status: "success",
        blockNumber: blockNumber,
        hash: transactionHash,
        explorerUrl: explorerLink,
        timestamp: timestamp,
        from: thirdwebAccount.address,
        to: transactionDetails.to,
        value: transactionDetails.value,
        data: transactionDetails.data,
        network: transactionDetails.network,
      },
    };
  }

  async estimateGas(preparedTransaction: PreparedTransaction): Promise<TEstimateGasDTO> {
    const estimatedGas = await estimateGas({
      transaction: preparedTransaction,
    });
    return {
        success: true,
        data: estimatedGas,
    };
  }
}
