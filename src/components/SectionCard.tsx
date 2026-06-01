import type { PropsWithChildren } from 'react';

interface SectionCardProps extends PropsWithChildren {
  eyebrow: string;
  title: string;
  description: string;
}

export function SectionCard({ eyebrow, title, description, children }: SectionCardProps) {
  return (
    <section className="panel-shell rounded-[2rem] p-4 sm:p-5">
      <div className="mb-5">
        <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--text-muted)]">{eyebrow}</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[var(--text-strong)]">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-body)]">{description}</p>
      </div>
      {children}
    </section>
  );
}
