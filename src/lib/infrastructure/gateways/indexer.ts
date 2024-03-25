import { BigNumber } from "ethers";
import {
  type GetAllocationLimitDTO,
  type GetAllMintedDTO,
  type GetAllocationForAddressDTO,
  type GetInscriptionStatusDTO,
  type GetLatestBlockDTO,
  type GetBalanceForAccountDTO,
  type GetTotalMintedForAccountDTO,
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
    if (response.success) {
      const total_minted = BigNumber.from(response.data.total_minted);
      return {
        success: true,
        data: {
          total_minted,
        },
      };
    }
    return response;
  }

  async getAllocationLimits(): Promise<GetAllocationLimitDTO> {
    const response =
      await this._call<GetAllocationLimitDTO>("allocation_limits");
    if (response.success) {
      const data = response.data;
      const total_mintable = BigNumber.from(data.total_mintable);
      const max_per_mint = BigNumber.from(data.max_per_mint);
      const total_allocations = BigNumber.from(data.total_allocations);
      const address_count = BigNumber.from(data.address_count);
      console.log("data", data)
      return {
        success: true,
        data: {
          total_mintable,
          max_per_mint,
          total_allocations,
          address_count,
        },
      };
    }
    return response;
  }

  async getAllocationForAddress(
    address: string,
  ): Promise<GetAllocationForAddressDTO> {
    const response = await this._call<GetAllocationForAddressDTO>(
      `allocation/${address}`,
    );
    if (response.success) {
      const data = response.data;
      const allocation_amount = BigNumber.from(data.allocation_amount);
      return {
        success: true,
        data: {
          address: data.address,
          allocation_amount: allocation_amount,
        },
      };
    }
    return response;
  }

  async getTotalMintedForAccount(
    address: string,
  ): Promise<GetTotalMintedForAccountDTO> {
    const response = await this._call<GetTotalMintedForAccountDTO>(
      `minted/${address}`,
    );
    if (response.success) {
      const data = response.data;
      const minted = BigNumber.from(data.minted);
      return {
        success: true,
        data: {
          minted: minted,
        },
      };
    }
    return response;
  }

  async getInscriptionStatus(txHash: string): Promise<GetInscriptionStatusDTO> {
    const response = await this._call<GetInscriptionStatusDTO>(
      `inscriptions/${txHash}`,
    );
    if (response.success) {
      const data = response.data;
      const amount = BigNumber.from(data.amount);
      return {
        success: true,
        data: {
          tx_hash: data.tx_hash,
          block_number: data.block_number,
          sender: data.sender,
          timestamp: data.timestamp,
          p: data.p,
          op: data.op,
          tick: data.tick,
          receiver: data.receiver,
          amount: amount,
          valid: data.valid,
        },
      };
    }
    return response;
  }

  async getLatestBlock(): Promise<GetLatestBlockDTO> {
    const response = await this._call<GetLatestBlockDTO>("latest_block");
    return response;
  }

  async getBalanceForAccount(
    address: string,
    latestBlock?: number,
  ): Promise<GetBalanceForAccountDTO> {
    if (latestBlock) {
      const response = await this._call<GetBalanceForAccountDTO>(
        `balances/${address}?block=${latestBlock}`,
      );
      if (response.success) {
        const data = response.data;
        const balance = BigNumber.from(data.balance);
        return {
          success: true,
          data: {
            balance: balance,
          },
        };
      }
      return response;
    }
    const response = await this._call<GetBalanceForAccountDTO>(
      `balances/${address}`,
    );
    if (response.success) {
      const data = response.data;
      const balance = BigNumber.from(data.balance);
      return {
        success: true,
        data: {
          balance: balance,
        },
      };
    }
    return response;
  }
}
