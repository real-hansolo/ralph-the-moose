/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import "reflect-metadata";
import { Container, type interfaces } from "inversify";
import { ThirdwebWalletProvider } from "~/app/api/web3/thirdweb-wallet-provider";
import type WalletProviderOutputPort from "~/lib/core/ports/secondary/wallet-provider-output-port";
import { CONTROLLER, GATEWAYS, SIGNALS, USECASE } from "./symbols";
import type NetworkGatewayOutputPort from "~/lib/core/ports/secondary/network-gateway-output-port";
import NetworkGateway from "../../gateways/network-gateway";
import { type TTransactionGasStatus, type TSignal, S_TransactionGasStatus } from "~/lib/core/entity/signals";
import { signal } from "@preact/signals-react";
import type Web3GatewayOutputPort from "~/lib/core/ports/secondary/web3-gateway-output-port";
import ThirdwebWeb3Gateway from "../../gateways/thirdweb-web3-gateway";
import type RPCGatewayOutputPort from "~/lib/core/ports/secondary/rpc-gateway-output-port";
import RpcGateway from "../../gateways/rpc-gateway";
import RalphTokenGateway from "../../gateways/ralph-token-gateway";
import type RalphTokenOutputPort from "~/lib/core/ports/secondary/ralph-token-output-port";
import type RalphReservoirOutputPort from "~/lib/core/ports/secondary/ralph-reservoir-output-port";
import RalphReservoirGateway from "../../gateways/ralph-reservoir-gateway";
import type IndexerGatewayOutputPort from "~/lib/core/ports/secondary/indexer-gateway-output-port";
import { type TNetwork } from "~/lib/core/entity/models";
import IndexerGateway from "../../gateways/indexer-gateway";
import type { MintingInputPort, MintingOutputPort } from "~/lib/core/ports/primary/minting-primary-ports";
import MintingUsecase from "~/lib/core/usecase/minting-usecase";
import MintingPresenter from "../../presenters/minting-presenter";
import type { TMintingViewModel } from "~/lib/core/view-models/minting-view-model";
import MintingController from "../../controllers/minting-controller";
import WrappingController from "../../controllers/wrapping-controller";
import { type WrappingInputPort } from "~/lib/core/ports/primary/wrapping-primary-ports";
import { type TWrappingViewModel } from "~/lib/core/view-models/wrapping-view-model";
import WrappingPresenter from "../../presenters/wrapping-presenter";
import WrappingUsecase from "~/lib/core/usecase/wrapping-usecase";
import ClaimingController from "../../controllers/claiming-controller";
import type { ClaimingInputPort } from "~/lib/core/ports/primary/claiming-primary-ports";
import ClaimingUsecase from "~/lib/core/usecase/claiming-usecase";
import type { TClaimingViewModel } from "~/lib/core/view-models/claiming-view-model";
import ClaimingPresenter from "../../presenters/claiming-presenter";
import UnwrappingController from "../../controllers/unwrapping-controller";
import UnwrappingPresenter from "../../presenters/unwrapping-presenter";
import type { UnWrappingInputPort } from "~/lib/core/ports/primary/unwrapping-primary-ports";
import type { TUnwrappingViewModel } from "~/lib/core/view-models/unwrapping-view-model";
import UnwrappingUsecase from "~/lib/core/usecase/unwrapping-usecase";
import BridgingController from "../../controllers/bridging-controller";
import type { BridgingInputPort } from "~/lib/core/ports/primary/bridging-primary-ports";
import type { TBridgingViewModel } from "~/lib/core/view-models/bridging-view-model";
import BridgingPresenter from "../../presenters/bridging-presenter";
import type ElkBridgeHeadOutputPort from "~/lib/core/ports/secondary/elk-bridgehead-output-port";
import ElkBridgeHeadGateway from "../../gateways/elk-bridge-head-gateway";
import BridgingUsecase from "~/lib/core/usecase/bridging-usecase";

const clientContainer = new Container();
const signalsContainer = new Container();
const serverContainer = new Container();

/* 
Client Side Gateways 
*/
clientContainer.bind<NetworkGatewayOutputPort>(GATEWAYS.NETWORK_GATEWAY).to(NetworkGateway);
clientContainer.bind<WalletProviderOutputPort<unknown>>(GATEWAYS.WALLET_PROVIDER).to(ThirdwebWalletProvider);
clientContainer.bind<Web3GatewayOutputPort<any, any, any>>(GATEWAYS.WEB3_GATEWAY).to(ThirdwebWeb3Gateway);
clientContainer.bind<RalphTokenOutputPort>(GATEWAYS.RALPH_TOKEN_GATEWAY).to(RalphTokenGateway);
clientContainer.bind<RalphReservoirOutputPort>(GATEWAYS.RALPH_RESERVOIR_GATEWAY).to(RalphReservoirGateway);
clientContainer.bind<ElkBridgeHeadOutputPort>(GATEWAYS.ELK_BRIDGE_HEAD_GATEWAY).to(ElkBridgeHeadGateway);
/**
 * Indexer Factory
 */
clientContainer
  .bind<interfaces.Factory<IndexerGatewayOutputPort>>(GATEWAYS.INDEXER_GATEWAY_FACTORY)
  .toFactory<IndexerGateway, [TNetwork]>((context: interfaces.Context) => (network: TNetwork) => {
    return new IndexerGateway(network);
  });

/**
 * Feature: Minting
 */
