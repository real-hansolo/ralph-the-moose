import React from "react";
import {
  Button,
  Heading,
  HeadingVariant,
  IconButtonClose,
  InProgressStatusFrame,
  InputAssetAmountWithLabel,
  Label,
  Modal,
} from "..";

import { LightFrame } from "../layouts/LightFrame";
import { type Signal } from "@preact/signals-react";
import { useSignals } from "@preact/signals-react/runtime";

/**
 * Props for the WrapModal component.
 */
export interface WrapCardProps {
  amountToWrap: Signal<number>; // The amount to be wrapped
  inscriptionBalance: number; // The maximum amount that can be wrapped
  fee: number; // The fee for wrapping
  tokenShortName: string; // The short name of the token
  icon: React.ReactNode; // The icon for the token
  claimableAmount: number; // The amount that can be claimed
  onClose?: () => void; // Callback function when the modal is closed
  onWrap: () => void; // Callback function when wrapping is triggered
  onClaim: () => void; // Callback function when claiming is triggered
  SWrapStatusMessage: Signal<string>; // The status message populated during the wrapping process
  SClaimStatusMessage: Signal<string>; // The status message populated during the claiming process
  SWrapCardView: Signal<"wrapping" | "claiming" | "default">; // The view of the wrap card
}

export const WrapCard = ({
  amountToWrap,
  inscriptionBalance,
  claimableAmount,
  fee,
  tokenShortName,
  icon,
  onClose,
  onWrap,
  onClaim,
  SWrapCardView,
  SWrapStatusMessage,
  SClaimStatusMessage,
}: WrapCardProps) => {
  useSignals();
  const wrappedTokenName = `W${tokenShortName.toUpperCase()}`;
  const amountAfterWrapping = amountToWrap.value * (1 - fee / 100);
  const defaultView = (
    <div className="flex w-full flex-col items-start justify-center gap-4">
      <div className="relative flex w-full flex-row justify-between">
        <Heading title="Wrap" variant={HeadingVariant.H4} />
        <div className="ml-auto">
          <IconButtonClose size={4} onClick={onClose ? onClose : () => {}} />
        </div>
      </div>
      <InputAssetAmountWithLabel
        label="Amount to wrap"
        maxAmount={inscriptionBalance}
        amount={amountToWrap}
        tokenShortName={tokenShortName}
        icon={icon}
        errorMessage={
          amountToWrap.value > inscriptionBalance
            ? "Tryn'a reap before you sow, eh?"
            : ""
        }
      />
      <LightFrame className="w-full font-varela text-text-secondary">
        <div className="flex flex-row items-baseline justify-between self-stretch">
          <div className="relative leading-[14px]">Wrap amount</div>
          <Label
            label={`${amountToWrap.value} ${tokenShortName}`}
            variant="medium"
          />
        </div>
        <div className="flex flex-row items-baseline justify-between self-stretch">
          <div className="relative leading-[14px]">Wrapping fee</div>
          <Label label={`${fee} %`} variant="medium" />
        </div>
        <div className="flex flex-row items-baseline justify-between self-stretch">
          <div className="relative leading-[14px]">{`You'll receive`}</div>
          <Label
            label={`${amountAfterWrapping} ${wrappedTokenName}`}
            variant="medium"
          />
        </div>
        <Button
          label={`Wrap ${amountToWrap.value} ${tokenShortName}`}
          variant="primary"
          onClick={onWrap}
        />
        <div className="flex flex-row items-baseline justify-between self-stretch">
          <div className="relative leading-[14px]">{`Reap what you sow'd`}</div>
          <Label
            label={`${claimableAmount} ${wrappedTokenName}`}
            variant="medium"
          />
        </div>
        <Button
          label={`Claim ${claimableAmount} ${wrappedTokenName}`}
          variant="secondary"
          onClick={onClaim}
        />
      </LightFrame>
    </div>
  );

  const wrappingView = (
    <div className="flex w-full flex-col items-start justify-center gap-4">
      <div className="relative flex w-full flex-row justify-between">
        <Heading title="Wrapping" variant={HeadingVariant.H4} />
        <div className="ml-auto">
          <IconButtonClose size={4} onClick={onClose ? onClose : () => {
            SWrapCardView.value = "default";
          }} />
        </div>
      </div>
      <div className="flex w-full flex-col items-center justify-center gap-4">
        <LightFrame className="w-full items-center gap-4">
          <div className="font-heading-h5 relative inline-block w-full overflow-auto whitespace-normal text-center font-gluten text-lg font-bold leading-[18px] tracking-[-0.04em] text-text-primary">
            <InProgressStatusFrame
              title={`Wrapping ${amountToWrap.value} ${tokenShortName}`}
              message={SWrapStatusMessage.value}
            />
          </div>
        </LightFrame>
      </div>
    </div>
  );

  const claimingView = (
    <div className="flex w-full flex-col items-start justify-center gap-4">
      <div className="relative flex w-full flex-row justify-between">
        <Heading title="Claiming" variant={HeadingVariant.H4} />
        <div className="ml-auto">
          <IconButtonClose size={4} onClick={onClose ? onClose : () => {
            SWrapCardView.value = "default";
          }} />
        </div>
      </div>
      <div className="flex w-full flex-col items-center justify-center gap-4">
        <LightFrame className="w-full items-center gap-4">
          <div className="font-heading-h5 relative inline-block w-full overflow-auto whitespace-normal text-center font-gluten text-lg font-bold leading-[18px] tracking-[-0.04em] text-text-primary">
            <InProgressStatusFrame
              title={`Claiming ${claimableAmount} W${tokenShortName}`}
              message={SClaimStatusMessage.value}
            />
          </div>
        </LightFrame>
      </div>
    </div>
  );
  return (
    <Modal>
      {SWrapCardView.value === "default" && defaultView}
      {SWrapCardView.value === "wrapping" && wrappingView}
      {SWrapCardView.value === "claiming" && claimingView}
    </Modal>
  );
};
