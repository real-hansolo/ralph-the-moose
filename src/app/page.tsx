"use client";
import { signal } from "@preact/signals-react";
import { unstable_noStore as noStore } from "next/cache";
import { Button, TextButton, WalletCard, MintCard, BalanceCard, PageTemplate, Modal, WrapCard } from "~/lib";


const connectButton = <Button variant="primary" label="Connect Wallet" />;
const disconnectButton = (
  <TextButton text="Disconnect" size="medium" onClick={() => {console.log("Disconnect Wallet")}}></TextButton>
);
const walletCard = (
  <WalletCard
    status="disconnected"
    address="0x1234...5678"
    connectButton={connectButton}
    disconnectButton={disconnectButton}
  />
);

const mintCard = (
  <MintCard
    mintedPercentage={0.5}
    mintLimit={100000}
    totalSupply={100000}
    totalMinted={50000}
    mintingFee={10}
    mintingDisabled={false}
    tokenShortName="PR"
    isMinting={signal(false)}
    onMint={() => console.log('mint')}
    // children={
    // <MintCompletedStatusFrame
    //   tokenShortName="PR"
    //   amountMinted={10000}
    //   timestamp="2024-02-14 @ 16:03"
    //   explorerLink="nowhere"
    // />
    // }
  />
);
const balanceCard = (
  <BalanceCard
    inscriptionBalance={80000}
    wrappedBalance={20000}
    tokenShortName="PR"
    icon={<div />}
    fee={2}
    onWrap={() => {console.log('wrap')}}
    onUnwrap={() => {console.log('unwrap')}}
  />
);
export default function Home() {
  noStore();

  return (

    
    <div className="">
      {/* <Modal><div><h1>Hello</h1></div></Modal> */}
      <PageTemplate>
        {walletCard}
        {mintCard}
        {balanceCard}
      </PageTemplate>
    </div>
  )
}