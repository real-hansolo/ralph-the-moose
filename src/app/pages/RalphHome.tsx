"use client";
import { RalphWalletCard } from "../_components/RalphWalletCard";
import { PageTemplate } from "@maany_shr/ralph-the-moose-ui-kit";
import { useSignals } from "@preact/signals-react/runtime";
import { RalphMenu } from "../_components/RalphMenu";
import { useActiveWallet } from "@maany_shr/thirdweb/react";

export const RalphHome = () => {
  useSignals();

  const log = (message: string) => {
    const timestamp = new Date().toISOString();
    return `[RalphHome] [${timestamp}] ${message}`;
  };

  /**
   * Hooks and Wallet Information
   */
  const walletInstance = useActiveWallet();
  const isWalletConnected = walletInstance !== undefined;

  /**
   * [Signal] Toasts: Store the toasts to be displayed on the screen.
   */

  return (
    <div id="app-container">
      <PageTemplate menu={<RalphMenu />} networkSelector={<></>} footerContent={""}>
        {!isWalletConnected && <RalphWalletCard />}
        {isWalletConnected && <RalphWalletCard />}
      </PageTemplate>
    </div>
  );
};
