import { z } from "zod";
import { DTOSchemaFactory } from "~/sdk/dto";

export const IndexerGatewayErrorSchema = z.object({
    msg: z.string(),
}).passthrough()

export const AllMintedDTOSchema = DTOSchemaFactory(
    z.object({
        total_minted: z.number(),
    }),
    IndexerGatewayErrorSchema
)

export type TAllMintedDTO = z.infer<typeof AllMintedDTOSchema>

export const AllocationLimitDTOSchema = DTOSchemaFactory(
    z.object({
        total_mintable: z.number(),
        max_per_mint: z.number(),
        total_allocations: z.number(),
        address_count: z.number(),
    }),
    IndexerGatewayErrorSchema
)

export type TAllocationLimitDTO = z.infer<typeof AllocationLimitDTOSchema>

export const AllocationForAddressDTOSchema = DTOSchemaFactory(
    z.object({
        address: z.string(),
        allocation_amount: z.number(),
    }),
    IndexerGatewayErrorSchema
)

export type TAllocationForAddressDTO = z.infer<typeof AllocationForAddressDTOSchema>

export const InscriptionDTOSchema = DTOSchemaFactory(
    z.object({
        tx_hash: z.string(),
        block_number: z.number(),
        sender: z.string(),
        timestamp: z.number(),
        p: z.string(),
        op: z.string(),
        tick: z.string(),
        receiver: z.string(),
        amount: z.number(),
        valid: z.number(),
    }),
    IndexerGatewayErrorSchema
)

export type TInscriptionStatusDTO = z.infer<typeof InscriptionDTOSchema>

export const IndexerLatestBlockDTOSchema = DTOSchemaFactory(
    z.object({
        latest_block: z.number(),
    }),
    IndexerGatewayErrorSchema
)

export type TIndexerLatestBlockDTO = z.infer<typeof IndexerLatestBlockDTOSchema>

export const AccountBalanceDTOSchema = DTOSchemaFactory(
    z.object({
        balance: z.number(),
    }),
    IndexerGatewayErrorSchema
)

export type TAccountBalalnceDTO = z.infer<typeof AccountBalanceDTOSchema>

export const TotalMintedForAccountDTOSchema = DTOSchemaFactory(
    z.object({
        minted: z.number(),
    }),
    IndexerGatewayErrorSchema
)

export type TTotalMintedForAccountDTO = z.infer<typeof TotalMintedForAccountDTOSchema>

export const WrapStatusDTOSchema = DTOSchemaFactory(
    z.object({
        tx_hash: z.string(),
        confirmation_tx_hash: z.string(),
    }),
    IndexerGatewayErrorSchema
)

export type TWrapStatusDTO = z.infer<typeof WrapStatusDTOSchema>