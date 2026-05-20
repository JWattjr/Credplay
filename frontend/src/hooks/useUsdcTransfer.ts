"use client";

import { useAccount, useChainId, usePublicClient, useWriteContract } from "wagmi";
import type { Hex } from "viem";
import {
  credPlayPredictionMarketAbi,
  getCredPlayMarketContractAddress,
} from "@/lib/credplayContract";
import { xLayer } from "@/lib/xLayer";
import {
  erc20ApproveAbi,
  getUsdtTokenAddress,
  parseUsdtAmount,
} from "@/lib/usdt";

export function useUsdcTransfer() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId: xLayer.id });
  const { writeContractAsync } = useWriteContract();

  async function createPredictionOnChain(amount: number, marketKey: Hex) {
    if (!isConnected || !address) {
      throw new Error("Connect your wallet first.");
    }

    if (chainId !== xLayer.id) {
      throw new Error("Switch to X Layer before sending USDT.");
    }

    if (!publicClient) {
      throw new Error("X Layer RPC client is not ready.");
    }

    const contractAddress = getCredPlayMarketContractAddress();
    if (!contractAddress) {
      throw new Error("Set NEXT_PUBLIC_CREDPLAY_MARKET_CONTRACT_ADDRESS in .env.local before paid USDT actions.");
    }

    const usdtAddress = getUsdtTokenAddress();
    if (!usdtAddress) {
      throw new Error("X Layer USDT token address is not configured.");
    }

    const amountUnits = parseUsdtAmount(amount);

    const approvalHash = await writeContractAsync({
      abi: erc20ApproveAbi,
      address: usdtAddress,
      args: [contractAddress, amountUnits],
      chainId: xLayer.id,
      functionName: "approve",
    });
    await publicClient.waitForTransactionReceipt({ hash: approvalHash });

    const hash = await writeContractAsync({
      abi: credPlayPredictionMarketAbi,
      address: contractAddress,
      args: [marketKey],
      chainId: xLayer.id,
      functionName: "createPrediction",
    });

    await publicClient.waitForTransactionReceipt({ hash });
    return { hash, contractAddress, marketKey };
  }

  async function seedPredictionOnChain(amount: number, marketKey: Hex, side: "YES" | "NO") {
    if (!isConnected || !address) {
      throw new Error("Connect your wallet first.");
    }

    if (chainId !== xLayer.id) {
      throw new Error("Switch to X Layer before sending USDT.");
    }

    if (!publicClient) {
      throw new Error("X Layer RPC client is not ready.");
    }

    const contractAddress = getCredPlayMarketContractAddress();
    if (!contractAddress) {
      throw new Error("Set NEXT_PUBLIC_CREDPLAY_MARKET_CONTRACT_ADDRESS in .env.local before seed actions.");
    }

    const usdtAddress = getUsdtTokenAddress();
    if (!usdtAddress) {
      throw new Error("X Layer USDT token address is not configured.");
    }

    const amountUnits = parseUsdtAmount(amount);

    const approvalHash = await writeContractAsync({
      abi: erc20ApproveAbi,
      address: usdtAddress,
      args: [contractAddress, amountUnits],
      chainId: xLayer.id,
      functionName: "approve",
    });
    await publicClient.waitForTransactionReceipt({ hash: approvalHash });

    const hash = await writeContractAsync({
      abi: credPlayPredictionMarketAbi,
      address: contractAddress,
      args: [marketKey, amountUnits, side === "YES"],
      chainId: xLayer.id,
      functionName: "seedPrediction",
    });

    await publicClient.waitForTransactionReceipt({ hash });
    return { hash, contractAddress, marketKey };
  }

  return { createPredictionOnChain, seedPredictionOnChain };
}
