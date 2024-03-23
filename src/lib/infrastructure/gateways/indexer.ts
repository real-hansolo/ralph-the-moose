import {
  type GetAllocationLimitDTO,
  type GetAllMintedDTO,
  type GetAllocationForAddressDTO,
  type GetInscriptionStatusDTO,
  type GetLatestBlockDTO,
  type GetBalanceForAccountDTO,
  GetTotalMintedForAccountDTO,
} from "../dto/indexer-dto";

export default class IndexerGateway {
  constructor(private indexer_url: string) {
    this.indexer_url = indexer_url;
  }

  async _call<T>(endpoint: string, method?: string, body?: object): Promise<T> {
    const response = await fetch(`${this.indexer_url}/${endpoint}`, {
      method: method ?? "GET",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (response.ok) {
      const data = await response.json();
      return data as T;
    } else {
      return {
        status: "error",
        msg: "Error fetching data from the indexer.",
      } as T;
    }
  }

  async getAllMinted(): Promise<GetAllMintedDTO> {
    const response = await this._call<GetAllMintedDTO>("all_minted");
    return response;
  }

  async getAllocationLimits(): Promise<GetAllocationLimitDTO> {
    const response =
      await this._call<GetAllocationLimitDTO>("allocation_limits");
    return response;
  }

  async getAllocationForAddress(
    address: string,
  ): Promise<GetAllocationForAddressDTO> {
    const response = await this._call<GetAllocationForAddressDTO>(
      `allocation/${address}`,
    );
    return response;
  }

  async getTotalMintedForAccount(address: string): Promise<GetTotalMintedForAccountDTO> {
    const response = await this._call<GetTotalMintedForAccountDTO>(
      `minted/${address}`,
    );
    return response;
  }
  
  async getInscriptionStatus(txHash: string): Promise<GetInscriptionStatusDTO> {
    const response = await this._call<GetInscriptionStatusDTO>(
      `inscriptions/${txHash}`,
    );
    return response;
  }

  async getLatestBlock(): Promise<GetLatestBlockDTO> {
    const response = await this._call<GetLatestBlockDTO>("latest_block");
    return response;
  }

  async getBalanceForAccount(address: string, latestBlock?: number): Promise<GetBalanceForAccountDTO> {
    if(latestBlock) {
      const response = await this._call<GetBalanceForAccountDTO>(
        `balances/${address}?block=${latestBlock}`,
        );
      return response;
    }
    const response = await this._call<GetBalanceForAccountDTO>(
      `balances/${address}`,
      );
    return response;
  }
}