clientContainer.bind<MintingController>(CONTROLLER.MINTING_CONTROLLER).to(MintingController);
clientContainer
  .bind<interfaces.Factory<MintingInputPort>>(USECASE.MINTING_USECASE_FACTORY)
  .toFactory<MintingInputPort, [TSignal<TMintingViewModel>]>((context: interfaces.Context) => (response: TSignal<TMintingViewModel>) => {
    const presenter = new MintingPresenter(response);
    const indexerGatewayFactory: (network: TNetwork) => IndexerGatewayOutputPort = context.container.get(GATEWAYS.INDEXER_GATEWAY_FACTORY);
    const web3Gateway = context.container.get<Web3GatewayOutputPort<any, any, any>>(GATEWAYS.WEB3_GATEWAY);
    return new MintingUsecase(presenter, indexerGatewayFactory, web3Gateway);
  });

/**
 * Feature: Wrapping
 */
clientContainer.bind<WrappingController>(CONTROLLER.WRAPPING_CONTROLLER).to(WrappingController);
clientContainer
  .bind<interfaces.Factory<WrappingInputPort>>(USECASE.WRAPPING_USECASE_FACTORY)
  .toFactory<WrappingInputPort, [TSignal<TWrappingViewModel>]>((context: interfaces.Context) => (response: TSignal<TWrappingViewModel>) => {
    const presenter = new WrappingPresenter(response);
    const indexerGatewayFactory: (network: TNetwork) => IndexerGatewayOutputPort = context.container.get(GATEWAYS.INDEXER_GATEWAY_FACTORY);
    const web3Gateway = context.container.get<Web3GatewayOutputPort<any, any, any>>(GATEWAYS.WEB3_GATEWAY);
    return new WrappingUsecase(presenter, indexerGatewayFactory, web3Gateway);
  });

/**
 * Feature: Claiming
 */
clientContainer.bind<ClaimingController>(CONTROLLER.CLAIMING_CONTROLLER).to(ClaimingController);
clientContainer
  .bind<interfaces.Factory<ClaimingInputPort>>(USECASE.CLAIMING_USECASE_FACTORY)
  .toFactory<ClaimingInputPort, [TSignal<TClaimingViewModel>]>((context: interfaces.Context) => (response: TSignal<TClaimingViewModel>) => {
    const presenter = new ClaimingPresenter(response);
    const ralphTokenGateway = context.container.get<RalphTokenOutputPort>(GATEWAYS.RALPH_TOKEN_GATEWAY);
    const ralphReservoirGateway = context.container.get<RalphReservoirOutputPort>(GATEWAYS.RALPH_RESERVOIR_GATEWAY);
    return new ClaimingUsecase(presenter, ralphTokenGateway, ralphReservoirGateway);
  });

/**
 * Feature: Unwrapping
 */
clientContainer.bind<UnwrappingController>(CONTROLLER.UNWRAPPING_CONTROLLER).to(UnwrappingController);
clientContainer
  .bind<interfaces.Factory<UnWrappingInputPort>>(USECASE.UNWRAPPING_USECASE_FACTORY)
  .toFactory<UnWrappingInputPort, [TSignal<TUnwrappingViewModel>]>((context: interfaces.Context) => (response: TSignal<TUnwrappingViewModel>) => {
    const presenter = new UnwrappingPresenter(response);
    const ralphTokenGateway = context.container.get<RalphTokenOutputPort>(GATEWAYS.RALPH_TOKEN_GATEWAY);
    const ralphReservoirGateway = context.container.get<RalphReservoirOutputPort>(GATEWAYS.RALPH_RESERVOIR_GATEWAY);
    return new UnwrappingUsecase(presenter, ralphTokenGateway, ralphReservoirGateway);
  });

/**
 * Feature: Bridging
 */
clientContainer.bind<BridgingController>(CONTROLLER.BRIDGING_CONTROLLER).to(BridgingController);
clientContainer
  .bind<interfaces.Factory<BridgingInputPort>>(USECASE.BRIDGING_USECASE_FACTORY)
  .toFactory<BridgingInputPort, [TSignal<TBridgingViewModel>]>((context: interfaces.Context) => (response: TSignal<TBridgingViewModel>) => {
    const presenter = new BridgingPresenter(response);
    const ralphTokenGateway = context.container.get<RalphTokenOutputPort>(GATEWAYS.RALPH_TOKEN_GATEWAY);
    const bridgeHeadGateway = context.container.get<ElkBridgeHeadOutputPort>(GATEWAYS.ELK_BRIDGE_HEAD_GATEWAY);
    return new BridgingUsecase(presenter, bridgeHeadGateway, ralphTokenGateway);
  });
/*
Client Side Static Signals
*/
signalsContainer.bind<TSignal<boolean>>(SIGNALS.MINTING_ENABLED).toConstantValue({
  name: "Minting Enabled Signal",
  description: "Signal to enable minting",
  value: signal<boolean>(false),
});

/*
Client Side Dynamic Signals
*/
signalsContainer.bind<TSignal<TTransactionGasStatus>>(SIGNALS.TRANSACTION_GAS_STATUS).toDynamicValue((context: interfaces.Context) => {
  return new S_TransactionGasStatus();
});

/*
Server Side Gateways
*/
serverContainer.bind<NetworkGatewayOutputPort>(GATEWAYS.NETWORK_GATEWAY).to(NetworkGateway);
serverContainer.bind<RPCGatewayOutputPort>(GATEWAYS.RPC_GATEWAY).to(RpcGateway);

export { clientContainer, signalsContainer, serverContainer };
