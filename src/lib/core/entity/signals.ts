import { signal, type Signal } from "@preact/signals-react";
import type { TNetwork, TPreparedContractCall, TPreparedTransaction } from "./models";
import { injectable } from "inversify";

export interface TSignal<TValue> {
    name: string;
    description: string;
    value: Signal<TValue>;
}

type TMintingEnabled = {
    enabled: true;
    allocationAmount: number;   
}

type TMintingDisabled = {
    enabled: false;
    allocationAmount: number;
    reason: string;
} 

export type TMintStatus = TMintingEnabled | TMintingDisabled;


type TMintingStatus = {
    status: "in-progress";
    mintTransactionHash: string;
    mintAmount: number;
    indexerBlockNumber: number;
    transactionBlockNumber: number;
    message: string;
    allocationAmount: number;
}

type TMintingSuccess = {
    status: "success";
    transactionHash: string;
    network: TNetwork;
}

type TMintingError = {
    status: "error";
    transactionHash: string;
    network: TNetwork;
    error: string;
}

export type TMintInfo = TMintingStatus | TMintingSuccess | TMintingError;


export type TTransactionGasStatus = {
    estimatedGas: number;
    gasLimit: number;
    preparedTransaction: TPreparedTransaction |TPreparedContractCall |  undefined;
}

@injectable()
export class S_TransactionGasStatus implements TSignal<TTransactionGasStatus> {
    name = "Transaction Gas Status";
    description ="Signal to show transaction gas status";
    value = signal({
        gasLimit: 0,
        estimatedGas: 0,
        preparedTransaction: undefined
    });
}