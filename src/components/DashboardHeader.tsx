import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface DashboardHeaderProps {
  currentAsset: string | null;
  issueCount: number;
  highSeverityCount: number;
  languageLabel: string;
  progress: number;
  status: string;
  uiLanguageLabel: string;
  uiLanguageShortLabel: string;
  children: ReactNode;
}

export function DashboardHeader({
  currentAsset,
  issueCount,
  highSeverityCount,
  languageLabel,
  progress,
  status,
  uiLanguageLabel,
  uiLanguageShortLabel,
  children,
}: DashboardHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="panel-shell cut-corner-panel rounded-[2rem] px-5 py-5 sm:px-6 sm:py-6">
      <div className="hero-decoration">
        <div className="hero-wave" />
        <div className="hero-arc" />
        <div className="hero-trace" />
        <div className="hero-dots" />
      </div>
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="status-badge rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-[var(--tone-sky)]">
              {t('dashboard.badge')}
            </span>
            <span className="status-badge rounded-full px-3 py-1 text-[11px] text-[var(--text-body)]">
              {t('dashboard.subbadge')}
            </span>
          </div>

          <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.05em] text-[var(--text-strong)] sm:text-[2.8rem]">
            {t('dashboard.title')}
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--text-body)]">
            {t('dashboard.description')}
          </p>

          <div className="mt-5 flex flex-wrap gap-2 text-xs text-[var(--text-muted)]">
            {(['0', '1', '2', '3'] as const).map((index) => (
              <span key={index} className="status-badge rounded-full px-3 py-1 text-[var(--text-body)]">
                {t(`dashboard.chips.${index}`)}
              </span>
            ))}
          </div>
        </div>

        <div className="relative z-10 grid w-full gap-3 xl:max-w-[360px]">
          <div className="flex justify-end">
            <span className="status-badge inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-medium text-[var(--tone-sky)] sm:text-xs">
              <span aria-hidden="true">🌐</span>
              <span className="hidden sm:inline">{uiLanguageLabel}</span>
              <span className="sm:hidden">{uiLanguageShortLabel}</span>
            </span>
          </div>
          {children}

          <div className="panel-muted interactive-panel cut-corner-panel rounded-[1.5rem] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--tone-sky)]">
                  {t('dashboard.currentPass')}
                </p>
                <p className="mt-2 text-sm font-medium text-[var(--text-strong)]">{status}</p>
              </div>
              <span className="status-badge rounded-full px-3 py-1 text-[11px] font-semibold text-[var(--tone-sky)]">
                {Math.round(progress * 100)}%
              </span>
            </div>

            <div className="sport-progress mt-4 h-2.5 rounded-full border border-white/6">
              <div
                className="sport-progress-fill h-full rounded-full transition-all duration-300"
                style={{ width: `${progress > 0 ? Math.max(8, Math.round(progress * 100)) : 0}%` }}
              />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--tone-sky)]">{t('dashboard.locale')}</p>
                <p className="metric-value mt-2 text-lg font-semibold text-[var(--text-strong)]">{languageLabel}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--tone-sky)]">{t('dashboard.flags')}</p>
                <p className="metric-value mt-2 text-2xl font-semibold text-[var(--text-strong)]">{issueCount}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--tone-sky)]">{t('dashboard.high')}</p>
                <p className="metric-value mt-2 text-2xl font-semibold text-[var(--text-strong)]">{highSeverityCount}</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/8 bg-black/20 px-3 py-3 text-sm text-[var(--text-body)]">
              <span className="text-[var(--tone-sky)]">{t('dashboard.activeAsset')}</span>{' '}
              {currentAsset ?? t('dashboard.activeAssetEmpty')}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
