import { Trophy, Globe, Medal, Flame, Users, Target } from "lucide-react";
import PagePanel from "@/components/layout/PagePanel";

const GLOBAL_LEADERS = [
  { rank: 1, name: "NigeriaFan9", country: "🇳🇬", credScore: 2840, accuracy: "78%", calls: 156 },
  { rank: 2, name: "ArgentinaOracle", country: "🇦🇷", credScore: 2610, accuracy: "74%", calls: 201 },
  { rank: 3, name: "BrazilPredictor", country: "🇧🇷", credScore: 2490, accuracy: "71%", calls: 189 },
  { rank: 4, name: "ThreeLions_UK", country: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", credScore: 2350, accuracy: "69%", calls: 143 },
  { rank: 5, name: "AlbicelesteFan", country: "🇦🇷", credScore: 2280, accuracy: "68%", calls: 167 },
  { rank: 6, name: "DieManschaft", country: "🇩🇪", credScore: 2110, accuracy: "65%", calls: 134 },
  { rank: 7, name: "LesBleus2026", country: "🇫🇷", credScore: 2050, accuracy: "67%", calls: 112 },
  { rank: 8, name: "SambaKing", country: "🇧🇷", credScore: 1980, accuracy: "63%", calls: 198 },
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

export default function StandingsPage() {
  return (
    <PagePanel
      description="See who's building the most football credibility through prediction accuracy."
      eyebrow="Leaderboard"
      title="Credibility Standings"
    >
      {/* Global Leaders */}
      <section className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] shadow-sm">
        <div className="border-b border-dashed border-[var(--border)] p-5">
          <h2 className="flex items-center gap-2 font-mono text-xs font-black uppercase tracking-[0.16em] text-[var(--foreground)]">
            <Trophy className="h-4 w-4 text-yellow-500" />
            Global Top Predictors
          </h2>
        </div>
        <div className="divide-y divide-dashed divide-[var(--border)]">
          {GLOBAL_LEADERS.map((leader) => (
            <div
              className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-[var(--surface-hover)]"
              key={leader.name}
            >
              <div className="flex items-center gap-4">
                <span className={`flex h-8 w-8 items-center justify-center rounded-full font-mono text-sm font-black ${
                  leader.rank <= 3 ? "bg-yellow-500/20 text-yellow-500" : "bg-[var(--surface-muted)] text-[var(--muted)]"
                }`}>
                  {leader.rank}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{leader.country}</span>
                    <span className="font-black text-[var(--foreground)]">{leader.name}</span>
                  </div>
                  <span className="font-mono text-[11px] text-[var(--muted)]">
                    {leader.accuracy} accuracy · {leader.calls} calls
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-lg font-black text-[var(--foreground)]">{leader.credScore.toLocaleString()}</p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]">Cred Points</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Top Seeders */}
      <section className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] shadow-sm">
        <div className="border-b border-dashed border-[var(--border)] p-5">
          <h2 className="flex items-center gap-2 font-mono text-xs font-black uppercase tracking-[0.16em] text-[var(--foreground)]">
            <Flame className="h-4 w-4 text-orange-500" />
            Top Seeders
          </h2>
        </div>
        <div className="divide-y divide-dashed divide-[var(--border)]">
          {TOP_SEEDERS.map((seeder) => (
            <div className="flex items-center justify-between p-4" key={seeder.name}>
              <span className="font-black text-[var(--foreground)]">{seeder.name}</span>
              <div className="text-right">
                <p className="font-mono text-sm font-bold text-[var(--foreground)]">{seeder.seeded}</p>
                <p className="font-mono text-[10px] text-[var(--muted)]">{seeder.markets} markets seeded</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Category Experts */}
      <section className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] shadow-sm">
        <div className="border-b border-dashed border-[var(--border)] p-5">
          <h2 className="flex items-center gap-2 font-mono text-xs font-black uppercase tracking-[0.16em] text-[var(--foreground)]">
            <Target className="h-4 w-4 text-brand-secondary" />
            Category Experts
          </h2>
        </div>
        <div className="divide-y divide-dashed divide-[var(--border)]">
          {CATEGORY_EXPERTS.map((item) => (
            <div className="flex items-center justify-between p-4" key={item.category}>
              <div>
                <p className="font-black text-[var(--foreground)]">{item.category}</p>
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
