import { useRef, useState } from 'react';
import { cn } from '../utils/cn';

interface UploadDropzoneProps {
  disabled?: boolean;
  fileName?: string;
  onFileSelect: (file: File) => void | Promise<void>;
}

export function UploadDropzone({ disabled = false, fileName, onFileSelect }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);

  function handleFiles(fileList: FileList | null) {
    const file = fileList?.[0];

    if (file) {
      void onFileSelect(file);
    }
  }

  return (
    <div
      className={cn(
        'rounded-[1.75rem] border border-dashed p-6 transition duration-200',
        dragActive ? 'border-[rgba(125,211,196,0.42)] bg-[rgba(125,211,196,0.08)]' : 'border-white/10 bg-black/15',
        disabled && 'cursor-not-allowed opacity-70',
      )}
      onDragEnter={(event) => {
        event.preventDefault();
        if (!disabled) {
          setDragActive(true);
        }
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setDragActive(false);
      }}
      onDragOver={(event) => {
        event.preventDefault();
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragActive(false);
        if (!disabled) {
          handleFiles(event.dataTransfer.files);
        }
      }}
    >
      <input
        ref={inputRef}
        accept="image/png,image/jpeg"
        className="hidden"
        disabled={disabled}
        onChange={(event) => handleFiles(event.target.files)}
        type="file"
      />

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">Screenshot intake</p>
          <h2 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-[var(--text-strong)]">
            Upload a PNG or JPG screenshot from a workout app or device UI
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-body)]">
            Use production-like captures from training summaries, wearable setup, recovery flows, or metrics
            dashboards. OCR will extract visible strings and map likely localization risks directly onto the
            surface.
          </p>
          {fileName ? (
            <p className="mt-3 text-sm text-[var(--text-body)]">
              Current asset: <span className="font-medium text-[var(--text-strong)]">{fileName}</span>
            </p>
          ) : null}
        </div>

        <button
          className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_100%)] px-4 py-3 text-sm font-medium text-[var(--text-strong)] transition hover:border-white/20 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.06)_100%)] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          Choose screenshot
        </button>
      </div>
    </div>
  );
}
