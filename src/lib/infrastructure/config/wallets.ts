import { coinbaseWallet, metamaskWallet } from "@thirdweb-dev/react";

export const SUPPORTED_WALLETS = [
    metamaskWallet(),
    coinbaseWallet(),
];