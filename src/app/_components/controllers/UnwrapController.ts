import { type Signal } from "@preact/signals-react";
import { type Account, type Wallet } from "thirdweb/wallets";
import { type TChainConfig } from "~/lib/infrastructure/config/chains";
import { UnwrapDTO } from "~/lib/infrastructure/dto/web3-dto";
import type Web3Gateway from "~/lib/infrastructure/gateways/web3";

export const unwrap = async (
  web3Gateway: Web3Gateway,
  humanReadableUnwrappingAmount: number,
  wallet: Wallet,
  account: Account,
  chain: TChainConfig,
  statusMessage: Signal<string>,
) => {
  const amountToUnwrap = humanReadableUnwrappingAmount * 10 ** 9;
  const walletAddress = account.address;
  // Check allowance
  const allowance = await web3Gateway.checkSpendingAllowanceForRalphReservoir(
    chain,
    walletAddress,
    amountToUnwrap,
  );
  if (!allowance) {
    statusMessage.value = "Awaiting approval to unwrap your tokens.";
    const approvalResult =
      await web3Gateway.approveRalphReservoirToSpendPRToken(
        chain,
        wallet,
        account,
        amountToUnwrap,
      );
    if (!approvalResult) {
      return Promise.reject("Couldn't approve Ralph to unwrap your PR Tokens");
    }
  }
  statusMessage.value = "Unwrapping your tokens...";
    const result: UnwrapDTO = await web3Gateway.unwrapPRToken(
        amountToUnwrap,
        chain,
        wallet,
        account,
        statusMessage,
    );
    if (!result.success) {
        return Promise.reject(result.msg);
    }
    return result;

};
