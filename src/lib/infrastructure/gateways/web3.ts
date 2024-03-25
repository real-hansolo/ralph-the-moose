import {
  type ThirdwebClient,
  createThirdwebClient,
  estimateGas,
  prepareTransaction,
  sendTransaction,
  toWei,
  prepareContractCall,
  getContract,
} from "thirdweb";
import { env } from "~/env";
import {
  type GetWrappedBalanceDTO,
  type ClaimableDTO,
  type MintResponseDTO,
  type WrapDTO,
  type ClaimDTO,
  type UnwrapDTO,
} from "../dto/web3-dto";
import { type Signal } from "@preact/signals-react";
import { type TChainConfig } from "../config/chains";
import { ethers } from "ethers";
import RalphReservoirABI from "../abi/RalphReservoir.json";
import Ralph from "../abi/Ralph.json";
import { type Account, type Wallet } from "thirdweb/wallets";

export default class Web3Gateway {
  private feeWalletAddress: string;
  private thirdWebClient: ThirdwebClient;
  constructor() {
    this.feeWalletAddress = env.NEXT_PUBLIC_FEE_WALLET_ADDRESS;
    this.thirdWebClient = createThirdwebClient({
      clientId: env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
    });
  }

  __getWalletChainID = async (wallet: Wallet) => {
    const chain = wallet.getChain();
    return chain?.id;
  };
  __generateHexFromMintMessage = (amount: number): string => {
    // TODO: hook up amount to the message. default 10000000000
    const json = `{"p": "elkrc-404", "op": "mint", "tick": "PR", "amount": ${amount}}`;
    const hex = Buffer.from(json, "utf8").toString("hex");
    return hex;
  };

  __generateHexFromWrapMessage = (
    bigAmount: number,
    ralphReservoirAddress: string,
  ): string => {
    const json = `{"p": "elkrc-404", "op": "transfer", "tick": "PR", "to": "${ralphReservoirAddress}", "amount": ${bigAmount}}`;
    const hex = Buffer.from(json, "utf8").toString("hex");
    return hex;
  };

  async sendMintTransaction(
    amount: number,
    chain: TChainConfig,
    wallet: Wallet,
    account: Account,
    statusMessage: Signal<string>,
  ): Promise<MintResponseDTO> {
    const message = this.__generateHexFromMintMessage(amount);
    const thirdWebClient = this.thirdWebClient;
    const thirdWebTx = prepareTransaction({
      to: `0x${this.feeWalletAddress}`,
      value: toWei("0.00123"),
      data: `0x${message}`,
      chain: chain.thirdWeb,
      client: thirdWebClient,
    });

    if (account.estimateGas) {
      const estimatedGas = await account.estimateGas(thirdWebTx);
      statusMessage.value = `Waiting for confirmation! Estimated Gas: ${estimatedGas.toString()}. Gas Limit: ${chain.gasLimit}`; // TODO: what is the correct format ?
    }
    const gas = await estimateGas({
      transaction: thirdWebTx,
    });
    statusMessage.value = `Estimated Gas: ${gas.toString()}. Gas Limit: ${chain.gasLimit}`; // TODO: what is the correct format ?
    try {
      const { transactionHash } = await sendTransaction({
        account: account,
        transaction: thirdWebTx,
      });
      const explorerLink = `${chain.explorerUrl}/tx/${transactionHash}`;
      const timestamp = new Date().toLocaleDateString();
      return {
        success: true,
        data: {
          amountMinted: amount,
          timestamp: timestamp,
          explorerLink: explorerLink,
          tokenShortName: "PR",
          txHash: transactionHash,
        },
      };
    } catch (e) {
      console.error(e as Error);
      return {
        success: false,
        msg: "Transaction failed. Try again or get in touch?",
      };
    }
  }

