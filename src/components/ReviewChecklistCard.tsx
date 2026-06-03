import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  return (
    <section className="panel-shell cut-corner-panel rounded-[1.75rem] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">
            {t('reviewGuidance.eyebrow')}
          </p>
          <h3 className="section-title mt-3 text-xl font-semibold tracking-[-0.03em]">
            {t('reviewGuidance.title')}
          </h3>
        </div>
        <span className="status-badge rounded-full px-3 py-1 text-[11px] text-[var(--text-body)]">
          {languageLabel}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="panel-muted interactive-panel rounded-2xl p-4">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--tone-sky)]">{t('reviewGuidance.expansion')}</p>
          <p className="metric-value mt-2 text-2xl font-semibold text-[var(--text-strong)]">{t('reviewGuidance.baseline', { value: expansionBaseline })}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--text-body)]">
            {t('reviewGuidance.expansionDescription')}
          </p>
        </div>
        <div className="panel-muted interactive-panel rounded-2xl p-4">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--tone-sky)]">{t('reviewGuidance.direction')}</p>
          <p className="metric-value mt-2 text-2xl font-semibold text-[var(--text-strong)]">{isRtl ? t('reviewGuidance.rtl') : t('reviewGuidance.ltr')}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--text-body)]">
            {isRtl ? t('reviewGuidance.rtlDescription') : t('reviewGuidance.ltrDescription')}
          </p>
        </div>
        <div className="panel-muted interactive-panel rounded-2xl p-4">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--tone-sky)]">{t('reviewGuidance.prioritySurfaces')}</p>
          <p className="metric-value mt-2 text-2xl font-semibold text-[var(--text-strong)]">{t('reviewGuidance.priorityTitle')}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--text-body)]">
            {t('reviewGuidance.priorityDescription')}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="panel-muted interactive-panel rounded-2xl p-4">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--tone-sky)]">{t('reviewGuidance.manualPass')}</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--text-body)]">
            {(['0', '1', '2'] as const).map((index) => (
              <li key={index}>{t(`reviewGuidance.manualPassItems.${index}`)}</li>
            ))}
          </ul>
        </div>
        <div className="panel-muted interactive-panel rounded-2xl p-4">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--tone-sky)]">{t('reviewGuidance.escalateWhen')}</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--text-body)]">
            {(['0', '1', '2'] as const).map((index) => (
              <li key={index}>{t(`reviewGuidance.escalateItems.${index}`)}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
