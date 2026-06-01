import type { LanguageOption, SupportedLanguage } from './types';

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  {
    value: 'en',
    label: 'English',
    tesseractCode: 'eng',
    expansionBaseline: 0,
    rtl: false,
    scriptPattern: /[A-Za-z]/,
  },
  {
    value: 'de',
    label: 'German',
    tesseractCode: 'deu+eng',
    expansionBaseline: 35,
    rtl: false,
    scriptPattern: /[A-Za-zÄÖÜäöüß]/,
  },
  {
    value: 'th',
    label: 'Thai',
    tesseractCode: 'tha+eng',
    expansionBaseline: 18,
    rtl: false,
    scriptPattern: /[\u0E00-\u0E7F]/,
  },
  {
    value: 'he',
    label: 'Hebrew',
    tesseractCode: 'heb+eng',
    expansionBaseline: 14,
    rtl: true,
    scriptPattern: /[\u0590-\u05FF]/,
  },
  {
    value: 'ar',
    label: 'Arabic',
    tesseractCode: 'ara+eng',
    expansionBaseline: 16,
    rtl: true,
    scriptPattern: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/,
  },
  {
    value: 'ko',
    label: 'Korean',
    tesseractCode: 'kor+eng',
    expansionBaseline: 10,
    rtl: false,
    scriptPattern: /[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7AF]/,
  },
  {
    value: 'ja',
    label: 'Japanese',
    tesseractCode: 'jpn+eng',
    expansionBaseline: 8,
    rtl: false,
    scriptPattern: /[\u3040-\u30FF\u4E00-\u9FFF]/,
  },
];

export function getLanguageConfig(language: SupportedLanguage) {
  return LANGUAGE_OPTIONS.find((option) => option.value === language) ?? LANGUAGE_OPTIONS[0];
}

