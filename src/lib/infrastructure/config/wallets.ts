import { bloctoWallet, coinbaseWallet, frameWallet, localWallet, metamaskWallet, phantomWallet, trustWallet, walletConnect } from "@thirdweb-dev/react";

export const SUPPORTED_WALLETS = [
    metamaskWallet(),
    walletConnect({ recommended: true }),
    coinbaseWallet(),
    localWallet(),
    trustWallet({ recommended: true }),
    bloctoWallet(),
    frameWallet(),
    phantomWallet(),
];