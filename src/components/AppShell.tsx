import { startTransition, useEffect, useMemo, useRef, useState } from 'react';
import { analyzeLocalizationIssues } from '../utils/analysis';
import { getLanguageConfig, LANGUAGE_OPTIONS } from '../utils/languages';
import { runOcr } from '../utils/ocr';
import type { DetectionIssue, OcrExtraction, SupportedLanguage } from '../utils/types';
import { DashboardHeader } from './DashboardHeader';
import { ImageInspectionCanvas } from './ImageInspectionCanvas';
import { LanguageSelector } from './LanguageSelector';
import { MetricCard } from './MetricCard';
import { QAReportPanel } from './QAReportPanel';
import { ReviewChecklistCard } from './ReviewChecklistCard';
import { SectionCard } from './SectionCard';
import { UploadDropzone } from './UploadDropzone';

type OCRPhase = 'idle' | 'preparing' | 'running' | 'done' | 'error';

interface ImageSize {
  width: number;
  height: number;
}

async function loadImageSize(url: string): Promise<ImageSize> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error('Failed to read image metadata.'));
    image.src = url;
  });
}

function getReviewStage(phase: OCRPhase, issues: DetectionIssue[]) {
  switch (phase) {
    case 'idle':
      return 'Awaiting review surface';
    case 'preparing':
      return 'Preparing screenshot';
    case 'running':
      return 'Running OCR and layout checks';
    case 'error':
      return 'Review blocked';
    case 'done':
      return issues.length ? 'Findings ready for localization review' : 'Clean heuristic pass';
    default:
      return 'Awaiting review surface';
  }
}

