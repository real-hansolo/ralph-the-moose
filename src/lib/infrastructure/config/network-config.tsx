import { IconNetworkAvax, IconNetworkBase } from "@maany_shr/ralph-the-moose-ui-kit";
import type { TNetwork } from "~/lib/core/entity/models";

export const BASE: TNetwork = {
    chainId: 8453,
    name: "Base",
    explorer: { 
        name: "BaseScan",
        url: "https://base.basescan.org/" 
    },
    rpcProvider: "alchemy",
    nativeCurrency: "ETH",
    gasLimit: 500000,
    fee: { 
        minting: 0.00123,
        wrapping: 0.00123,
        unwrapping: 0.00123,
        bridging: 0.000123
    },
    contracts: {
        ralphReservoirAddress: "0x27e964E016B68EeFbe958Ace62174af0e1CeD053",
        ralphTokenAddress: "0x05F1938646a897008e813fb03CE7C575eAE45738",
        bridgeHeadAddress: "0xcAB6F73BbCb36eFf4bEc05713F61eE6B6438F57e"
    },
    icon: <IconNetworkBase />,
    indexer: {
        url: "https://ralph-indexer-01.devmaany.com", // TODO: move to env
        secure: false,
    },
    urls: {
        elkdex: "https://app.elk.finance/swap/8453/ETH/PR",
        uniswap: "https://app.uniswap.org/swap",
        farm: "https://app.elk.finance/farms/all/"
    },
    publicMint: {
        enabled: false,
        amount: 10
    }
}

export const BASE_SEPOLIA: TNetwork = {
    chainId: 84532,
    name: "Base Sepolia",
    explorer: { 
        name: "BaseScan",
        url: "https://sepolia.basescan.org/" 
    },
    rpcProvider: "alchemy",
    nativeCurrency: "ETH",
    gasLimit: 200000,
    fee: { 
        minting: 0.00123,
        wrapping: 0.00123,
        unwrapping: 0.00123,
        bridging: 0.000123
    },
    contracts: {
        ralphReservoirAddress: "0x296271298780966bC0550a6B10c8e5BE60fE282f",
        ralphTokenAddress: "0xA415b2Df73D9E1D0415de58f012E2cB3E059F2E1",
        bridgeHeadAddress: "0xcAB6F73BbCb36eFf4bEc05713F61eE6B6438F57e"
    },
    icon: <IconNetworkBase />,
    indexer: {
        url: "http://162.244.82.115:8000",
        secure: false,
    },
    urls: {
        elkdex: "https://app.elk.finance/swap/84532/ETH/PR",
        uniswap: "https://app.uniswap.org/swap",
        farm: "https://app.elk.finance/farms/all/"
    },
    publicMint: {
        enabled: false,
        amount: 10
    }
}

export const AVALANCHE: TNetwork = {
    chainId: 43114,
    name: "Avax",
    explorer: { 
        name: "Avalanche Explorer",
        url: "https://snowtrace.io/" 
    },
    rpcProvider: "infura",
    nativeCurrency: "AVAX",
    gasLimit: 500000,
    fee: { 
        minting: 0.0572523,
        wrapping: 0.0572523,
        unwrapping: 0.0572523,
        bridging: 0.0123
    },
    contracts: {
        ralphReservoirAddress: "0x27e964E016B68EeFbe958Ace62174af0e1CeD053",
        ralphTokenAddress: "0x05F1938646a897008e813fb03CE7C575eAE45738",
        bridgeHeadAddress: "0xcAB6F73BbCb36eFf4bEc05713F61eE6B6438F57e"
    },
    icon: <IconNetworkAvax />,
    indexer: {
        url: "https://ralph-indexer-02.devmaany.com", // TODO: move to env
        secure: false
    },
    urls: {
        elkdex: "https://app.elk.finance/swap/43114/AVAX/PR",
        uniswap: "https://app.uniswap.org/swap",
        farm: "https://app.elk.finance/farms/all/"
    },
    publicMint: {
        enabled: true,
        amount: 10
    }
}
