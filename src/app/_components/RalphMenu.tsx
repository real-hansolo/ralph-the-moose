import React from "react";
import { clientContainer } from "~/lib/infrastructure/config/ioc/container";
import { IconTelegram, IconTwitter, Menu, NavLink } from "@maany_shr/ralph-the-moose-ui-kit";
import { GATEWAYS } from "~/lib/infrastructure/config/ioc/symbols";
import type NetworkGatewayOutputPort from "~/lib/core/ports/secondary/network-gateway-output-port";

export const RalphMenu = () => {
  const networkGateway = clientContainer.get<NetworkGatewayOutputPort>(GATEWAYS.NETWORK_GATEWAY);
  const activeNetworkDTO = networkGateway.getActiveNetwork();
  let elkdexUrl = "";
  let uniswapUrl = "";
  if (activeNetworkDTO.success) {
    elkdexUrl = activeNetworkDTO.data.urls.elkdex
    uniswapUrl = activeNetworkDTO.data.urls.uniswap
  }
  return (
    <Menu>
      <NavLink variant="medium" label="Website" url="https://ralphthemoose.com/" className="text-text-inverted" />
      <NavLink variant="medium" label="Twitter" url="https://twitter.com/RalphTheMoose" icon={<IconTwitter />} className="text-text-inverted" />
      <NavLink variant="medium" label="Telegram" url="https://t.me/RalphTheMoose" icon={<IconTelegram />} className="text-text-inverted" />
      <NavLink variant="medium" label="Farm" url="https://app.elk.finance/farms/all/" className="text-text-inverted" />
      <NavLink variant="medium" label="ElkDex" url={elkdexUrl} className="text-text-inverted" />
      <NavLink variant="medium" label="UniSwap" url={uniswapUrl} className="text-text-inverted" />
    </Menu>
  );
};
