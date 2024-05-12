const SIGNALS = {
    ACTIVE_NETWORK: Symbol.for('ActiveNetwork'),
    MINTING_ENABLED: Symbol.for('MintingEnabled'),
}

const GATEWAYS = {
    WALLET_PROVIDER: Symbol.for('WalletProvider'),
    NETWORK_GATEWAY: Symbol.for('NetworkGateway'),
    CLIENT_KEY_VALUE_STORE: Symbol.for('ClientKeyValueStore'),
}

export { SIGNALS, GATEWAYS };