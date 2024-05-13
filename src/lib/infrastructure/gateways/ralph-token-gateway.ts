import type { ApproveReservoirDTO, BalanceDTO } from "~/lib/core/dto/ralph-token-dto";
import type { TNetwork, TWallet } from "~/lib/core/entity/models";
import type RalphTokenOutputPort from "~/lib/core/ports/secondary/ralph-token-output-port";

export default class RalphTokenGateway implements RalphTokenOutputPort {
    approveReservoir(wallet: TWallet, network: TNetwork, amount: number): Promise<ApproveReservoirDTO>{
        throw new Error("Method not implemented.");
    }
    getBalance(walletAddress: string, network: TNetwork): Promise<BalanceDTO>{
        throw new Error("Method not implemented.");
    }
}