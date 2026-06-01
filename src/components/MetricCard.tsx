import { cn } from '../utils/cn';

type MetricTone = 'emerald' | 'amber' | 'slate';

interface MetricCardProps {
  label: string;
  value: string;
  delta: string;
  tone: MetricTone;
}

const toneStyles: Record<MetricTone, string> = {
  emerald: 'border-[rgba(125,211,196,0.18)] bg-[rgba(125,211,196,0.09)] text-[var(--text-strong)]',
  amber: 'border-[rgba(251,191,36,0.18)] bg-[rgba(251,191,36,0.09)] text-[var(--text-strong)]',
  slate: 'border-white/10 bg-white/4 text-[var(--text-body)]',
};

export function MetricCard({ label, value, delta, tone }: MetricCardProps) {
  return (
    <div className="panel-shell rounded-[1.5rem] p-4">
      <p className="text-sm text-[var(--text-muted)]">{label}</p>
      <div className="mt-4 flex items-end justify-between gap-3">
        <span className="text-3xl font-semibold tracking-[-0.04em] text-[var(--text-strong)]">{value}</span>
        <span className={cn('rounded-full border px-2.5 py-1 text-[11px] font-medium', toneStyles[tone])}>
          {delta}
        </span>
      </div>
    </div>
  );
}
