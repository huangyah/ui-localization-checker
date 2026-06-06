import type { PlaceholderIssue } from './types';

type PlaceholderFamily = 'printf' | 'mustache' | 'template' | 'bracedIndex';

interface PlaceholderToken {
  raw: string;
  family: PlaceholderFamily;
  type: string;
  index?: string;
  key: string;
  sequence: number;
  matched: boolean;
}

const PRINTF_PLACEHOLDER = /(?<!%)%(?!%)(?:(\d+)\$)?([dsf@])/g;
const MUSTACHE_PLACEHOLDER = /{{\s*([A-Za-z_$][\w$.-]*)\s*}}/g;
const TEMPLATE_PLACEHOLDER = /\$\{\s*([A-Za-z_$][\w$.-]*)\s*}/g;
const BRACED_INDEX_PLACEHOLDER = /(?<!{){(\d+)}(?!})/g;

const FAMILY_LABELS: Record<PlaceholderFamily, string> = {
  printf: 'printf',
  mustache: '{{name}}',
  template: '${variable}',
  bracedIndex: '{0}',
};

function parsePlaceholders(text: string): PlaceholderToken[] {
  const tokens: Array<Omit<PlaceholderToken, 'sequence' | 'matched'> & { start: number }> = [];

  for (const match of text.matchAll(PRINTF_PLACEHOLDER)) {
    const index = match[1];
    const type = match[2];

    tokens.push({
      raw: match[0],
      family: 'printf',
      type,
      index,
      key: index ?? type,
      start: match.index ?? 0,
    });
  }

  for (const match of text.matchAll(MUSTACHE_PLACEHOLDER)) {
    tokens.push({
      raw: match[0],
      family: 'mustache',
      type: 'named',
      key: match[1],
      start: match.index ?? 0,
    });
  }

  for (const match of text.matchAll(TEMPLATE_PLACEHOLDER)) {
    tokens.push({
      raw: match[0],
      family: 'template',
      type: 'named',
      key: match[1],
      start: match.index ?? 0,
    });
  }

  for (const match of text.matchAll(BRACED_INDEX_PLACEHOLDER)) {
    tokens.push({
      raw: match[0],
      family: 'bracedIndex',
      type: 'indexed',
      index: match[1],
      key: match[1],
      start: match.index ?? 0,
    });
  }

  return tokens
    .sort((a, b) => a.start - b.start)
    .map((token, sequence) => ({ ...token, sequence, matched: false }));
}

function addIssueOnce(issues: PlaceholderIssue[], nextIssue: PlaceholderIssue) {
  const exists = issues.some(
    (issue) =>
      issue.type === nextIssue.type &&
      issue.placeholder === nextIssue.placeholder &&
      issue.description === nextIssue.description,
  );

  if (!exists) {
    issues.push(nextIssue);
  }
}

function findUnmatched(
  tokens: PlaceholderToken[],
  predicate: (token: PlaceholderToken) => boolean,
): PlaceholderToken | undefined {
  return tokens.find((token) => !token.matched && predicate(token));
}

function placeholdersMatchExactly(source: PlaceholderToken, translation: PlaceholderToken) {
  return source.raw === translation.raw && source.family === translation.family && source.type === translation.type;
}

function canCompareTypes(source: PlaceholderToken, translation: PlaceholderToken) {
  if (source.family !== 'printf' || translation.family !== 'printf') {
    return false;
  }

  if (source.index || translation.index) {
    return source.index === translation.index && Boolean(source.index);
  }

  return source.sequence === translation.sequence;
}

function canCompareFormats(source: PlaceholderToken, translation: PlaceholderToken) {
  if (source.family === translation.family) {
    return false;
  }

  const sameKey = source.key === translation.key;
  const sameSequence = source.sequence === translation.sequence;

  return sameKey || sameSequence;
}

function getPositionalPrintfSequence(tokens: PlaceholderToken[]) {
  return tokens.filter((token) => token.family === 'printf' && token.index).map((token) => token.raw);
}

function hasSamePlaceholderMultiset(source: string[], translation: string[]) {
  if (source.length !== translation.length) {
    return false;
  }

  const counts = new Map<string, number>();

  for (const placeholder of source) {
    counts.set(placeholder, (counts.get(placeholder) ?? 0) + 1);
  }

  for (const placeholder of translation) {
    const count = counts.get(placeholder) ?? 0;

    if (count === 0) {
      return false;
    }

    if (count === 1) {
      counts.delete(placeholder);
    } else {
      counts.set(placeholder, count - 1);
    }
  }

  return counts.size === 0;
}

