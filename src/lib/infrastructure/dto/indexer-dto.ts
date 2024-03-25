import { type BigNumber } from "ethers";
import { type BaseDTO } from "./base";

export type GetAllMintedSuccessDTO = {
    total_minted: BigNumber;
}
export type GetAllMintedDTO = BaseDTO<GetAllMintedSuccessDTO>;

export type GetAllocationLimitSSuccessDTO = {
    "total_mintable": BigNumber,
    "max_per_mint": BigNumber,
    "total_allocations": BigNumber,
    "address_count": BigNumber
}

export type GetAllocationLimitDTO = BaseDTO<GetAllocationLimitSSuccessDTO>;


export type GetAllocationForAddressSuccessDTO = {
    "address": string,
    "allocation_amount": BigNumber,
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
    amount: BigNumber,
    valid: number
}

export type GetInscriptionStatusDTO = BaseDTO<GetInscriptionSuccessDTO>;


export type GetLatestBlockSuccessDTO = {
    latest_block: number
}

export type GetLatestBlockDTO = BaseDTO<GetLatestBlockSuccessDTO>;

export type GetBalanceForAccountSuccessDTO = {
    balance: BigNumber
}

export type GetBalanceForAccountDTO = BaseDTO<GetBalanceForAccountSuccessDTO>;

export type GetTotalMintedForAccountSuccessDTO = {
    minted: BigNumber
}

export type GetTotalMintedForAccountDTO = BaseDTO<GetTotalMintedForAccountSuccessDTO>;
