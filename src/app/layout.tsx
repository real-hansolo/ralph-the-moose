import "~/styles/globals.css";
import { SpeedInsights } from '@vercel/speed-insights/next';

import { Inter } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { AxiomWebVitals } from "next-axiom";

export { AxiomWebVitals } from 'next-axiom';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Ralph",
  description: "",
  icons: [{ rel: "icon", url: "/favicon.png" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <AxiomWebVitals />
      <SpeedInsights />
      <body className={`font-sans ${inter.variable}`}>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
