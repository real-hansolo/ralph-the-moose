import { type BaseDTO } from "./base";

export type MintResponseSuccessDTO = {
    success: true;
    data: {
        minted: number;
        chain: string;
    };
};

export type MintResponseDTO = BaseDTO<MintResponseSuccessDTO>