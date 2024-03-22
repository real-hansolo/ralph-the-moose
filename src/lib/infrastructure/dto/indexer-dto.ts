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


export type GetInscriptionSuccessDTO = {
    tx_hash: string,
    block_number: number,
    sender: string,
    timestamp: number,
    p: string,
    op: string,
    tick: string,
    receiver: string,
    amount: number,
    valid: number
}

export type GetInscriptionStatusDTO = BaseDTO<GetInscriptionSuccessDTO>;