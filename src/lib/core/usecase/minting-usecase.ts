/* eslint-disable @typescript-eslint/no-explicit-any */
import { sendThirdWebTransactionUtil } from "~/lib/utils/transactionUtils";
import type { MintingInputPort, MintingOutputPort } from "../ports/primary/minting-primary-ports";
import type IndexerGatewayOutputPort from "../ports/secondary/indexer-gateway-output-port";
import type { TExecutedTransactionDTO } from "../dto/web3-gateway-dto";
import type { TNetwork, TPreparedTransaction } from "../entity/models";
import { env } from "~/env";
import { type BigNumber } from "ethers";
import { fromHumanReadableNumber } from "~/lib/utils/tokenUtils";
import type { TMintingRequest } from "../usecase-models/minting-usecase-models";
import { signalsContainer } from "~/lib/infrastructure/config/ioc/container";
import type { TSignal, TTransactionGasStatus } from "../entity/signals";
import { SIGNALS } from "~/lib/infrastructure/config/ioc/symbols";
import { effect } from "@preact/signals-react";

export default class MintingUsecase implements MintingInputPort {
  presenter: MintingOutputPort<any>;
  indexerGatewayFactory: (network: TNetwork) => IndexerGatewayOutputPort;
  constructor(presenter: MintingOutputPort<any>, indexerGatewayFactory: (network: TNetwork) => IndexerGatewayOutputPort) {
    this.presenter = presenter;
    this.indexerGatewayFactory = indexerGatewayFactory;
  }

