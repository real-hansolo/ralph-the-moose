import { type BaseDTO } from "./base";

export type MintResponseSuccessData = {
    minted: number;
};

export type MintResponseDTO = BaseDTO<MintResponseSuccessData>