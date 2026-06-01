import { cn } from '../utils/cn';
import type { DetectionIssue } from '../utils/types';

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
  return (
    <div className="panel-muted rounded-[1.75rem] p-3">
      <div className="mb-4 flex items-center justify-between gap-3 px-2">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">Annotated preview</p>
          <p className="mt-1 text-sm text-[var(--text-body)]">
            Overlay boxes mark suspicious copy regions on the selected sports UI surface.
          </p>
        </div>
        <div className="panel-chip rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[var(--text-body)]">
          {phase === 'done' ? `${issues.length} flags` : status}
        </div>
      </div>

      <div className="grid-fade flex min-h-[420px] items-center justify-center rounded-[1.5rem] border border-white/8 bg-[linear-gradient(180deg,rgba(13,16,22,0.82)_0%,rgba(7,9,13,0.96)_100%)] p-4">
        {imageUrl && imageSize ? (
          <div className="relative max-h-[70vh] overflow-hidden rounded-[1.35rem] border border-white/10 bg-black/30 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
            <img
              alt="Uploaded UI screenshot"
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
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-white/12 bg-white/4 text-xl text-[var(--text-muted)]">
              QA
            </div>
            <h3 className="mt-6 text-lg font-semibold text-[var(--text-strong)]">
              Upload a sports product screenshot to begin.
            </h3>
            <p className="mt-3 text-sm leading-6 text-[var(--text-body)]">
              OCR output, language-specific heuristics, and flagged bounding boxes will appear here after you
              add a PNG or JPG from a mobile app, watch UI, or metrics-heavy device screen.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
