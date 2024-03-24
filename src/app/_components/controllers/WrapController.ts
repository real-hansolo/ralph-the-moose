import { effect, type Signal } from "@preact/signals-react";
import { type TChainConfig } from "~/lib/infrastructure/config/chains";
import { type WrapDTO } from "~/lib/infrastructure/dto/web3-dto";
import type Web3Gateway from "~/lib/infrastructure/gateways/web3";

export const wrap = async (
  web3Gateway: Web3Gateway,
  humanReadableWrappingAmount: number,
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
    statusMessage,
  );
  if (!result.success) {
    return false;
  }
};

// export const claim = async (
//   web3Gateway: Web3Gateway,
//   humanReadableWrappingAmount: number,
//   chain: TChainConfig,
//   statusMessage: Signal<string>,
// ) => {
//   effect(() => {
//     const message = `[CLAIM CONTROLLER]: ${statusMessage.value}`;
//     console.log(message);
//   });
//   const amountToClaim = humanReadableWrappingAmount * 10 ** 9;
//   const result = await web3Gateway.sendClaimTransaction(
//     amountToClaim,
//     chain,
//     statusMessage,
//   );
//   return false;
// };
