import { cn } from '../utils/cn';
import { getLanguageConfig } from '../utils/languages';
import type { DetectionIssue, SupportedLanguage } from '../utils/types';
import { useTranslation } from 'react-i18next';

interface QAReportPanelProps {
  activeIssueId: string | null;
  errorMessage: string | null;
  extractedText: string;
  imageName: string | null;
  issues: DetectionIssue[];
  language: SupportedLanguage;
  onIssueHover: (issueId: string | null) => void;
  phase: 'idle' | 'preparing' | 'running' | 'done' | 'error';
}

const severityClassNames = {
  High: 'severity-high',
  Medium: 'severity-medium',
  Low: 'severity-low',
} as const;

export function QAReportPanel({
  activeIssueId,
  errorMessage,
  extractedText,
  imageName,
  issues,
  language,
  onIssueHover,
  phase,
}: QAReportPanelProps) {
  const { t } = useTranslation();
  const languageLabel = t(getLanguageConfig(language).labelKey);
  const isIdle = phase === 'idle' || phase === 'preparing';

  return (
    <aside className="panel-shell cut-corner-panel rounded-[2rem] p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">{t('qa.title')}</p>
          <h2 className="section-title mt-3 text-2xl font-semibold tracking-[-0.04em]">
            {t('qa.title')}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text-body)]">
            {t('qa.subtitle', { language: languageLabel })}
          </p>
        </div>
        <div className="status-badge rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[var(--text-body)]">
          {t('qa.flagged', { count: issues.length })}
        </div>
      </div>

      <div className="panel-muted mt-4 rounded-2xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--tone-sky)]">{t('qa.currentAsset')}</p>
            <p className="mt-2 text-sm font-medium text-[var(--text-strong)]">
              {imageName ?? t('qa.noAsset')}
            </p>
          </div>
          <div className="status-badge rounded-full px-3 py-1 text-[11px] text-[var(--text-body)]">
            {phase === 'running' ? t('qa.ocrInProgress') : phase === 'done' ? t('qa.readyToReview') : t('qa.standby')}
          </div>
        </div>
      </div>

      {errorMessage ? (
        <div className="mt-4 rounded-2xl border border-[rgba(251,113,133,0.22)] bg-[rgba(251,113,133,0.08)] p-4 text-sm text-[var(--text-strong)]">
          {errorMessage}
        </div>
      ) : null}

      <div className="mt-4 space-y-3">
        {isIdle ? (
          <div className="panel-muted rounded-2xl p-4">
            <h3 className="text-sm font-medium text-[var(--text-strong)]">{t('qa.waitingTitle')}</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--text-body)]">
              {t('qa.waitingDescription')}
            </p>
          </div>
        ) : null}

        {issues.map((issue, index) => (
          <article
            key={issue.id}
            className={cn(
              'interactive-panel rounded-2xl border p-4 transition duration-200',
              index % 2 === 0 ? 'report-zebra border-[rgba(51,65,85,0.95)]' : 'report-zebra-alt border-[rgba(51,65,85,0.95)]',
              activeIssueId === issue.id && 'border-[rgba(251,113,133,0.26)] bg-[rgba(251,113,133,0.08)]',
            )}
            onMouseEnter={() => onIssueHover(issue.id)}
            onMouseLeave={() => onIssueHover(null)}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">
                  {t('qa.issue', { index: index + 1 })}
                </div>
                <h3 className="mt-2 text-sm font-medium text-[var(--text-strong)]">{issue.title}</h3>
              </div>
              <div className={cn('rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]', severityClassNames[issue.severity])}>
                {t(`qa.severity.${issue.severity}`)}
              </div>
            </div>

            <p className="mt-3 text-sm leading-6 text-[var(--text-body)]">{issue.description}</p>
            <p className="mt-3 text-sm text-[var(--text-body)]">
              <span className="text-[var(--tone-sky)]">{t('qa.suggestedFix')}</span> {issue.suggestedFix}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="status-badge rounded-full px-2.5 py-1 text-[11px] text-[var(--text-body)]">
                {t('qa.characterExpansionRisk', { risk: issue.charExpansionRisk })}
              </span>
              <span className="status-badge rounded-full px-2.5 py-1 text-[11px] text-[var(--text-body)]">
                {issue.categoryLabel}
              </span>
            </div>
          </article>
        ))}

        {phase === 'done' && issues.length === 0 ? (
          <div className="rounded-2xl border border-[rgba(125,211,196,0.18)] bg-[rgba(125,211,196,0.08)] p-4">
            <h3 className="text-sm font-medium text-[var(--text-strong)]">
              {t('qa.noIssuesTitle')}
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--text-body)]">
              {t('qa.noIssuesDescription')}
            </p>
          </div>
        ) : null}
      </div>

      <div className="panel-muted mt-4 rounded-2xl p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--tone-sky)]">{t('qa.extractedText')}</p>
          <span className="status-badge rounded-full px-2.5 py-1 text-[11px] text-[var(--text-body)]">
            {t('qa.ocrTag')}
          </span>
        </div>
        <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded-xl border border-[rgba(51,65,85,0.95)] bg-black/20 p-3 font-mono text-xs leading-6 text-[var(--text-body)]">
          {extractedText || t('qa.ocrOutputPlaceholder')}
        </pre>
      </div>
    </aside>
  );
}
