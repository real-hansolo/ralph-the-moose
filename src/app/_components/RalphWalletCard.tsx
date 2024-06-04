import { createThirdwebClient } from "@maany_shr/thirdweb";
import { ConnectButton, type Theme } from "@maany_shr/thirdweb/react";
import { type Wallet } from "@maany_shr/thirdweb/wallets";
import { env } from "~/env";
import { TextButton, WalletCard } from "@maany_shr/ralph-the-moose-ui-kit";
import { RALPH_PUBLIC_ICON_URL } from "~/lib/infrastructure/config/ralph_public_assets";
import { SUPPORTED_WALLETS } from "~/lib/infrastructure/config/wallets";
import { clientContainer } from "~/lib/infrastructure/config/ioc/container";
import type WalletProviderOutputPort from "~/lib/core/ports/secondary/wallet-provider-output-port";
import { GATEWAYS } from "~/lib/infrastructure/config/ioc/symbols";


/**
 * Wraps the WalletCard component with the ThirdWeb ConnectWallet component
 */
export const RalphWalletCard = () => {
  const log = (message: string) => {
    const timestamp = new Date().toISOString();
    return `[RalphWalletCard] [${timestamp}] ${message}`;
  }

  const walletProvider = clientContainer.get<WalletProviderOutputPort<Wallet>>(
    GATEWAYS.WALLET_PROVIDER,
  );
  const getActiveWalletInstance = () => {
    const activeWalletDTO = walletProvider.getActiveWallet();
    if (activeWalletDTO.success) {
      const connectedWallet = activeWalletDTO.data;
      const walletInstanceDTO = walletProvider.getWalletInstance(connectedWallet);
      if (walletInstanceDTO.success) {
        const walletInstance = walletInstanceDTO.data;
        return walletInstance;
      } else {
        console.error(log("Failed to get wallet instance for active wallet"));
        return undefined;
      }
    } else {
      console.error(log("Failed to get active wallet"));
      return undefined;
    }
  };

  const getActiveWalletProvider = () => {
    const activeWalletDTO = walletProvider.getActiveWallet();
    if (activeWalletDTO.success) {
      const connectedWallet = activeWalletDTO.data;
      return connectedWallet.name;
    } else {
      console.error(log("Failed to get active wallet"));
      return undefined;
    }
  }


  const walletInstance = getActiveWalletInstance();
  const isWalletConnected = walletInstance !== undefined;

  const walletAddress = walletInstance?.getAccount()?.address;
  const walletProviderName = getActiveWalletProvider();
  console.info(log(`Wallet Provider: ${walletProviderName} ${walletAddress}`));
  /**
   * Disconnect Wallet
   */
  const onDisconnect = () => {
    const connectedWalletInstance = walletInstance;
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
      status={isWalletConnected ? "connected" : "disconnected"}
      address={walletAddress ? walletAddress : ""}
      walletName={walletProviderName ? walletProviderName : ""}
      connectButton={connectButton}
      disconnectButton={disconnectButton}
    />
  );
};
