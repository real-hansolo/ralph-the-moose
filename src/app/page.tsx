"use client";
import "reflect-metadata"; // Client side Inversion of Control
import { unstable_noStore as noStore } from "next/cache";
import { useSignals } from "@preact/signals-react/runtime";
import {} from "~/lib/infrastructure/config/chains";
import { RalphHome } from "./pages/RalphHome";
import { ThirdwebProvider } from "@maany_shr/thirdweb/react";
import { Card, Heading, HeadingVariant, LightFrame, PageTemplate, Paragraph } from "@maany_shr/ralph-the-moose-ui-kit";
import { RalphNetworkSelector } from "./_components/NetworkSelector";
import { RalphMenu } from "./_components/RalphMenu";

export default function Home() {
  noStore();
  // useSignals();
  return (
    <ThirdwebProvider>
      <PageTemplate menu={<RalphMenu />} networkSelector={<RalphNetworkSelector />} footerContent={""}>
          <div className="flex flex-col items-center justify-between">
            <LightFrame className="w-1/2">
              <Heading title="Preparing a spicy v2 launch" variant={HeadingVariant.H4} />
              <Paragraph>
                We are currently preparing for the launch of the v2 of the Ralph dApp. Please check back later. Once the v2 is launched, you will be able to mint,
                wrap, unwrap, bridge, and claim your assets. Please stay tuned for more updates. Thank you for your patience. We will be announcing the launch of
                the v2 on our social media channels.
              </Paragraph>
            </LightFrame>
          </div>
      </PageTemplate>
    </ThirdwebProvider>
  );
}