function hasDifferentOrder(source: string[], translation: string[]) {
  return source.some((placeholder, index) => placeholder !== translation[index]);
}

function formatOrderSwapDescription(sourceOrder: string[], translationOrder: string[]) {
  const swapped = sourceOrder.filter((placeholder, index) => placeholder !== translationOrder[index]);

  if (swapped.length >= 2) {
    return `位置索引占位符顺序错误：${swapped[0]} 和 ${swapped[1]} 在译文中位置互换。`;
  }

  return '位置索引占位符顺序与源文本不一致。';
}

export function validatePlaceholders(source: string, translation: string): PlaceholderIssue[] {
  const sourceTokens = parsePlaceholders(source);
  const translationTokens = parsePlaceholders(translation);
  const issues: PlaceholderIssue[] = [];

  const sourceOrder = getPositionalPrintfSequence(sourceTokens);
  const translationOrder = getPositionalPrintfSequence(translationTokens);

  if (
    sourceOrder.length > 1 &&
    hasSamePlaceholderMultiset(sourceOrder, translationOrder) &&
    hasDifferentOrder(sourceOrder, translationOrder)
  ) {
    addIssueOnce(issues, {
      type: 'order',
      severity: 'high',
      placeholder: sourceOrder.join(' → '),
      description: formatOrderSwapDescription(sourceOrder, translationOrder),
      suggestion: `按照源文本顺序放置位置索引占位符：${sourceOrder.join('，')}。`,
    });
  }

  for (const sourceToken of sourceTokens) {
    const translationToken = findUnmatched(translationTokens, (candidate) => placeholdersMatchExactly(sourceToken, candidate));

    if (translationToken) {
      sourceToken.matched = true;
      translationToken.matched = true;
    }
  }

  for (const sourceToken of sourceTokens) {
    if (sourceToken.matched) {
      continue;
    }

    const translationToken = findUnmatched(translationTokens, (candidate) => canCompareTypes(sourceToken, candidate));

    if (!translationToken || sourceToken.type === translationToken.type) {
      continue;
    }

    sourceToken.matched = true;
    translationToken.matched = true;

    addIssueOnce(issues, {
      type: 'type',
      severity: 'medium',
      placeholder: `${sourceToken.raw} → ${translationToken.raw}`,
      description: `占位符类型错误：源文本使用 ${sourceToken.raw}，译文改成了 ${translationToken.raw}。`,
      suggestion: `将译文中的 ${translationToken.raw} 改回与源文本一致的 ${sourceToken.raw}。`,
    });
  }

  for (const sourceToken of sourceTokens) {
    if (sourceToken.matched) {
      continue;
    }

    const translationToken = findUnmatched(translationTokens, (candidate) => canCompareFormats(sourceToken, candidate));

    if (!translationToken) {
      continue;
    }

    sourceToken.matched = true;
    translationToken.matched = true;

    addIssueOnce(issues, {
      type: 'format',
      severity: 'high',
      placeholder: `${sourceToken.raw} → ${translationToken.raw}`,
      description: `占位符格式错误：源文本使用 ${FAMILY_LABELS[sourceToken.family]} 格式 ${sourceToken.raw}，译文改成了 ${FAMILY_LABELS[translationToken.family]} 格式 ${translationToken.raw}。`,
      suggestion: `保持占位符格式一致，将 ${translationToken.raw} 改为 ${sourceToken.raw}。`,
    });
  }

  for (const sourceToken of sourceTokens) {
    if (sourceToken.matched) {
      continue;
    }

    addIssueOnce(issues, {
      type: 'missing',
      severity: 'critical',
      placeholder: sourceToken.raw,
      description: `源文本中的 ${sourceToken.raw} 在译文中消失。`,
      suggestion: `在译文的正确位置添加 ${sourceToken.raw}。`,
    });
  }

  for (const translationToken of translationTokens) {
    if (translationToken.matched) {
      continue;
    }

    addIssueOnce(issues, {
      type: 'extra',
      severity: 'high',
      placeholder: translationToken.raw,
      description: `译文中出现了源文本没有的占位符 ${translationToken.raw}。`,
      suggestion: `删除 ${translationToken.raw}，或确认源文本中也包含对应占位符。`,
    });
  }

  return issues;
}
