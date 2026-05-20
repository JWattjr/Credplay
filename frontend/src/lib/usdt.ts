import { isAddress, parseUnits, type Address } from "viem";
import { xLayerUsdtAddress } from "@/lib/xLayer";

export const USDT_DECIMALS = 6;

export const erc20TransferAbi = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

export function getTreasuryAddress() {
  const address = process.env.NEXT_PUBLIC_CREDPLAY_TREASURY_ADDRESS;
  if (!address || !isAddress(address)) return null;
  return address as Address;
}

export function getUsdtTokenAddress() {
  if (!isAddress(xLayerUsdtAddress)) return null;
  return xLayerUsdtAddress as Address;
}

export function parseUsdtAmount(amount: number) {
  return parseUnits(amount.toFixed(USDT_DECIMALS), USDT_DECIMALS);
}
