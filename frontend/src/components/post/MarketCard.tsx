"use client";

import type { MouseEvent, ReactNode } from "react";
import {
  ArrowRight,
  BarChart3,
  MessageCircle,
  Repeat2,
  Share,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
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

function displayStatus(status: string) {
  const labels: Record<string, string> = {
    draft: "Draft",
    collecting_calls: "Collecting calls",
    open_for_votes: "Trending",
    seeding: "Seeding",
    qualified: "High conviction",
    under_review: "High conviction",
    tradable: "Live market",
    live: "Live market",
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
  uniqueVotersCount = 0,
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
  const seedLiquidity = totalUsdt;
  const requiredSeedLiquidity = 50;
  const seedProgress = Math.min(100, (seedLiquidity / requiredSeedLiquidity) * 100);
  const isDetail = variant === "detail";
  const creatorLabel = handle === "@unknown" ? name : handle;
  const traderCount = Math.max(uniqueVotersCount, totalVotes, 1);
  const stopClick = (event: MouseEvent) => event.stopPropagation();

  function openDetails() {
    if (!isDetail) onOpenDetails?.();
  }

  return (
    <article
      className={`group overflow-hidden rounded-[8px] border border-white/10 bg-[linear-gradient(155deg,rgba(24,25,29,0.98),rgba(8,8,9,0.98)_58%,rgba(0,224,88,0.08))] p-4 shadow-[0_20px_80px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.05)] transition-colors hover:border-brand-secondary/45 ${
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
      <div className="mb-3 flex items-center justify-between gap-3 font-mono text-[11px]">
        <span className="flex items-center gap-1.5 font-black uppercase tracking-[0.12em] text-brand-secondary">
          {isLive ? <BarChart3 className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
          {displayStatus(status)}
        </span>
        <span className="text-[var(--muted)]">{traderCount.toLocaleString()} fans</span>
      </div>

      <div className="mb-4">
        <h3 className="text-[22px] font-black leading-[1.05] tracking-normal text-white sm:text-2xl">
          {question}
        </h3>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]">
          <span>{category}</span>
          <span>{"\u00B7"}</span>
          <span>{time}</span>
          <span>{"\u00B7"}</span>
          <span>closes {deadline}</span>
        </div>
      </div>

      {postContent && postContent !== question && (
        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-[var(--muted)]">{postContent}</p>
      )}

      <div className="mb-2 flex items-end justify-between">
        <div>
          <span className="text-[32px] font-black leading-none text-brand-secondary">
            {displayYesPercent.toFixed(0)}%
          </span>
          <span className="ml-2 font-mono text-sm font-black text-brand-secondary">Yes</span>
        </div>
        <div>
          <span className="text-[32px] font-black leading-none text-white/90">{noPercent.toFixed(0)}%</span>
          <span className="ml-2 font-mono text-sm font-black text-[var(--muted)]">No</span>
        </div>
      </div>

      <div className="mb-4 flex h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full bg-brand-secondary" style={{ width: `${displayYesPercent}%` }} />
        <div className="h-full bg-downvote" style={{ width: `${noPercent}%` }} />
      </div>

      <div className="mb-4 grid grid-cols-[1fr_1fr_auto] items-center gap-3 border-b border-white/10 pb-4 font-mono text-[11px] text-[var(--muted)]">
        <span>Calls {totalVotes.toLocaleString()}</span>
        <span>Liquidity {totalUsdt.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDT</span>
        <button
          className="flex h-9 items-center gap-2 rounded-[6px] border border-brand-secondary/30 bg-black/30 px-4 font-black text-brand-secondary transition-colors hover:bg-brand-secondary hover:text-black"
          onClick={openDetails}
          type="button"
        >
          Trade <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mb-4 grid gap-3 rounded-[8px] border border-white/10 bg-black/20 p-3">
        <div className="flex items-center justify-between gap-3 font-mono text-[11px] text-[var(--muted)]">
          <span>{voteThresholdMet ? "Review threshold met" : `${votesToReview} more calls to review`}</span>
          <span>{qualificationProgress.toFixed(0)}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full bg-brand-secondary" style={{ width: `${qualificationProgress}%` }} />
        </div>
        {!isLive && !isClosed && (
          <>
            <div className="flex items-center justify-between gap-3 font-mono text-[11px] text-[var(--muted)]">
              <span>Seed liquidity</span>
              <span>{seedLiquidity.toFixed(0)} / {requiredSeedLiquidity} USDT</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-brand-accent" style={{ width: `${seedProgress}%` }} />
            </div>
          </>
        )}
      </div>

      {isDetail && (
        <div className="mb-4 grid gap-2 rounded-[8px] border border-white/10 bg-black/20 p-3 text-sm text-[var(--muted)]">
          {yesCondition && <p><span className="font-mono text-brand-secondary">YES</span> {yesCondition}</p>}
          {noCondition && <p><span className="font-mono text-downvote">NO</span> {noCondition}</p>}
          {resolutionSource && <p className="font-mono text-xs">Source: {resolutionSource}</p>}
          <p className="font-mono text-xs">Create fee: {Number(marketCreationFeeUsdc).toFixed(2)} USDT</p>
        </div>
      )}

      {canFreeVote && (
        <div className="mb-4 grid grid-cols-2 gap-2" onClick={stopClick}>
          <button
            className="h-9 rounded-[6px] border border-brand-secondary/35 bg-brand-secondary/10 text-sm font-black text-brand-secondary transition-colors hover:bg-brand-secondary hover:text-black disabled:cursor-not-allowed disabled:opacity-45"
            disabled={voteDisabled}
            onClick={() => onVote?.("YES")}
            type="button"
          >
            Yes Call
          </button>
          <button
            className="h-9 rounded-[6px] border border-downvote/35 bg-downvote/10 text-sm font-black text-downvote transition-colors hover:bg-downvote hover:text-black disabled:cursor-not-allowed disabled:opacity-45"
            disabled={voteDisabled}
            onClick={() => onVote?.("NO")}
            type="button"
          >
            No Call
          </button>
        </div>
      )}

      {votingDisabledMessage && <p className="mb-3 font-mono text-[11px] text-downvote">{votingDisabledMessage}</p>}

      <div className="flex items-center justify-between gap-3" onClick={stopClick}>
        <div className="flex min-w-0 items-center gap-2">
          <AvatarStack />
          <span className="truncate font-mono text-[11px] text-[var(--muted)]">{creatorLabel} + fans</span>
        </div>

        <div className="flex items-center gap-1 text-[var(--muted)]">
          <IconAction label={comments} onClick={onComment} icon={<MessageCircle className="h-4 w-4" />} />
          <IconAction active={reshared} label={reshares} onClick={onReshare} icon={<Repeat2 className="h-4 w-4" />} />
          <IconAction onClick={onShare} icon={<Share className="h-4 w-4" />} />
        </div>
      </div>

      {hasViewerVoted && (
        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-brand-secondary/30 bg-brand-secondary/10 px-3 py-1 font-mono text-[11px] font-black text-brand-secondary">
          <ShieldCheck className="h-3.5 w-3.5" />
          Your call: {viewerVote}
        </div>
      )}
    </article>
  );
}

function IconAction({
  active = false,
  icon,
  label,
  onClick,
}: {
  active?: boolean;
  icon: ReactNode;
  label?: number;
  onClick?: () => void;
}) {
  return (
    <button
      className={`flex items-center gap-1 rounded-full p-2 transition-colors hover:bg-white/10 hover:text-white ${
        active ? "text-brand-secondary" : ""
      }`}
      onClick={onClick}
      type="button"
    >
      {icon}
      {typeof label === "number" && <span className="font-mono text-[11px]">{label}</span>}
    </button>
  );
}

function AvatarStack() {
  return (
    <div className="flex -space-x-2">
      {["bg-brand-secondary", "bg-brand-accent", "bg-brand-pitch", "bg-white"].map((color, index) => (
        <span
          className={`h-6 w-6 rounded-full border border-black ${color}`}
          key={color}
          style={{ opacity: 1 - index * 0.12 }}
        />
      ))}
      <span className="flex h-6 items-center rounded-full border border-white/10 bg-white/10 px-2 font-mono text-[10px] text-white">
        <Users className="mr-1 h-3 w-3" />
        1.2K
      </span>
    </div>
  );
}
