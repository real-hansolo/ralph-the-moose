import type { TGetTransactionByHashDTO, TGetRpcURLDTO } from "../../dto/rpc-gateway-dto";

export default interface RPCGatewayOutputPort {
    getRpcURL(networkId: number): TGetRpcURLDTO
    getTransactionByHash(networkId: number, hash: string): Promise<TGetTransactionByHashDTO>
}