  async fetchClaimableAmount(
    chain: TChainConfig,
    walletAddress: string,
  ): Promise<ClaimableDTO> {
    const provider = new ethers.providers.JsonRpcProvider(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      chain.jsonRpcProvider,
    );
    const contract = new ethers.Contract(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      chain.ralphReservoirAddress,
      RalphReservoirABI,
      provider,
    );

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const claimable = await contract.claimable(walletAddress);
      return {
        success: true,
        data: {
          amount: claimable as unknown as number, // TODO: check if this is the correct value
        },
      };
    } catch (e) {
      console.error(e as Error);
      return {
        success: false,
        msg: "Error fetching claimable balance",
      };
    }
  }

  async claimWrappedTokens(
    amount: number,
    wallet: Wallet,
    account: Account,
    chain: TChainConfig,
  ): Promise<ClaimDTO> {
    try {
      const transaction = prepareContractCall({
        contract: getContract({
          client: this.thirdWebClient,
          address: chain.ralphReservoirAddress,
          chain: chain.thirdWeb,
        }),
        method: {
          inputs: [
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "claim",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        params: [BigInt(amount)],
      });

      const receipt = await sendTransaction({
        transaction: transaction,
        account: account,
      });
      console.log(`[Receipt]: ${JSON.stringify(receipt)}`);
      
      return {
        success: true,
        data: {},
      };
    } catch (e: unknown) {
      console.error(e as Error);
      return {
        success: false,
        msg: `Error claiming wrapped tokens: ${JSON.stringify(e)}`,
      };
    }
  }
  async getPRTokenBalance(
    chain: TChainConfig,
    walletAddress: string,
  ): Promise<GetWrappedBalanceDTO> {
    const provider = new ethers.providers.JsonRpcProvider(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      chain.jsonRpcProvider,
    );

    const contract = new ethers.Contract(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      chain.ralphTokenAddress,
      Ralph,
      provider,
    );

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const balance = await contract.balanceOf(walletAddress);
      return {
        success: true,
        data: {
          balance: balance,
        },
      };
    } catch (e) {
      console.error(e as Error);
      return {
        success: false,
        msg: "Error fetching PR Token balance",
      };
    }
  }

  async sendWrapTransaction(
    amount: number,
    chain: TChainConfig,
    wallet: Wallet,
    account: Account,
    statusMessage: Signal<string>,
  ): Promise<WrapDTO> {
    const message = this.__generateHexFromWrapMessage(
      amount,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      chain.ralphReservoirAddress,
    );
    const thirdWebTx = prepareTransaction({
      to: `${chain.ralphReservoirAddress}`,
      chain: chain.thirdWeb,
      client: this.thirdWebClient,
      value: toWei("0.00123"),
      data: `0x${message}`,
    });

    const estimatedGas = await estimateGas({ transaction: thirdWebTx });
    statusMessage.value = `Estd Gas: ${estimatedGas.toString()}. Limit: ${chain.gasLimit}`; // TODO: what is the correct format ?

    try {
      const { transactionHash } = await sendTransaction({
        transaction: thirdWebTx,
        account: account,
      });
      statusMessage.value = `Wrapping ended!`;
      const timestamp = new Date().toLocaleDateString(); // TODO: check if this is okay or we should stick with the receipt timestamp
      const explorerLink = `${chain.explorerUrl}/tx/${transactionHash}`;
      return {
        success: true,
        data: {
          wrappedAmount: amount,
          timestamp: timestamp,
          explorerLink: explorerLink,
          tokenShortName: "PR",
          txHash: transactionHash,
        },
      };
    } catch (e) {
      console.error(e as Error);
      return {
        success: false,
        msg: "Transaction failed. Try again or get in touch?",
      };
    }
  }

  async checkSpendingAllowanceForRalphReservoir(
    chain: TChainConfig,
    walletAddress: string,
    unwrapRequestAmount: number,
  ): Promise<boolean> {
    const provider = new ethers.providers.JsonRpcProvider(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      chain.jsonRpcProvider,
    );
    const contract = new ethers.Contract(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      chain.ralphTokenAddress,
      Ralph,
      provider,
    );

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const allowance = await contract.allowance(walletAddress, chain.ralphReservoirAddress);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
      return allowance.gt(BigInt(unwrapRequestAmount));
    } catch (e) {
      console.error(e as Error);
      return false;
    }
  }

  async approveRalphReservoirToSpendPRToken(
    chain: TChainConfig,
    wallet: Wallet,
    account: Account,
    amount: number,
  ): Promise<boolean> {
    try {
      const transaction = prepareContractCall({
        contract: getContract({
          client: this.thirdWebClient,
          address: chain.ralphTokenAddress,
          chain: chain.thirdWeb,
        }),
        method: {
          inputs: [
            {
              internalType: "address",
              name: "spender",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "approve",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        params: [chain.ralphReservoirAddress, BigInt(amount)],
      });

      const receipt = await sendTransaction({
        transaction: transaction,
        account: account,
      });
      console.log(`[Receipt]: ${JSON.stringify(receipt)}`);
      return true;
    } catch (e: unknown) {
      console.error(e as Error);
      return false;
    }
  }

  async unwrapPRToken(
    amount: number,
    chain: TChainConfig,
    wallet: Wallet,
    account: Account,
    statusMessage: Signal<string>,
  ): Promise<UnwrapDTO> {
    const message = this.__generateHexFromWrapMessage(
      amount,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      chain.ralphReservoirAddress,
    );
    const thirdWebTx = prepareTransaction({
      to: `${chain.ralphReservoirAddress}`,
      chain: chain.thirdWeb,
      client: this.thirdWebClient,
      value: toWei("0.00123"),
      data: `0x${message}`,
    });

    const estimatedGas = await estimateGas({ transaction: thirdWebTx });
    statusMessage.value = `Estd Gas: ${estimatedGas.toString()}. Limit: ${chain.gasLimit}`; // TODO: what is the correct format ?

    try {
      const { transactionHash } = await sendTransaction({
        transaction: thirdWebTx,
        account: account,
      });
      statusMessage.value = `Unwrapping ended!`;
      const timestamp = new Date().toLocaleDateString(); // TODO: check if this is okay or we should stick with the receipt timestamp
      const explorerLink = `${chain.explorerUrl}/tx/${transactionHash}`;
      return {
        success: true,
        data: {
          unwrappedAmount: amount,
          timestamp: timestamp,
          explorerLink: explorerLink,
          tokenShortName: "PR",
          txHash: transactionHash,
        },
      };
    } catch (e) {
      console.error(e as Error);
      return {
        success: false,
        msg: "Transaction failed. Try again or get in touch?",
      };
    }
  }
}
