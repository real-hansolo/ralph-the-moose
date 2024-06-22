import type { ClaimDTO, ClaimableDTO, UnwrapDTO } from "../../dto/ralph-reservoir-dto";
import type { TNetwork, TWallet } from "../../entity/models";

export default interface RalphReservoirOutputPort {
    getClaimableAmount(walletAddress: string, network: TNetwork): Promise<ClaimableDTO>;
    claim(wallet: TWallet, network: TNetwork, amount: number): Promise<ClaimDTO>;
    unwrap(wallet: TWallet, network: TNetwork, amount: number): Promise<UnwrapDTO>;
}