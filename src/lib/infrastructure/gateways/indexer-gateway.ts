import type { z } from "zod";
import { BigNumber } from "ethers";
import { injectable } from "inversify";
import {
  AccountBalanceDTOSchema,
  AllMintedDTOSchema,
  AllocationForAddressDTOSchema,
  AllocationLimitDTOSchema,
  IndexerLatestBlockDTOSchema,
  InscriptionDTOSchema,
  type TAccountBalalnceDTO,
  type TAllocationForAddressDTO,
  type TIndexerLatestBlockDTO,
  type TInscriptionStatusDTO,
  type TTotalMintedForAccountDTO,
  TotalMintedForAccountDTOSchema,
  type TAllMintedDTO,
  type TAllocationLimitDTO,
  type TWrapStatusDTO,
  WrapStatusDTOSchema,
} from "~/lib/core/dto/indexer-gateway-dto";
import { type TNetwork } from "~/lib/core/entity/models";
import type IndexerGatewayOutputPort from "~/lib/core/ports/secondary/indexer-gateway-output-port";
import { toHumanReadableNumber } from "~/lib/utils/tokenUtils";

@injectable()
export default class IndexerGateway implements IndexerGatewayOutputPort {
  private network: TNetwork;
  private url: string;
  constructor(network: TNetwork) {
    this.network = network;
    this.url = network.indexer.url;
  }

  __transformStringToNumber(data: string): number {
    try {
      return toHumanReadableNumber(BigNumber.from(data));
    } catch (e) {
      console.log("Error transforming string to number", data, e);
      return 0;
    }
  }

  async __call<TDTO>(endpoint: string, schema: z.Schema<TDTO>, numericFields: string[], validate = true, method = "GET", body?: object): Promise<TDTO> {
    const response = await fetch(`${this.url}${endpoint}`, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (response.ok) {
      const data = await response.json();
      for (const field of numericFields) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          data.data[field] = this.__transformStringToNumber(data.data[field]);
        } catch (e) {
          return {
            success: false,
            data: {
              msg: `indexer@${endpoint}: Error transforming field ${field} to number.`,
            },
          } as TDTO;
        }
      }
      if (validate) {
        const result = schema.safeParse(data);
        if (result.success) {
          return result.data;
        } else {
          return {
            success: false,
            data: {
              msg: `Error validating data from the indexer@${endpoint}.`,
            },
          } as TDTO;
        }
      } else {
        return data as TDTO;
      }
    } else {
      return {
        success: false,
        data: {
          msg: "Error fetching data from the indexer.",
        },
      } as TDTO;
    }
  }

  async getAllMinted(): Promise<TAllMintedDTO> {
    const response = await this.__call<TAllMintedDTO>("/all_minted", AllMintedDTOSchema, ["total_minted"]);
    return response;
  }

  async getAllocationLimits(): Promise<TAllocationLimitDTO> {
    const response = await this.__call<TAllocationLimitDTO>("/allocation_limits", AllocationLimitDTOSchema, [
      "total_mintable",
      "max_per_mint",
      "total_allocations",
      "address_count",
    ]);
    return response;
  }

  async getAllocationForAddress(address: string): Promise<TAllocationForAddressDTO> {
    const response = await this.__call<TAllocationForAddressDTO>(`/allocation/${address}`, AllocationForAddressDTOSchema, ["allocation_amount"]);
    return response;
  }

  async getTotalMintedForAccount(address: string): Promise<TTotalMintedForAccountDTO> {
    const response = await this.__call<TTotalMintedForAccountDTO>(`/minted/${address}`, TotalMintedForAccountDTOSchema, ["minted"]);
    return response;
  }
  async getInscriptionStatus(txHash: string): Promise<TInscriptionStatusDTO> {
    const response = await this.__call<TInscriptionStatusDTO>(`/inscriptions/${txHash}`, InscriptionDTOSchema, ["amount"]);
    return response;
  }

  async getLatestBlock(): Promise<TIndexerLatestBlockDTO> {
    const response = await this.__call<TIndexerLatestBlockDTO>("/latest_block", IndexerLatestBlockDTOSchema, [], false);
    if(response.success) {
      response.data.latest_block = parseInt(response.data.latest_block.toString())
    }
    return response;
  }

  async getBalanceForAccount(address: string): Promise<TAccountBalalnceDTO> {
    const response = await this.__call<TAccountBalalnceDTO>(`/balances/${address}`, AccountBalanceDTOSchema, ["balance"]);
    return response;
  }

  async getWrapStatus(txHash: string): Promise<TWrapStatusDTO> {
    const response = await this.__call<TWrapStatusDTO>(`/wraps/${txHash}`, WrapStatusDTOSchema, []);
    return response;
  }
}
