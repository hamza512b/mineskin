"use client";
import { useDictionary } from "@/i18n";

interface RecorderOverlayProps {
  /** Shown while a clip is being captured. */
  recording: boolean;
  /** Capture progress, 0..1. */
  progress: number;
  /** Non-null shows a capability or runtime recording error. */
  error: { title: string; message: string } | null;
  onCancel: () => void;
  onDismissError: () => void;
}

/**
 * Full-screen modal shown while a clip records (progress + cancel) or when the
 * browser can't record at all. Rendered above the dashboard, which is otherwise
 * `pointer-events-none`, so this must re-enable interaction itself.
 */
export default function RecorderOverlay({
  recording,
  progress,
  error,
  onCancel,
  onDismissError,
}: RecorderOverlayProps) {
  const { dictionary: dict } = useDictionary();
  const rec = dict.recorder;

  if (!recording && !error) return null;

  const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="pointer-events-auto fixed inset-0 z-[2147483646] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
    >
      <div className="w-full max-w-xs rounded-2xl bg-neutral-50 p-6 text-center shadow-2xl dark:bg-neutral-800">
        {error ? (
          <>
            <h2 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-white">
              {error.title}
            </h2>
            <p className="mb-6 text-sm text-neutral-600 dark:text-neutral-400">
              {error.message}
            </p>
            <button
              type="button"
              onClick={onDismissError}
              className="w-full rounded-full bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-black"
            >
              {rec.dismiss}
            </button>
          </>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-center gap-2">
              <span className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {rec.recording}
              </h2>
            </div>
            <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
              {rec.hint}
            </p>
            <div className="mb-1 h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
              <div
                className="h-full rounded-full bg-blue-600 transition-[width] duration-150 ease-linear dark:bg-blue-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mb-5 text-right text-xs tabular-nums text-neutral-500 dark:text-neutral-400">
              {pct}%
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="w-full rounded-full border border-neutral-300 px-4 py-2.5 text-sm font-semibold text-neutral-700 dark:border-neutral-600 dark:text-neutral-200"
            >
              {rec.cancel}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
