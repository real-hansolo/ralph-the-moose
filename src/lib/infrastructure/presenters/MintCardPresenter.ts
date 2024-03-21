import { type Signal, signal } from "@preact/signals-react";
import type MintCardViewModel from "../view-models/MintCardViewModel";
import IndexerGateway from "../gateways/indexer";
import { env } from "~/env";
import { type GetAllocationLimitDTO, type GetAllMintedDTO } from "../dto/indexer-dto";

export default class MintCardPresenter {
    public mintedPercentage: Signal<number>;
    public mintLimit: Signal<number>;
    public totalSupply: Signal<number>;
    public totalMinted: Signal<number>;
    private indexer: IndexerGateway;
    constructor(
        // inject necessary gateways
    ) {
        // set up necessary gateways
        this.mintLimit = signal(0);
        this.mintedPercentage = signal(0);
        this.totalSupply = signal(0);
        this.totalMinted = signal<number>(0);
        const indexerHost = env.NEXT_PUBLIC_INDEXER_URL;
        this.indexer = new IndexerGateway(indexerHost);
    }

    async present(): Promise<MintCardViewModel> {
        // present the view model
        const allMinted: GetAllMintedDTO = await this.indexer.getAllMinted();
        if(!allMinted.success) {
            return {
                status: "error",
                message: allMinted.msg
            } as MintCardViewModel;
        } else if(allMinted.success) {
            this.totalMinted.value = allMinted.data.total_minted / 1000000000; // TODO: check if this is the correct value
        }

        this.totalSupply.value = 5000000
        
        const allocationLimits: GetAllocationLimitDTO = await this.indexer.getAllocationLimits();
        if(!allocationLimits.success) {
            return {
                status: "error",
                message: allocationLimits.msg
            } as MintCardViewModel;
        } else if(allocationLimits.success) {
            this.mintLimit.value = allocationLimits.data.total_mintable / 1000000000; // TODO: check if this is the correct value
        }

        this.mintedPercentage.value = parseFloat(((this.totalMinted.value / this.mintLimit.value) * 100).toFixed(2));
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