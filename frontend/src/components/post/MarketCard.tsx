"use client";

import type { MouseEvent } from "react";
import { ArrowDown, ArrowUp, MessageCircle, Repeat2, Share, Droplets } from "lucide-react";
import { PREDICTION_CREATION_FEE_USDT } from "@/lib/fees";
import type { VoteSide } from "@/lib/credplay";

export interface MarketCardProps {
  variant?: "compact" | "detail";
  name: string;
  handle: string;
  time: string;
  postContent?: string;
  question: string;
  category: string;
  deadline: string;
  resolutionSource?: string;
  yesCondition?: string;
  noCondition?: string;
  status?: string;
  yesPercent: number;
  usdcYes: number;
  usdcNo: number;
  marketCreationFeeUsdc?: number;
  tradingFeeBps?: number;
  freeYesVotes?: number;
  freeNoVotes?: number;
  totalFreeVotes?: number;
  uniqueVotersCount?: number;
  qualificationThreshold?: number;
  uniqueVoterThreshold?: number;
  dailyVotesRemaining?: number;
  votingDisabledMessage?: string | null;
  comments: number;
  reshares: number;
  viewerVote?: VoteSide | null;
  reshared?: boolean;
  onVote?: (side: VoteSide) => void;
  onUsdcVote?: (side: VoteSide, amount: number) => void;
  onOpenDetails?: () => void;
  onComment?: () => void;
  onReshare?: () => void;
  onShare?: () => void;
  avatarColor?: string;
}

/** Map CredPlay lifecycle statuses to display labels */
function displayStatus(status: string) {
  const labels: Record<string, string> = {
    draft: "Draft",
    collecting_calls: "Collecting Calls",
    open_for_votes: "Collecting Calls",
    seeding: "Seeding",
    qualified: "Under Review",
    under_review: "Under Review",
    tradable: "Live",
    live: "Live",
    locked: "Locked",
    closed: "Closed",
    resolving: "Resolving",
    resolved: "Settled",
    settled: "Settled",
    voided: "Voided",
  };
  return labels[status] || status.replaceAll("_", " ");
}

