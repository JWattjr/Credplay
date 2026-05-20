"use client";

import { ClipboardCheck, CheckCircle2, AlertTriangle } from "lucide-react";
import type { MarketPost } from "@/lib/credplay";
import { reviewPredictionPost, type CredPlayReview } from "@/lib/credplayAgent";

interface CredPlayAgentPanelProps {
  market?: MarketPost | null;
  review?: CredPlayReview | null;
  compact?: boolean;
}

function reviewMarket(market: MarketPost): CredPlayReview {
  return reviewPredictionPost({
    content: "",
    question: market.question,
    category: market.category,
    deadline: market.deadline,
    resolutionSource: market.resolution_source,
    yesCondition: market.yes_condition,
    noCondition: market.no_condition,
  });
}

export default function CredPlayAgentPanel({ compact = false, market, review }: CredPlayAgentPanelProps) {
  const agentReview = review || (market ? reviewMarket(market) : null);
  if (!agentReview) return null;

  const Icon = agentReview.approved ? CheckCircle2 : AlertTriangle;

  return (
    <section
      className={`rounded-[10px] border ${
        agentReview.approved ? "border-brand-secondary/30 bg-brand-secondary/10" : "border-downvote/30 bg-downvote/10"
      } ${compact ? "p-3" : "p-4"}`}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-[var(--foreground)]" />
          <h2 className="font-mono text-[11px] font-black uppercase tracking-[0.14em] text-[var(--foreground)]">
            CredPlay Market Review
          </h2>
        </div>
        <span className="font-mono text-xs font-black text-[var(--foreground)]">{agentReview.score}/100</span>
      </div>
      <div className="flex gap-2">
        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${agentReview.approved ? "text-brand-secondary" : "text-downvote"}`} />
        <div className="min-w-0">
          <p className={`${compact ? "text-xs" : "text-sm"} font-medium text-[var(--foreground)]`}>
            {agentReview.summary}
          </p>
          {!compact && (
            <div className="mt-3 grid gap-2">
              {agentReview.findings.map((finding) => (
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
          )}
        </div>
      </div>
    </section>
  );
}
