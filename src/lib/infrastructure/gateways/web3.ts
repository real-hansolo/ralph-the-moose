import { Account, type WalletInstance } from "@thirdweb-dev/react";
import {
  prepareTransaction,
  toWei,
  createThirdwebClient,
  estimateGas,
  sendTransaction,
} from "thirdweb";
import { env } from "~/env";
import { type MintResponseDTO } from "../dto/web3-dto";
import { type BaseErrorDTO } from "../dto/base";
import { type Signal } from "@preact/signals-react";
import { type ToastProps } from "~/lib";
import { BaseSepoliaTestnet } from "@thirdweb-dev/chains";

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

  generateHexFromMessage = (amount: number): string => {
    // const message = {
    //   p: "elkrc-404",
    //   tick: "PR",
    //   op: "mint",
    //   amount: '10000000000', // TODO : Min Amount, FIX THIS 
    // };
    // const json = JSON.stringify(message);
    const json = `{"p": "elkrc-404", "op": "mint", "tick": "PR", "amount": ${10000000000}}`
    const hex = Buffer.from(json, "utf8").toString("hex");
    console.log("Hex: ", hex);
    console.log(hex);
    return hex;
  };

  async mintRequest(amount: number): Promise<MintResponseDTO> {
    if (!this.wallet) {
      const error = {
        success: false,
        msg: "Wallet not connected",
      };
      console.log(error);
      return error as BaseErrorDTO;
    }
    // this.toasts.value.push({
    //   title: "Minting Begins!",
    //   message: "Please check your wallet to confirm the minting transaction.",
    //   status: "warning",
    //   isPermanent: false,
    // });

    const generateHexFromMessage = this.generateHexFromMessage(amount);
   
    const chainID = await this.wallet.getChainId();

    const baseSepoliaTestnet = BaseSepoliaTestnet

    if(chainID !== baseSepoliaTestnet.chainId) {
      const error = {
        success: false,
        msg: "Wrong Network",
      };
      console.log(error);
      return error as BaseErrorDTO;
    }
    
    const tx = prepareTransaction({
      to: `0x${this.feeWalletAddress}`,
      value: toWei("0.00123"),
      chain: {
        ...BaseSepoliaTestnet,
        rpc: "https://sepolia.base.org",
        id: 84532,
      },
      data: `0x${generateHexFromMessage}`,
      client: createThirdwebClient({
        clientId: this.thirdwebClientID,
      }),
    });
    console.log("Tx: ", tx);
    const gas = await estimateGas({
      transaction: tx
    });
    console.log("Gas: ", gas);

    const signer = await this.wallet.getSigner();

    const receipt = await signer.sendTransaction({
      to: `0x${this.feeWalletAddress}`,
      value: toWei("0.00123"),
      data: `0x${generateHexFromMessage}`,
      chainId: tx.chain.id,
      gasPrice: gas,
      gasLimit: 23000, // TODO: Set gas limit
    });
    
    
    console.log("Receipt: ", receipt);
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


