import type { ApproveReservoirDTO, BalanceDTO } from "../../dto/ralph-token-dto";
import type { TNetwork, TWallet } from "../../entity/models";

export default interface RalphTokenOutputPort {
    approveReservoir(wallet: TWallet, network: TNetwork, amount: number): Promise<ApproveReservoirDTO>;
    getBalance(walletAddress: string, network: TNetwork): Promise<BalanceDTO>;
}