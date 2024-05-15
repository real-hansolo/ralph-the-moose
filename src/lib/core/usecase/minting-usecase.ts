/* eslint-disable @typescript-eslint/no-explicit-any */
import { sendThirdWebTransactionUtil } from "~/lib/utils/transactionUtils";
import type { MintingInputPort, MintingOutputPort } from "../ports/primary/minting-primary-ports";
import type IndexerGatewayOutputPort from "../ports/secondary/indexer-gateway-output-port";
import type Web3GatewayOutputPort from "../ports/secondary/web3-gateway-output-port";
import type { TExecutedTransactionDTO } from "../dto/web3-gateway-dto";
import type { TPreparedTransaction } from "../entity/models";
import { env } from "~/env";
import { type BigNumber } from "ethers";
import { fromHumanReadableNumber } from "~/lib/utils/tokenUtils";
import type { TMintingRequest } from "../usecase-models/minting-usecase-models";
import { clientContainer } from "~/lib/infrastructure/config/ioc/container";
import type { TSignal, TTransactionGasStatus } from "../entity/signals";
import { SIGNALS } from "~/lib/infrastructure/config/ioc/symbols";

export default class MintingUsecase implements MintingInputPort {
  presenter: MintingOutputPort<any>;
  indexerGateway: IndexerGatewayOutputPort;
  web3Gateway: Web3GatewayOutputPort<any, any, any>;
  constructor(
    presenter: MintingOutputPort<any>,
    indexerGateway: IndexerGatewayOutputPort,
    web3Gateway: Web3GatewayOutputPort<any, any, any>,
  ) {
    this.presenter = presenter;
    this.indexerGateway = indexerGateway;
    this.web3Gateway = web3Gateway;
  }

  __generateMintTransactionMessage(amount: BigNumber): string {
    const json = `{"p": "elkrc-404", "op": "mint", "tick": "PR", "amount": ${amount.toString()}}`;
    const hex = Buffer.from(json, "utf8").toString("hex");
    return hex;
  }
  async execute(request: TMintingRequest): Promise<void> {
    const { wallet, network, amount } = request;
    const mintAmount = fromHumanReadableNumber(amount);
    const message = this.__generateMintTransactionMessage(mintAmount);
    const preparedMintTransaction: TPreparedTransaction = {
      to: env.NEXT_PUBLIC_FEE_WALLET_ADDRESS,
      value: `${network.fee.minting}`,
      data: `0x${message}`,
      network: network,
    };
    // present progress
    // gas signal
    const S_GAS_STATUS = clientContainer.get<TSignal<TTransactionGasStatus>>(SIGNALS.TRANSACTION_GAS_STATUS);
    const intialIndexerBlockNumberDTO = await this.indexerGateway.getLatestBlock();
    if (!intialIndexerBlockNumberDTO.success) {
      this.presenter.presentError({
        status: "error",
        message: "Error getting latest block number from indexer.",
        details: {
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
        amount: amount,
        network: network,
        wallet: wallet,
        indexerBlockNumber: 0,
        s_gas_status: S_GAS_STATUS,
        intialIndexerBlockNumber: intialIndexerBlockNumber,
    });
    const mintTransactionDTO: TExecutedTransactionDTO = await sendThirdWebTransactionUtil(wallet, preparedMintTransaction, S_GAS_STATUS);
    if (!mintTransactionDTO.success) {
      this.presenter.presentError({
        status: "error",
        message: mintTransactionDTO.data.message,
        details: {
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
      const latestIndexerBlockNumberDTO = await this.indexerGateway.getLatestBlock();
      if (!latestIndexerBlockNumberDTO.success) {
        this.presenter.presentError({
          status: "error",
          message: "Error getting latest block number from indexer.",
          details: {
            amount: amount,
            indexerBlockNumber: 0,
            wallet: wallet,
            network: network,
          },
        });
        return;
      }
      latestIndexerBlockNumber = latestIndexerBlockNumberDTO.data.latest_block;
      this.presenter.presentProgress({
        transaction: mintTransactionDTO.data,
        network: network,
        wallet: wallet,
        amount: amount,
        indexerBlockNumber: latestIndexerBlockNumber,
        intialIndexerBlockNumber: intialIndexerBlockNumber,
      });
    } while (latestIndexerBlockNumber < transactionBlockNumber);

    const inscrptionStatusDTO = await this.indexerGateway.getInscriptionStatus(mintTransactionDTO.data.hash);
    if (!inscrptionStatusDTO.success) {
      this.presenter.presentError({
        status: "error",
        message: `Error getting inscription status for the transaction ${mintTransactionDTO.data.hash}. `,
        details: {
          amount: amount,
          indexerBlockNumber: 0,
          wallet: wallet,
          network: network,
        },
      });
      return;
    }

    if(inscrptionStatusDTO.data.valid === 0) {
      this.presenter.presentError({
        status: "error",
        message: `Minting Error: Invalid Transaction ${mintTransactionDTO.data.hash}.`,
        details: {
          amount: amount,
          indexerBlockNumber: 0,
          wallet: wallet,
          network: network,
          transaction: mintTransactionDTO.data,
        },
      });
      return;
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