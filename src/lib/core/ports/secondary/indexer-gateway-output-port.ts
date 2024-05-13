import type {
  TAllMintedDTO,
  TAllocationForAddressDTO,
  TAllocationLimitDTO,
  TAccountBalalnceDTO,
  TInscriptionStatusDTO,
  TIndexerLatestBlockDTO,
  TTotalMintedForAccountDTO,
} from "../../dto/indexer-gateway-dto";

export default interface IndexerGatewayOutputPort {
  _call<T>(endpoint: string, method?: string, body?: object): Promise<T>;
  __transformStringToNumber(data: string): number;
  ping(): Promise<boolean>;
  getAllMinted(): Promise<TAllMintedDTO>;
  getAllocationLimits(): Promise<TAllocationLimitDTO>;
  getAllocationForAddress(address: string): Promise<TAllocationForAddressDTO>;
  getTotalMintedForAccount(address: string): Promise<TTotalMintedForAccountDTO>;
  getInscriptionStatus(txHash: string): Promise<TInscriptionStatusDTO>;
  getLatestBlock(): Promise<TIndexerLatestBlockDTO>;
  getBalanceForAccount(address: string): Promise<TAccountBalalnceDTO>;
}
