const SIGNALS = {
    ACTIVE_NETWORK: Symbol.for('ActiveNetwork'),
    BALANCE_INFO: Symbol.for('BalanceInfo'),
    TRANSACTION_GAS_STATUS: Symbol.for('TransactionGasStatus'),
    IS_MINTING: Symbol.for('IsMinting'),
    MINTING_STATS: Symbol.for('MintingStats'),
}

const GATEWAYS = {
    WALLET_PROVIDER: Symbol.for('WalletProvider'),
    NETWORK_GATEWAY: Symbol.for('NetworkGateway'),
    INDEXER_GATEWAY_FACTORY: Symbol.for('IndexerGatewayFactory'),
    RPC_GATEWAY: Symbol.for('RpcGateway'),
    WEB3_GATEWAY: Symbol.for('Web3Gateway'),
    RALPH_TOKEN_GATEWAY: Symbol.for('RalphTokenGateway'),
    RALPH_RESERVOIR_GATEWAY: Symbol.for('RalphReservoirGateway'),
    ELK_BRIDGE_HEAD_GATEWAY: Symbol.for('ElkBridgeHeadGateway'),
}

const USECASE = {
    BRIDGING_USECASE_FACTORY: Symbol.for('BridgingUsecaseFactory'),
    BALANCE_INFO_USECASE_FACTORY: Symbol.for('BalanceInfoUsecaseFactory'),
    CLAIMING_USECASE_FACTORY: Symbol.for('ClaimingUsecaseFactory'),
    MINTING_USECASE_FACTORY: Symbol.for('MintingUsecaseFactory'),
    MINTING_STATS_USECASE_FACTORY: Symbol.for('MintingStatsUsecaseFactory'),
    WRAPPING_USECASE_FACTORY: Symbol.for('WrappingUsecaseFactory'),
    UNWRAPPING_USECASE_FACTORY: Symbol.for('UnwrappingUsecaseFactory'),
}

const CONTROLLER = {
    BRIDGING_CONTROLLER: Symbol.for('BridgingController'),
    BALANCE_INFO_CONTROLLER: Symbol.for('BalanceInfoController'),
    CLAIMING_CONTROLLER: Symbol.for('ClaimingController'),
    MINTING_CONTROLLER: Symbol.for('MintingController'),
    MINTING_STATS_CONTROLLER: Symbol.for('MintingStatsController'),
    WRAPPING_CONTROLLER: Symbol.for('WrappingController'),
    UNWRAPPING_CONTROLLER: Symbol.for('UnwrappingController'),

}
export { SIGNALS, GATEWAYS, USECASE, CONTROLLER };