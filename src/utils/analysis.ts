import i18n from '../i18n';
import { getLanguageConfig } from './languages';
import type {
  BoundingBox,
  DetectionIssue,
  DetectionIssueCategory,
  OcrExtraction,
  OcrLine,
  SupportedLanguage,
} from './types';

interface AnalyzeLocalizationIssuesArgs {
  extraction: OcrExtraction;
  imageSize: { width: number; height: number };
  language: SupportedLanguage;
}

const placeholderPattern = /(%\d+\$[sd]|%[sd]|\{\{?\s*[\w.]+\s*\}?\}|:\w+)/g;

const riskModifierByCategory: Record<DetectionIssueCategory, number> = {
  overflow: 12,
  rtl: 6,
  placeholder: 8,
  lineHeight: 7,
  truncation: 10,
  fontFallback: 5,
};

const severityBonus = {
  High: 12,
  Medium: 7,
  Low: 3,
} as const;

const tallScriptLanguages: SupportedLanguage[] = ['th', 'ar', 'he', 'km', 'vi'];
const nonLatinLanguages: SupportedLanguage[] = ['th', 'ar', 'he', 'ko', 'ja', 'km', 'el', 'vi'];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function median(values: number[]) {
  if (!values.length) {
    return 0;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const midpoint = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[midpoint - 1] + sorted[midpoint]) / 2 : sorted[midpoint];
}

function hasScript(text: string, scriptPattern: RegExp) {
  return scriptPattern.test(text);
}

function extractPlaceholders(text: string) {
  return [...text.matchAll(placeholderPattern)].map((match) => match[0]);
}

function createIssue(
  category: DetectionIssueCategory,
  severity: DetectionIssue['severity'],
  title: string,
  description: string,
  suggestedFix: string,
  bbox: BoundingBox,
  language: SupportedLanguage,
  ordinal: number,
): DetectionIssue {
  const languageConfig = getLanguageConfig(language);

  return {
    id: `${category}-${ordinal}`,
    bbox,
    category,
    categoryLabel: i18n.t(`qa.categories.${category}`),
    charExpansionRisk: clamp(
      languageConfig.expansionBaseline + riskModifierByCategory[category] + severityBonus[severity],
      0,
      95,
    ),
    description,
    severity,
    suggestedFix,
    title,
  };
}

function lineTextLength(line: OcrLine) {
  return line.text.replace(/\s+/g, '').length;
}

function normalizeBBox(line: OcrLine) {
  return {
    x: line.bbox.x,
    y: line.bbox.y,
    width: Math.max(line.bbox.width, 28),
    height: Math.max(line.bbox.height, 18),
  };
}

function groupAdjacentLines(lines: OcrLine[]) {
  return [...lines]
    .sort((left, right) => left.bbox.y - right.bbox.y)
    .reduce<OcrLine[][]>((groups, line) => {
      const previousGroup = groups.at(-1);
      const previousLine = previousGroup?.at(-1);

      if (
        previousLine &&
        Math.abs(previousLine.bbox.x - line.bbox.x) < Math.max(previousLine.bbox.width, line.bbox.width) * 0.22 &&
        line.bbox.y - (previousLine.bbox.y + previousLine.bbox.height) < Math.max(previousLine.bbox.height, line.bbox.height) * 1.8
      ) {
        previousGroup?.push(line);
      } else {
        groups.push([line]);
      }

      return groups;
    }, []);
}

