import { type WalletInstance } from "@thirdweb-dev/react";
import { toWei } from "thirdweb";
import { env } from "~/env";
import { type MintResponseDTO } from "../dto/web3-dto";
import { type BaseErrorDTO } from "../dto/base";
import { type Signal } from "@preact/signals-react";
import { type ToastProps } from "~/lib";
import { type TChainConfig } from "../config/chains";

export default class Web3Gateway {
  private feeWalletAddress: string;
  private wallet: WalletInstance | undefined;
  private thirdwebClientID: string;
  private toasts: Signal<ToastProps[]>;
  constructor(
    wallet: WalletInstance | undefined,
    toasts: Signal<ToastProps[]>,
  ) {
    this.feeWalletAddress = env.NEXT_PUBLIC_FEE_WALLET_ADDRESS;
    this.wallet = wallet;
    this.thirdwebClientID = env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
    this.toasts = toasts;
  }

  __getWalletChainID = async () => {
    if (!this.wallet) {
      return;
    }
    const chainID = await this.wallet.getChainId();
    return chainID;
  }
  __generateHexFromMintMessage = (amount: number): string => {
    // TODO: hook up amount to the message. default 10000000000
    const json = `{"p": "elkrc-404", "op": "mint", "tick": "PR", "amount": ${amount}}`;
    const hex = Buffer.from(json, "utf8").toString("hex");
    return hex;
  };

  async sendMintTransaction(
    amount: number,
    chain: TChainConfig,
    statusMessage: Signal<string>,
  ): Promise<MintResponseDTO> {
    if (!this.wallet) {
      const error = {
        success: false,
        msg: "Looks like your wallet is not connected!",
      };
      return error as BaseErrorDTO;
    }
    const message = this.__generateHexFromMintMessage(amount);
    const signer = await this.wallet.getSigner();
    const tx = {
      to: `0x${this.feeWalletAddress}`,
      value: toWei("0.00123"),
      data: `0x${message}`,
      chainId: chain.chainId,
      gasLimit: chain.gasLimit, // TODO: Set gas limit from chain config
    };

    const estimatedGas = await signer.estimateGas(tx);
    statusMessage.value = `Waiting for confirmation! Estimated Gas: ${estimatedGas.toString()}. Gas Limit: ${chain.gasLimit}`; // TODO: what is the correct format ?

    try {
      const receipt = await signer.sendTransaction(tx);
      statusMessage.value = `Minting...`;
      await receipt.wait();
      statusMessage.value = `Transaction completed!`;
      const timestamp =
        receipt.timestamp?.toLocaleString() ?? new Date().toLocaleDateString(); // TODO: check if this is okay or we should stick with the receipt timestamp
      const explorerLink = `${chain.explorerUrl}/tx/${receipt.hash}`;
      return {
        success: true,
        data: {
          amountMinted: amount,
          timestamp: timestamp,
          explorerLink: explorerLink,
          tokenShortName: "PR",
          txHash: receipt.hash,
        },
      };
    } catch (e) {
      console.error(e as Error);
      return {
        success: false,
        msg: "Transaction failed. Try again or get in touch?",
      };
    }

    // const chainID = await this.wallet.getChainId();

    // const baseSepoliaTestnet = BaseSepoliaTestnet; // TODO: Obtain chain form config

    // if (chainID !== baseSepoliaTestnet.chainId) { // TODO: do this check not in the gateway
    //   const error = {
    //     success: false,
    //     msg: "Wrong Network",
    //   };
    //   return error as BaseErrorDTO;
    // }

    // const tx = prepareTransaction({
    //   to: `0x${this.feeWalletAddress}`,
    //   value: toWei("0.00123"),
    //   chain: {
    //     ...BaseSepoliaTestnet,
    //     rpc: "https://sepolia.base.org",
    //     id: 84532,
    //   },
    //   data: `0x${message}`,
    //   client: createThirdwebClient({
    //     clientId: this.thirdwebClientID,
    //   }),
    // });
    // console.log("Tx: ", tx);
    // const gas = await estimateGas({
    //   transaction: tx,
    // });
    // console.log("Gas: ", gas);
  }
}
