import { type Signal, useSignal } from "@preact/signals-react";
import { type Chain, createThirdwebClient } from "@maany_shr/thirdweb";
import { ConnectButton, type Theme } from "@maany_shr/thirdweb/react";
import { type Wallet } from "@maany_shr/thirdweb/wallets";
import { env } from "~/env";
import { TextButton, WalletCard } from "@maany_shr/ralph-the-moose-ui-kit";
import {
  SUPPORTED_CHAINS,
  type TChainConfig,
} from "~/lib/infrastructure/config/chains";
import { RALPH_PUBLIC_ICON_URL } from "~/lib/infrastructure/config/ralph_public_assets";
import { SUPPORTED_WALLETS } from "~/lib/infrastructure/config/wallets";
import { clientContainer, signalsContainer } from "~/lib/infrastructure/config/ioc/container";
import type WalletProviderOutputPort from "~/lib/core/ports/secondary/wallet-provider-output-port";
import { GATEWAYS, SIGNALS } from "~/lib/infrastructure/config/ioc/symbols";

/**
 * Props for the RalphWalletCard component.
 */
// export interface RalphWalletCardProps {
//   /**
//    * The status of the wallet connection.
//    * Possible values are "connected" or "disconnected".
//    */
//   status: "connected" | "disconnected";
//   /**
//    * The connected wallet
//    */
//   connectedWallet?: Wallet;
//   /**
//    * The connected account
//    */
//   connectedAccount?: Account;
//   /**
//    * Connected Wallet's Network
//    */
//   connectedWalletNetwork: Chain | undefined;
//   /**
//    * The currently active network
//    */
//   activeNetwork: Signal<TChainConfig>;
//   /**
//    * Callback function to be called when the wallet is disconnected.
//    */
//   onDisconnect: () => void;
// }

/**
 * Wraps the WalletCard component with the ThirdWeb ConnectWallet component
 */
export const RalphWalletCard = () => {
  const S_Wallet_Connection_Status = useSignal<"connected" | "disconnected">("disconnected");
  const S_ActiveWalletName = useSignal<string>("");
  const S_ActiveWalletAddress = useSignal<string>("");

  const walletProvider: WalletProviderOutputPort<Wallet> = clientContainer.get<
    WalletProviderOutputPort<Wallet>
  >(GATEWAYS.WALLET_PROVIDER);
  
  const activeWalletDTO = walletProvider.getActiveWallet();
  if (!activeWalletDTO.success) {
    S_Wallet_Connection_Status.value = "disconnected";
  } else {
    S_Wallet_Connection_Status.value = "connected";
    S_ActiveWalletName.value = activeWalletDTO.data.name;
    S_ActiveWalletAddress.value = activeWalletDTO.data.activeAccount;
  }

  
  /**
   * Disconnect Wallet
   */
  const onDisconnect = () => {
    const connectedWalletInstance = activeWalletDTO.walletInstance;
    if (!connectedWalletInstance) return;
    walletProvider.disconnect(connectedWalletInstance);
  };

  const disconnectButton = (
    <TextButton text="Disconnect" size="medium" onClick={onDisconnect} />
  );

  /**
   * Theme for the Connect Wallet Modal
   */
  const customTheme: Theme = {
    type: "dark",
    colors: {
      secondaryIconColor: "#8E5A45",
      modalBg: "#F6E6DC",
      success: "#009F55",
      danger: "#b42245",
      separatorLine: "#3D1F14",
      borderColor: "#3D1F14",
      accentButtonBg: "#FBF7F3",
      primaryButtonBg: "#009F55",
      primaryButtonText: "#FBF7F3",
      accentText: "#009F55",
      primaryText: "#3D1F16",
      secondaryText: "#8E5A45",
      secondaryButtonHoverBg: "#FBF7F3",
      tertiaryBg: "#D1AC98",
      secondaryIconHoverBg: "#F6E6DC",
      secondaryIconHoverColor: "#009F55",
      skeletonBg: "#8E5A45",
      selectedTextColor: "#FBF7F3",
      selectedTextBg: "#8E5A45",
      secondaryButtonText: "#009F55",
      connectedButtonBg: "#FBF7F3",
      connectedButtonBgHover: "#FBF7F3",
      secondaryButtonBg: "#FBF7F3",
      modalOverlayBg: "",
      accentButtonText: "",
      tooltipBg: "",
      tooltipText: "",
      inputAutofillBg: "",
      scrollbarBg: "",
    },
    fontFamily: "Gluten",
  };

  const thirdWebClient = createThirdwebClient({
    clientId: `${env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}`,
  });
  const supportedChains = Object.values(SUPPORTED_CHAINS).map(
    (chain) => chain.thirdWeb,
  );
  /**
   * The Connect Wallet Button
   */
  const connectButton = (
    <div className="flex w-full font-gluten">
      <ConnectButton
        client={thirdWebClient}
        theme={customTheme}
        wallets={SUPPORTED_WALLETS}
        appMetadata={{
          name: "Ralph",
          description: "Project Ralph",
          url: "https://ralphthemoose.com",
        }}
        // chain={props.activeNetwork.value.thirdWeb}
        chains={supportedChains}
        connectButton={{
          label: "Connect Wallet",
          className: "connectButton",
          // style: {}
        }}
        connectModal={{
          title: "Connect Wallet",
          titleIcon: "Connect your wallet to get started",
          size: "wide",
          welcomeScreen: {
            title: "Welcome to Ralph",
            subtitle: "Connect your wallet to get started",
            img: {
              src: RALPH_PUBLIC_ICON_URL,
              width: 100,
              height: 100,
            },
          },
          showThirdwebBranding: false,
        }}
      />
    </div>
  );

  return (
    <WalletCard
      status={S_Wallet_Connection_Status.value}
      address={S_ActiveWalletAddress.value}
      walletName={S_ActiveWalletName.value}
      connectButton={connectButton}
      disconnectButton={disconnectButton}
    />
  );
};
