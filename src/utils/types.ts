export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type SupportedLanguage = 'en' | 'de' | 'th' | 'he' | 'ar' | 'ko' | 'ja';

export interface OcrWord {
  id: string;
  bbox: BoundingBox;
  confidence: number;
  lineId?: string;
  text: string;
}

export interface OcrLine {
  id: string;
  bbox: BoundingBox;
  confidence: number;
  text: string;
  words: OcrWord[];
}

export interface OcrExtraction {
  lines: OcrLine[];
  text: string;
  words: OcrWord[];
}

export type DetectionIssueCategory =
  | 'overflow'
  | 'rtl'
  | 'placeholder'
  | 'lineHeight'
  | 'truncation'
  | 'fontFallback';

export type IssueSeverity = 'High' | 'Medium' | 'Low';

export interface DetectionIssue {
  id: string;
  bbox: BoundingBox;
  category: DetectionIssueCategory;
  categoryLabel: string;
  charExpansionRisk: number;
  description: string;
  severity: IssueSeverity;
  suggestedFix: string;
  title: string;
}

export interface LanguageOption {
  expansionBaseline: number;
  label: string;
  rtl: boolean;
  scriptPattern: RegExp;
  tesseractCode: string;
  value: SupportedLanguage;
}
