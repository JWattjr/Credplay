"use client";

import { useAccount, useChainId, usePublicClient, useWriteContract } from "wagmi";
import { xLayer } from "@/lib/xLayer";
import {
  erc20TransferAbi,
  getTreasuryAddress,
  getUsdtTokenAddress,
  parseUsdtAmount,
} from "@/lib/usdt";

export function useUsdcTransfer() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId: xLayer.id });
  const { writeContractAsync } = useWriteContract();

  async function transferToTreasury(amount: number) {
    if (!isConnected || !address) {
      throw new Error("Connect your wallet first.");
    }

    if (chainId !== xLayer.id) {
      throw new Error("Switch to X Layer before sending USDT.");
    }

    if (!publicClient) {
      throw new Error("X Layer RPC client is not ready.");
    }

    const treasuryAddress = getTreasuryAddress();
    if (!treasuryAddress) {
      throw new Error("Set NEXT_PUBLIC_CREDPLAY_TREASURY_ADDRESS in .env.local before paid USDT actions.");
    }

    const usdtAddress = getUsdtTokenAddress();
    if (!usdtAddress) {
      throw new Error("X Layer USDT token address is not configured.");
    }

    const hash = await writeContractAsync({
      abi: erc20TransferAbi,
      address: usdtAddress,
      args: [treasuryAddress, parseUsdtAmount(amount)],
      chainId: xLayer.id,
      functionName: "transfer",
    });

    await publicClient.waitForTransactionReceipt({ hash });
    return { hash, treasuryAddress };
  }

  return { transferToTreasury };
}