export default function MarketCard({
  variant = "compact",
  name,
  handle,
  time,
  postContent,
  question,
  category,
  deadline,
  resolutionSource,
  yesCondition,
  noCondition,
  status = "collecting_calls",
  yesPercent,
  usdcYes,
  usdcNo,
  marketCreationFeeUsdc = PREDICTION_CREATION_FEE_USDT,
  freeYesVotes = 0,
  freeNoVotes = 0,
  totalFreeVotes,
  qualificationThreshold = 20,
  dailyVotesRemaining = 10,
  votingDisabledMessage,
  comments,
  reshares,
  viewerVote,
  reshared = false,
  onVote,
  onOpenDetails,
  onComment,
  onReshare,
  onShare,
}: MarketCardProps) {
  const totalUsdt = usdcYes + usdcNo;
  const hasBackedSentiment = totalUsdt > 0;
  const totalVotes = totalFreeVotes ?? freeYesVotes + freeNoVotes;
  const freeYesPercent = totalVotes > 0 ? (freeYesVotes / totalVotes) * 100 : 50;
  const displayYesPercent = hasBackedSentiment ? yesPercent : freeYesPercent;
  const noPercent = totalVotes > 0 || hasBackedSentiment ? 100 - displayYesPercent : 50;
  const isCollecting = status === "open_for_votes" || status === "collecting_calls";
  const isUnderReview = status === "qualified" || status === "under_review";
  const isLive = status === "tradable" || status === "live";
  const isClosed = ["closed", "resolving", "resolved", "settled", "voided", "locked"].includes(status);
  const canFreeVote = isCollecting || isUnderReview;
  const hasViewerVoted = Boolean(viewerVote);
  const voteDisabled = !canFreeVote || hasViewerVoted || dailyVotesRemaining <= 0;
  const voteThresholdMet = totalVotes >= qualificationThreshold;
  const votesToReview = Math.max(0, qualificationThreshold - totalVotes);
  const qualificationProgress = Math.min(100, (totalVotes / qualificationThreshold) * 100);

  // Mock seed liquidity progress (TODO: wire to real data)
  const seedLiquidity = 0;
  const requiredSeedLiquidity = 50;
  const seedProgress = Math.min(100, (seedLiquidity / requiredSeedLiquidity) * 100);

  const isDetail = variant === "detail";
  const creatorLabel = handle === "@unknown" ? name : handle;
  const openDetails = () => {
    if (!isDetail) onOpenDetails?.();
  };
  const stopClick = (event: MouseEvent) => event.stopPropagation();

  return (
    <article
      className={`rounded-[10px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm transition-colors hover:bg-[var(--surface-solid)] ${
        isDetail ? "" : "cursor-pointer"
      }`}
      onClick={openDetails}
      onKeyDown={(event) => {
        if (!isDetail && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          openDetails();
        }
      }}
      role={isDetail ? undefined : "link"}
      tabIndex={isDetail ? undefined : 0}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[17px] font-bold leading-snug text-[var(--foreground)] sm:text-lg">{question}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-[var(--muted)]">
            <span>by</span>
            <span className="font-mono text-[var(--foreground)]">{creatorLabel}</span>
            <span className="font-mono text-[var(--muted)]">{"\u00B7"}</span>
            <span className="font-mono">{time}</span>
          </div>
        </div>

        <span className={`shrink-0 pt-0.5 rounded-[4px] px-2 py-0.5 font-mono text-[11px] font-bold ${
          isClosed ? "bg-[var(--surface-muted)] text-[var(--muted)]" 
          : isLive ? "bg-brand-secondary/20 text-brand-secondary"
          : "bg-brand-accent/20 text-brand-accent"
        }`}>
          {displayStatus(status)}
        </span>
      </div>

      {postContent && postContent !== question && (
        <p className="mb-3 line-clamp-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--muted)]">
          {postContent}
        </p>
      )}

      <div className="mb-2 flex flex-wrap gap-2">
        <span className="rounded-[3px] border border-[var(--border)] bg-[var(--surface-solid)] px-2 py-0.5 font-mono text-[11px] text-[var(--muted)]">
          {category}
        </span>
      </div>

      {/* Free Call Sentiment */}
      <div className="mb-3 rounded-[7px] bg-[var(--surface-muted)] p-3">
        <div className="mb-3 font-mono text-[11px] font-bold uppercase text-[var(--foreground)]">
          Free Call Sentiment
        </div>
        <div className="flex h-1.5 overflow-hidden rounded-full bg-zinc-700">
          <div className="h-full bg-upvote transition-all" style={{ width: `${displayYesPercent}%` }} />
          <div className="h-full bg-downvote transition-all" style={{ width: `${noPercent}%` }} />
        </div>
        <div className="mt-2 flex justify-between font-mono text-[11px] text-[var(--muted)]">
          {totalVotes > 0 ? (
            <>
              <span>Yes: {displayYesPercent.toFixed(0)}%</span>
              <span>No: {noPercent.toFixed(0)}%</span>
            </>
          ) : (
            <span>No free calls yet</span>
          )}
        </div>
      </div>

      {/* Free Calls Progress */}
      <div className="mb-3 rounded-[7px] border border-dashed border-[var(--border)] bg-[var(--surface-muted)] p-3 font-mono text-[11px] text-[var(--muted)]">
        <div className="mb-2 flex flex-wrap justify-between gap-2">
          <span>{totalVotes} free calls</span>
          <span>{voteThresholdMet ? "Review threshold met ✓" : `${votesToReview} more to review`}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-solid)]">
          <div className="h-full bg-brand-secondary transition-all" style={{ width: `${qualificationProgress}%` }} />
        </div>
        <div className="mt-2">
          <span>Free calls left today: {dailyVotesRemaining}</span>
        </div>
      </div>

      {/* Seed Liquidity Progress */}
      {!isLive && !isClosed && (
        <div className="mb-3 rounded-[7px] border border-dashed border-brand-accent/30 bg-brand-accent/5 p-3 font-mono text-[11px] text-[var(--muted)]">
          <div className="mb-2 flex flex-wrap justify-between gap-2">
            <span className="flex items-center gap-1">
              <Droplets className="h-3 w-3 text-brand-accent" />
              Seed Liquidity
            </span>
            <span>{seedLiquidity} / {requiredSeedLiquidity} USDT</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-solid)]">
            <div className="h-full bg-brand-accent transition-all" style={{ width: `${seedProgress}%` }} />
          </div>
          <p className="mt-2 text-[10px] text-[var(--muted)]">Seed this prediction to help it become a live market.</p>
        </div>
      )}

      {isLive ? (
        <div className="mb-3 grid grid-cols-2 gap-2" onClick={stopClick}>
          <button className="h-9 rounded-[6px] border border-brand-secondary bg-brand-secondary/10 text-sm font-bold text-[var(--foreground)]" type="button">
            Back YES with USDT
          </button>
          <button className="h-9 rounded-[6px] border border-downvote bg-downvote/10 text-sm font-bold text-[var(--foreground)]" type="button">
            Back NO with USDT
          </button>
        </div>
      ) : canFreeVote ? (
        <div className="mb-3" onClick={stopClick}>
          {isUnderReview && (
            <p className="mb-3 rounded-[7px] border border-brand-secondary/30 bg-brand-secondary/10 p-3 text-sm font-semibold text-[var(--foreground)]">
              Ready for Live Market review ✓
            </p>
          )}
          <div className="mb-2 grid grid-cols-3 gap-2">
            <button
              className="flex h-8 items-center justify-center gap-1 rounded-[5px] border border-brand-secondary bg-brand-secondary/10 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-brand-secondary/20 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={voteDisabled}
              onClick={() => onVote?.("YES")}
              title={yesCondition}
              type="button"
            >
              Yes Call
            </button>
            <button
              className="flex h-8 items-center justify-center gap-1 rounded-[5px] border border-downvote bg-downvote/10 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-downvote/20 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={voteDisabled}
              onClick={() => onVote?.("NO")}
              title={noCondition}
              type="button"
            >
              No Call
            </button>
            <button
              className="flex h-8 items-center justify-center gap-1 rounded-[5px] border border-brand-accent bg-brand-accent/10 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-brand-accent/20"
              onClick={() => {/* TODO: seedPrediction() */}}
              type="button"
            >
              <Droplets className="h-3.5 w-3.5" />
              Seed
            </button>
          </div>
          <p className="font-mono text-[10px] text-[var(--muted)]">Free calls earn Cred Points, not money.</p>
          {votingDisabledMessage && <p className="mt-1 font-mono text-[11px] text-downvote">{votingDisabledMessage}</p>}
        </div>
      ) : (
        <p className="mb-3 rounded-[7px] border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-sm font-semibold text-[var(--muted)]">
          This prediction is not open for free calls.
        </p>
      )}

      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-[var(--muted)]">
        {isLive && <span>Liquidity ${totalUsdt.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDT</span>}
        <span>Closes {deadline}</span>
        {isDetail && <span>Create fee {Number(marketCreationFeeUsdc).toFixed(2)} USDT</span>}
        {isDetail && resolutionSource && <span className="min-w-0 truncate">Source: {resolutionSource}</span>}
      </div>

      {isDetail && (
        <div className="mb-3 grid gap-2 rounded-[7px] border border-dashed border-[var(--border)] bg-[var(--surface-muted)] p-3 font-mono text-[11px] text-[var(--muted)]">
          {yesCondition && <span className="text-brand-secondary">YES: {yesCondition}</span>}
          {noCondition && <span className="text-downvote">NO: {noCondition}</span>}
        </div>
      )}

      <div
        className="flex max-w-[425px] items-center justify-between border-t border-dashed border-[var(--border)] pt-1.5 text-[var(--muted)]"
        onClick={stopClick}
      >
        <button aria-label={`Comment on ${question}`} className="group flex items-center gap-2 transition-colors hover:text-[var(--foreground)]" onClick={onComment} type="button">
          <span className="rounded-full p-2 transition-colors group-hover:bg-[var(--surface-hover)]">
            <MessageCircle className="h-4 w-4" />
          </span>
          <span className="text-xs">{comments}</span>
        </button>

        <button
          aria-label={`Reshare ${question}`}
          aria-pressed={reshared}
          className={`group flex items-center gap-2 transition-colors hover:text-[var(--foreground)] ${reshared ? "text-brand-secondary" : ""}`}
          onClick={onReshare}
          type="button"
        >
          <span className="rounded-full p-2 transition-colors group-hover:bg-[var(--surface-hover)]">
            <Repeat2 className="h-4 w-4" />
          </span>
          <span className="text-xs">{reshares}</span>
        </button>

        <button
          aria-label={`Yes Call on ${question}`}
          aria-pressed={viewerVote === "YES"}
          className={`group flex items-center gap-2 transition-colors hover:text-brand-secondary ${
            viewerVote === "YES" ? "text-brand-secondary" : ""
          }`}
          disabled={voteDisabled}
          onClick={() => onVote?.("YES")}
          type="button"
        >
          <span className="rounded-full p-2 transition-colors group-hover:bg-brand-secondary/10">
            <ArrowUp className="h-4 w-4" />
          </span>
          <span className="text-xs">{freeYesVotes}</span>
        </button>

        <button
          aria-label={`No Call on ${question}`}
          aria-pressed={viewerVote === "NO"}
          className={`group flex items-center gap-2 transition-colors hover:text-downvote ${
            viewerVote === "NO" ? "text-downvote" : ""
          }`}
          disabled={voteDisabled}
          onClick={() => onVote?.("NO")}
          type="button"
        >
          <span className="rounded-full p-2 transition-colors group-hover:bg-downvote/10">
            <ArrowDown className="h-4 w-4" />
          </span>
          <span className="text-xs">{freeNoVotes}</span>
        </button>

        <button aria-label={`Share ${question}`} className="group flex items-center gap-2 transition-colors hover:text-[var(--foreground)]" onClick={onShare} type="button">
          <span className="rounded-full p-2 transition-colors group-hover:bg-[var(--surface-hover)]">
            <Share className="h-4 w-4" />
          </span>
        </button>
      </div>
    </article>
  );
}
