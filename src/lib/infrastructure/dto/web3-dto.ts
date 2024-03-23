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