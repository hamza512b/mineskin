import { shareFile, type ShareFileResult } from "./shareFile";

/**
 * Result of a share attempt so callers can react (e.g. analytics) without
 * treating a user cancellation as an error.
 */
export type ShareVideoResult = ShareFileResult;

/**
 * Shares a recorded clip through the best available route, mirroring
 * {@link downloadFile}'s strategy for images:
 *
 * 1. Native app (Capacitor): write to cache and open the iOS/Android share
 *    sheet — this is the "straight into TikTok/Reels/Save Video" path.
 * 2. iOS / installed PWA with file-share support: Web Share API with the file.
 * 3. Desktop / Android browser: a plain download.
 */
export async function shareVideo(
  blob: Blob,
  filename: string,
): Promise<ShareVideoResult> {
  return shareFile(blob, filename);
}
