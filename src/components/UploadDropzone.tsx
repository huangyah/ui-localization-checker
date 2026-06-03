import { useRef, useState } from 'react';
import { cn } from '../utils/cn';
import { useTranslation } from 'react-i18next';

interface UploadDropzoneProps {
  disabled?: boolean;
  fileName?: string;
  onFileSelect: (file: File) => void | Promise<void>;
}

export function UploadDropzone({ disabled = false, fileName, onFileSelect }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const { t } = useTranslation();

  function handleFiles(fileList: FileList | null) {
    const file = fileList?.[0];

    if (file) {
      void onFileSelect(file);
    }
  }

  return (
    <div
      className={cn(
        'interactive-panel cut-corner-panel rounded-[1.75rem] border border-dashed p-6 transition duration-200',
        dragActive
          ? 'border-[rgba(6,182,212,0.55)] bg-[rgba(6,182,212,0.09)] shadow-[0_0_0_1px_rgba(59,130,246,0.16),0_0_28px_rgba(6,182,212,0.18)]'
          : 'border-[rgba(71,85,105,0.92)] bg-[rgba(2,8,23,0.24)]',
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
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[rgba(59,130,246,0.28)] bg-[rgba(59,130,246,0.14)] text-sm font-semibold text-[var(--tone-sky)]">
              GO
            </span>
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--tone-sky)]">{t('upload.eyebrow')}</p>
          </div>
          <h2 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-[var(--text-strong)]">
            {t('upload.title')}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-body)]">
            {t('upload.description')}
          </p>
          {fileName ? (
            <p className="mt-3 text-sm text-[var(--text-body)]">
              {t('upload.currentAsset')} <span className="font-medium text-[var(--text-strong)]">{fileName}</span>
            </p>
          ) : null}
        </div>

        <button
          className="gradient-button inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          {t('upload.button')}
        </button>
      </div>
    </div>
  );
}
