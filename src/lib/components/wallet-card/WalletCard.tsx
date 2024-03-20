import Image from "next/image";
import { Label, Card } from "..";
import ralphConnectWallet from "@/assets/ralph-connect-wallet.svg";
/**
 * Represents the props for the WalletCard component.
 */
export interface WalletCardProps {
  /**
   * The status of the wallet connection.
   * Possible values are "connected" or "disconnected".
   */
  status: "connected" | "disconnected";

  /**
   * The address of the wallet.
   */
  address: string;
  /**
   * The walletId of the wallet.
   */
  walletId: string;
  /**
   * The React node for the connect button.
   */
  connectButton: React.ReactNode;

  /**
   * The React node for the disconnect button.
   */
  disconnectButton: React.ReactNode;
}

/**
 * The WalletCard component displays the status and address of the wallet.
 */
export const WalletCard = ({
  status,
  address,
  connectButton,
  disconnectButton,
  walletId,
}: WalletCardProps) => {
  return (
    <Card>
      {status === "connected" ? (
        <WalletCard.Connected
          address={address}
          walletId={walletId}
          disconnectButton={disconnectButton}
        />
      ) : (
        <WalletCard.Disconnected connectButton={connectButton} />
      )}
    </Card>
  );
};

WalletCard.Disconnected = ({
  connectButton,
}: {
  connectButton: React.ReactNode;
}) => {
  return (
    <div className="text-button-primary-text font-link-medium relative flex w-full flex-1 flex-col items-center justify-start gap-[30px] text-left text-base">
      <Image
        className="relative h-[117.56px] w-[135.24px] object-cover"
        alt=""
        src={ralphConnectWallet}
      />
      {connectButton}
    </div>
  );
};

WalletCard.Connected = ({
  address,
  walletId,
  disconnectButton,
}: {
  address: string;
  walletId: string;
  disconnectButton: React.ReactNode;
}) => {
  return (
    <div className="flex flex-row items-center justify-between gap-[16px] self-stretch">
      {/** Wallet Addres div, pinned to the left of the parent */}
      <div className="flex flex-1 flex-col items-start justify-start gap-[8px]">
        <div className="relative self-stretch font-varela text-sm leading-[14px] text-text-secondary">
          {walletId}
        </div>
        <Label variant="small" label={address} />
      </div>
      {/** Disconnect div, pinned to the right of parent */}
      <div className="">{disconnectButton}</div>
    </div>
  );
};