export function analyzeLocalizationIssues({
  extraction,
  imageSize,
  language,
}: AnalyzeLocalizationIssuesArgs): DetectionIssue[] {
  const issues: DetectionIssue[] = [];
  const languageConfig = getLanguageConfig(language);
  const lines = extraction.lines.filter((line) => line.text.trim().length > 0);
  const medianHeight = median(lines.map((line) => line.bbox.height));

  if (!lines.length) {
    return [
      createIssue(
        'fontFallback',
        'Low',
        i18n.t('issues.ocrLowText.title'),
        i18n.t('issues.ocrLowText.description'),
        i18n.t('issues.ocrLowText.fix'),
        { x: 24, y: 24, width: imageSize.width * 0.4, height: imageSize.height * 0.15 },
        language,
        1,
      ),
    ];
  }

  const lineGroups = groupAdjacentLines(lines);

  const overflowCandidates = lines
    .filter((line) => lineTextLength(line) >= 8)
    .map((line) => {
      const widthRatio = line.bbox.width / imageSize.width;
      const rightEdgeRatio = (line.bbox.x + line.bbox.width) / imageSize.width;
      return { line, score: widthRatio * 0.8 + rightEdgeRatio * 0.5 + lineTextLength(line) / 120 };
    })
    .filter(({ line, score }) => score > 0.58 || line.bbox.width / imageSize.width > 0.5)
    .sort((left, right) => right.score - left.score)
    .slice(0, 2);

  overflowCandidates.forEach(({ line }, index) => {
    const rightEdgeRatio = (line.bbox.x + line.bbox.width) / imageSize.width;
    const severity =
      rightEdgeRatio > 0.93 || languageConfig.expansionBaseline >= 25 || lineTextLength(line) >= 22
        ? 'High'
        : 'Medium';

    issues.push(
      createIssue(
        'overflow',
        severity,
        i18n.t('issues.overflow.title'),
        i18n.t('issues.overflow.description', { text: line.text }),
        i18n.t('issues.overflow.fix'),
        normalizeBBox(line),
        language,
        index + 1,
      ),
    );
  });

  if (languageConfig.rtl) {
    const languageLabel = i18n.t(languageConfig.labelKey);

    lines
      .filter((line) => hasScript(line.text, languageConfig.scriptPattern))
      .filter((line) => line.bbox.x / imageSize.width < 0.34 || (line.bbox.x + line.bbox.width) / imageSize.width < 0.72)
      .slice(0, 2)
      .forEach((line, index) => {
        issues.push(
          createIssue(
            'rtl',
            'High',
            i18n.t('issues.rtl.title'),
            i18n.t('issues.rtl.description', { language: languageLabel, text: line.text }),
            i18n.t('issues.rtl.fix'),
            normalizeBBox(line),
            language,
            index + 1,
          ),
        );
      });
  }

  lines
    .filter((line) => extractPlaceholders(line.text).length > 0)
    .forEach((line, index) => {
      const placeholders = extractPlaceholders(line.text);
      const numericOrder = placeholders
        .map((placeholder) => placeholder.match(/\d+/)?.[0])
        .filter(Boolean)
        .map(Number);

      const descending = numericOrder.length > 1 && numericOrder.some((value, position) => value < numericOrder[position - 1]);
      const duplicateTokens = new Set(placeholders).size !== placeholders.length;
      const rtlPlaceholderRisk = languageConfig.rtl && hasScript(line.text, languageConfig.scriptPattern);

      if (descending || duplicateTokens || rtlPlaceholderRisk) {
        issues.push(
          createIssue(
            'placeholder',
            descending ? 'High' : 'Medium',
            i18n.t('issues.placeholder.title'),
            i18n.t('issues.placeholder.description', { text: line.text }),
            i18n.t('issues.placeholder.fix'),
            normalizeBBox(line),
            language,
            index + 1,
          ),
        );
      }
    });

  const crowdedLines = [...lines]
    .sort((left, right) => left.bbox.y - right.bbox.y)
    .filter((line, index, collection) => {
      const nextLine = collection[index + 1];

      if (!nextLine) {
        return false;
      }

      const gap = nextLine.bbox.y - (line.bbox.y + line.bbox.height);
      const likelyTallScript = tallScriptLanguages.includes(language) || /[gjpqy]/i.test(line.text);
      return likelyTallScript && (line.bbox.height < medianHeight * 0.8 || gap < medianHeight * 0.15);
    })
    .slice(0, 2);

  crowdedLines.forEach((line, index) => {
    issues.push(
      createIssue(
        'lineHeight',
        language === 'th' || language === 'km' ? 'High' : 'Medium',
        i18n.t('issues.lineHeight.title'),
        i18n.t('issues.lineHeight.description', { text: line.text }),
        i18n.t('issues.lineHeight.fix'),
        normalizeBBox(line),
        language,
        index + 1,
      ),
    );
  });

  lineGroups.forEach((group, index) => {
    if (group.length < 2) {
      return;
    }

    const secondLine = group[1];
    const firstLine = group[0];
    const endsWithEllipsis = /(\.\.\.|…)$/.test(secondLine.text.trim());
    const widthDrop = firstLine.bbox.width > secondLine.bbox.width * 1.9;
    const suspiciousEnding = !/[.!?)]$/.test(secondLine.text.trim());

    if (endsWithEllipsis || (widthDrop && suspiciousEnding)) {
      issues.push(
        createIssue(
          'truncation',
          endsWithEllipsis ? 'High' : 'Medium',
          i18n.t('issues.truncation.title'),
          i18n.t('issues.truncation.description', { text: secondLine.text }),
          i18n.t('issues.truncation.fix'),
          normalizeBBox(secondLine),
          language,
          index + 1,
        ),
      );
    }
  });

  if (language !== 'en' && language !== 'de') {
    const languageLabel = i18n.t(languageConfig.labelKey);
    const expectedScriptLines = lines.filter((line) => hasScript(line.text, languageConfig.scriptPattern));
    const confidenceAverage = expectedScriptLines.length
      ? expectedScriptLines.reduce((total, line) => total + line.confidence, 0) / expectedScriptLines.length
      : 0;
    const tallestLine = expectedScriptLines.reduce<OcrLine | null>(
      (currentTallest, line) =>
        !currentTallest || line.bbox.height > currentTallest.bbox.height ? line : currentTallest,
      null,
    );
    const heightOutlier = tallestLine ? tallestLine.bbox.height > medianHeight * 1.35 : false;

    const confidenceFloor = nonLatinLanguages.includes(language) ? 76 : 80;

    if (!expectedScriptLines.length || confidenceAverage < confidenceFloor || heightOutlier) {
      const fallbackLine = tallestLine ?? lines[0];

      issues.push(
        createIssue(
          'fontFallback',
          expectedScriptLines.length ? 'Medium' : 'Low',
          i18n.t('issues.fontFallback.title'),
          expectedScriptLines.length
            ? i18n.t('issues.fontFallback.descriptionSized', { text: fallbackLine.text })
            : i18n.t('issues.fontFallback.descriptionMissing', { language: languageLabel }),
          i18n.t('issues.fontFallback.fix'),
          normalizeBBox(fallbackLine),
          language,
          1,
        ),
      );
    }
  }

  return issues
    .filter(
      (issue, index, collection) =>
        collection.findIndex(
          (candidate) =>
            candidate.title === issue.title &&
            candidate.bbox.x === issue.bbox.x &&
            candidate.bbox.y === issue.bbox.y,
        ) === index,
    )
    .sort((left, right) => {
      const order = { High: 0, Medium: 1, Low: 2 };
      return order[left.severity] - order[right.severity];
    });
}
