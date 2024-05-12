const SIGNALS = {
    ACTIVE_NETWORK: Symbol.for('ActiveNetwork'),
    MINTING_ENABLED: Symbol.for('MintingEnabled'),
}

const GATEWAYS = {
    WALLET_PROVIDER: Symbol.for('WalletProvider'),
    NETWORK_GATEWAY: Symbol.for('NetworkGateway'),
    WEB3_GATEWAY: Symbol.for('Web3Gateway'),
}

export { SIGNALS, GATEWAYS };