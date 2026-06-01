import type { BoundingBox, OcrExtraction, OcrLine, OcrWord } from './types';

function toBoundingBox(node: unknown): BoundingBox | null {
  if (!node || typeof node !== 'object') {
    return null;
  }

  const source = 'bbox' in node ? (node as { bbox?: unknown }).bbox : node;

  if (!source || typeof source !== 'object') {
    return null;
  }

  const maybeBox = source as Record<string, unknown>;

  if (
    typeof maybeBox.x0 === 'number' &&
    typeof maybeBox.y0 === 'number' &&
    typeof maybeBox.x1 === 'number' &&
    typeof maybeBox.y1 === 'number'
  ) {
    return {
      x: maybeBox.x0,
      y: maybeBox.y0,
      width: maybeBox.x1 - maybeBox.x0,
      height: maybeBox.y1 - maybeBox.y0,
    };
  }

  if (
    typeof maybeBox.left === 'number' &&
    typeof maybeBox.top === 'number' &&
    typeof maybeBox.right === 'number' &&
    typeof maybeBox.bottom === 'number'
  ) {
    return {
      x: maybeBox.left,
      y: maybeBox.top,
      width: maybeBox.right - maybeBox.left,
      height: maybeBox.bottom - maybeBox.top,
    };
  }

  return null;
}

function readConfidence(node: Record<string, unknown>) {
  const candidate = node.confidence ?? node.conf;
  return typeof candidate === 'number' ? candidate : 0;
}

function normalizeWord(wordNode: Record<string, unknown>, index: number): OcrWord | null {
  const bbox = toBoundingBox(wordNode);
  const text =
    typeof wordNode.text === 'string'
      ? wordNode.text.trim()
      : typeof wordNode.symbol === 'string'
        ? wordNode.symbol.trim()
        : '';

  if (!bbox || !text) {
    return null;
  }

  return {
    id: `word-${index}-${bbox.x}-${bbox.y}`,
    bbox,
    confidence: readConfidence(wordNode),
    text,
  };
}

function collectLineNodes(root: Record<string, unknown>) {
  const found = new Set<Record<string, unknown>>();

  function visit(value: unknown) {
    if (!value) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }

    if (typeof value !== 'object') {
      return;
    }

    const node = value as Record<string, unknown>;

    if (Array.isArray(node.lines)) {
      node.lines.forEach((line) => {
        if (line && typeof line === 'object') {
          found.add(line as Record<string, unknown>);
        }
      });
    }

    Object.values(node).forEach(visit);
  }

  visit(root);
  return [...found];
}

function normalizeLine(lineNode: Record<string, unknown>, index: number): OcrLine | null {
  const bbox = toBoundingBox(lineNode);
  const text = typeof lineNode.text === 'string' ? lineNode.text.trim() : '';

  if (!bbox || !text) {
    return null;
  }

  const lineId = `line-${index}-${bbox.x}-${bbox.y}`;
  const rawWords = Array.isArray(lineNode.words) ? lineNode.words : [];
  const words = rawWords
    .map((wordNode, wordIndex) =>
      wordNode && typeof wordNode === 'object'
        ? normalizeWord(wordNode as Record<string, unknown>, wordIndex)
        : null,
    )
    .filter((word): word is OcrWord => Boolean(word))
    .map((word) => ({ ...word, id: `${lineId}-${word.id}`, lineId }));

  return {
    id: lineId,
    bbox,
    confidence: readConfidence(lineNode),
    text,
    words: words.length
      ? words
      : [
          {
            id: `${lineId}-word-0`,
            bbox,
            confidence: readConfidence(lineNode),
            lineId,
            text,
          },
        ],
  };
}

function groupWordsIntoLines(words: OcrWord[]): OcrLine[] {
  const sortedWords = [...words].sort(
    (left, right) => left.bbox.y - right.bbox.y || left.bbox.x - right.bbox.x,
  );

  return sortedWords.reduce<OcrLine[]>((lines, word) => {
    const previousLine = lines.at(-1);

    if (
      previousLine &&
      Math.abs(previousLine.bbox.y - word.bbox.y) < Math.max(previousLine.bbox.height, word.bbox.height) * 0.75
    ) {
      previousLine.words.push({ ...word, lineId: previousLine.id });
      previousLine.text = `${previousLine.text} ${word.text}`.trim();
      previousLine.confidence =
        (previousLine.confidence * (previousLine.words.length - 1) + word.confidence) / previousLine.words.length;
      previousLine.bbox = {
        x: Math.min(previousLine.bbox.x, word.bbox.x),
        y: Math.min(previousLine.bbox.y, word.bbox.y),
        width:
          Math.max(previousLine.bbox.x + previousLine.bbox.width, word.bbox.x + word.bbox.width) -
          Math.min(previousLine.bbox.x, word.bbox.x),
        height:
          Math.max(previousLine.bbox.y + previousLine.bbox.height, word.bbox.y + word.bbox.height) -
          Math.min(previousLine.bbox.y, word.bbox.y),
      };
    } else {
      lines.push({
        id: `line-fallback-${lines.length}`,
        bbox: { ...word.bbox },
        confidence: word.confidence,
        text: word.text,
        words: [{ ...word, lineId: `line-fallback-${lines.length}` }],
      });
    }

    return lines;
  }, []);
}

function normalizeOcrData(data: unknown): OcrExtraction {
  const root = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>;
  const lineNodes = collectLineNodes(root);
  let lines = lineNodes
    .map((lineNode, index) => normalizeLine(lineNode, index))
    .filter((line): line is OcrLine => Boolean(line))
    .sort((left, right) => left.bbox.y - right.bbox.y || left.bbox.x - right.bbox.x);

  if (!lines.length && Array.isArray(root.words)) {
    const words = root.words
      .map((wordNode, index) =>
        wordNode && typeof wordNode === 'object'
          ? normalizeWord(wordNode as Record<string, unknown>, index)
          : null,
      )
      .filter((word): word is OcrWord => Boolean(word));

    lines = groupWordsIntoLines(words);
  }

  const words = lines.flatMap((line) => line.words);
  const text =
    typeof root.text === 'string' && root.text.trim().length
      ? root.text.trim()
      : lines.map((line) => line.text).join('\n');

  return { lines, text, words };
}

export async function runOcr(
  file: File,
  language: string,
  onProgress?: (status: string, progress: number) => void,
): Promise<OcrExtraction> {
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker(language, 1, {
    logger: (message: { progress?: number; status?: string }) => {
      onProgress?.(message.status ?? 'Processing screenshot', message.progress ?? 0);
    },
  });

  try {
    const result = await worker.recognize(file, {}, { blocks: true });
    return normalizeOcrData(result.data);
  } finally {
    await worker.terminate();
  }
}
