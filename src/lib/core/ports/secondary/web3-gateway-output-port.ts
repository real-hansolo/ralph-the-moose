import type { TEstimateGasDTO, TExecutedTransactionDTO, TPreparedTransactionDTO } from "../../dto/web3-gateway-dto";
import type { TNetwork, TPreparedTransaction as TTransactionDetails } from "../../entity/models";

export default interface Web3GatewayOutputPort<TWallet, TPreparedTransaction> {
    prepareTransaction(to: string, network: TNetwork, value: string, data: string): Promise<TPreparedTransactionDTO<TPreparedTransaction>>;
    sendTransaction(preparedTransaction: TPreparedTransaction, transactionDetails: TTransactionDetails, wallet: TWallet): Promise<TExecutedTransactionDTO>;
    estimateGas(preparedTransaction: TPreparedTransaction): Promise<TEstimateGasDTO>;
}