import { useTranslation } from 'react-i18next';
import { UI_LANGUAGE_OPTIONS, getUiLanguageOption } from '../utils/uiLanguages';

export function InterfaceLanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const activeLanguage = getUiLanguageOption(i18n.resolvedLanguage ?? i18n.language);

  return (
    <label className="panel-muted interactive-panel cut-corner-panel grid gap-2 rounded-[1.5rem] px-4 py-3">
      <span className="text-xs uppercase tracking-[0.24em] text-[var(--tone-violet)]">
        {t('languageSwitcher.label')}
      </span>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--tone-violet)] shadow-[0_0_12px_rgba(139,92,246,0.5)]" />
        </span>
        <select
          className="precision-select w-full appearance-none rounded-xl px-10 py-3 pr-10 text-sm text-[var(--text-strong)] outline-none transition"
          onChange={(event) => void i18n.changeLanguage(event.target.value)}
          value={activeLanguage.value}
        >
          {UI_LANGUAGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {t(option.labelKey)}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[var(--tone-violet)]">
          ▾
        </span>
      </div>
    </label>
  );
}
