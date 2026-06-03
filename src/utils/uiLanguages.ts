export type UiLanguage = 'en' | 'zh-CN' | 'zh-TW' | 'ja' | 'de' | 'fr' | 'es';

export interface UiLanguageOption {
  value: UiLanguage;
  labelKey: string;
  shortLabel: string;
}

export const UI_LANGUAGE_STORAGE_KEY = 'ui-localization-checker:ui-language';

export const UI_LANGUAGE_OPTIONS: UiLanguageOption[] = [
  { value: 'en', labelKey: 'languageSwitcher.options.en', shortLabel: 'EN' },
  { value: 'zh-CN', labelKey: 'languageSwitcher.options.zh-CN', shortLabel: '简中' },
  { value: 'zh-TW', labelKey: 'languageSwitcher.options.zh-TW', shortLabel: '繁中' },
  { value: 'ja', labelKey: 'languageSwitcher.options.ja', shortLabel: 'JA' },
  { value: 'de', labelKey: 'languageSwitcher.options.de', shortLabel: 'DE' },
  { value: 'fr', labelKey: 'languageSwitcher.options.fr', shortLabel: 'FR' },
  { value: 'es', labelKey: 'languageSwitcher.options.es', shortLabel: 'ES' },
] as const;

export const UI_LANGUAGE_VALUES = UI_LANGUAGE_OPTIONS.map((option) => option.value);

export function isUiLanguage(value: string): value is UiLanguage {
  return UI_LANGUAGE_VALUES.includes(value as UiLanguage);
}

export function matchBrowserLanguage(language: string) {
  const normalized = language.toLowerCase();

  if (normalized.startsWith('zh-tw') || normalized.startsWith('zh-hk') || normalized.startsWith('zh-mo')) {
    return 'zh-TW' satisfies UiLanguage;
  }

  if (normalized.startsWith('zh')) {
    return 'zh-CN' satisfies UiLanguage;
  }

  if (normalized.startsWith('ja')) {
    return 'ja' satisfies UiLanguage;
  }

  if (normalized.startsWith('de')) {
    return 'de' satisfies UiLanguage;
  }

  if (normalized.startsWith('fr')) {
    return 'fr' satisfies UiLanguage;
  }

  if (normalized.startsWith('es')) {
    return 'es' satisfies UiLanguage;
  }

  if (normalized.startsWith('en')) {
    return 'en' satisfies UiLanguage;
  }

  return null;
}

export function getUiLanguageOption(language: string) {
  return UI_LANGUAGE_OPTIONS.find((option) => option.value === language) ?? UI_LANGUAGE_OPTIONS[0];
}
