import { type Signal } from "@preact/signals-react";
import { type TNetwork, NetworkSchema } from "./models";

export type TSignal<TValue> = {
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
