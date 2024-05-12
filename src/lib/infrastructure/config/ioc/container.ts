import { Container } from 'inversify';
import { ThirdwebWalletProvider } from '~/app/api/web3/thirdweb-wallet-provider';
import type WalletProviderOutputPort from '~/lib/core/ports/secondary/wallet-provider-output-port';
import { GATEWAYS, SIGNALS } from './symbols';
import type NetworkGatewayOutputPort from '~/lib/core/ports/secondary/network-gateway-output-port';
import NetworkGateway from '../../gateways/network-gateway';
import { type TSignal } from '~/lib/core/entity/signals';
import { signal } from '@preact/signals-react';
import type Web3GatewayOutputPort from '~/lib/core/ports/secondary/web3-gateway-output-port';
import ThirdwebWeb3Gateway from '../../gateways/thirdweb-web3-gateway';

const appContainer = new Container();
appContainer.bind<WalletProviderOutputPort<unknown>>(GATEWAYS.WALLET_PROVIDER).to(ThirdwebWalletProvider);
appContainer.bind<NetworkGatewayOutputPort>(GATEWAYS.NETWORK_GATEWAY).to(NetworkGateway);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
appContainer.bind<Web3GatewayOutputPort<any, any>>(GATEWAYS.WEB3_GATEWAY).to(ThirdwebWeb3Gateway);
const signalsContainer = new Container();
signalsContainer.bind<TSignal<boolean>>(SIGNALS.MINTING_ENABLED).toConstantValue(
    {
        name: "Minting Enabled Signal",
        description: "Signal to enable minting",
        value: signal<boolean>(false),
    }
);

export { appContainer, signalsContainer };