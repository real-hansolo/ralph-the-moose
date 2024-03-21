import { type Signal } from "@preact/signals-react";
import { type BaseViewModel } from "./base";

export interface MintCardData {
    mintedPercentage: Signal<number>;
    mintLimit: Signal<number>;
    totalSupply: Signal<number>;
    totalMinted: Signal<number>;
    mint: () => Promise<void>;
}

type MintCardViewModel = BaseViewModel<MintCardData>;

export default MintCardViewModel;