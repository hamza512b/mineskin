import { baseUrl } from "@/i18n/config";
import { isNativeWebview } from "@/hooks/useNativeWebview";

/**
 * Open a URL outside of the app's main view.
 *
 * - On native (Capacitor iOS/Android): opens in the system in-app browser
 *   (SFSafariViewController / Chrome Custom Tabs). Relative URLs are resolved
 *   against the production base URL, since the system browser can't load the
 *   webview's bundled assets.
 * - On the web: opens in a new tab.
 */
export async function openExternalUrl(url: string): Promise<void> {
  if (isNativeWebview()) {
    const absoluteUrl = /^https?:\/\//.test(url) ? url : `${baseUrl}${url}`;
    const { Browser } = await import("@capacitor/browser");
    await Browser.open({ url: absoluteUrl });
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}
