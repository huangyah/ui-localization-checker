import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import de from './locales/de.json';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import ja from './locales/ja.json';
import zhCN from './locales/zh-CN.json';
import zhTW from './locales/zh-TW.json';
import {
  UI_LANGUAGE_STORAGE_KEY,
  UI_LANGUAGE_VALUES,
  isUiLanguage,
  matchBrowserLanguage,
} from './utils/uiLanguages';

const SUPPORTED_LANGUAGES = UI_LANGUAGE_VALUES;

function getInitialLanguage() {
  if (typeof window === 'undefined') {
    return 'en';
  }

  const savedLanguage = window.localStorage.getItem(UI_LANGUAGE_STORAGE_KEY);
  if (savedLanguage && isUiLanguage(savedLanguage)) {
    return savedLanguage;
  }

  const browserLanguages = [window.navigator.language, ...(window.navigator.languages ?? [])].filter(Boolean);

  for (const browserLanguage of browserLanguages) {
    const matchedLanguage = matchBrowserLanguage(browserLanguage);

    if (matchedLanguage) {
      return matchedLanguage;
    }
  }

  return 'en';
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    'zh-CN': { translation: zhCN },
    'zh-TW': { translation: zhTW },
    fr: { translation: fr },
    es: { translation: es },
    de: { translation: de },
    ja: { translation: ja },
  },
  lng: getInitialLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  supportedLngs: SUPPORTED_LANGUAGES,
});

i18n.on('languageChanged', (language) => {
  if (typeof window !== 'undefined' && isUiLanguage(language)) {
    window.localStorage.setItem(UI_LANGUAGE_STORAGE_KEY, language);
  }
});

export default i18n;
