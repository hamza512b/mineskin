import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

export type ShareFileResult = "shared" | "downloaded" | "cancelled";

/** Outcome of a bare web-share attempt, before any download fallback. */
export type WebShareResult = "shared" | "cancelled" | "unavailable";

export function isIOS(): boolean {
  const ua = navigator.userAgent;
  const iOSDevice = /iP(hone|od|ad)/.test(ua);
  // iPadOS 13+ reports itself as macOS; distinguish by touch support.
  const iPadOS =
    navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return iOSDevice || iPadOS;
}

function isCancellation(error: unknown): boolean {
  if (error instanceof DOMException && error.name === "AbortError") {
    return true;
  }
  const msg = error instanceof Error ? error.message : String(error);
  return msg.toLowerCase().includes("cancel");
}

export function canShareFile(file: File): boolean {
  return (
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [file] })
  );
}

/**
 * Attempt the web share sheet without any fallback, so callers can pick a
 * platform-appropriate one (anchor download, iOS long-press sheet, …).
 */
export async function tryWebShare(file: File): Promise<WebShareResult> {
  if (!canShareFile(file)) return "unavailable";
  try {
    await navigator.share({ files: [file] });
    return "shared";
  } catch (e) {
    if (isCancellation(e)) return "cancelled";
    // Share unsupported at runtime, in-app restriction, …
    return "unavailable";
  }
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Failed to read file blob"));
        return;
      }
      // Strip the "data:<mime>;base64," prefix.
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = () =>
      reject(reader.error ?? new Error("FileReader error"));
    reader.readAsDataURL(blob);
  });
}

async function shareNative(
  blob: Blob,
  filename: string,
): Promise<ShareFileResult> {
  const base64 = await blobToBase64(blob);
  const written = await Filesystem.writeFile({
    path: filename,
    data: base64,
    directory: Directory.Cache,
  });
  try {
    await Share.share({ url: written.uri });
    return "shared";
  } catch (e) {
    if (isCancellation(e)) return "cancelled";
    throw e;
  }
}

export async function shareFile(
  blob: Blob,
  filename: string,
): Promise<ShareFileResult> {
  if (Capacitor.isNativePlatform()) {
    return shareNative(blob, filename);
  }

  const file = new File([blob], filename, { type: blob.type });
  const standalone = window.matchMedia("(display-mode: standalone)").matches;

  if (isIOS() || standalone) {
    const result = await tryWebShare(file);
    if (result !== "unavailable") return result;
    // Otherwise fall through to a download.
  }

  // Desktop / Android: a real file download is the most reliable route.
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  // Revoke on the next tick so the download has a chance to start.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return "downloaded";
}
