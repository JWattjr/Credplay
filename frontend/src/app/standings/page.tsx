import { Flame, Target, Trophy } from "lucide-react";
import PagePanel from "@/components/layout/PagePanel";

const GLOBAL_LEADERS = [
  { rank: 1, name: "NigeriaFan9", country: "NG", credScore: 2840, accuracy: "78%", calls: 156 },
  { rank: 2, name: "ArgentinaOracle", country: "AR", credScore: 2610, accuracy: "74%", calls: 201 },
  { rank: 3, name: "BrazilPredictor", country: "BR", credScore: 2490, accuracy: "71%", calls: 189 },
  { rank: 4, name: "ThreeLions_UK", country: "ENG", credScore: 2350, accuracy: "69%", calls: 143 },
  { rank: 5, name: "AlbicelesteFan", country: "AR", credScore: 2280, accuracy: "68%", calls: 167 },
  { rank: 6, name: "DieManschaft", country: "DE", credScore: 2110, accuracy: "65%", calls: 134 },
  { rank: 7, name: "LesBleus2026", country: "FR", credScore: 2050, accuracy: "67%", calls: 112 },
  { rank: 8, name: "SambaKing", country: "BR", credScore: 1980, accuracy: "63%", calls: 198 },
];

const TOP_SEEDERS = [
  { name: "WhaleSeeder", seeded: "12,400 USDT", markets: 34 },
  { name: "LiquidityKing", seeded: "8,900 USDT", markets: 22 },
  { name: "EarlyBacker", seeded: "6,200 USDT", markets: 18 },
];

const CATEGORY_EXPERTS = [
  { category: "Match Winner", expert: "ArgentinaOracle", accuracy: "82%" },
  { category: "Goals", expert: "SambaKing", accuracy: "76%" },
  { category: "Group Stage", expert: "NigeriaFan9", accuracy: "80%" },
  { category: "Upsets", expert: "ThreeLions_UK", accuracy: "71%" },
  { category: "Player Performance", expert: "LesBleus2026", accuracy: "74%" },
];

function panelClassName() {
  return "rounded-[8px] border border-white/10 bg-[linear-gradient(180deg,rgba(21,22,24,0.98),rgba(9,10,11,0.96))] shadow-[0_18px_60px_rgba(0,0,0,0.36)]";
}

export default function StandingsPage() {
  return (
    <PagePanel
      description="See who's building the most football credibility through prediction accuracy."
      eyebrow="Leaderboard"
      title="Credibility Standings"
    >
      <section className={panelClassName()}>
        <div className="border-b border-dashed border-white/10 p-5">
          <h2 className="flex items-center gap-2 font-mono text-xs font-black uppercase tracking-[0.16em] text-white">
            <Trophy className="h-4 w-4 text-brand-gold" />
            Global Top Predictors
          </h2>
        </div>
        <div className="divide-y divide-dashed divide-white/10">
          {GLOBAL_LEADERS.map((leader) => (
            <div
              className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-brand-secondary/10"
              key={leader.name}
            >
              <div className="flex min-w-0 items-center gap-4">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-mono text-sm font-black ${
                    leader.rank <= 3
                      ? "border-brand-gold/40 bg-brand-gold/15 text-brand-gold"
                      : "border-white/10 bg-white/5 text-[var(--muted)]"
                  }`}
                >
                  {leader.rank}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-brand-secondary/80">
                      {leader.country}
                    </span>
                    <span className="truncate font-black text-white">{leader.name}</span>
                  </div>
                  <span className="font-mono text-[11px] text-[var(--muted)]">
                    {leader.accuracy} accuracy · {leader.calls} calls
                  </span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-mono text-lg font-black text-white">
                  {leader.credScore.toLocaleString()}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-brand-secondary/70">
                  Cred Points
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={panelClassName()}>
        <div className="border-b border-dashed border-white/10 p-5">
          <h2 className="flex items-center gap-2 font-mono text-xs font-black uppercase tracking-[0.16em] text-white">
            <Flame className="h-4 w-4 text-brand-gold" />
            Top Seeders
          </h2>
        </div>
        <div className="divide-y divide-dashed divide-white/10">
          {TOP_SEEDERS.map((seeder) => (
            <div className="flex items-center justify-between gap-4 p-4" key={seeder.name}>
              <span className="font-black text-white">{seeder.name}</span>
              <div className="text-right">
                <p className="font-mono text-sm font-bold text-white">{seeder.seeded}</p>
                <p className="font-mono text-[10px] text-[var(--muted)]">
                  {seeder.markets} markets seeded
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={panelClassName()}>
        <div className="border-b border-dashed border-white/10 p-5">
          <h2 className="flex items-center gap-2 font-mono text-xs font-black uppercase tracking-[0.16em] text-white">
            <Target className="h-4 w-4 text-brand-secondary" />
            Category Experts
          </h2>
        </div>
        <div className="divide-y divide-dashed divide-white/10">
          {CATEGORY_EXPERTS.map((item) => (
            <div className="flex items-center justify-between gap-4 p-4" key={item.category}>
              <div>
                <p className="font-black text-white">{item.category}</p>
                <p className="font-mono text-[11px] text-[var(--muted)]">Top: {item.expert}</p>
              </div>
              <span className="font-mono text-sm font-bold text-brand-secondary">{item.accuracy}</span>
            </div>
          ))}
        </div>
      </section>
    </PagePanel>
  );
}
