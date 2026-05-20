"use client";

import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { xLayer, xLayerTransport } from "@/lib/xLayer";
import { RightPanelSlotProvider } from "@/hooks/useRightPanelSlot";

const config = getDefaultConfig({
  appName: "CredPlay",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "credplay-local",
  chains: [xLayer],
  transports: {
    [xLayer.id]: xLayerTransport,
  },
  ssr: true,
});

export default function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <RightPanelSlotProvider>{children}</RightPanelSlotProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
