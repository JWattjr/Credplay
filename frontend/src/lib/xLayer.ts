import { defineChain, http } from "viem";
import type { Address } from "viem";

const chainId = Number(process.env.NEXT_PUBLIC_XLAYER_CHAIN_ID || "196");
const rpcUrl = process.env.NEXT_PUBLIC_XLAYER_RPC_URL || "";
const usdtAddress = process.env.NEXT_PUBLIC_XLAYER_USDT_ADDRESS || "";

export const xLayer = defineChain({
  id: chainId,
  name: "X Layer",
  nativeCurrency: {
    decimals: 18,
    name: "OKB",
    symbol: "OKB",
  },
  rpcUrls: {
    default: {
      http: [rpcUrl || "https://rpc.xlayer.tech"],
    },
  },
  testnet: false,
});

export const xLayerTransport = http(rpcUrl || undefined);

export const xLayerUsdtAddress = usdtAddress as Address;

export function hasXLayerWalletConfig() {
  return Boolean(chainId && rpcUrl && usdtAddress);
}

export function shortAddress(address?: string) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
