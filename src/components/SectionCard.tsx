import type { PropsWithChildren } from 'react';

interface SectionCardProps extends PropsWithChildren {
  eyebrow: string;
  title: string;
  description: string;
}

export function SectionCard({ eyebrow, title, description, children }: SectionCardProps) {
  return (
    <section className="panel-shell cut-corner-panel rounded-[2rem] p-4 sm:p-5">
      <div className="section-divider mb-5">
        <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--text-muted)]">{eyebrow}</p>
        <h2 className="section-title mt-3 text-2xl font-semibold tracking-[-0.04em]">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-body)]">{description}</p>
      </div>
      {children}
    </section>
  );
}
