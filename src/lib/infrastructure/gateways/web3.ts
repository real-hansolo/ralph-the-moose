import { type WalletInstance } from "@thirdweb-dev/react";
import {
  prepareTransaction,
  toWei,
  createThirdwebClient,
  type ThirdwebClient,
} from "thirdweb";
import { env } from "~/env";

export default class Web3Gateway {
  private feeWalletAddress: string;
  private wallet: WalletInstance | undefined;
  private thirdwebClientID: string;
  constructor(wallet: WalletInstance | undefined) {
    this.feeWalletAddress = env.NEXT_PUBLIC_FEE_WALLET_ADDRESS;
    this.wallet = wallet;
    this.thirdwebClientID = env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
  }

  async mintRequest(amount: number): Promise<MintResponse> {
    console.log("** Minting request");
    if (!this.wallet) {
      const error = {
        status: "error",
        message: "Wallet not connected",
      };
      console.log(error);
      return;
    }
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
    } catch (error) {
      console.log("Error signing message: ", error);
    }
    console.log("Returning")
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
