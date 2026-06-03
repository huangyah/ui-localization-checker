import { cn } from '../utils/cn';
import type { DetectionIssue } from '../utils/types';
import { useTranslation } from 'react-i18next';

interface ImageInspectionCanvasProps {
  activeIssueId: string | null;
  imageSize: { width: number; height: number } | null;
  imageUrl: string | null;
  issues: DetectionIssue[];
  onIssueHover: (issueId: string | null) => void;
  phase: 'idle' | 'preparing' | 'running' | 'done' | 'error';
  status: string;
}

export function ImageInspectionCanvas({
  activeIssueId,
  imageSize,
  imageUrl,
  issues,
  onIssueHover,
  phase,
  status,
}: ImageInspectionCanvasProps) {
  const { t } = useTranslation();

  return (
    <div className="panel-muted cut-corner-panel rounded-[1.75rem] p-3">
      <div className="mb-4 flex items-center justify-between gap-3 px-2">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--tone-sky)]">{t('canvas.eyebrow')}</p>
          <p className="mt-1 text-sm text-[var(--text-body)]">
            {t('canvas.description')}
          </p>
        </div>
        <div className="status-badge rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[var(--text-body)]">
          {phase === 'done' ? t('qa.flagged', { count: issues.length }) : status}
        </div>
      </div>

      <div className="scan-stage grid-fade relative flex min-h-[420px] items-center justify-center rounded-[1.5rem] border border-white/8 p-4">
        {imageUrl && imageSize ? (
          <div className="relative max-h-[70vh] overflow-hidden rounded-[1.35rem] border border-[rgba(51,65,85,0.95)] bg-black/30 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
            <img
              alt={t('canvas.imageAlt')}
              className="block max-h-[70vh] w-auto max-w-full object-contain"
              src={imageUrl}
            />

            <div className="pointer-events-none absolute inset-0">
              {issues.map((issue, index) => (
                <button
                  key={issue.id}
                  aria-label={issue.title}
                  className={cn(
                    'pointer-events-auto absolute rounded-[0.9rem] border-2 border-[rgba(251,113,133,0.95)] bg-[rgba(251,113,133,0.08)] shadow-[0_0_0_1px_rgba(251,113,133,0.18),0_0_22px_rgba(251,113,133,0.24)] transition duration-200',
                    activeIssueId === issue.id &&
                      'bg-[rgba(251,113,133,0.16)] shadow-[0_0_0_1px_rgba(251,113,133,0.26),0_0_32px_rgba(251,113,133,0.4)]',
                  )}
                  onClick={() => onIssueHover(issue.id)}
                  onMouseEnter={() => onIssueHover(issue.id)}
                  onMouseLeave={() => onIssueHover(null)}
                  style={{
                    left: `${(issue.bbox.x / imageSize.width) * 100}%`,
                    top: `${(issue.bbox.y / imageSize.height) * 100}%`,
                    width: `${(issue.bbox.width / imageSize.width) * 100}%`,
                    height: `${(issue.bbox.height / imageSize.height) * 100}%`,
                  }}
                  type="button"
                >
                  <span className="absolute -top-6 left-0 rounded-full bg-[var(--tone-rose)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-white">
                    {index + 1}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-md text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-[rgba(59,130,246,0.3)] bg-[rgba(59,130,246,0.08)] text-xl font-semibold text-[var(--tone-sky)] shadow-[0_0_28px_rgba(59,130,246,0.12)]">
              RUN
            </div>
            <h3 className="mt-6 text-lg font-semibold text-[var(--text-strong)]">
              {t('canvas.emptyTitle')}
            </h3>
            <p className="mt-3 text-sm leading-6 text-[var(--text-body)]">
              {t('canvas.emptyDescription')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
