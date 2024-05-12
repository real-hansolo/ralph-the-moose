import { IconNetworkBase } from "@maany_shr/ralph-the-moose-ui-kit";
import type { TNetwork } from "~/lib/core/entity/models";

export const BASE: TNetwork = {
    chainId: 8453,
    name: "Base",
    explorer: { 
        name: "BaseScan",
        url: "https://base.basescan.org/" 
    },
    rpc: "https://mainnet.infura.io/v3/your-api-key",
    nativeCurrency: "ETH",
    gasLimit: 200000,
    fee: { 
        minting: 0.00123,
        wrapping: 0.00123,
        unwrapping: 0.00123 
    },
    contracts: {
        ralphReservoirAddress: "0x27e964E016B68EeFbe958Ace62174af0e1CeD053",
        ralphTokenAddress: "0x05F1938646a897008e813fb03CE7C575eAE45738"
    },
    icon: <IconNetworkBase />,
}

export const BASE_SEPOLIA: TNetwork = {
    chainId: 84532,
    name: "Base Sepolia",
    explorer: { 
        name: "BaseScan",
        url: "https://sepolia.basescan.org/" 
    },
    rpc: "https://sepolia.infura.io/v3/your-api-key",
    nativeCurrency: "ETH",
    gasLimit: 200000,
    fee: { 
        minting: 0.00123,
        wrapping: 0.00123,
        unwrapping: 0.00123 
    },
    contracts: {
        ralphReservoirAddress: "0x296271298780966bC0550a6B10c8e5BE60fE282f",
        ralphTokenAddress: "0xA415b2Df73D9E1D0415de58f012E2cB3E059F2E1",
    },
    icon: <IconNetworkBase />,
}

