import { cn } from '../utils/cn';

type MetricTone = 'emerald' | 'amber' | 'slate';

interface MetricCardProps {
  label: string;
  value: string;
  delta: string;
  tone: MetricTone;
}

const toneStyles: Record<MetricTone, string> = {
  emerald: 'border-[rgba(16,185,129,0.26)] bg-[rgba(16,185,129,0.12)] text-[#d1fae5]',
  amber: 'border-[rgba(245,158,11,0.26)] bg-[rgba(245,158,11,0.12)] text-[#fef3c7]',
  slate: 'border-[rgba(59,130,246,0.18)] bg-[rgba(59,130,246,0.08)] text-[var(--text-body)]',
};

export function MetricCard({ label, value, delta, tone }: MetricCardProps) {
  return (
    <div className="panel-shell interactive-panel cut-corner-panel rounded-[1.5rem] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-[var(--text-muted)]">{label}</p>
        <span className="h-2 w-2 rounded-full bg-[var(--tone-cyan)] shadow-[0_0_16px_rgba(6,182,212,0.6)]" />
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <span className="metric-value text-4xl font-semibold text-[var(--text-strong)]">{value}</span>
        <span className={cn('rounded-full border px-2.5 py-1 text-[11px] font-medium', toneStyles[tone])}>
          {delta}
        </span>
      </div>
    </div>
  );
}
