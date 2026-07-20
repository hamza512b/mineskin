/**
 * Shared watermark rendering for exported media (recorded clips and
 * screenshots). Keeping this in one place means the pill baked into a shared
 * video and the one baked into a downloaded screenshot always match.
 */

/** Attribution text baked into exported media. Pass "" to disable. */
export const DEFAULT_WATERMARK = "MineSkin Pro";
/** Logo drawn left of the watermark text. Must be same-origin (bundled asset). */
export const DEFAULT_LOGO_URL = "/icon-512x512.png";
/** Cap on how long callers wait for the logo before drawing without it. */
export const LOGO_LOAD_TIMEOUT_MS = 3000;

export interface WatermarkContent {
  /** Text to render; empty string renders logo-only. */
  text: string;
  /** Decoded logo, or null for text-only. */
  logo: HTMLImageElement | null;
  /**
   * Horizontal placement of the pill along the bottom edge. Clips use
   * "center"; still images use "right". Default "center".
   */
  align?: "center" | "right";
}

/**
 * Loads the watermark logo, resolving to the decoded image or `null` if it
 * fails / never loads within {@link LOGO_LOAD_TIMEOUT_MS}. Same-origin only —
 * a cross-origin logo taints the canvas and breaks capture/export.
 */
export function loadWatermarkLogo(
  url: string | null = DEFAULT_LOGO_URL,
): Promise<HTMLImageElement | null> {
  if (!url || typeof Image === "undefined") return Promise.resolve(null);
  return new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    let settled = false;
    const finish = (value: HTMLImageElement | null) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };
    img.onload = () => finish(img);
    img.onerror = () => finish(null);
    img.src = url;
    // Cached images may already be complete before listeners attach.
    if (img.complete && img.naturalWidth > 0) finish(img);
    setTimeout(() => finish(null), LOGO_LOAD_TIMEOUT_MS);
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Draws a centered, bottom-anchored watermark pill (logo + text) sized
 * relative to the frame height. Shared by the video recorder and the
 * screenshot exporter so exported media carries consistent attribution.
 */
export function drawWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  content: WatermarkContent,
): void {
  const text = content.text;
  const logo = content.logo;
  if (!text && !logo) return;

  const fontSize = Math.round(height * 0.026);
  const paddingX = Math.round(fontSize * 0.9);
  const paddingY = Math.round(fontSize * 0.55);
  const margin = Math.round(height * 0.035);

  ctx.font = `600 ${fontSize}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  ctx.textBaseline = "middle";

  // A logo only participates once it has actually decoded.
  const logoReady = !!logo && logo.complete && logo.naturalWidth > 0;
  const logoSize = logoReady ? Math.round(fontSize * 1.45) : 0;
  const hasText = text.length > 0;
  const textWidth = hasText ? ctx.measureText(text).width : 0;
  const gap = logoReady && hasText ? Math.round(fontSize * 0.5) : 0;

  const contentWidth = logoSize + gap + textWidth;
  const pillWidth = contentWidth + paddingX * 2;
  const pillHeight = Math.max(fontSize, logoSize) + paddingY * 2;
  const pillX =
    content.align === "right"
      ? width - margin - pillWidth
      : (width - pillWidth) / 2;
  const pillY = height - margin - pillHeight;
  const centerY = pillY + pillHeight / 2;

  // Translucent dark pill keeps the logo + white text legible over any backdrop.
  ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  roundRect(ctx, pillX, pillY, pillWidth, pillHeight, pillHeight / 2);
  ctx.fill();

  let cursorX = pillX + paddingX;
  if (logoReady && logo) {
    ctx.drawImage(
      logo,
      cursorX,
      Math.round(centerY - logoSize / 2),
      logoSize,
      logoSize,
    );
    cursorX += logoSize + gap;
  }
  if (hasText) {
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
    ctx.fillText(text, cursorX, centerY + 1);
  }
}