  __generateMintTransactionMessage(amount: BigNumber): string {
    const json = `{"p": "elkrc-404", "op": "mint", "tick": "PR", "amount": ${amount.toString()}}`;
    const hex = Buffer.from(json, "utf8").toString("hex");
    return hex;
  }
  async execute(request: TMintingRequest): Promise<void> {
    const { wallet, network, amount } = request;
    const indexerGateway = this.indexerGatewayFactory(network);
    const mintAmount = fromHumanReadableNumber(amount);
    const message = this.__generateMintTransactionMessage(mintAmount);
    const preparedMintTransaction: TPreparedTransaction = {
      to: env.NEXT_PUBLIC_FEE_WALLET_ADDRESS,
      value: `${network.fee.minting}`,
      data: `0x${message}`,
      network: network,
    };

    const initialBalanceDTO = await indexerGateway.getBalanceForAccount(wallet.activeAccount);
    if (!initialBalanceDTO.success) {
      this.presenter.presentError({
        status: "error",
        message: "Error getting initial balance from indexer.",
        details: {
          type: "indexer-error",
          amount: amount,
          indexerBlockNumber: 0,
          wallet: wallet,
          network: network,
        },
      });
      return;
    }
    const initialBalance = initialBalanceDTO.data.balance;
    const expectedBalance = initialBalance + amount;

    const S_GAS_STATUS = signalsContainer.get<TSignal<TTransactionGasStatus>>(SIGNALS.TRANSACTION_GAS_STATUS);
    const s_gas_signal = S_GAS_STATUS.value;

    effect(() => {
      return this.presenter.presentEstimatedGas({
        estimateGas: s_gas_signal.value.estimatedGas,
        gasLimit: s_gas_signal.value.gasLimit,
        amount: amount,
        network: network,
        wallet: wallet,
      });
    });
    const intialIndexerBlockNumberDTO = await indexerGateway.getLatestBlock();
    if (!intialIndexerBlockNumberDTO.success) {
      this.presenter.presentError({
        status: "error",
        message: "Error getting latest block number from indexer." + intialIndexerBlockNumberDTO.data.message,
        details: {
          type: "indexer-error",
          amount: amount,
          indexerBlockNumber: 0,
          wallet: wallet,
          network: network,
        },
      });
      return;
    }
    const intialIndexerBlockNumber = intialIndexerBlockNumberDTO.data.latest_block;

    this.presenter.presentProgress({
      type: "awaiting-transaction",
      amount: amount,
      network: network,
      wallet: wallet,
      indexerBlockNumber: 0,
      initialIndexerBlockNumber: intialIndexerBlockNumber,
      message: "Preparing mint transaction!",
    });

    const mintTransactionDTO: TExecutedTransactionDTO = await sendThirdWebTransactionUtil(wallet, preparedMintTransaction, S_GAS_STATUS);
    if (!mintTransactionDTO.success) {
      this.presenter.presentError({
        status: "error",
        message: mintTransactionDTO.data.message,
        details: {
          type: "transaction-error",
          amount: amount,
          indexerBlockNumber: 0,
          wallet: wallet,
          network: network,
        },
      });
      return;
    }

    const transactionBlockNumber = mintTransactionDTO.data.blockNumber;
    let latestIndexerBlockNumber = 0;
    do {
      const latestIndexerBlockNumberDTO = await indexerGateway.getLatestBlock();
      if (!latestIndexerBlockNumberDTO.success) {
        this.presenter.presentProgress({
          type: "awaiting-indexer",
          transaction: mintTransactionDTO.data,
          network: network,
          wallet: wallet,
          amount: amount,
          indexerBlockNumber: latestIndexerBlockNumber,
          initialIndexerBlockNumber: intialIndexerBlockNumber,
          message: "Error getting latest block number from indexer!",
        });
        continue;
      }
      latestIndexerBlockNumber = latestIndexerBlockNumberDTO.data.latest_block;
      this.presenter.presentProgress({
        type: "awaiting-indexer",
        transaction: mintTransactionDTO.data,
        network: network,
        wallet: wallet,
        amount: amount,
        indexerBlockNumber: latestIndexerBlockNumber,
        initialIndexerBlockNumber: intialIndexerBlockNumber,
        message: "Waiting for indexer to catch up!",
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));
    } while (latestIndexerBlockNumber < transactionBlockNumber);

    const inscrptionStatusDTO = await indexerGateway.getInscriptionStatus(mintTransactionDTO.data.hash);
    if (!inscrptionStatusDTO.success) {
      this.presenter.presentError({
        status: "error",
        message: `Error getting inscription status for the transaction ${mintTransactionDTO.data.hash}. `,
        details: {
          type: "indexer-error",
          amount: amount,
          indexerBlockNumber: latestIndexerBlockNumber,
          wallet: wallet,
          network: network,
        },
      });
      return;
    }

    if (inscrptionStatusDTO.data.valid === 0) {
      this.presenter.presentError({
        status: "error",
        message: `The indexer says your mint transaction is invalid.`,
        details: {
          type: "transaction-error",
          amount: amount,
          indexerBlockNumber: latestIndexerBlockNumber,
          wallet: wallet,
          network: network,
          transaction: mintTransactionDTO.data,
        },
      });
      return;
    }

    let balance = initialBalance;
    while (balance < expectedBalance) {
      const balanceDTO = await indexerGateway.getBalanceForAccount(wallet.activeAccount);
      if (!balanceDTO.success) {
        this.presenter.presentError({
          status: "error",
          message:
            "Could not verify that your balance was updated. Do not worry, your funds are safe. Just wait a moment to let the balance to auto-update. Or get in touch and we will happily resolve the matter.",
          details: {
            type: "verification-error",
            amount: amount,
            indexerBlockNumber: latestIndexerBlockNumber,
            wallet: wallet,
            network: network,
          },
        });
        continue;
      }
      balance = balanceDTO.data.balance;
      this.presenter.presentProgress({
        type: "awaiting-verification",
        amount: amount,
        network: network,
        wallet: wallet,
        indexerBlockNumber: latestIndexerBlockNumber,
        initialIndexerBlockNumber: intialIndexerBlockNumber,
        message: "Checking that your balance has been updated!",
        transaction: mintTransactionDTO.data,
      });
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    this.presenter.presentSuccess({
      status: "success",
      transaction: mintTransactionDTO.data,
      network: network,
      wallet: wallet,
      amount: amount,
    });
  }
}
