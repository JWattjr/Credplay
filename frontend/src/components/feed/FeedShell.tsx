"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Goal, ShieldCheck, TrendingUp } from "lucide-react";
import ComposeBox from "@/components/feed/ComposeBox";
import FeedTabs, { type FeedTabId } from "@/components/feed/FeedTabs";
import MarketCard from "@/components/post/MarketCard";
import PostCard from "@/components/post/PostCard";
import { useDailyVotes } from "@/hooks/useDailyVotes";
import { useFeed } from "@/hooks/useFeed";
import { useWalletProfile } from "@/hooks/useWalletProfile";
import {
  addComment,
  castFreeVote,
  displayHandle,
  displayName,
  relativeTime,
  toggleLike,
  toggleReshare,
  type FeedPost,
  type MarketPost,
  type VoteSide,
} from "@/lib/credplay";

const FEED_CATEGORIES = [
  "Match Winner",
  "Goals",
  "Player Performance",
  "Group Stage",
  "Knockout Stage",
  "Tournament Winner",
  "Upsets",
  "Fan Sentiment",
] as const;

type FeedCategory = (typeof FEED_CATEGORIES)[number];

export default function FeedShell() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FeedTabId>("for-you");
  const [activeCategory, setActiveCategory] = useState<FeedCategory | null>(null);
  const { profile } = useWalletProfile();
  const { dailyVotes, reload: reloadDailyVotes } = useDailyVotes(profile?.id);
  const { items, loading, error, reload } = useFeed(profile?.id, activeTab === "markets");
  const [actionError, setActionError] = useState<string | null>(null);

  const visibleItems = useMemo(() => {
    if (!activeCategory) return items;
    return items.filter((item) => item.market?.category === activeCategory);
  }, [activeCategory, items]);

  async function runAction(action: () => Promise<unknown>) {
    if (!profile) {
      setActionError("Connect a wallet before taking that action.");
      return;
    }

    setActionError(null);

    try {
      await action();
      await Promise.all([reload(), reloadDailyVotes()]);
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : "Action failed.");
    }
  }

  async function commentOn(post: FeedPost) {
    const content = window.prompt("Add a comment");
    if (!content) return;
    await runAction(() => addComment(post.id, profile!.id, content));
  }

  async function sharePost(post: FeedPost) {
    const text = post.market?.question || post.content;
    const url = post.market ? `${window.location.origin}/markets/${post.market.id}` : `${window.location.origin}/`;

    if (navigator.share) {
      await navigator.share({ title: "CredPlay", text, url });
      return;
    }

    await navigator.clipboard.writeText(`${text}\n${url}`);
  }

  return (
    <div className="flex flex-col gap-3 py-3">
      <section className="overflow-hidden rounded-[8px] border border-white/10 bg-[linear-gradient(145deg,rgba(22,23,26,0.96),rgba(5,5,5,0.98))] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.4)]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="mb-2 flex items-center gap-2 font-mono text-[11px] font-black uppercase tracking-[0.16em] text-brand-secondary">
              <Goal className="h-4 w-4" />
              World Cup markets
            </p>
            <h1 className="max-w-[11ch] text-4xl font-black leading-[0.95] text-white sm:text-5xl">
              The future of football calls.
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--muted)]">
              Predict match outcomes, seed conviction, and build a reputation fans can verify.
            </p>
          </div>
          <div className="hidden min-w-[160px] rounded-[8px] border border-brand-secondary/25 bg-brand-secondary/10 p-4 sm:block">
            <div className="flex items-center gap-2 text-brand-secondary">
              <ShieldCheck className="h-4 w-4" />
              <span className="font-mono text-[11px] font-black uppercase">Cred layer</span>
            </div>
            <p className="mt-3 text-3xl font-black text-white">98.7</p>
            <p className="font-mono text-[11px] text-[var(--muted)]">top signal score</p>
          </div>
        </div>
      </section>

      <div className="rounded-[8px] border border-white/10 bg-black/45 p-3 shadow-sm">
        <div className="mb-2 flex items-center gap-2 font-mono text-[11px] font-black uppercase tracking-[0.14em] text-[var(--muted)]">
          <TrendingUp className="h-3.5 w-3.5 text-brand-secondary" />
          Category
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FEED_CATEGORIES.map((category) => {
            const isActive = activeCategory === category;

            return (
              <button
                aria-pressed={isActive}
                className={`h-9 shrink-0 rounded-[999px] border px-4 font-mono text-xs font-black transition-colors ${
                  isActive
                    ? "border-brand-secondary bg-brand-secondary/15 text-brand-secondary"
                    : "border-white/10 bg-black/30 text-[var(--muted)] hover:border-[var(--border-strong)] hover:text-white"
                }`}
                key={category}
                onClick={() => setActiveCategory(isActive ? null : category)}
                type="button"
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <ComposeBox onCreated={reload} profile={profile} />

      {(error || actionError) && (
        <div className="rounded-[18px] border border-downvote/30 bg-downvote/10 p-4 text-sm font-medium text-[var(--foreground)]">
          {actionError || error}
        </div>
      )}

      <div
        aria-labelledby={`feed-tab-${activeTab}`}
        aria-live="polite"
        className="flex flex-col gap-3 pb-20 sm:pb-0"
        id="feed-panel"
        role="tabpanel"
      >
        {loading ? (
          <div className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-8 text-center text-sm font-medium text-[var(--muted)] shadow-sm">
            Loading feed...
          </div>
        ) : visibleItems.length > 0 ? (
          visibleItems.map((item) => (
            <FeedCard
              item={item}
              key={item.id}
              dailyVotesRemaining={dailyVotes.votesRemaining}
              onComment={() => commentOn(item)}
              onLike={() => runAction(() => toggleLike(item.id, profile!.id, item.viewerLiked))}
              onOpenMarket={(market) => router.push(`/markets/${market.id}`)}
              onReshare={() => runAction(() => toggleReshare(item.id, profile!.id, item.viewerReshared))}
              onShare={() => sharePost(item)}
              onUsdcVote={() => setActionError("USDT trading is pending review and not active in this phase.")}
              onVote={(market, side) => runAction(() => castFreeVote(market, profile!.id, side))}
            />
          ))
        ) : (
          <div className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-8 text-center text-sm font-medium text-[var(--muted)] shadow-sm">
            No feed items yet. Create your first prediction! ⚽
          </div>
        )}
      </div>
    </div>
  );
}

function FeedCard({
  item,
  dailyVotesRemaining,
  onComment,
  onLike,
  onOpenMarket,
  onReshare,
  onShare,
  onUsdcVote,
  onVote,
}: {
  item: FeedPost;
  dailyVotesRemaining: number;
  onComment: () => void;
  onLike: () => void;
  onOpenMarket: (market: MarketPost) => void;
  onReshare: () => void;
  onShare: () => void;
  onUsdcVote: (market: MarketPost, side: VoteSide, amount: number) => void;
  onVote: (market: MarketPost, side: VoteSide) => void;
}) {
  if (item.type === "market" && item.market) {
    const yesPercent = calculateYesPercent(item.market);

    return (
      <MarketCard
        category={item.market.category}
        comments={item.commentsCount}
        deadline={new Date(item.market.deadline).toLocaleString()}
        freeNoVotes={item.market.free_no_votes}
        freeYesVotes={item.market.free_yes_votes}
        handle={displayHandle(item.author)}
        marketCreationFeeUsdc={item.market.market_creation_fee_usdc}
        name={displayName(item.author)}
        noCondition={item.market.no_condition}
        onComment={onComment}
        onOpenDetails={() => onOpenMarket(item.market!)}
        onReshare={onReshare}
        onShare={onShare}
        onUsdcVote={(side, amount) => onUsdcVote(item.market!, side, amount)}
        onVote={(side) => onVote(item.market!, side)}
        postContent={item.content}
        question={item.market.question}
        resolutionSource={item.market.resolution_source}
        reshares={item.resharesCount}
        reshared={item.viewerReshared}
        status={item.market.status}
        time={relativeTime(item.created_at)}
        dailyVotesRemaining={dailyVotesRemaining}
        qualificationThreshold={item.market.qualificationThreshold}
        totalFreeVotes={item.market.totalFreeVotes}
        tradingFeeBps={item.market.trading_fee_bps}
        uniqueVoterThreshold={item.market.uniqueVoterThreshold}
        uniqueVotersCount={item.market.uniqueVotersCount}
        usdcNo={Number(item.market.usdc_no_amount)}
        usdcYes={Number(item.market.usdc_yes_amount)}
        viewerVote={item.viewerVote}
        votingDisabledMessage={
          dailyVotesRemaining <= 0 ? "You have used all 10 free calls today. Resets tomorrow." : null
        }
        yesCondition={item.market.yes_condition}
        yesPercent={yesPercent}
      />
    );
  }

  return (
    <PostCard
      comments={item.commentsCount}
      content={item.content}
      handle={displayHandle(item.author)}
      liked={item.viewerLiked}
      likes={item.likesCount}
      name={displayName(item.author)}
      onComment={onComment}
      onLike={onLike}
      onReshare={onReshare}
      onShare={onShare}
      reshares={item.resharesCount}
      reshared={item.viewerReshared}
      time={relativeTime(item.created_at)}
    />
  );
}

function calculateYesPercent(market: MarketPost) {
  const yes = Number(market.usdc_yes_amount);
  const no = Number(market.usdc_no_amount);
  const totalUsdc = yes + no;
  if (totalUsdc > 0) return (yes / totalUsdc) * 100;

  return 50;
}
