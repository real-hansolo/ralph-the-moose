import { type BaseDTO } from "./base";

export type MintResponseSuccessData = {
    amountMinted: number;
    timestamp: string;
    explorerLink: string;
    tokenShortName: string;
    txHash: string;
};

export type MintResponseDTO = BaseDTO<MintResponseSuccessData>

export type ClaimableSuccessData = {
    amount: number;
};
export type ClaimableDTO = BaseDTO<ClaimableSuccessData>;

export type GetWrappedBalanceSuccessData = {
    balance: number;
};

export type GetWrappedBalanceDTO = BaseDTO<GetWrappedBalanceSuccessData>;


export type ClaimSuccessData = {
    txHash: string;
};

export type ClaimDTO = BaseDTO<ClaimSuccessData>;


export type WrapSuccessDTO = {
    txHash: string;
    timestamp: string;
    explorerLink: string;
    wrappedAmount: number;
    tokenShortName: string;
};

export type WrapDTO = BaseDTO<WrapSuccessDTO>;

export type UnwrapSuccessDTO = {
    txHash: string;
    timestamp: string;
    explorerLink: string;
    unwrappedAmount: number;
    tokenShortName: string;
};

export type UnwrapDTO = BaseDTO<UnwrapSuccessDTO>;



