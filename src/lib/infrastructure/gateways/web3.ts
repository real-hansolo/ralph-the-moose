import { type WalletInstance } from "@thirdweb-dev/react";
import {
  prepareTransaction,
  toWei,
  createThirdwebClient,
} from "thirdweb";
import { env } from "~/env";
import { type MintResponseDTO } from "../dto/web3-dto";
import { type BaseErrorDTO } from "../dto/base";
import { type Signal } from "@preact/signals-react";
import { type ToastProps } from "~/lib";
import { ZksyncSepoliaTestnet } from "@thirdweb-dev/chains";

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

  async mintRequest(amount: number): Promise<MintResponseDTO> {
    if (!this.wallet) {
      const error = {
        success: false,
        msg: "Wallet not connected",
      };
      console.log(error);
      return error as BaseErrorDTO;
    }
    this.toasts.value.push(
      {
        title: "Minting Begins!",
        message: "Please check your wallet to confirm the minting transaction.",
        status: "warning",
        isPermanent: false,
      },
    );
    const message = {
      p: "elkrc-404",
      tick: "PR",
      op: "mint",
      amount: amount,
    };

    try {
      const signedMessage = await this.wallet.signMessage(
        JSON.stringify(message),
      );
      console.log("** Signed message: ", signedMessage);

      const thirdwebClient = createThirdwebClient({
        clientId: this.thirdwebClientID,
      });
      const transaction = prepareTransaction({
        to: this.feeWalletAddress,
        value: toWei(amount.toString()),
        client: thirdwebClient,
        chain: {
          ...ZksyncSepoliaTestnet,
          id: 1,
          rpc: ZksyncSepoliaTestnet.rpc[0],
        },
      });
      console.log("** Transaction: ", transaction);

    } catch (error) {
      return {
        success: false,
        msg: `Error signing message: ${error as string}`,
      };
    }
    return {
      success: true,
      data: {
        minted: amount,
      },
    };
    // const chainID = await this.wallet.getChainId();
    // const thirdwebClient = createThirdwebClient({
    //   clientId: this.thirdwebClientID,
    // });
    // const transaction = prepareTransaction({
    //   to: this.feeWalletAddress,
    //   value: toWei(amount.toString()),
    //   data: signedMessage,
    // });
  }
}
