import { isAddress, type Address, type Hex } from "viem";
import { credPlayMarketContractAddress } from "@/lib/xLayer";

export const credPlayPredictionMarketAbi = [
  {
    name: "createPrediction",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "marketKey", type: "bytes32" }],
    outputs: [],
  },
  {
    name: "seedPrediction",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "marketKey", type: "bytes32" },
      { name: "amount", type: "uint256" },
      { name: "yesSide", type: "bool" },
    ],
    outputs: [],
  },
  {
    name: "votePrediction",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "marketKey", type: "bytes32" },
      { name: "side", type: "uint8" },
    ],
    outputs: [],
  },
] as const;

export function getCredPlayMarketContractAddress() {
  if (!isAddress(credPlayMarketContractAddress)) return null;
  return credPlayMarketContractAddress as Address;
}

export function createMarketKey(): Hex {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return `0x${Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")}` as Hex;
}
