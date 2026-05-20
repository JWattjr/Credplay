import { Award, Lock, Star } from "lucide-react";
import PagePanel from "@/components/layout/PagePanel";

const TROPHIES = [
  {
    name: "Early Prophet",
    icon: "🔮",
    description: "Made a correct free call on a prediction before it had 10 total calls.",
    rarity: "Common",
    unlocked: false,
  },
  {
    name: "Group Stage Expert",
    icon: "📊",
    description: "Achieved 70%+ accuracy on 10+ Group Stage predictions.",
    rarity: "Rare",
    unlocked: false,
  },
  {
    name: "Upset Oracle",
    icon: "⚡",
    description: "Correctly predicted 3 upsets that less than 25% of fans called.",
    rarity: "Epic",
    unlocked: false,
  },
  {
    name: "Golden Boot Watcher",
    icon: "👟",
    description: "Made 5+ correct Player Performance predictions about top scorers.",
    rarity: "Rare",
    unlocked: false,
  },
  {
    name: "Market Creator",
    icon: "🏗️",
    description: "Created 3 prediction posts that reached Live Market status.",
    rarity: "Common",
    unlocked: false,
  },
  {
    name: "Liquidity Seeder",
    icon: "💧",
    description: "Seeded USDT into 5+ prediction posts that went live.",
    rarity: "Rare",
    unlocked: false,
  },
  {
    name: "Final Boss Predictor",
    icon: "🏆",
    description: "Correctly predicted the World Cup winner before the knockout stage.",
    rarity: "Legendary",
    unlocked: false,
  },
  {
    name: "100 Club",
    icon: "💯",
    description: "Made 100 total free calls across all categories.",
    rarity: "Common",
    unlocked: false,
  },
];

const RARITY_COLORS: Record<string, string> = {
  Common: "text-[var(--muted)] border-[var(--border)]",
  Rare: "text-blue-400 border-blue-400/30",
  Epic: "text-purple-400 border-purple-400/30",
  Legendary: "text-yellow-500 border-yellow-500/30",
};

export default function TrophiesPage() {
  return (
    <PagePanel
      description="Earn badges and trophies by building football credibility through accurate predictions."
      eyebrow="Achievements"
      title="Trophies & Badges"
    >
      <section className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <h2 className="flex items-center gap-2 font-mono text-xs font-black uppercase tracking-[0.16em] text-[var(--foreground)]">
          <Award className="h-4 w-4 text-yellow-500" />
          Your Progress
        </h2>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-[13px] bg-[var(--surface-muted)] p-4">
            <p className="text-2xl font-black text-[var(--foreground)]">0</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">Unlocked</p>
          </div>
          <div className="rounded-[13px] bg-[var(--surface-muted)] p-4">
            <p className="text-2xl font-black text-[var(--foreground)]">{TROPHIES.length}</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">Total</p>
          </div>
          <div className="rounded-[13px] bg-[var(--surface-muted)] p-4">
            <p className="text-2xl font-black text-[var(--foreground)]">0%</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">Complete</p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {TROPHIES.map((trophy) => (
          <article
            className={`relative rounded-[18px] border bg-[var(--surface)] p-5 shadow-sm transition-colors ${
              trophy.unlocked ? "border-yellow-500/40" : "border-[var(--border)]"
            }`}
            key={trophy.name}
          >
            {!trophy.unlocked && (
              <div className="absolute right-4 top-4">
                <Lock className="h-4 w-4 text-[var(--muted)]" />
              </div>
            )}
            <div className="mb-3 text-3xl">{trophy.icon}</div>
            <h3 className="font-black text-[var(--foreground)]">{trophy.name}</h3>
            <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">{trophy.description}</p>
            <div className="mt-3 flex items-center gap-2">
              <Star className={`h-3 w-3 ${RARITY_COLORS[trophy.rarity]?.split(" ")[0] || "text-[var(--muted)]"}`} />
              <span className={`font-mono text-[10px] font-bold uppercase tracking-wider ${RARITY_COLORS[trophy.rarity]?.split(" ")[0] || "text-[var(--muted)]"}`}>
                {trophy.rarity}
              </span>
            </div>
          </article>
        ))}
      </section>
    </PagePanel>
  );
}
