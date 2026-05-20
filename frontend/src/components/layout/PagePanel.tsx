import type { ReactNode } from "react";

interface PagePanelProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
}

export default function PagePanel({ eyebrow, title, description, children }: PagePanelProps) {
  return (
    <div className="flex flex-col gap-3 py-3">
      <section className="rounded-[8px] border border-white/10 bg-[linear-gradient(180deg,rgba(21,22,24,0.98),rgba(9,10,11,0.96))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.38)]">
        {eyebrow && (
          <p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-brand-secondary">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 text-2xl font-black tracking-tight text-white">{title}</h1>
        {description && (
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{description}</p>
        )}
      </section>

      {children}
    </div>
  );
}
