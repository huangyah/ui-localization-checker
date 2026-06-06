import { startTransition, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { analyzeLocalizationIssues } from '../utils/analysis';
import { getLanguageConfig, LANGUAGE_OPTIONS } from '../utils/languages';
import { runOcr } from '../utils/ocr';
import { validatePlaceholders } from '../utils/placeholder';
import { getUiLanguageOption } from '../utils/uiLanguages';
import type { DetectionIssue, OcrExtraction, PlaceholderIssue, SupportedLanguage } from '../utils/types';
import { DashboardHeader } from './DashboardHeader';
import { ImageInspectionCanvas } from './ImageInspectionCanvas';
import { InterfaceLanguageSwitcher } from './InterfaceLanguageSwitcher';
import { LanguageSelector } from './LanguageSelector';
import { MetricCard } from './MetricCard';
import { PlaceholderValidator, PLACEHOLDER_DEMO_SOURCE, PLACEHOLDER_DEMO_TRANSLATION } from './PlaceholderValidator';
import { QAReportPanel } from './QAReportPanel';
import { ReviewChecklistCard } from './ReviewChecklistCard';
import { SectionCard } from './SectionCard';
import { UploadDropzone } from './UploadDropzone';

type OCRPhase = 'idle' | 'preparing' | 'running' | 'done' | 'error';

interface ImageSize {
  width: number;
  height: number;
}

const engineStatusMap: Record<string, string> = {
  'loading tesseract core': 'status.engine.loadingTesseractCore',
  'loaded tesseract core': 'status.engine.loadedTesseractCore',
  'initializing tesseract': 'status.engine.initializingTesseract',
  'initialized tesseract': 'status.engine.initializedTesseract',
  'loading language traineddata': 'status.engine.loadingLanguageTraineddata',
  'loaded language traineddata': 'status.engine.loadedLanguageTraineddata',
  'initializing api': 'status.engine.initializingApi',
  'initialized api': 'status.engine.initializedApi',
  'recognizing text': 'status.engine.recognizingText',
};

async function loadImageSize(url: string): Promise<ImageSize> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error('Failed to read image metadata.'));
    image.src = url;
  });
}

function translateEngineStatus(status: string, t: (key: string, options?: Record<string, unknown>) => string) {
  const translationKey = engineStatusMap[status.toLowerCase()];
  return translationKey ? t(translationKey) : status;
}

function getReviewStage(
  phase: OCRPhase,
  issues: DetectionIssue[],
  t: (key: string, options?: Record<string, unknown>) => string,
) {
  switch (phase) {
    case 'idle':
      return t('status.review.awaiting');
    case 'preparing':
      return t('status.review.preparing');
    case 'running':
      return t('status.review.running');
    case 'error':
      return t('status.review.blocked');
    case 'done':
      return issues.length ? t('status.review.findings') : t('status.review.clean');
    default:
      return t('status.review.awaiting');
  }
}

