import { type BaseDTO } from "./base";

export type MintResponseSuccessData = {
    amountMinted: number;
    timestamp: string;
    explorerLink: string;
    tokenShortName: string;
    txHash: string;
};

export type MintResponseDTO = BaseDTO<MintResponseSuccessData>