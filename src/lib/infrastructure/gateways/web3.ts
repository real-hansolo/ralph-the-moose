import { env } from "~/env";

export default class Web3Gateway {
    private feeWalletAddress: string;
    constructor(
    ) {
        this.feeWalletAddress = env.NEXT_PUBLIC_FEE_WALLET_ADDRESS;
    }


    async mintRequest(amount: number) {
        const message = {
            p: "elkrc-404",
            tick: "PR",
            op: "mint",
            amount: amount,
        }
        
    }
}