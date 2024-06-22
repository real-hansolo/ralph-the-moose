/* eslint-disable @typescript-eslint/no-explicit-any */
import { approveRalphReservoir } from "~/lib/utils/transactionUtils";
import type { BridgingInputPort, BridgingOutputPort } from "../ports/primary/bridging-primary-ports";
import type ElkBridgeHeadOutputPort from "../ports/secondary/elk-bridgehead-output-port";
import type RalphTokenOutputPort from "../ports/secondary/ralph-token-output-port";
import type { TBridgingRequest } from "../usecase-models/bridging-usecase-models";

export default class BridgingUsecase implements BridgingInputPort {
  presenter: BridgingOutputPort<any>;
  elkBridgeHead: ElkBridgeHeadOutputPort;
  ralphTokenGateway: RalphTokenOutputPort;
  constructor(presenter: BridgingOutputPort<any>, elkBridgeHead: ElkBridgeHeadOutputPort, ralphTokenGateway: RalphTokenOutputPort) {
    this.presenter = presenter;
    this.elkBridgeHead = elkBridgeHead;
    this.ralphTokenGateway = ralphTokenGateway;
  }

  async execute(request: TBridgingRequest): Promise<void> {
    const { wallet, network, amount, toNetwork } = request;
    this.presenter.presentProgress({
      type: "update",
      amount: amount,
      network: network,
      wallet: wallet,
      toNetwork: toNetwork,
      message: "Checking balance before bridging...",
    });
    const balanceDTO = await this.ralphTokenGateway.getBalance(wallet.activeAccount, network);
    if (!balanceDTO.success) {
      this.presenter.presentError({
        status: "error",
        message: `Error getting PR token balance on ${network.name} for wallet ${wallet.activeAccount}. If you're like a nerd or sth, here's the message from the backend: ${balanceDTO.data.message}`,
        details: {
          type: "balance-error",
          amount: amount,
          network: network,
          wallet: wallet,
          toNetwork: toNetwork,
        },
      });
      return;
    }
    const balance = balanceDTO.data.balance;
    if (amount > balance) {
      this.presenter.presentError({
        status: "error",
        message: `The requested amount to bridge i.e. ${amount} PR exceeds your balance on ${network.name}.`,
        details: {
          type: "balance-error",
          amount: amount,
          network: network,
          wallet: wallet,
          toNetwork: toNetwork,
        },
      });
      return;
    }
    let destinationNetworkBalanceDTO = await this.ralphTokenGateway.getBalance(wallet.activeAccount, toNetwork);

    if (!destinationNetworkBalanceDTO.success) {
      this.presenter.presentError({
        status: "error",
        message: `Could not get your balance on the destination chain: ${destinationNetworkBalanceDTO.data.network}. We went looking for the balance of your wallet : ${wallet.activeAccount}. If you're feelin' like a nerd, here's what the backend told us about your error: ${destinationNetworkBalanceDTO.data.message}`,
        details: {
          type: "balance-error",
          amount: amount,
          network: network,
          wallet: wallet,
          toNetwork: toNetwork,
        },
      });
      return;
    }

    let destinationNetworkBalance = destinationNetworkBalanceDTO.data.balance;
    const expectedBalanceOnDestinationChain = destinationNetworkBalance + amount;

    this.presenter.presentProgress({
      type: "awaiting-approval",
      amount: amount,
      network: network,
      wallet: wallet,
      toNetwork: toNetwork,
      message: "Bridging in progress...",
    });

    const approvalRessult = await approveRalphReservoir(amount, wallet, network);
    if (approvalRessult && !approvalRessult.success) {
      this.presenter.presentError({
        status: "error",
        message: `Error approving reservoir for bridging your PR tokens. For nerds, here's some deets: ${approvalRessult.data.message}`,
        details: {
          type: "approval-error",
          amount: amount,
          network: network,
          wallet: wallet,
          toNetwork: toNetwork,
        },
      });
      return;
    }

    const bridgeTokensDTO = await this.elkBridgeHead.bridgeTokens(wallet, network, amount, toNetwork);
    if (!bridgeTokensDTO.success) {
      this.presenter.presentError({
        status: "error",
        message: bridgeTokensDTO.data.message,
        details: {
          type: "transaction-error",
          amount: amount,
          network: network,
          wallet: wallet,
          toNetwork: toNetwork,
        },
      });
      return;
    }

    this.presenter.presentProgress({
      type: "awaiting-verification",
      amount: amount,
      network: network,
      toNetwork: toNetwork,
      wallet: wallet,
      message: `Verifying that you've received ${amount} PR on ${toNetwork.name}.`,
      transaction: bridgeTokensDTO.data,
    });

    while (destinationNetworkBalance < expectedBalanceOnDestinationChain) {
      destinationNetworkBalanceDTO = await this.ralphTokenGateway.getBalance(wallet.activeAccount, toNetwork);
      if (!destinationNetworkBalanceDTO.success) {
        this.presenter.presentError({
          status: "error",
          message: `Could not retrieve balance on destination network: ${toNetwork.name}. For nerds, the backend says, ${destinationNetworkBalanceDTO.data.message}`,
          details: {
            type: "verification-error",
            network: network,
            toNetwork: toNetwork,
            wallet: wallet,
            transaction: bridgeTokensDTO.data,
            amount: amount,
          },
        });
        continue;
      }
      destinationNetworkBalance = destinationNetworkBalanceDTO.data.balance;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    this.presenter.presentSuccess({
      status: "success",
      message: "Bridging successful",
      amount: amount,
      network: network,
      wallet: wallet,
      toNetwork: toNetwork,
      transaction: bridgeTokensDTO.data,
    });
  }
}
