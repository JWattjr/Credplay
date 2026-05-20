import { Bell, CheckCircle2, MessageCircle, TrendingUp } from "lucide-react";
import PagePanel from "@/components/layout/PagePanel";

const NOTIFICATIONS = [
  {
    icon: TrendingUp,
    title: "Market moved 12%",
    body: "Brazil to beat France moved toward YES after the latest team news.",
    time: "12m",
  },
  {
    icon: MessageCircle,
    title: "New reply",
    body: "Maya Oracle replied to your match prediction comment.",
    time: "1h",
  },
  {
    icon: CheckCircle2,
    title: "Settlement ready",
    body: "A football market you followed is ready for resolution review.",
    time: "3h",
  },
];

export default function NotificationsPage() {
  return (
    <PagePanel
      description="Signals from matches, market moves, replies, and settlements you care about."
      eyebrow="Inbox"
      title="Notifications"
    >
      <section className="rounded-[8px] border border-white/10 bg-[var(--surface)] shadow-sm">
        <div className="border-b border-dashed border-white/10 p-5">
          <h2 className="flex items-center gap-2 font-mono text-xs font-black uppercase tracking-[0.16em] text-white">
            <Bell className="h-4 w-4 text-brand-secondary" />
            Recent
          </h2>
        </div>
        {NOTIFICATIONS.map((notification) => (
          <article
            className="flex gap-4 border-b border-dashed border-white/10 p-5 last:border-b-0"
            key={notification.title}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-secondary text-black">
              <notification.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-black text-white">{notification.title}</h3>
                <span className="font-mono text-xs text-[var(--muted)]">{notification.time}</span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">{notification.body}</p>
            </div>
          </article>
        ))}
      </section>
    </PagePanel>
  );
}
