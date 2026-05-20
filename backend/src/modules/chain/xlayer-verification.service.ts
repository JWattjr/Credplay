import { Injectable, ServiceUnavailableException, UnprocessableEntityException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

const PREDICTION_CREATED_TOPIC =
  "0xcdd18f04289ee1b08c36eab21fa02cc6d603369548971a67f12efd8e56e0bacf";
const PREDICTION_SEEDED_TOPIC =
  "0x908388aaacf386242ddea3e1f14e6ba6099f99bdef75ebd91605a37364a8a701";

interface RpcLog {
  address: string;
  topics: string[];
  data: string;
}

interface RpcReceipt {
  status?: string;
  transactionHash: string;
  blockNumber?: string;
  from?: string;
  to?: string;
  logs: RpcLog[];
}

export interface VerifiedPredictionCreation {
  contractAddress: string;
  feeToken: string;
  feeAmount: bigint;
  chainId: number;
  blockNumber: number | null;
}

export interface VerifiedPredictionSeed {
  contractAddress: string;
  amount: bigint;
  yesSide: boolean;
  chainId: number;
  blockNumber: number | null;
}

@Injectable()
export class XLayerVerificationService {
  constructor(private readonly configService: ConfigService) {}

  private get rpcUrl() {
    return (
      this.configService.get<string>("X_LAYER_RPC_URL") ||
      this.configService.get<string>("NEXT_PUBLIC_X_LAYER_RPC_URL") ||
      ""
    );
  }

  private get expectedChainId() {
    return Number(
      this.configService.get<string>("X_LAYER_CHAIN_ID") ||
        this.configService.get<string>("NEXT_PUBLIC_XLAYER_CHAIN_ID") ||
        "0",
    );
  }

  private get marketContractAddress() {
    return this.normalizeAddress(
      this.configService.get<string>("X_LAYER_MARKET_CONTRACT_ADDRESS") ||
        this.configService.get<string>("NEXT_PUBLIC_CREDPLAY_MARKET_CONTRACT_ADDRESS") ||
        "",
    );
  }

  private get usdtAddress() {
    return this.normalizeAddress(
      this.configService.get<string>("X_LAYER_USDT_ADDRESS") ||
        this.configService.get<string>("NEXT_PUBLIC_XLAYER_USDT_ADDRESS") ||
        "",
    );
  }

  private get usdtDecimals() {
    return Number(this.configService.get<string>("X_LAYER_USDT_DECIMALS", "6"));
  }

  expectedCreationFeeUnits() {
    const amount = this.configService.get<string>("X_LAYER_MARKET_CREATION_FEE_USDT", "2");
    return this.parseTokenUnits(amount, this.usdtDecimals);
  }

  getConfiguredContractAddress() {
    return this.marketContractAddress;
  }

  getConfiguredChainId() {
    return this.expectedChainId || null;
  }

  async verifyPredictionCreated(input: {
    txHash: string;
    marketKey: string;
    creatorAddress: string;
  }): Promise<VerifiedPredictionCreation> {
    const receipt = await this.getSuccessfulReceipt(input.txHash);
    const chainId = await this.verifyChainId();
    const marketKey = this.normalizeBytes32(input.marketKey, "market key");
    const creatorTopic = this.addressToTopic(input.creatorAddress);
    const contractAddress = this.requireContractAddress();
    const feeToken = this.requireUsdtAddress();

    const log = receipt.logs.find(
      (item) =>
        this.normalizeAddress(item.address) === contractAddress &&
        item.topics[0]?.toLowerCase() === PREDICTION_CREATED_TOPIC &&
        item.topics[1]?.toLowerCase() === marketKey &&
        item.topics[2]?.toLowerCase() === creatorTopic,
    );

    if (!log) {
      throw new UnprocessableEntityException("Transaction did not create this CredPlay prediction on X Layer.");
    }

    const [feeAmount, emittedFeeToken] = this.decodeUintAndAddress(log.data);
    const expectedFee = this.expectedCreationFeeUnits();
    if (feeAmount !== expectedFee) {
      throw new UnprocessableEntityException("Prediction creation transaction paid an unexpected fee amount.");
    }
    if (this.normalizeAddress(emittedFeeToken) !== feeToken) {
      throw new UnprocessableEntityException("Prediction creation transaction used the wrong fee token.");
    }

    return {
      contractAddress,
      feeToken,
      feeAmount,
      chainId,
      blockNumber: this.hexToNumberOrNull(receipt.blockNumber),
    };
  }

  async verifyPredictionSeeded(input: {
    txHash: string;
    marketKey: string;
    seederAddress: string;
    yesSide: boolean;
  }): Promise<VerifiedPredictionSeed> {
    const receipt = await this.getSuccessfulReceipt(input.txHash);
    const chainId = await this.verifyChainId();
    const marketKey = this.normalizeBytes32(input.marketKey, "market key");
    const seederTopic = this.addressToTopic(input.seederAddress);
    const contractAddress = this.requireContractAddress();

    const log = receipt.logs.find(
      (item) =>
        this.normalizeAddress(item.address) === contractAddress &&
        item.topics[0]?.toLowerCase() === PREDICTION_SEEDED_TOPIC &&
        item.topics[1]?.toLowerCase() === marketKey &&
        item.topics[2]?.toLowerCase() === seederTopic,
    );

    if (!log) {
      throw new UnprocessableEntityException("Transaction did not seed this CredPlay prediction on X Layer.");
    }

    const [amount, yesSide] = this.decodeUintAndBool(log.data);
    if (amount <= 0n) {
      throw new UnprocessableEntityException("Seed transaction amount must be greater than zero.");
    }
    if (yesSide !== input.yesSide) {
      throw new UnprocessableEntityException("Seed transaction side does not match the request.");
    }

    return {
      contractAddress,
      amount,
      yesSide,
      chainId,
      blockNumber: this.hexToNumberOrNull(receipt.blockNumber),
    };
  }

  formatUnits(value: bigint) {
    const divisor = 10n ** BigInt(this.usdtDecimals);
    const whole = value / divisor;
    const fraction = value % divisor;
    return Number(`${whole}.${fraction.toString().padStart(this.usdtDecimals, "0")}`);
  }

  private async getSuccessfulReceipt(txHash: string): Promise<RpcReceipt> {
    this.normalizeHash(txHash);
    const receipt = await this.rpc<RpcReceipt | null>("eth_getTransactionReceipt", [txHash]);
    if (!receipt) {
      throw new UnprocessableEntityException("Transaction was not found on the configured X Layer RPC.");
    }
    if (receipt.status !== "0x1") {
      throw new UnprocessableEntityException("Transaction failed on X Layer.");
    }
    return receipt;
  }

  private async verifyChainId() {
    const chainIdHex = await this.rpc<string>("eth_chainId", []);
    const chainId = Number.parseInt(chainIdHex, 16);
    if (this.expectedChainId && chainId !== this.expectedChainId) {
      throw new UnprocessableEntityException("Configured RPC is not the expected X Layer chain.");
    }
    return chainId;
  }

  private async rpc<T>(method: string, params: unknown[]): Promise<T> {
    if (!this.rpcUrl) {
      throw new ServiceUnavailableException("X Layer RPC URL is not configured.");
    }

    const response = await fetch(this.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    });

    if (!response.ok) {
      throw new ServiceUnavailableException("X Layer RPC request failed.");
    }

    const payload = (await response.json()) as { result?: T; error?: { message?: string } };
    if (payload.error) {
      throw new UnprocessableEntityException(payload.error.message || "X Layer RPC returned an error.");
    }
    return payload.result as T;
  }

  private requireContractAddress() {
    if (!this.marketContractAddress) {
      throw new ServiceUnavailableException("X Layer market contract address is not configured.");
    }
    return this.marketContractAddress;
  }

  private requireUsdtAddress() {
    if (!this.usdtAddress) {
      throw new ServiceUnavailableException("X Layer USDT address is not configured.");
    }
    return this.usdtAddress;
  }

  private normalizeAddress(value: string) {
    const trimmed = value.trim().toLowerCase();
    return /^0x[a-f0-9]{40}$/.test(trimmed) ? trimmed : "";
  }

  private normalizeHash(value: string) {
    const trimmed = value.trim().toLowerCase();
    if (!/^0x[a-f0-9]{64}$/.test(trimmed)) {
      throw new UnprocessableEntityException("A valid X Layer transaction hash is required.");
    }
    return trimmed;
  }

  private normalizeBytes32(value: string, label: string) {
    const trimmed = value.trim().toLowerCase();
    if (!/^0x[a-f0-9]{64}$/.test(trimmed)) {
      throw new UnprocessableEntityException(`A valid ${label} is required.`);
    }
    return trimmed;
  }

  private addressToTopic(value: string) {
    const address = this.normalizeAddress(value);
    if (!address) {
      throw new UnprocessableEntityException("A valid wallet address is required for transaction verification.");
    }
    return `0x${address.slice(2).padStart(64, "0")}`;
  }

  private decodeUintAndAddress(data: string): [bigint, string] {
    const words = this.dataWords(data, 2);
    return [BigInt(`0x${words[0]}`), `0x${words[1].slice(24)}`];
  }

  private decodeUintAndBool(data: string): [bigint, boolean] {
    const words = this.dataWords(data, 2);
    return [BigInt(`0x${words[0]}`), BigInt(`0x${words[1]}`) === 1n];
  }

  private dataWords(data: string, minWords: number) {
    const normalized = data.startsWith("0x") ? data.slice(2) : data;
    if (normalized.length < minWords * 64) {
      throw new UnprocessableEntityException("Transaction event data is malformed.");
    }
    return Array.from({ length: minWords }, (_, index) => normalized.slice(index * 64, (index + 1) * 64));
  }

  private parseTokenUnits(value: string, decimals: number) {
    const [wholePart, fractionPart = ""] = value.trim().split(".");
    const normalizedFraction = fractionPart.padEnd(decimals, "0").slice(0, decimals);
    return BigInt(wholePart || "0") * 10n ** BigInt(decimals) + BigInt(normalizedFraction || "0");
  }

  private hexToNumberOrNull(value?: string) {
    return value ? Number.parseInt(value, 16) : null;
  }
}
