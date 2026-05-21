"use client";

import { useMemo, useState } from "react";
import { Image as ImageIcon, BarChart2, Smile, MapPin } from "lucide-react";
import { PREDICTION_CREATION_FEE_USDT } from "@/lib/fees";
import {
  createMarketPost,
  createNormalPost,
  type MarketInput,
  type Profile,
} from "@/lib/credplay";
import { createMarketKey } from "@/lib/credplayContract";
import { reviewPredictionPost, type CredPlayReview } from "@/lib/credplayAgent";
import { useUsdcTransfer } from "@/hooks/useUsdcTransfer";

interface ComposeBoxProps {
  profile: Profile | null;
  onCreated: () => void;
}

const PREDICTION_CATEGORIES = [
  "World Cup",
  "Match Result",
  "Goals",
  "Player Performance",
  "Group Stage",
  "Knockout Stage",
  "Tournament Winner",
  "Upsets",
  "Fan Sentiment",
];

const FIFA_WORLD_CUP_RESOLUTION_SOURCE = "https://www.fifa.com/en/tournaments/mens/worldcup";

export default function ComposeBox({ profile, onCreated }: ComposeBoxProps) {
  const { createPredictionOnChain } = useUsdcTransfer();
  const [content, setContent] = useState("");
  const [isMarket, setIsMarket] = useState(false);
  const [market, setMarket] = useState<MarketInput>({
    content: "",
    question: "",
    category: "World Cup",
    kind: "multi_option",
    options: [],
    deadline: "",
    resolutionSource: FIFA_WORLD_CUP_RESOLUTION_SOURCE,
    yesCondition: "Official FIFA result selects the winning match outcome.",
    noCondition: "All non-winning match outcomes resolve as not selected.",
  });
  const [homeOutcome, setHomeOutcome] = useState("USA");
  const [awayOutcome, setAwayOutcome] = useState("PAR");
  const [agentReview, setAgentReview] = useState<CredPlayReview | null>(null);
  const [reviewedSignature, setReviewedSignature] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasMarketFields = useMemo(
    () =>
      market.question.trim().length > 0 &&
      market.category.trim().length > 0 &&
      market.deadline.trim().length > 0 &&
      homeOutcome.trim().length > 0 &&
      awayOutcome.trim().length > 0,
    [homeOutcome, awayOutcome, market],
  );

  const matchOptions = useMemo(
    () => [{ label: homeOutcome.trim() }, { label: "Draw" }, { label: awayOutcome.trim() }],
    [awayOutcome, homeOutcome],
  );

  const generatedMarket = useMemo<MarketInput>(
    () => ({
      ...market,
      kind: "multi_option",
      options: matchOptions,
      resolutionSource: FIFA_WORLD_CUP_RESOLUTION_SOURCE,
      yesCondition: `Official FIFA result selects one outcome: ${homeOutcome.trim()}, Draw, or ${awayOutcome.trim()}.`,
      noCondition: "All other outcomes resolve as down for this match-result market.",
    }),
    [awayOutcome, homeOutcome, market, matchOptions],
  );

  const marketSignature = useMemo(
    () =>
      JSON.stringify({
        content: content.trim(),
        question: market.question.trim(),
        category: generatedMarket.category.trim(),
        kind: generatedMarket.kind,
        options: generatedMarket.options,
        deadline: market.deadline,
        resolutionSource: generatedMarket.resolutionSource.trim(),
        yesCondition: generatedMarket.yesCondition.trim(),
        noCondition: generatedMarket.noCondition.trim(),
      }),
    [content, generatedMarket, market.deadline, market.question],
  );

  const liveAgentReview = useMemo(
    () =>
      reviewPredictionPost({
        ...generatedMarket,
        content,
      }),
    [content, generatedMarket],
  );

  const reviewIsCurrent = Boolean(agentReview && reviewedSignature === marketSignature);
  const predictionApproved = Boolean(reviewIsCurrent && agentReview?.approved);
  const visibleAgentReview = reviewIsCurrent && agentReview ? agentReview : liveAgentReview;

  const canUsePrimaryAction = useMemo(() => {
    if (!profile || saving) return false;
    if (!isMarket) return content.trim().length > 0;
    return hasMarketFields;
  }, [content, hasMarketFields, isMarket, profile, saving]);

  function runAgentReview() {
    setAgentReview(liveAgentReview);
    setReviewedSignature(marketSignature);
    setError(liveAgentReview.approved ? null : liveAgentReview.summary);
  }

  const primaryLabel = useMemo(() => {
    if (saving) return isMarket ? "Posting" : "Posting";
    if (!isMarket) return "Post";
    if (!predictionApproved) return "Review";
    return `Pay ${PREDICTION_CREATION_FEE_USDT} USDT & Post`;
  }, [isMarket, predictionApproved, saving]);

  const marketReadyText = useMemo(() => {
    return (
      "CredPlay reviews prediction quality before the USDT creation payment is enabled."
    );
  }, []);

  async function submit() {
    if (!profile || !canUsePrimaryAction) return;

    if (isMarket && !predictionApproved) {
      runAgentReview();
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (isMarket) {
        const marketKey = createMarketKey();
        const payment = await createPredictionOnChain(PREDICTION_CREATION_FEE_USDT, marketKey);
        const result = await createMarketPost(profile.id, {
          ...generatedMarket,
          content,
          creationFeeTxHash: payment.hash,
          feeCollectorAddress: payment.contractAddress,
          chainMarketKey: payment.marketKey,
        });
        if (result.warning) setError(result.warning);
        setMarket({
          content: "",
          question: "",
          category: "World Cup",
          kind: "multi_option",
          options: [],
          deadline: "",
          resolutionSource: FIFA_WORLD_CUP_RESOLUTION_SOURCE,
          yesCondition: "Official FIFA result selects the winning match outcome.",
          noCondition: "All non-winning match outcomes resolve as not selected.",
        });
        setHomeOutcome("USA");
        setAwayOutcome("PAR");
        setAgentReview(null);
        setReviewedSignature("");
        setIsMarket(false);
      } else {
        await createNormalPost(profile.id, content);
      }

      setContent("");
      onCreated();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to create post.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex gap-4 rounded-[8px] border border-white/10 bg-[linear-gradient(155deg,rgba(20,21,24,0.96),rgba(5,5,5,0.96))] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className="h-10 w-10 rounded-full border border-brand-secondary/40 bg-brand-secondary/15" />
      </div>
      
      <div className="flex-1 flex flex-col pt-1">
        <textarea 
          disabled={!profile || saving}
          onChange={(event) => setContent(event.target.value)}
          placeholder={profile ? "What's your World Cup prediction?" : "Connect wallet to post"}
          value={content}
          className="min-h-[60px] w-full resize-none border-none bg-transparent text-lg font-bold text-white outline-none placeholder:text-[var(--muted)]"
        />

        {isMarket && (
          <div className="mt-3 grid gap-2 rounded-[8px] border border-white/10 bg-black/25 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-[8px] border border-brand-secondary/25 bg-brand-secondary/10 px-3 py-2 font-mono text-[11px] text-brand-secondary">
              <span>Prediction posts cost {PREDICTION_CREATION_FEE_USDT} USDT</span>
              <span>CredPlay review required</span>
            </div>
            <input
              className="h-10 rounded-[8px] border border-white/10 bg-black/35 px-3 text-sm text-white outline-none placeholder:text-[var(--muted)] focus:border-brand-secondary/50"
              onChange={(event) => setMarket((current) => ({ ...current, question: event.target.value }))}
              placeholder="Prediction question (e.g. Will Nigeria qualify from the group stage?)"
              value={market.question}
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                className="h-10 rounded-[8px] border border-white/10 bg-black/35 px-3 text-sm text-white outline-none placeholder:text-[var(--muted)] focus:border-brand-secondary/50"
                onChange={(event) => setHomeOutcome(event.target.value)}
                placeholder="Home option (e.g. USA)"
                value={homeOutcome}
              />
              <input
                className="h-10 rounded-[8px] border border-white/10 bg-black/35 px-3 text-sm text-white outline-none placeholder:text-[var(--muted)] focus:border-brand-secondary/50"
                onChange={(event) => setAwayOutcome(event.target.value)}
                placeholder="Away option (e.g. PAR)"
                value={awayOutcome}
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {matchOptions.map((option, index) => (
                <div className="rounded-[8px] border border-brand-secondary/20 bg-brand-secondary/10 px-3 py-2 text-center text-sm font-black text-white" key={`${option.label}-${index}`}>
                  {option.label || "Option"}
                </div>
              ))}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <select
                className="h-10 rounded-[8px] border border-white/10 bg-black/35 px-3 text-sm text-white outline-none focus:border-brand-secondary/50"
                onChange={(event) => setMarket((current) => ({ ...current, category: event.target.value }))}
                value={market.category}
              >
                {PREDICTION_CATEGORIES.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
              <input
                className="h-10 rounded-[8px] border border-white/10 bg-black/35 px-3 text-sm text-white outline-none focus:border-brand-secondary/50"
                onChange={(event) => setMarket((current) => ({ ...current, deadline: event.target.value }))}
                type="datetime-local"
                value={market.deadline}
              />
            </div>
            <input
              className="h-10 rounded-[8px] border border-white/10 bg-black/35 px-3 text-sm text-[var(--muted)] outline-none"
              readOnly
              value={`Resolution source: ${FIFA_WORLD_CUP_RESOLUTION_SOURCE}`}
            />
            <div className="rounded-[8px] border border-white/10 bg-black/30 p-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-[11px] font-black uppercase tracking-[0.12em] text-[var(--foreground)]">
                  CredPlay Prediction Review
                </span>
                <span className={`font-mono text-[11px] font-bold ${visibleAgentReview.approved ? "text-brand-secondary" : "text-downvote"}`}>
                  {visibleAgentReview.score}/100
                </span>
              </div>
              <p className="mb-2 text-sm text-[var(--muted)]">{reviewIsCurrent ? visibleAgentReview.summary : marketReadyText}</p>
              <div className="grid gap-1">
                {visibleAgentReview.findings.slice(0, 3).map((finding) => (
                  <p
                    className={`text-xs ${
                      finding.severity === "blocker"
                        ? "text-downvote"
                        : finding.severity === "warning"
                          ? "text-[var(--muted)]"
                          : "text-brand-secondary"
                    }`}
                    key={finding.message}
                  >
                    {finding.message}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {error && <p className="mt-2 text-sm text-downvote">{error}</p>}
        
        <div className="mt-2 flex items-center justify-between border-t border-dashed border-[var(--border)] pt-3">
          <div className="flex items-center gap-1 text-[var(--muted)]">
            <button aria-label="Add image" className="rounded-full p-2 transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]" type="button">
              <ImageIcon className="w-5 h-5" />
            </button>
            <button
              aria-label="Create prediction"
              aria-pressed={isMarket}
              className={`rounded-full p-2 transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)] ${
                isMarket ? "bg-brand-secondary/10 text-brand-secondary" : ""
              }`}
              onClick={() => setIsMarket((current) => !current)}
              type="button"
            >
              <BarChart2 className="w-5 h-5" />
            </button>
            <button aria-label="Add emoji" className="hidden rounded-full p-2 transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)] sm:block" type="button">
              <Smile className="w-5 h-5" />
            </button>
            <button aria-label="Add location" className="hidden rounded-full p-2 transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)] sm:block" type="button">
              <MapPin className="w-5 h-5" />
            </button>
          </div>
          
          <button
            className={`rounded-[8px] px-5 py-2 font-mono text-[10px] font-black uppercase tracking-[0.16em] transition-opacity ${
              canUsePrimaryAction
                ? "bg-brand-secondary text-black hover:opacity-85"
                : "cursor-not-allowed bg-zinc-700 text-zinc-500"
            }`}
            disabled={!canUsePrimaryAction}
            onClick={submit}
            type="button"
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
