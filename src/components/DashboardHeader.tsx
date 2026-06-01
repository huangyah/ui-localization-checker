import type { ReactNode } from 'react';

interface DashboardHeaderProps {
  currentAsset: string | null;
  issueCount: number;
  highSeverityCount: number;
  languageLabel: string;
  progress: number;
  status: string;
  children: ReactNode;
}

export function DashboardHeader({
  currentAsset,
  issueCount,
  highSeverityCount,
  languageLabel,
  progress,
  status,
  children,
}: DashboardHeaderProps) {
  return (
    <header className="panel-shell rounded-[2rem] px-5 py-5 sm:px-6 sm:py-6">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="panel-chip rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-[var(--text-muted)]">
              Sports Localization QA
            </span>
            <span className="panel-chip rounded-full px-3 py-1 text-[11px] text-[var(--text-body)]">
              Multilingual release review for training apps and device UI
            </span>
          </div>

          <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.04em] text-[var(--text-strong)] sm:text-[2.6rem]">
            Review workout, wearable, and sensor-driven UI before it ships in every locale.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--text-body)]">
            Inspect screenshots from fitness apps, watch surfaces, GPS summaries, and metrics-heavy product
            flows. OCR extracts visible copy, then the checker surfaces likely overflow, RTL, placeholder,
            truncation, and font fallback risks for localization teams.
          </p>

          <div className="mt-5 flex flex-wrap gap-2 text-xs text-[var(--text-muted)]">
            <span className="panel-chip rounded-full px-3 py-1">Workout summaries</span>
            <span className="panel-chip rounded-full px-3 py-1">Wearable device UI</span>
            <span className="panel-chip rounded-full px-3 py-1">Metrics labels</span>
            <span className="panel-chip rounded-full px-3 py-1">GPS and sensor screens</span>
          </div>
        </div>

        <div className="grid w-full gap-3 xl:max-w-[360px]">
          {children}

          <div className="panel-muted rounded-[1.5rem] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">
                  Current pass
                </p>
                <p className="mt-2 text-sm font-medium text-[var(--text-strong)]">{status}</p>
              </div>
              <span className="panel-chip rounded-full px-3 py-1 text-[11px] text-[var(--text-body)]">
                {Math.round(progress * 100)}%
              </span>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/6">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,rgba(125,211,196,0.95)_0%,rgba(125,211,252,0.9)_100%)] transition-all duration-300"
                style={{ width: `${progress > 0 ? Math.max(8, Math.round(progress * 100)) : 0}%` }}
              />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
              <div className="rounded-2xl border border-white/6 bg-white/[0.03] px-3 py-3">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Locale</p>
                <p className="mt-2 font-medium text-[var(--text-strong)]">{languageLabel}</p>
              </div>
              <div className="rounded-2xl border border-white/6 bg-white/[0.03] px-3 py-3">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Flags</p>
                <p className="mt-2 font-medium text-[var(--text-strong)]">{issueCount}</p>
              </div>
              <div className="rounded-2xl border border-white/6 bg-white/[0.03] px-3 py-3">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">High</p>
                <p className="mt-2 font-medium text-[var(--text-strong)]">{highSeverityCount}</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/6 bg-black/20 px-3 py-3 text-sm text-[var(--text-body)]">
              <span className="text-[var(--text-strong)]">Active asset:</span>{' '}
              {currentAsset ?? 'Waiting for a workout or device screenshot'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
