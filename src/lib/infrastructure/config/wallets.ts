import { coinbaseWallet, localWallet, metamaskWallet, trustWallet, walletConnect } from "@thirdweb-dev/react";

export const SUPPORTED_WALLETS = [
    metamaskWallet(),
    walletConnect(),
    coinbaseWallet(),
    localWallet(),
    trustWallet(),
];