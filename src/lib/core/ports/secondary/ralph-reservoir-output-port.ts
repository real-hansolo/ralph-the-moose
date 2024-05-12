import type { ClaimableDTO } from "../../dto/ralph-reservoir-dto";
import type { TNetwork } from "../../entity/models";

export default interface RalphReservoirOutputPort {
    claimable(walletAddress: string, network: TNetwork): Promise<ClaimableDTO>;
}