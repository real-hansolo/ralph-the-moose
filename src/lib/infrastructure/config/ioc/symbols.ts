const SIGNALS = {
    ACTIVE_NETWORK: Symbol.for('ActiveNetwork'),
    TRANSACTION_GAS_STATUS: Symbol.for('TransactionGasStatus'),
    MINTING_ENABLED: Symbol.for('MintingEnabled'),
}

const GATEWAYS = {
    WALLET_PROVIDER: Symbol.for('WalletProvider'),
    NETWORK_GATEWAY: Symbol.for('NetworkGateway'),
    INDEXER_GATEWAY_FACTORY: Symbol.for('IndexerGatewayFactory'),
    RPC_GATEWAY: Symbol.for('RpcGateway'),
    WEB3_GATEWAY: Symbol.for('Web3Gateway'),
    RALPH_TOKEN_GATEWAY: Symbol.for('RalphTokenGateway'),
    RALPH_RESERVOIR_GATEWAY: Symbol.for('RalphReservoirGateway'),
}

const USECASE = {
    CLAIMING_USECASE_FACTORY: Symbol.for('ClaimingUsecaseFactory'),
    MINTING_USECASE_FACTORY: Symbol.for('MintingUsecaseFactory'),
    WRAPPING_USECASE_FACTORY: Symbol.for('WrappingUsecaseFactory'),
    UNWRAPPING_USECASE_FACTORY: Symbol.for('UnwrappingUsecaseFactory'),
}

const CONTROLLER = {
    CLAIMING_CONTROLLER: Symbol.for('ClaimingController'),
    MINTING_CONTROLLER: Symbol.for('MintingController'),
    WRAPPING_CONTROLLER: Symbol.for('WrappingController'),
    UNWRAPPING_CONTROLLER: Symbol.for('UnwrappingController'),

}
export { SIGNALS, GATEWAYS, USECASE, CONTROLLER };