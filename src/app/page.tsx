"use client";
import "reflect-metadata"; // Client side Inversion of Control
import { unstable_noStore as noStore } from "next/cache";
import { useSignals } from "@preact/signals-react/runtime";
import {
} from "~/lib/infrastructure/config/chains";
import { RalphHome } from "./pages/RalphHome";
import { ThirdwebProvider } from "@maany_shr/thirdweb/react";

export default function Home() {
  noStore();
  // useSignals();
  return (
    <ThirdwebProvider>
      <RalphHome />
    </ThirdwebProvider>
  );
}
