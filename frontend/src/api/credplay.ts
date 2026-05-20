import { apiRequest } from "@/api/client";
import type {
  FeedPost,
  MarketComment,
  MarketInput,
  MarketPosition,
  MarketPost,
  MarketTrade,
  MarketTradeAction,
  VoteSide,
} from "@/lib/credplay";

export function fetchFeed(viewerProfileId?: string, onlyMarkets = false) {
  const params = new URLSearchParams();
  if (viewerProfileId) params.set("userId", viewerProfileId);
  if (onlyMarkets) params.set("onlyMarkets", "true");

  const query = params.toString();
  return apiRequest<FeedPost[]>(`/feed${query ? `?${query}` : ""}`);
}

export async function createNormalPost(profileId: string, content: string) {
  await apiRequest<unknown>("/posts/normal", {
    method: "POST",
    body: JSON.stringify({ authorId: profileId, content }),
  });
}

export async function createMarketPost(profileId: string, input: MarketInput) {
  return apiRequest<{ post: FeedPost; warning: string | null }>("/posts/market", {
    method: "POST",
    body: JSON.stringify({ authorId: profileId, ...input }),
  });
}

export async function toggleLike(postId: string, profileId: string, currentlyLiked: boolean) {
  await apiRequest<null>(`/posts/${postId}/like`, {
    method: "POST",
    body: JSON.stringify({ userId: profileId, currentlyActive: currentlyLiked }),
  });
}

export async function toggleReshare(postId: string, profileId: string, currentlyReshared: boolean) {
  await apiRequest<null>(`/posts/${postId}/reshare`, {
    method: "POST",
    body: JSON.stringify({ userId: profileId, currentlyActive: currentlyReshared }),
  });
}

export async function addComment(postId: string, profileId: string, content: string) {
  await apiRequest<null>(`/posts/${postId}/comment`, {
    method: "POST",
    body: JSON.stringify({ authorId: profileId, content }),
  });
}

export function fetchPostComments(postId: string) {
  return apiRequest<MarketComment[]>(`/comments?postId=${encodeURIComponent(postId)}`);
}

export function fetchMarketPositions(marketId: string, profileId: string) {
  return apiRequest<MarketPosition[]>(
    `/markets/${marketId}/positions?profileId=${encodeURIComponent(profileId)}`,
  );
}

export function fetchMarketTrades(marketId: string) {
  return apiRequest<MarketTrade[]>(`/markets/${marketId}/trades`);
}

export async function castFreeVote(market: MarketPost, profileId: string, side: VoteSide) {
  return apiRequest<{ market: MarketPost; dailyVotes: { votesLimit: number; votesUsed: number; votesRemaining: number; date: string } }>(`/markets/${market.id}/vote`, {
    method: "POST",
    body: JSON.stringify({ userId: profileId, side }),
  });
}

export function approveMarketForTrading(marketId: string) {
  return apiRequest<MarketPost>(`/markets/${marketId}/approve-trading`, {
    method: "POST",
  });
}

export function seedMarketLiquidity({
  marketId,
  profileId,
  side,
  txHash,
}: {
  marketId: string;
  profileId: string;
  side: VoteSide;
  txHash: string;
}) {
  return apiRequest<MarketPost>(`/markets/${marketId}/seed`, {
    method: "POST",
    body: JSON.stringify({ profileId, side, txHash }),
  });
}

export async function executeMarketTrade({
  market,
  profileId,
  side,
  action,
  amount,
  feeAmount,
  grossAmount,
  txHash,
}: {
  market: MarketPost;
  profileId: string;
  side: VoteSide;
  action: MarketTradeAction;
  amount: number;
  feeAmount?: number;
  grossAmount?: number;
  txHash?: string | null;
}) {
  await apiRequest<null>(`/markets/${market.id}/trade`, {
    method: "POST",
    body: JSON.stringify({ profileId, side, action, amount, feeAmount, grossAmount, txHash }),
  });
}

/* ─── CredPlay placeholder functions (contracts not yet deployed) ─── */

/** TODO: Submit seed liquidity for a prediction post */
export async function seedPrediction(_marketId: string, _profileId: string, _amountUsdt: number) {
  console.warn("[CredPlay] seedPrediction() is a placeholder — contract not deployed yet");
}

/** TODO: Submit prediction for admin review */
export async function submitForReview(_marketId: string) {
  console.warn("[CredPlay] submitForReview() is a placeholder — contract not deployed yet");
}

/** TODO: Admin approves prediction → live market */
export async function approveMarket(_marketId: string) {
  console.warn("[CredPlay] approveMarket() is a placeholder — contract not deployed yet");
}
