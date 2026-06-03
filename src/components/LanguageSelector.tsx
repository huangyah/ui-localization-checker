import { cn } from '../utils/cn';
import type { LanguageOption, SupportedLanguage } from '../utils/types';
import { useTranslation } from 'react-i18next';

interface LanguageSelectorProps {
  label: string;
  onChange: (language: SupportedLanguage) => void;
  options: LanguageOption[];
  value: SupportedLanguage;
}

export function LanguageSelector({ label, onChange, options, value }: LanguageSelectorProps) {
  const { t } = useTranslation();

  return (
    <label className="panel-muted interactive-panel cut-corner-panel grid gap-2 rounded-[1.5rem] px-4 py-3">
      <span className="text-xs uppercase tracking-[0.24em] text-[var(--tone-sky)]">{label}</span>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--tone-cyan)] shadow-[0_0_12px_rgba(6,182,212,0.65)]" />
        </span>
        <select
          className={cn(
            'precision-select w-full appearance-none rounded-xl px-10 py-3 pr-10 text-sm text-[var(--text-strong)] outline-none transition',
          )}
          onChange={(event) => onChange(event.target.value as SupportedLanguage)}
          value={value}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {t(option.labelKey)}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[var(--tone-sky)]">
          ▾
        </span>
      </div>
    </label>
  );
}
