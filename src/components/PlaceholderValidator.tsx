import { useEffect, useMemo, useState } from 'react';
import { validatePlaceholders } from '../utils/placeholder';
import type { PlaceholderIssue } from '../utils/types';
import { cn } from '../utils/cn';

const DEMO_SOURCE = 'Completed %1$d of %2$d steps. Welcome, %s!';
const DEMO_TRANSLATION = 'Abgeschlossen %2$d von %1$d Schritten. Willkommen!';

type PlaceholderStyle = 'auto' | 'android' | 'ios' | 'web' | 'dotnet';

interface PlaceholderValidatorProps {
  onIssuesChange: (issues: PlaceholderIssue[]) => void;
}

const placeholderStyles: Array<{ label: string; value: PlaceholderStyle }> = [
  { label: '自动识别', value: 'auto' },
  { label: 'Android（%d %s）', value: 'android' },
  { label: 'iOS（%@）', value: 'ios' },
  { label: 'Web（{{name}}）', value: 'web' },
  { label: '.NET（{0}）', value: 'dotnet' },
];

const issueTypeLabels: Record<PlaceholderIssue['type'], string> = {
  missing: '占位符缺失',
  extra: '多余占位符',
  order: '顺序错误',
  type: '类型错误',
  format: '格式错误',
};

const severityLabels: Record<PlaceholderIssue['severity'], string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
};

const severityIcons: Record<PlaceholderIssue['severity'], string> = {
  critical: '🔴',
  high: '🟠',
  medium: '🟡',
};

const severityStyles: Record<PlaceholderIssue['severity'], string> = {
  critical: 'bg-[#EF4444] text-white shadow-[0_0_18px_rgba(239,68,68,0.24)]',
  high: 'bg-[#F97316] text-white shadow-[0_0_18px_rgba(249,115,22,0.24)]',
  medium: 'bg-[#F59E0B] text-[#0F172A] shadow-[0_0_18px_rgba(245,158,11,0.18)]',
};

export function PlaceholderValidator({ onIssuesChange }: PlaceholderValidatorProps) {
  const [sourceText, setSourceText] = useState(DEMO_SOURCE);
  const [translationText, setTranslationText] = useState(DEMO_TRANSLATION);
  const [placeholderStyle, setPlaceholderStyle] = useState<PlaceholderStyle>('auto');
  const [issues, setIssues] = useState<PlaceholderIssue[]>(() => validatePlaceholders(DEMO_SOURCE, DEMO_TRANSLATION));

  const hasCriticalIssue = useMemo(() => issues.some((issue) => issue.severity === 'critical'), [issues]);

  useEffect(() => {
    onIssuesChange(issues);
  }, [issues, onIssuesChange]);

  function handleValidate() {
    setIssues(validatePlaceholders(sourceText, translationText));
  }

  return (
    <section className="panel-shell cut-corner-panel rounded-[1.75rem] bg-[#1E293B] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#3B82F6]">Placeholder QA</p>
          <h2 className="section-title mt-3 text-xl font-semibold tracking-[-0.03em] text-[#3B82F6]">
            占位符校验
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text-body)]">
            检测源文本与译文之间的缺失、多余、顺序、类型与格式占位符问题。
          </p>
        </div>

        <span
          className={cn(
            'inline-flex shrink-0 items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold text-white',
            hasCriticalIssue ? 'bg-[#EF4444]' : issues.length ? 'bg-[#F97316]' : 'bg-[#10B981]',
          )}
        >
          {issues.length} Issues
        </span>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-[var(--text-body)]">
          源文本
          <textarea
            className="min-h-32 resize-y rounded-2xl border border-[#334155] bg-[#0F172A]/80 px-4 py-3 text-sm leading-6 text-[var(--text-strong)] outline-none transition focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.16)]"
            value={sourceText}
            onChange={(event) => setSourceText(event.target.value)}
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-[var(--text-body)]">
          译文
          <textarea
            className="min-h-32 resize-y rounded-2xl border border-[#334155] bg-[#0F172A]/80 px-4 py-3 text-sm leading-6 text-[var(--text-strong)] outline-none transition focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.16)]"
            value={translationText}
            onChange={(event) => setTranslationText(event.target.value)}
          />
        </label>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <label className="grid gap-2 text-sm font-medium text-[var(--text-body)]">
          占位符格式风格
          <select
            className="precision-select h-12 rounded-2xl px-4 text-sm text-[var(--text-strong)] outline-none"
            value={placeholderStyle}
            onChange={(event) => setPlaceholderStyle(event.target.value as PlaceholderStyle)}
          >
            {placeholderStyles.map((style) => (
              <option key={style.value} value={style.value}>
                {style.label}
              </option>
            ))}
          </select>
        </label>

        <button
          className="gradient-button inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
          type="button"
          onClick={handleValidate}
        >
          <span aria-hidden="true">▶</span>
          执行校验
        </button>
      </div>

      <div className="mt-5 grid gap-3" aria-live="polite">
        {issues.length === 0 ? (
          <div className="rounded-2xl border border-[rgba(16,185,129,0.32)] bg-[#10B981] px-4 py-4 text-sm font-semibold text-white shadow-[0_0_24px_rgba(16,185,129,0.18)]">
            ✅ 所有占位符校验通过 — 未发现问题。
          </div>
        ) : (
          issues.map((issue, index) => (
            <article
              key={`${issue.type}-${issue.placeholder}-${index}`}
              className="interactive-panel rounded-2xl border border-[#334155] bg-[#1E293B] p-4 transition hover:border-[#3B82F6] hover:shadow-[0_0_22px_rgba(59,130,246,0.2)]"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold',
                    severityStyles[issue.severity],
                  )}
                >
                  <span aria-hidden="true">{severityIcons[issue.severity]}</span>
                  {severityLabels[issue.severity]}
                </span>
                <span className="rounded-full border border-[#334155] bg-[#0F172A]/72 px-3 py-1 text-xs font-semibold text-[var(--text-strong)]">
                  {issueTypeLabels[issue.type]}
                </span>
              </div>

              <p className="mt-3 text-sm leading-6 text-[var(--text-body)]">{issue.description}</p>
              <p className="mt-3 rounded-2xl border border-[#334155] bg-[#0F172A]/60 px-3 py-3 text-sm leading-6 text-[var(--text-strong)]">
                <span className="font-semibold text-[#3B82F6]">修复建议：</span>
                {issue.suggestion}
              </p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export { DEMO_SOURCE as PLACEHOLDER_DEMO_SOURCE, DEMO_TRANSLATION as PLACEHOLDER_DEMO_TRANSLATION };
