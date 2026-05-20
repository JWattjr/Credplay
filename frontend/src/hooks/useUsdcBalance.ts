"use client";

import type { Address } from "viem";
import { formatUnits, isAddress } from "viem";
import { useAccount, useChainId, useReadContract } from "wagmi";
import { xLayer, xLayerUsdtAddress, hasXLayerWalletConfig } from "@/lib/xLayer";

const erc20Abi = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
] as const;

export function useUsdcBalance() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const enabled =
    isConnected &&
    Boolean(address) &&
    hasXLayerWalletConfig() &&
    isAddress(xLayerUsdtAddress);

  const rawBalance = useReadContract({
    abi: erc20Abi,
    address: enabled ? (xLayerUsdtAddress as Address) : undefined,
    args: address ? [address] : undefined,
    chainId: xLayer.id,
    functionName: "balanceOf",
    query: {
      enabled,
      refetchInterval: 15_000,
    },
  });

  const decimals = useReadContract({
    abi: erc20Abi,
    address: enabled ? (xLayerUsdtAddress as Address) : undefined,
    chainId: xLayer.id,
    functionName: "decimals",
    query: {
      enabled,
      staleTime: Infinity,
    },
  });

  const formattedValue =
    rawBalance.data !== undefined
      ? Number(formatUnits(rawBalance.data, decimals.data ?? 6)).toLocaleString(undefined, { maximumFractionDigits: 4 })
      : "0";

  return {
    address,
    isConnected,
    chainId,
    isXLayer: chainId === xLayer.id,
    balance: {
      data: rawBalance.data,
      error: rawBalance.error || decimals.error,
      isLoading: rawBalance.isLoading || decimals.isLoading,
    },
    formatted: formattedValue,
  };
}
