import { cn } from '../utils/cn';
import type { LanguageOption, SupportedLanguage } from '../utils/types';

interface LanguageSelectorProps {
  label: string;
  onChange: (language: SupportedLanguage) => void;
  options: LanguageOption[];
  value: SupportedLanguage;
}

export function LanguageSelector({ label, onChange, options, value }: LanguageSelectorProps) {
  return (
    <label className="panel-muted grid gap-2 rounded-[1.5rem] px-4 py-3">
      <span className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">{label}</span>
      <div className="relative">
        <select
          className={cn(
            'w-full appearance-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 pr-10 text-sm text-[var(--text-strong)] outline-none transition',
            'focus:border-white/20 focus:ring-2 focus:ring-[rgba(125,211,196,0.24)]',
          )}
          onChange={(event) => onChange(event.target.value as SupportedLanguage)}
          value={value}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[var(--text-muted)]">
          ▾
        </span>
      </div>
    </label>
  );
}
