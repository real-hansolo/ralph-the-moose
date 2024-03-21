import { signal, type Signal } from "@preact/signals-react";
import type BalanceCardViewModel from "../view-models/BalanceCardViewModel";

export default class BalanceCardPresenter {
    public inscriptionBalance: Signal<number>
    public wrappedBalance: Signal<number>
    public fee: Signal<number>
    constructor() {
        this.inscriptionBalance = signal(0);
        this.wrappedBalance = signal(0);
        this.fee = signal(0);
    }
    
    async present(): Promise<BalanceCardViewModel> {
        return {
            status: "success",
            data: {
                inscriptionBalance: this.inscriptionBalance,
                wrappedBalance: this.wrappedBalance,
                fee: this.fee
            }
        };
    }
}