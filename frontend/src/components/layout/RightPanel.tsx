"use client";

import { Search, Shield, Target, TrendingUp, Trophy } from "lucide-react";
import { useFeed } from "@/hooks/useFeed";
import { useRightPanelSlot } from "@/hooks/useRightPanelSlot";
import { displayHandle, displayName } from "@/lib/credplay";

export default function RightPanel() {
  const { items } = useFeed(undefined, true);
  const marketItems = items.filter((item) => item.market);
  const trending = marketItems.slice(0, 3);
  const predictors = Array.from(
    new Map(items.map((item) => [item.author.id, item.author])).values(),
  ).slice(0, 3);
  const slotContent = useRightPanelSlot();

  return (
    <div className="flex h-full w-full flex-col gap-4 overflow-y-auto pb-8">
      <div className="group relative">
        <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
          <Search className="h-5 w-5 text-[var(--muted)] transition-colors group-focus-within:text-white" />
        </div>
        <input
          className="w-full rounded-[8px] border border-white/10 bg-black/55 py-3 pl-12 pr-4 text-white shadow-sm outline-none placeholder:text-[var(--muted)] focus:border-[var(--border-strong)] focus:ring-1 focus:ring-[var(--border-strong)]"
          placeholder="Search predictions, fans..."
          type="text"
        />
      </div>

      {slotContent}

      <div className="flex flex-col overflow-hidden rounded-[8px] border border-white/10 bg-[linear-gradient(160deg,rgba(21,22,24,0.96),rgba(5,5,5,0.98))] shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
        <div className="border-b border-white/10 p-4">
          <h2 className="flex items-center gap-2 font-mono text-xs font-black uppercase tracking-[0.16em] text-white">
            <TrendingUp className="h-4 w-4 text-brand-secondary" />
            Hot Predictions
          </h2>
        </div>

        <div className="flex flex-col">
          {trending.length > 0 ? trending.map((item) => {
            const market = item.market;
            const yes = market ? calculateYesPercent(Number(market.usdc_yes_amount), Number(market.usdc_no_amount)) : 50;
            const volume = market ? Number(market.usdc_yes_amount) + Number(market.usdc_no_amount) : 0;

            return (
              <div
                className="flex cursor-pointer flex-col gap-2 border-b border-white/10 p-4 transition-colors hover:bg-[var(--surface-hover)]"
                key={item.id}
              >
                <span className="inline-flex w-fit items-center gap-1 rounded-full border border-brand-accent/30 bg-brand-accent/10 px-2 py-1 font-mono text-[10px] font-black uppercase tracking-[0.12em] text-brand-accent">
                  <Target className="h-3 w-3" />
                  {market?.category || "Predictions"}
                </span>
                <p className="line-clamp-2 text-sm font-black leading-snug text-white">{market?.question}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-brand-secondary">{yes.toFixed(0)}% YES</span>
                  <span className="font-mono text-xs text-[var(--muted)]">{volume.toLocaleString()} USDT</span>
                </div>
              </div>
            );
          }) : (
            <div className="p-4 text-sm text-[var(--muted)]">No hot predictions yet.</div>
          )}
        </div>

        <button className="p-4 text-left font-mono text-xs font-black uppercase tracking-[0.12em] text-brand-secondary transition-colors hover:bg-[var(--surface-hover)]">
          Show more
        </button>
      </div>

      {!slotContent && (
        <div className="flex flex-col overflow-hidden rounded-[8px] border border-white/10 bg-[linear-gradient(160deg,rgba(21,22,24,0.96),rgba(5,5,5,0.98))] shadow-sm">
          <div className="border-b border-white/10 p-4">
            <h2 className="flex items-center gap-2 font-mono text-xs font-black uppercase tracking-[0.16em] text-white">
              <Trophy className="h-4 w-4 text-brand-gold" />
              Top Credibility
            </h2>
          </div>

          <div className="flex flex-col">
            {predictors.length > 0 ? predictors.map((user) => (
              <div
                className="flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-[var(--surface-hover)]"
                key={user.id}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-secondary/40 bg-black text-brand-secondary">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-black leading-none text-white">{displayName(user)}</span>
                    <span className="mt-1 truncate font-mono text-xs text-[var(--muted)]">{displayHandle(user)}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-black text-brand-secondary">98.7</span>
                  <span className="font-mono text-[10px] uppercase text-[var(--muted)]">Score</span>
                </div>
              </div>
            )) : (
              <div className="p-4 text-sm text-[var(--muted)]">No predictors yet.</div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-x-3 gap-y-1 px-4 font-mono text-[11px] text-[var(--muted)]">
        <a href="#" className="hover:text-white">Terms</a>
        <a href="#" className="hover:text-white">Privacy</a>
        <a href="#" className="hover:text-white">Docs</a>
        <span>{"\u00A9"} 2026 CredPlay</span>
      </div>
    </div>
  );
}

function calculateYesPercent(yes: number, no: number) {
  const total = yes + no;
  if (total === 0) return 50;
  return (yes / total) * 100;
}
