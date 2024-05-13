import "reflect-metadata";
import { Container, type interfaces } from 'inversify';
import { ThirdwebWalletProvider } from '~/app/api/web3/thirdweb-wallet-provider';
import type WalletProviderOutputPort from '~/lib/core/ports/secondary/wallet-provider-output-port';
import { GATEWAYS, SIGNALS } from './symbols';
import type NetworkGatewayOutputPort from '~/lib/core/ports/secondary/network-gateway-output-port';
import NetworkGateway from '../../gateways/network-gateway';
import { type TTransactionGasStatus, type TSignal, S_TransactionGasStatus } from '~/lib/core/entity/signals';
import { signal } from '@preact/signals-react';
import type Web3GatewayOutputPort from '~/lib/core/ports/secondary/web3-gateway-output-port';
import ThirdwebWeb3Gateway from '../../gateways/thirdweb-web3-gateway';
import type RPCGatewayOutputPort from '~/lib/core/ports/secondary/rpc-gateway-output-port';
import RpcGateway from '../../gateways/rpc-gateway';
import RalphTokenGateway from "../../gateways/ralph-token-gateway";
import type RalphTokenOutputPort from "~/lib/core/ports/secondary/ralph-token-output-port";
import type RalphReservoirOutputPort from "~/lib/core/ports/secondary/ralph-reservoir-output-port";
import RalphReservoirGateway from "../../gateways/ralph-reservoir-gateway";


const clientContainer = new Container();
clientContainer.bind<NetworkGatewayOutputPort>(GATEWAYS.NETWORK_GATEWAY).to(NetworkGateway);
clientContainer.bind<WalletProviderOutputPort<unknown>>(GATEWAYS.WALLET_PROVIDER).to(ThirdwebWalletProvider);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
clientContainer.bind<Web3GatewayOutputPort<any, any, any>>(GATEWAYS.WEB3_GATEWAY).to(ThirdwebWeb3Gateway);
clientContainer.bind<RalphTokenOutputPort>(GATEWAYS.RALPH_TOKEN_GATEWAY).to(RalphTokenGateway);
clientContainer.bind<RalphReservoirOutputPort>(GATEWAYS.RALPH_RESERVOIR_GATEWAY).to(RalphReservoirGateway);

const signalsContainer = new Container();
signalsContainer.bind<TSignal<boolean>>(SIGNALS.MINTING_ENABLED).toConstantValue(
    {
        name: "Minting Enabled Signal",
        description: "Signal to enable minting",
        value: signal<boolean>(false),
    }
);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
signalsContainer.bind<TSignal<TTransactionGasStatus>>(SIGNALS.TRANSACTION_GAS_STATUS).toDynamicValue((context: interfaces.Context) => { return new S_TransactionGasStatus();}
);

const serverContainer = new Container();
serverContainer.bind<NetworkGatewayOutputPort>(GATEWAYS.NETWORK_GATEWAY).to(NetworkGateway);
serverContainer.bind<RPCGatewayOutputPort>(GATEWAYS.RPC_GATEWAY).to(RpcGateway);


export { clientContainer, signalsContainer, serverContainer };