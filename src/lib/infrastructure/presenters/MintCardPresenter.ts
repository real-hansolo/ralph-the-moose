import { type Signal, signal } from "@preact/signals-react";
import type MintCardViewModel from "../view-models/MintCardViewModel";

export default class MintCardPresenter {
    public mintedPercentage: Signal<number>;
    public mintLimit: Signal<number>;
    public totalSupply: Signal<number>;
    public totalMinted: Signal<number>;
    constructor(
        // inject necessary gateways
    ) {
        // set up necessary gateways
        this.mintLimit = signal(0);
        this.mintedPercentage = signal(0);
        this.totalSupply = signal(0);
        this.totalMinted = signal(0);
    }

    getViewModel(): MintCardViewModel {
        // present the view model
        return {
            status: "success",
            data: {
                mintedPercentage: this.mintedPercentage,
                mintLimit: this.mintLimit,
                totalSupply: this.totalSupply,
                totalMinted: this.totalMinted,
            }
        } as MintCardViewModel;
    }
    
}