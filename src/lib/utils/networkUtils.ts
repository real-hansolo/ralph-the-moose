import { type Chain } from "@maany_shr/thirdweb";
import { avalanche, avalancheFuji, base, baseSepolia } from "@maany_shr/thirdweb/chains";

export function getThirdWebChain(name: string): Chain {
    switch (name) {
        case "Base":
            return base;
        case "Base Sepolia":
            return baseSepolia;
        case "Avalanche":
            return avalanche;
        case "Avalanche Fuji":
            return avalancheFuji; 
        default:
            throw new Error(`Config Error: Could not find thirdweb chain ${name} `);
    }
}