export function AppShell() {
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('en');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<ImageSize | null>(null);
  const [ocrPhase, setOcrPhase] = useState<OCRPhase>('idle');
  const [ocrStatus, setOcrStatus] = useState(() => t('status.ocr.awaiting'));
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrResult, setOcrResult] = useState<OcrExtraction | null>(null);
  const [issues, setIssues] = useState<DetectionIssue[]>([]);
  const [placeholderIssues, setPlaceholderIssues] = useState<PlaceholderIssue[]>(() =>
    validatePlaceholders(PLACEHOLDER_DEMO_SOURCE, PLACEHOLDER_DEMO_TRANSLATION),
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeIssueId, setActiveIssueId] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const requestIdRef = useRef(0);

  const languageConfig = getLanguageConfig(selectedLanguage);
  const localeLabel = t(languageConfig.labelKey);
  const activeUiLanguage = getUiLanguageOption(i18n.resolvedLanguage ?? i18n.language);
  const uiLanguageLabel = t(activeUiLanguage.labelKey);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!uploadedFile || !imageSize) {
      return;
    }

    const requestId = ++requestIdRef.current;
    let disposed = false;

    setOcrPhase('running');
    setOcrStatus(t('status.ocr.runningFor', { language: localeLabel }));
    setOcrProgress(0.03);
    setErrorMessage(null);
    setActiveIssueId(null);

    void (async () => {
      try {
        const extraction = await runOcr(uploadedFile, languageConfig.tesseractCode, (status, progress) => {
          if (disposed || requestId !== requestIdRef.current) {
            return;
          }

          setOcrStatus(translateEngineStatus(status, t));
          setOcrProgress(progress);
        });

        if (disposed || requestId !== requestIdRef.current) {
          return;
        }

        startTransition(() => {
          setOcrResult(extraction);
          setOcrPhase('done');
          setOcrProgress(1);
        });
      } catch (error) {
        if (disposed || requestId !== requestIdRef.current) {
          return;
        }

        setOcrPhase('error');
        setOcrStatus(t('status.ocr.failed'));
        setErrorMessage(error instanceof Error ? error.message : t('status.ocr.failed'));
      }
    })();

    return () => {
      disposed = true;
    };
  }, [imageSize, selectedLanguage, uploadedFile, languageConfig.tesseractCode]);

  useEffect(() => {
    if (!ocrResult || !imageSize) {
      return;
    }

    const nextIssues = analyzeLocalizationIssues({
      extraction: ocrResult,
      imageSize,
      language: selectedLanguage,
    });

    setIssues(nextIssues);

    if (ocrPhase === 'done') {
      setOcrStatus(nextIssues.length ? t('status.ocr.issuesDetected') : t('status.ocr.noIssues'));
    }
  }, [i18n.language, imageSize, ocrPhase, ocrResult, selectedLanguage, t]);

  useEffect(() => {
    if (ocrPhase === 'idle') {
      setOcrStatus(t('status.ocr.awaiting'));
    } else if (ocrPhase === 'preparing') {
      setOcrStatus(t('status.ocr.preparing'));
    } else if (ocrPhase === 'error' && !errorMessage) {
      setOcrStatus(t('status.ocr.failed'));
    }
  }, [errorMessage, ocrPhase, t]);

  async function handleFileSelect(file: File) {
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      setErrorMessage(t('upload.invalidFile'));
      setOcrPhase('error');
      return;
    }

    setErrorMessage(null);
    setOcrPhase('preparing');
    setOcrStatus(t('status.ocr.preparing'));
    setOcrProgress(0);
    setOcrResult(null);
    setIssues([]);

    const nextUrl = URL.createObjectURL(file);

    try {
      const nextImageSize = await loadImageSize(nextUrl);

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }

      objectUrlRef.current = nextUrl;
      setImageUrl(nextUrl);
      setImageSize(nextImageSize);
      setUploadedFile(file);
    } catch {
      URL.revokeObjectURL(nextUrl);
      setOcrPhase('error');
      setErrorMessage(t('upload.loadFailed'));
    }
  }

  const highSeverityCount = issues.filter((issue) => issue.severity === 'High').length;
  const hasCriticalPlaceholderIssue = placeholderIssues.some((issue) => issue.severity === 'critical');
  const maxRisk = issues.length ? Math.max(...issues.map((issue) => issue.charExpansionRisk)) : 0;
  const averageConfidence = ocrResult?.lines.length
    ? Math.round(ocrResult.lines.reduce((total, line) => total + line.confidence, 0) / ocrResult.lines.length)
    : 0;
  const reviewStage = getReviewStage(ocrPhase, issues, t);

  const metrics = useMemo(
    () => [
      {
        label: t('metrics.findingsReady'),
        value: `${issues.length}`,
        delta: highSeverityCount
          ? t('metrics.highSeverity', { count: highSeverityCount })
          : t('metrics.noHighSeverity'),
        tone: highSeverityCount ? ('amber' as const) : ('emerald' as const),
      },
      {
        label: t('metrics.ocrConfidence'),
        value: averageConfidence ? `${averageConfidence}%` : '--',
        delta: ocrPhase === 'running' ? t('metrics.inProgress') : t('metrics.latestPass'),
        tone: averageConfidence >= 80 ? ('emerald' as const) : ('slate' as const),
      },
      {
        label: t('metrics.expansionRisk'),
        value: `${maxRisk}%`,
        delta: t('metrics.baseline', { language: localeLabel }),
        tone: maxRisk >= 35 ? ('amber' as const) : ('slate' as const),
      },
      {
        label: 'Placeholder Issues',
        value: `${placeholderIssues.length}`,
        delta: hasCriticalPlaceholderIssue ? 'Critical placeholders' : placeholderIssues.length ? 'Needs placeholder QA' : 'All placeholders pass',
        tone: hasCriticalPlaceholderIssue ? ('rose' as const) : placeholderIssues.length ? ('amber' as const) : ('emerald' as const),
      },
      {
        label: t('metrics.scriptDirection'),
        value: languageConfig.rtl ? 'RTL' : 'LTR',
        delta: languageConfig.rtl ? t('metrics.rtlChecks') : t('metrics.ltrChecks'),
        tone: languageConfig.rtl ? ('amber' as const) : ('slate' as const),
      },
    ],
    [
      averageConfidence,
      hasCriticalPlaceholderIssue,
      highSeverityCount,
      issues.length,
      languageConfig.rtl,
      localeLabel,
      maxRisk,
      ocrPhase,
      placeholderIssues.length,
      t,
    ],
  );

  return (
    <div className="relative min-h-screen text-[var(--text-strong)]">
      <div className="app-shell-bg" />
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <DashboardHeader
          currentAsset={uploadedFile?.name ?? null}
          highSeverityCount={highSeverityCount}
          issueCount={issues.length}
          languageLabel={localeLabel}
          progress={ocrProgress}
          status={reviewStage}
          uiLanguageLabel={uiLanguageLabel}
          uiLanguageShortLabel={activeUiLanguage.shortLabel}
        >
          <div className="grid gap-3">
            <InterfaceLanguageSwitcher />
            <LanguageSelector
              label={t('appShell.targetLocale')}
              options={LANGUAGE_OPTIONS}
              value={selectedLanguage}
              onChange={setSelectedLanguage}
            />
          </div>
        </DashboardHeader>

        <main className="relative z-10 mt-6 flex-1">
          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {metrics.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </section>

          <section className="mt-4 grid gap-4 xl:grid-cols-[1.3fr_0.86fr]">
            <div className="grid gap-4">
              <SectionCard
                eyebrow={t('appShell.reviewWorkspace')}
                title={t('appShell.reviewWorkspaceTitle')}
                description={t('appShell.reviewWorkspaceDescription')}
              >
                <div className="grid gap-4">
                  <UploadDropzone
                    disabled={ocrPhase === 'running'}
                    fileName={uploadedFile?.name}
                    onFileSelect={handleFileSelect}
                  />

                  <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_240px]">
                    <div className="panel-muted cut-corner-panel rounded-[1.5rem] p-4">
                      <p className="text-[11px] uppercase tracking-[0.26em] text-[var(--tone-sky)]">
                        {t('appShell.reviewSummary')}
                      </p>
                      <div className="mt-3 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                          <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--tone-sky)]">
                            {t('appShell.ocrStatus')}
                          </p>
                          <p className="mt-2 text-sm font-medium text-[var(--text-strong)]">{ocrStatus}</p>
                        </div>
                        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                          <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--tone-sky)]">
                            {t('appShell.locale')}
                          </p>
                          <p className="mt-2 text-sm font-medium text-[var(--text-strong)]">{localeLabel}</p>
                        </div>
                        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                          <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--tone-sky)]">
                            {t('appShell.screenshot')}
                          </p>
                          <p className="mt-2 text-sm font-medium text-[var(--text-strong)]">
                            {uploadedFile ? t('appShell.loaded') : t('appShell.pending')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="panel-muted cut-corner-panel rounded-[1.5rem] p-4">
                      <p className="text-[11px] uppercase tracking-[0.26em] text-[var(--tone-violet)]">
                        {t('appShell.bestInputs')}
                      </p>
                      <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--text-body)]">
                        {(['0', '1', '2'] as const).map((index) => (
                          <li key={index}>{t(`appShell.bestInputItems.${index}`)}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <ImageInspectionCanvas
                    activeIssueId={activeIssueId}
                    imageSize={imageSize}
                    imageUrl={imageUrl}
                    issues={issues}
                    onIssueHover={setActiveIssueId}
                    phase={ocrPhase}
                    status={ocrStatus}
                  />
                </div>
              </SectionCard>

              <ReviewChecklistCard
                expansionBaseline={languageConfig.expansionBaseline}
                isRtl={languageConfig.rtl}
                languageLabel={localeLabel}
              />
            </div>

            <div className="grid gap-4">
              <PlaceholderValidator onIssuesChange={setPlaceholderIssues} />

              <QAReportPanel
                activeIssueId={activeIssueId}
                errorMessage={errorMessage}
                extractedText={ocrResult?.text ?? ''}
                imageName={uploadedFile?.name ?? null}
                issues={issues}
                language={selectedLanguage}
                onIssueHover={setActiveIssueId}
                phase={ocrPhase}
              />

              <section className="panel-shell cut-corner-panel rounded-[1.75rem] p-5">
                <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--tone-violet)]">
                  {t('appShell.releaseHandoff')}
                </p>
                <h3 className="section-title mt-3 text-xl font-semibold tracking-[-0.03em]">
                  {t('appShell.releaseHandoffTitle')}
                </h3>
                <div className="mt-4 grid gap-3">
                  {(['0', '1', '2'] as const).map((index) => (
                    <div key={index} className="panel-muted interactive-panel rounded-2xl p-4">
                      <p className="text-sm font-medium text-[var(--text-strong)]">
                        {t(`appShell.releaseCards.${index}.title`)}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[var(--text-body)]">
                        {t(`appShell.releaseCards.${index}.description`)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
