import { Capacitor } from "@capacitor/core";
import {
  isIOS,
  shareFile,
  tryWebShare,
  type ShareFileResult,
} from "./shareFile";

/**
 * Labels for the iOS save fallback sheet. Defaults are English; callers with
 * access to the i18n dictionary should pass localized strings.
 */
export interface SaveImageLabels {
  /** Long-press path (real Safari without file-share support). */
  title: string;
  instruction: string;
  done: string;
  /** Shown when the current browser can't export at all (in-app browsers). */
  cannotExportTitle: string;
  cannotExportMessage: string;
}

const DEFAULT_LABELS: SaveImageLabels = {
  title: "Save image",
  instruction:
    "Press and hold the image, then tap “Add to Photos” or “Save Image”.",
  done: "Done",
  cannotExportTitle: "Can't export skin",
  cannotExportMessage: "Skins can not be exported from this browser.",
};

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)![1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

// /**
//  * Detect known in-app browsers (embedded WKWebViews). These hijack or strip the
//  * normal save affordances: e.g. the Google app replaces WebKit's long-press
//  * image menu with its own (Search / Translate / Save-bookmark) sheet, so there
//  * is no "Add to Photos", no file share, and no working <a download>. There is
//  * no reliable save route, so we warn the user instead.
//  */
// function isInAppBrowser(): boolean {
//   const ua = navigator.userAgent;
//   return (
//     / GSA\//.test(ua) || // Google app
//     /FBAN|FBAV|FB_IAB/.test(ua) || // Facebook / Messenger
//     /Instagram/.test(ua) ||
//     /\bLine\//.test(ua) ||
//     /Twitter/.test(ua) ||
//     /MicroMessenger/.test(ua) || // WeChat
//     /(BytedanceWebview|musical_ly|TikTok)/.test(ua) ||
//     /Snapchat/.test(ua) ||
//     /LinkedInApp/.test(ua) ||
//     /Pinterest/.test(ua)
//   );
// }

function makeOverlay(label: string): HTMLDivElement {
  const overlay = document.createElement("div");
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", label);
  overlay.style.cssText = [
    "position:fixed",
    "inset:0",
    "z-index:2147483647",
    // Radix Dialog/Popover sets pointer-events:none on <body> while open;
    // our overlay lives on <body> so it must re-enable interaction itself.
    "pointer-events:auto",
    "display:flex",
    "flex-direction:column",
    "align-items:center",
    "justify-content:center",
    "gap:20px",
    "padding:24px",
    "box-sizing:border-box",
    "background:rgba(0,0,0,0.92)",
    "backdrop-filter:blur(4px)",
    "-webkit-backdrop-filter:blur(4px)",
    "padding-top:max(24px,env(safe-area-inset-top))",
    "padding-bottom:max(24px,env(safe-area-inset-bottom))",
  ].join(";");
  return overlay;
}

const FONT = "system-ui,-apple-system,sans-serif";

function makeTitle(text: string): HTMLDivElement {
  const el = document.createElement("div");
  el.textContent = text;
  el.style.cssText = `color:#fff;font-size:18px;font-weight:600;text-align:center;font-family:${FONT}`;
  return el;
}

function makeInstruction(text: string): HTMLDivElement {
  const el = document.createElement("div");
  el.textContent = text;
  el.style.cssText = `color:rgba(255,255,255,0.85);font-size:14px;line-height:1.5;text-align:center;max-width:340px;font-family:${FONT}`;
  return el;
}

function makeButton(text: string): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = text;
  btn.style.cssText = [
    "appearance:none",
    "border:none",
    "border-radius:999px",
    "padding:12px 32px",
    "font-size:16px",
    "font-weight:600",
    "color:#000",
    "background:#fff",
    "cursor:pointer",
    `font-family:${FONT}`,
  ].join(";");
  return btn;
}

const OVERLAY_ID = "miski-save-overlay";

function presentOverlay(overlay: HTMLDivElement): () => void {
  // Singleton: repeated download taps must not stack overlays (tapping "Done"
  // on a stack only reveals the next identical one and looks broken).
  document.getElementById(OVERLAY_ID)?.remove();
  overlay.id = OVERLAY_ID;

  const prevOverflow = document.body.style.overflow;
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    document.body.style.overflow = prevOverflow;
    overlay.remove();
  };
  // Tapping the backdrop itself (not the image/buttons) dismisses.
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  document.body.style.overflow = "hidden";
  document.body.appendChild(overlay);
  return close;
}

// /**
//  * Fallback for iOS in-app browsers (Google app, Instagram, …): they cannot save
//  * files by any means, so warn the user rather than silently doing nothing.
//  */
// function showCannotExportWarning(labels: SaveImageLabels): void {
//   const overlay = makeOverlay(labels.cannotExportTitle);
//   const title = makeTitle(labels.cannotExportTitle);
//   const message = makeInstruction(labels.cannotExportMessage);
//   const doneBtn = makeButton(labels.done);

//   const close = presentOverlay(overlay);
//   doneBtn.addEventListener("click", close);

//   overlay.append(title, message, doneBtn);
// }

/**
 * Fallback for iOS browsers that render the page directly (real Safari without
 * file-share support): the WebKit long-press "Save Image" callout works here.
 */
function showLongPressSheet(dataUrl: string, labels: SaveImageLabels): void {
  const overlay = makeOverlay(labels.title);
  const title = makeTitle(labels.title);

  const img = document.createElement("img");
  img.src = dataUrl;
  img.alt = labels.title;
  img.draggable = false;
  img.style.cssText = [
    "max-width:min(80vw,360px)",
    "max-height:55vh",
    "width:auto",
    "height:auto",
    "border-radius:12px",
    "background:#fff",
    "box-shadow:0 8px 32px rgba(0,0,0,0.5)",
    "image-rendering:pixelated",
    "-webkit-touch-callout:default",
    "-webkit-user-select:none",
    "user-select:none",
  ].join(";");

  const instruction = makeInstruction(labels.instruction);
  const doneBtn = makeButton(labels.done);

  const close = presentOverlay(overlay);
  doneBtn.addEventListener("click", close);

  overlay.append(title, img, instruction, doneBtn);
}

export async function downloadFile(
  dataUrl: string,
  filename: string,
  labels: SaveImageLabels = DEFAULT_LABELS,
): Promise<ShareFileResult> {
  const blob = dataUrlToBlob(dataUrl);
  if (Capacitor.isNativePlatform()) {
    return shareFile(blob, filename);
  }

  // iOS browsers can't save via a blob anchor click, so shareFile's download
  // fallback must never run here. Prefer the share sheet — it gives "Save to
  // Files" / "Save Image" — and fall back to the long-press callout when the
  // sheet is unavailable or fails.
  if (isIOS()) {
    const file = new File([blob], filename, { type: blob.type });
    const shared = await tryWebShare(file);
    if (shared !== "unavailable") return shared;

    // In-app browsers (Google app, Instagram, …) can't save files by any
    // means — warn the user. Other iOS browsers that lack file-share still
    // support the long-press "Save Image" callout.
    // if (isInAppBrowser()) {
    //   showCannotExportWarning(labels);
    // } else {
    showLongPressSheet(dataUrl, labels);
    // }
    return "downloaded";
  }

  // Desktop / Android: shareFile gives installed PWAs the share sheet and
  // everything else a real file download; a share sheet in a desktop browser
  // is a strictly worse experience than a direct download.
  return shareFile(blob, filename);
}
