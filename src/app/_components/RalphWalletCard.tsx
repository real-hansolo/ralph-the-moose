import {
  ConnectWallet,
  darkTheme,
} from "@thirdweb-dev/react";
import { TextButton, WalletCard } from "~/lib";
import { RALPH_PUBLIC_ICON_URL } from "~/lib/infrastructure/config/ralph_public_assets";

/**
 * Props for the RalphWalletCard component.
 */
export interface RalphWalletCardProps {
  /**
   * The status of the wallet connection.
   * Possible values are "connected" or "disconnected".
   */
  status: "connected" | "disconnected",
  /**
   * The address of the wallet.
   */
  walletAddress: string,
  /**
   * The ID of the wallet.
   */
  walletId: string,
  /**
   * Callback function to be called when the wallet is disconnected.
   */
  onDisconnect: () => void,
}

/**
 * Wraps the WalletCard component with the ThirdWeb ConnectWallet component
 */
export const RalphWalletCard = (props: RalphWalletCardProps) => {

  /**
   * Theme for the Connect Wallet Modal
   */
  const customTheme = darkTheme(
    darkTheme({
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
        walletSelectorButtonHoverBg: "#D1AC98",
        secondaryIconHoverBg: "#F6E6DC",
        secondaryIconHoverColor: "#009F55",
        skeletonBg: "#8E5A45",
        selectedTextColor: "#FBF7F3",
        selectedTextBg: "#8E5A45",
        secondaryButtonText: "#009F55",
        connectedButtonBg: "#FBF7F3",
        connectedButtonBgHover: "#FBF7F3",
        secondaryButtonBg: "#FBF7F3",
      },
      fontFamily: "Gluten",
    }),
  );

  /**
   * The Connect Wallet Button
   */
  const connectButton = (
    <div className="flex w-full font-gluten">
      <ConnectWallet
        className="connectButton"
        theme={customTheme}
        modalSize={"wide"}
        welcomeScreen={{
          img: {
            // TODO: Cleanup and store this in a config
            src: RALPH_PUBLIC_ICON_URL,
            width: 150,
            height: 150,
          },
          title: "Welcome to Ralph",
          subtitle: "Connect your wallet to get started",
        }}
        modalTitleIconUrl={RALPH_PUBLIC_ICON_URL}
        showThirdwebBranding={false}
        
      />
    </div>
  );
  /**
   * The Disconnect Wallet Button
   */
  const disconnectButton = (
    <TextButton text="Disconnect" size="medium" onClick={props.onDisconnect} />
  );
  
  return (
    <WalletCard
      status={props.status}
      address={
        props.walletAddress ? `${props.walletAddress}` : "Oops, no wallet conneced!"
      }
      walletId={props.walletAddress? props.walletId: ""}
      connectButton={connectButton}
      disconnectButton={disconnectButton}
    />
  );
};
