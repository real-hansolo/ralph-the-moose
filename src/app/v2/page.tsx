"use client";
import "reflect-metadata"; // Client side Inversion of Control
import { unstable_noStore as noStore } from "next/cache";
import { ThirdwebProvider } from "@maany_shr/thirdweb/react";
import { RalphHome } from "../pages/RalphHome";

export default function Home() {
  noStore();
  return (
    <ThirdwebProvider>
      <RalphHome />
    </ThirdwebProvider>
  );
}
