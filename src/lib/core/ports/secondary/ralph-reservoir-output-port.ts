import type { ClaimDTO, ClaimableDTO } from "../../dto/ralph-reservoir-dto";
import type { TNetwork, TWallet } from "../../entity/models";

export default interface RalphReservoirOutputPort {
    claimable(walletAddress: string, network: TNetwork): Promise<ClaimableDTO>;
    claim(wallet: TWallet, network: TNetwork, amount: number): Promise<ClaimDTO>;
}