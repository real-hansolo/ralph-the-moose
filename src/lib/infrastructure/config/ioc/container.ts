import { Container } from 'inversify';
import { ThirdwebWalletProvider } from '~/app/api/web3/thirdweb-wallet-provider';
import type WalletProviderOutputPort from '~/lib/core/ports/secondary/wallet-provider-output-port';
import { GATEWAYS } from './symbols';

const appContainer = new Container();
appContainer.bind<WalletProviderOutputPort<unknown>>(GATEWAYS.WALLET_PROVIDER).to(ThirdwebWalletProvider);

export { appContainer };