import { effect, type Signal } from "@preact/signals-react";
import { type Account, type Wallet } from "thirdweb/wallets";
import { type TChainConfig } from "~/lib/infrastructure/config/chains";
import { type WrapDTO } from "~/lib/infrastructure/dto/web3-dto";
import type Web3Gateway from "~/lib/infrastructure/gateways/web3";

export const wrap = async (
  web3Gateway: Web3Gateway,
  humanReadableWrappingAmount: number,
  wallet: Wallet,
  account: Account,
  chain: TChainConfig,
  statusMessage: Signal<string>,
) => {
  effect(() => {
    const message = `[WRAP CONTROLLER]: ${statusMessage.value}`;
    console.log(message);
  });
  const amountToWrap = humanReadableWrappingAmount * 10 ** 9;
  const result: WrapDTO = await web3Gateway.sendWrapTransaction(
    amountToWrap,
    chain,
    wallet,
    account,
    statusMessage,
  );
  if (!result.success) {
    return Promise.reject(result.msg);
  }
};

export const claim = async (
  web3Gateway: Web3Gateway,
  humanReadableClaimableAmount: number,
  wallet: Wallet,
  account: Account,
  chain: TChainConfig,
  statusMessage: Signal<string>,
) => {
  effect(() => {
    const message = `[CLAIM CONTROLLER]: ${statusMessage.value}`;
    console.log(message);
  });
  const amountToClaim = humanReadableClaimableAmount * 10 ** 9;
  const result = await web3Gateway.claimWrappedTokens(amountToClaim, wallet, account, chain);
  if (!result.success) {
    return Promise.reject(result.msg);
  }
  
};
