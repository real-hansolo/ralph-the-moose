const SIGNALS = {
    ACTIVE_NETWORK: Symbol.for('ActiveNetwork'),
    TRANSACTION_GAS_STATUS: Symbol.for('TransactionGasStatus'),
    MINTING_ENABLED: Symbol.for('MintingEnabled'),
}

const GATEWAYS = {
    WALLET_PROVIDER: Symbol.for('WalletProvider'),
    NETWORK_GATEWAY: Symbol.for('NetworkGateway'),
    RPC_GATEWAY: Symbol.for('RpcGateway'),
    WEB3_GATEWAY: Symbol.for('Web3Gateway'),
    RALPH_TOKEN_GATEWAY: Symbol.for('RalphTokenGateway'),
    RALPH_RESERVOIR_GATEWAY: Symbol.for('RalphReservoirGateway'),
}

export { SIGNALS, GATEWAYS };