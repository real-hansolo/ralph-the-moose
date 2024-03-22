import { type BaseDTO } from "./base";

export type GetAllMintedSuccessDTO = {
    total_minted: number;
}
export type GetAllMintedDTO = BaseDTO<GetAllMintedSuccessDTO>;

export type GetAllocationLimitSSuccessDTO = {
    "total_mintable": number,
    "max_per_mint": number,
    "total_allocations": number,
    "address_count": number
}

export type GetAllocationLimitDTO = BaseDTO<GetAllocationLimitSSuccessDTO>;


export type GetAllocationForAddressSuccessDTO = {
    "address": string,
    "allocation_amount": number,
}

export type GetAllocationForAddressDTO = BaseDTO<GetAllocationForAddressSuccessDTO>;