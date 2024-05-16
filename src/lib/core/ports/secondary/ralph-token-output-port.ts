import type { ApproveReservoirDTO, BalanceDTO, SpendingAllowanceDTO } from "../../dto/ralph-token-dto";
import type { TNetwork, TWallet } from "../../entity/models";

export default interface RalphTokenOutputPort {
    approveReservoir(wallet: TWallet, network: TNetwork, amount?: number): Promise<ApproveReservoirDTO>;
    getSpendingAllowance(wallet: TWallet, network: TNetwork): Promise<SpendingAllowanceDTO>;
    getBalance(walletAddress: string, network: TNetwork): Promise<BalanceDTO>;
}