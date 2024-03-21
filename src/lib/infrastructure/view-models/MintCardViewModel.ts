import { type BaseViewModel } from "./base";

export interface MintCardData {
    mintedPercentage: number;
    mintLimit: number;
    totalSupply: number;
    totalMinted: number;
}

type MintCardViewModel = BaseViewModel<MintCardData>;

export default MintCardViewModel;