export function AppShell() {
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('en');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<ImageSize | null>(null);
  const [ocrPhase, setOcrPhase] = useState<OCRPhase>('idle');
  const [ocrStatus, setOcrStatus] = useState('Awaiting screenshot');
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrResult, setOcrResult] = useState<OcrExtraction | null>(null);
  const [issues, setIssues] = useState<DetectionIssue[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeIssueId, setActiveIssueId] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const requestIdRef = useRef(0);

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
    const languageConfig = getLanguageConfig(selectedLanguage);

    setOcrPhase('running');
    setOcrStatus(`Running OCR for ${languageConfig.label}`);
    setOcrProgress(0.03);
    setErrorMessage(null);
    setActiveIssueId(null);

    void (async () => {
      try {
        const extraction = await runOcr(uploadedFile, languageConfig.tesseractCode, (status, progress) => {
          if (disposed || requestId !== requestIdRef.current) {
            return;
          }

          setOcrStatus(status);
          setOcrProgress(progress);
        });

        if (disposed || requestId !== requestIdRef.current) {
          return;
        }

        const nextIssues = analyzeLocalizationIssues({
          extraction,
          imageSize,
          language: selectedLanguage,
        });

        startTransition(() => {
          setOcrResult(extraction);
          setIssues(nextIssues);
          setOcrPhase('done');
          setOcrStatus(nextIssues.length ? 'Issues detected' : 'No obvious issues detected');
          setOcrProgress(1);
        });
      } catch (error) {
        if (disposed || requestId !== requestIdRef.current) {
          return;
        }

        setOcrPhase('error');
        setOcrStatus('OCR failed');
        setErrorMessage(error instanceof Error ? error.message : 'Unable to process the screenshot.');
      }
    })();

    return () => {
      disposed = true;
    };
  }, [imageSize, selectedLanguage, uploadedFile]);

  async function handleFileSelect(file: File) {
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      setErrorMessage('Upload a PNG or JPG screenshot to continue.');
      setOcrPhase('error');
      return;
    }

    setErrorMessage(null);
    setOcrPhase('preparing');
    setOcrStatus('Preparing screenshot');
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
    } catch (error) {
      URL.revokeObjectURL(nextUrl);
      setOcrPhase('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load the uploaded image.');
    }
  }

  const languageConfig = getLanguageConfig(selectedLanguage);
  const highSeverityCount = issues.filter((issue) => issue.severity === 'High').length;
  const maxRisk = issues.length ? Math.max(...issues.map((issue) => issue.charExpansionRisk)) : 0;
  const averageConfidence = ocrResult?.lines.length
    ? Math.round(ocrResult.lines.reduce((total, line) => total + line.confidence, 0) / ocrResult.lines.length)
    : 0;
  const reviewStage = getReviewStage(ocrPhase, issues);

  const metrics = useMemo(
    () => [
      {
        label: 'Findings ready',
        value: `${issues.length}`,
        delta: highSeverityCount ? `${highSeverityCount} high severity` : 'No high severity',
        tone: highSeverityCount ? ('amber' as const) : ('emerald' as const),
      },
      {
        label: 'OCR confidence',
        value: averageConfidence ? `${averageConfidence}%` : '--',
        delta: ocrPhase === 'running' ? 'In progress' : 'Latest pass',
        tone: averageConfidence >= 80 ? ('emerald' as const) : ('slate' as const),
      },
      {
        label: 'Expansion risk',
        value: `${maxRisk}%`,
        delta: `${languageConfig.label} baseline`,
        tone: maxRisk >= 35 ? ('amber' as const) : ('slate' as const),
      },
      {
        label: 'Script direction',
        value: languageConfig.rtl ? 'RTL' : 'LTR',
        delta: languageConfig.rtl ? 'Mirror layout checks' : 'Standard layout checks',
        tone: languageConfig.rtl ? ('amber' as const) : ('slate' as const),
      },
    ],
    [averageConfidence, highSeverityCount, issues.length, languageConfig.label, languageConfig.rtl, maxRisk, ocrPhase],
  );

  return (
    <div className="min-h-screen text-[var(--text-strong)]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <DashboardHeader
          currentAsset={uploadedFile?.name ?? null}
          highSeverityCount={highSeverityCount}
          issueCount={issues.length}
          languageLabel={languageConfig.label}
          progress={ocrProgress}
          status={reviewStage}
        >
          <LanguageSelector
            label="Target locale"
            options={LANGUAGE_OPTIONS}
            value={selectedLanguage}
            onChange={setSelectedLanguage}
          />
        </DashboardHeader>

        <main className="mt-6 flex-1">
          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </section>

          <section className="mt-4 grid gap-4 xl:grid-cols-[1.3fr_0.86fr]">
            <div className="grid gap-4">
              <SectionCard
                eyebrow="Review workspace"
                title="Validate screenshots before multilingual release handoff"
                description="Run a focused QA pass on training flows, post-run summaries, wearable pairing screens, and metrics-heavy cards without changing the OCR or issue-detection engine."
              >
                <div className="grid gap-4">
                  <UploadDropzone
                    disabled={ocrPhase === 'running'}
                    fileName={uploadedFile?.name}
                    onFileSelect={handleFileSelect}
                  />

                  <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_240px]">
                    <div className="panel-muted rounded-[1.5rem] p-4">
                      <p className="text-[11px] uppercase tracking-[0.26em] text-[var(--text-muted)]">
                        Review summary
                      </p>
                      <div className="mt-3 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-white/6 bg-white/[0.03] p-3">
                          <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">
                            OCR status
                          </p>
                          <p className="mt-2 text-sm font-medium text-[var(--text-strong)]">{ocrStatus}</p>
                        </div>
                        <div className="rounded-2xl border border-white/6 bg-white/[0.03] p-3">
                          <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">
                            Locale
                          </p>
                          <p className="mt-2 text-sm font-medium text-[var(--text-strong)]">
                            {languageConfig.label}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-white/6 bg-white/[0.03] p-3">
                          <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">
                            Screenshot
                          </p>
                          <p className="mt-2 text-sm font-medium text-[var(--text-strong)]">
                            {uploadedFile ? 'Loaded' : 'Pending'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="panel-muted rounded-[1.5rem] p-4">
                      <p className="text-[11px] uppercase tracking-[0.26em] text-[var(--text-muted)]">
                        Best inputs
                      </p>
                      <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--text-body)]">
                        <li>Workout result cards with tight metadata labels.</li>
                        <li>Wearable onboarding or accessory pairing flows.</li>
                        <li>Map, GPS, and sensor summary states with dynamic values.</li>
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
                languageLabel={languageConfig.label}
              />
            </div>

            <div className="grid gap-4">
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

              <section className="panel-shell rounded-[1.75rem] p-5">
                <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">
                  Release handoff
                </p>
                <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-[var(--text-strong)]">
                  What this pass is meant to catch
                </h3>
                <div className="mt-4 grid gap-3">
                  <div className="panel-muted rounded-2xl p-4">
                    <p className="text-sm font-medium text-[var(--text-strong)]">Layout risk on compact surfaces</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-body)]">
                      Cards, tabs, and watch-sized layouts where longer localized strings compete with metrics and
                      icons.
                    </p>
                  </div>
                  <div className="panel-muted rounded-2xl p-4">
                    <p className="text-sm font-medium text-[var(--text-strong)]">Dynamic copy and placeholders</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-body)]">
                      Coaching messages, achievement states, and sensor readouts that combine variables with
                      localized text.
                    </p>
                  </div>
                  <div className="panel-muted rounded-2xl p-4">
                    <p className="text-sm font-medium text-[var(--text-strong)]">Script support and readability</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-body)]">
                      Fallback font drift, clipped accents, and directional issues that appear only after locale
                      expansion.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
