import type { TEstimateGasDTO, TExecutedTransactionDTO, TPreparedContractCallDTO, TPreparedTransactionDTO } from "../../dto/web3-gateway-dto";
import type { TPreparedContractCall, TPreparedTransaction } from "../../entity/models";

export default interface Web3GatewayOutputPort<TWallet, TProviderPreparedTransaction, TProviderPreparedContractCall> {
    prepareTransaction(transaction: TPreparedTransaction): TPreparedTransactionDTO<TProviderPreparedTransaction>;
    sendTransaction(preparedTransaction: TProviderPreparedTransaction, transactionDetails: TPreparedTransaction, wallet: TWallet): Promise<TExecutedTransactionDTO>;
    prepareContractCall(contractCall: TPreparedContractCall): TPreparedContractCallDTO<TProviderPreparedContractCall>;
    callContract(preparedContractCall: TProviderPreparedContractCall, contractCallDetails: TPreparedContractCall, wallet: TWallet): Promise<TExecutedTransactionDTO>;
    estimateGas(preparedTransaction: TProviderPreparedContractCall | TProviderPreparedTransaction): Promise<TEstimateGasDTO>;
}