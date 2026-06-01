interface ReviewChecklistCardProps {
  expansionBaseline: number;
  isRtl: boolean;
  languageLabel: string;
}

export function ReviewChecklistCard({
  expansionBaseline,
  isRtl,
  languageLabel,
}: ReviewChecklistCardProps) {
  return (
    <section className="panel-shell rounded-[1.75rem] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">
            Reviewer guidance
          </p>
          <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-[var(--text-strong)]">
            Release checks tuned for sports UI
          </h3>
        </div>
        <span className="panel-chip rounded-full px-3 py-1 text-[11px] text-[var(--text-body)]">
          {languageLabel}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="panel-muted rounded-2xl p-4">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Expansion</p>
          <p className="mt-2 text-lg font-semibold text-[var(--text-strong)]">{expansionBaseline}% baseline</p>
          <p className="mt-2 text-sm leading-6 text-[var(--text-body)]">
            Prioritize dense workout cards, split labels, and compact watch layouts.
          </p>
        </div>
        <div className="panel-muted rounded-2xl p-4">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Direction</p>
          <p className="mt-2 text-lg font-semibold text-[var(--text-strong)]">{isRtl ? 'RTL review' : 'LTR review'}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--text-body)]">
            {isRtl
              ? 'Verify mirrored paddings, icon order, and directional metrics on every flagged surface.'
              : 'Confirm left anchoring, number formatting, and label rhythm across data-heavy screens.'}
          </p>
        </div>
        <div className="panel-muted rounded-2xl p-4">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Priority surfaces</p>
          <p className="mt-2 text-lg font-semibold text-[var(--text-strong)]">Watch, GPS, recovery</p>
          <p className="mt-2 text-sm leading-6 text-[var(--text-body)]">
            Focus on workout summaries, pace cards, heart-rate states, and accessory setup flows.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="panel-muted rounded-2xl p-4">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Manual pass</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--text-body)]">
            <li>Check unit labels, pace abbreviations, and sensor naming consistency.</li>
            <li>Verify CTA width on goal-completion and workout-detail screens.</li>
            <li>Review placeholders inside dynamic coaching messages and summary cards.</li>
          </ul>
        </div>
        <div className="panel-muted rounded-2xl p-4">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Escalate when</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--text-body)]">
            <li>High-severity findings affect watch face constraints or post-run summaries.</li>
            <li>Fallback fonts change metrics tone between phone and wearable surfaces.</li>
            <li>RTL order breaks icon plus value pairs on activity, recovery, or map screens.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
