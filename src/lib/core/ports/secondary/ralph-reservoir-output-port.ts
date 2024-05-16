import type { ClaimDTO, ClaimableDTO, UnwrapDTO } from "../../dto/ralph-reservoir-dto";
import type { TNetwork, TWallet } from "../../entity/models";
import type { TSignal, TTransactionGasStatus } from "../../entity/signals";

export default interface RalphReservoirOutputPort {
    getClaimableAmount(walletAddress: string, network: TNetwork): Promise<ClaimableDTO>;
    claim(wallet: TWallet, network: TNetwork, amount: number, gasStatusSignal: TSignal<TTransactionGasStatus>): Promise<ClaimDTO>;
    unwrap(wallet: TWallet, network: TNetwork, amount: number, gasStatusSignal: TSignal<TTransactionGasStatus>): Promise<UnwrapDTO>;
}