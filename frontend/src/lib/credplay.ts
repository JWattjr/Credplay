import { formatDistanceToNow } from "date-fns";
import { calculateTradingFee } from "@/lib/fees";
import * as usersApi from "@/api/users";
import * as credplayApi from "@/api/credplay";

export type PostType = "normal" | "market";
export type VoteSide = "YES" | "NO";
export type MarketTradeAction = "BUY" | "SELL";

/** CredPlay market lifecycle */
export type MarketStatus =
  | "draft"
  | "collecting_calls"
  | "seeding"
  | "under_review"
  | "live"
  | "locked"
  | "settled"
  // Legacy status names kept for backend compatibility.
  | "open_for_votes"
  | "qualified"
  | "tradable"
  | "closed"
  | "resolving"
  | "resolved"
  | "voided";

export interface Profile {
  id: string;
  wallet_address: string | null;
  walletAddress?: string | null;
  username: string;
  display_name: string | null;
  displayName?: string | null;
  avatar_url: string | null;
  avatarUrl?: string | null;
  bio: string | null;
  followersCount?: number;
  followingCount?: number;
  signalPoints?: number;
  credibilityScore?: number;
  credPoints?: number;
  country?: string;
  team?: string;
  freeVotesCorrect?: number;
  freeVotesWrong?: number;
  freeVotesTotal?: number;
  created_at: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MarketPost {
  id: string;
  post_id: string;
  postId?: string;
  question: string;
  category: string;
  deadline: string;
  resolution_source: string;
  resolutionSource?: string;
  yes_condition: string;
  yesCondition?: string;
  no_condition: string;
  noCondition?: string;
  status: string;
  free_yes_votes: number;
  freeYesVotes?: number;
  free_no_votes: number;
  freeNoVotes?: number;
  totalFreeVotes?: number;
  uniqueVotersCount?: number;
  qualificationThreshold?: number;
  uniqueVoterThreshold?: number;
  usdc_yes_amount: number;
  usdcYesAmount?: number;
  usdc_no_amount: number;
  usdcNoAmount?: number;
  liquidity?: number;
  market_creation_fee_usdc?: number;
  creationFeeTxHash?: string | null;
  creation_fee_tx_hash?: string | null;
  feeCollectorAddress?: string | null;
  fee_collector_address?: string | null;
  chain_market_key?: string | null;
  chainMarketKey?: string | null;
  market_contract_address?: string | null;
  marketContractAddress?: string | null;
  x_layer_chain_id?: number | null;
  xLayerChainId?: number | null;
  trading_fee_bps?: number;
  /** CredPlay: USDT seed liquidity deposited */
  seedLiquidity?: number;
  /** CredPlay: list of seeder user IDs */
  seeders?: string[];
  /** CredPlay: unique seeder count */
  seederCount?: number;
  /** CredPlay: required seed liquidity to go live */
  requiredSeedLiquidity?: number;
  /** CredPlay: required number of unique seeders */
  requiredSeeders?: number;
  /** CredPlay: creator fee share percentage */
  creatorFeeShare?: number;
  /** CredPlay: seeder fee share percentage */
  seederFeeShare?: number;
  created_at: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FeedPost {
  id: string;
  author_id: string;
  authorId?: string;
  type: PostType;
  content: string;
  created_at: string;
  createdAt?: string;
  updatedAt?: string;
  author: Profile;
  market: MarketPost | null;
  commentsCount: number;
  likesCount: number;
  resharesCount: number;
  sharesCount?: number;
  viewerLiked: boolean;
  viewerReshared: boolean;
  viewerVote: VoteSide | null;
}

export interface MarketComment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author: Profile;
}

export interface MarketPosition {
  id: string;
  market_id: string;
  user_id: string;
  side: VoteSide;
  shares: number;
  avg_price: number;
  invested_usdc: number;
  realized_pnl: number;
  created_at: string;
  updated_at: string;
}

export interface MarketTrade {
  id: string;
  market_id: string;
  user_id: string;
  side: VoteSide;
  action: MarketTradeAction;
  shares: number;
  price: number;
  amount_usdc: number;
  fee_usdc: number;
  gross_usdc: number;
  tx_hash: string | null;
  created_at: string;
}

export interface MarketInput {
  content: string;
  question: string;
  category: string;
  deadline: string;
  resolutionSource: string;
  yesCondition: string;
  noCondition: string;
  creationFeeTxHash?: string;
  feeCollectorAddress?: string;
  chainMarketKey?: string;
}

export function displayName(profile?: Profile | null) {
  if (!profile) return "Unknown";
  return profile.display_name || profile.displayName || profile.username || "Unknown";
}

export function displayHandle(profile?: Profile | null) {
  if (!profile?.username) return "@unknown";
  return `@${profile.username}`;
}

export function relativeTime(value: string) {
  try {
    return `${formatDistanceToNow(new Date(value), { addSuffix: false })} ago`;
  } catch {
    return "now";
  }
}

export const getOrCreateProfile = usersApi.getOrCreateProfile;
export const getDevProfile = usersApi.getDevProfile;
export const updateProfile = usersApi.updateProfile;
export const fetchFeed = credplayApi.fetchFeed;
export const createNormalPost = credplayApi.createNormalPost;
export const createMarketPost = credplayApi.createMarketPost;
export const toggleLike = credplayApi.toggleLike;
export const toggleReshare = credplayApi.toggleReshare;
export const addComment = credplayApi.addComment;
export const fetchPostComments = credplayApi.fetchPostComments;
export const fetchMarketPositions = credplayApi.fetchMarketPositions;
export const fetchMarketTrades = credplayApi.fetchMarketTrades;
export const castFreeVote = credplayApi.castFreeVote;
export const approveMarketForTrading = credplayApi.approveMarketForTrading;
export const seedMarketLiquidity = credplayApi.seedMarketLiquidity;
export const executeMarketTrade = credplayApi.executeMarketTrade;

const MIN_MARKET_PRICE = 0.01;
const MAX_MARKET_PRICE = 0.99;

function clampMarketPrice(price: number) {
  if (!Number.isFinite(price)) return 0.5;
  return Math.min(MAX_MARKET_PRICE, Math.max(MIN_MARKET_PRICE, price));
}

export function getMarketPrice(market: Pick<MarketPost, "usdc_yes_amount" | "usdc_no_amount">, side: VoteSide) {
  const yes = Number(market.usdc_yes_amount);
  const no = Number(market.usdc_no_amount);
  const total = yes + no;
  const yesPrice = total > 0 ? yes / total : 0.5;
  return clampMarketPrice(side === "YES" ? yesPrice : 1 - yesPrice);
}

export async function castUsdcVote({
  market,
  profileId,
  side,
  amount,
  feeAmount,
  grossAmount,
  txHash,
}: {
  market: MarketPost;
  profileId: string;
  side: VoteSide;
  amount: number;
  feeAmount: number;
  grossAmount: number;
  txHash: string;
}) {
  await executeMarketTrade({
    market,
    profileId,
    side,
    action: "BUY",
    amount,
    feeAmount: feeAmount ?? calculateTradingFee(amount, market.trading_fee_bps),
    grossAmount,
    txHash,
  });
}
