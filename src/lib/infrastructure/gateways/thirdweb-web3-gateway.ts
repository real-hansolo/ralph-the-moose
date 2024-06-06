import {
  type ThirdwebClient,
  createThirdwebClient,
  toWei,
  prepareTransaction,
  prepareContractCall,
  getContract,
  estimateGas as thirdWebEsimtateGas,
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
  TPreparedContractCallDTO,
} from "~/lib/core/dto/web3-gateway-dto";
import type {
  TPreparedContractCall,
  TPreparedTransaction,
} from "~/lib/core/entity/models";
import type Web3GatewayOutputPort from "~/lib/core/ports/secondary/web3-gateway-output-port";
import { injectable } from "inversify";
import { client } from "../trpc/vanilla";

@injectable()
export default class ThirdwebWeb3Gateway
  implements
    Web3GatewayOutputPort<Wallet, PreparedTransaction, PreparedTransaction>
{
  private thirdWebClient: ThirdwebClient;
  constructor(
  ) {
    this.thirdWebClient = createThirdwebClient({
      clientId: env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
    });
  }

  prepareTransaction(
    transactionDetails: TPreparedTransaction,
  ): TPreparedTransactionDTO<PreparedTransaction> {
    console.log("transactionDetails", transactionDetails);
    try {
      const chain = getThirdWebChain(transactionDetails.network.name);
      const thirdWebTx = prepareTransaction({
        to: transactionDetails.to,
        value: toWei(transactionDetails.value),
        data: `${transactionDetails.data}` as any,
        chain: chain,
        client: this.thirdWebClient,
      });
      return {
        success: true,
        preparedTransaction: thirdWebTx as PreparedTransaction,
      };
    } catch (e) {
      return {
        success: false,
        data: {
          type: "prepared_transaction_error",
          message: `Error preparing transaction using Thirdweb. ${(e as Error).message}`,
          to: transactionDetails.to,
          value: transactionDetails.value,
          data: transactionDetails.data,
          network: transactionDetails.network,
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
    const timestamp = new Date().getTime();

    const txDetailsDTOQuery = await client.rpc.getTransaction.query({
      hash: transactionHash,
      networkId: transactionDetails.network.chainId,
    });
    if (
      !txDetailsDTOQuery.success) {
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
    const txDetails = txDetailsDTOQuery.data;
    const blockNumber = txDetails.blockNumber;

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

  prepareContractCall(
    preparedContractCall: TPreparedContractCall,
  ): TPreparedContractCallDTO<PreparedTransaction> {
    let thirdwebChain;
    try {
      thirdwebChain = getThirdWebChain(
        preparedContractCall.contract.network.name,
      );
    } catch (e) {
      return {
        success: false,
        data: {
          type: "contract_preparation_error",
          message: `Error preparing contract call using Thirdweb. Mapping for chain: ${preparedContractCall.contract.network.name} not found.`,
        },
      };
    }

    try {
      const thirdwebContract = getContract({
        client: this.thirdWebClient,
        address: preparedContractCall.contract.address,
        chain: thirdwebChain,
      });
      const transaction = prepareContractCall({
        contract: thirdwebContract,
        method: {
          name: preparedContractCall.method.name,
          type: preparedContractCall.method.type,
          inputs: preparedContractCall.method.inputs,
          outputs: preparedContractCall.method.outputs,
          stateMutability: preparedContractCall.method.stateMutability,
        },
        params: preparedContractCall.params,
        value: toWei(preparedContractCall.value),
      });
      return {
        success: true,
        preparedContractCall: transaction as PreparedTransaction,
      };
    } catch (e) {
      return {
        success: false,
        data: {
          type: "contract_preparation_error",
          message: `Error preparing contract call for method ${preparedContractCall.method.name} of ${preparedContractCall.contract.name} using Thirdweb. Network: ${preparedContractCall.contract.network.name} `,
        },
      };
    }
  }

  async callContract(preparedContractCall: PreparedTransaction, contractCallDetails: TPreparedContractCall, wallet: Wallet): Promise<TExecutedTransactionDTO> {
    const transactionDetails: TPreparedTransaction = {
      to: contractCallDetails.contract.address,
      value: contractCallDetails.value,
      data: contractCallDetails.data,
      network: contractCallDetails.contract.network,
    };
    const executedTransactionDTO = await this.sendTransaction(preparedContractCall, transactionDetails, wallet);
    return executedTransactionDTO;
  }

  async estimateGas(
    preparedTransaction: PreparedTransaction,
  ): Promise<TEstimateGasDTO> {
    const estimatedGas = await thirdWebEsimtateGas({
      transaction: preparedTransaction,
    });
    return {
      success: true,
      data: estimatedGas,
    };
  }
}
