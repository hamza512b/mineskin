import { isDarkMode } from "@/lib/theme";
import { RecorderNotSupportedError } from "../errors";
import {
  DEFAULT_LOGO_URL,
  DEFAULT_WATERMARK,
  drawWatermark,
  loadWatermarkLogo,
  LOGO_LOAD_TIMEOUT_MS,
} from "../watermark";

export interface FrameCompositorOptions {
  /** Output width in px. */
  width: number;
  /** Output height in px. */
  height: number;
  /** Watermark text baked into every frame. Pass "" to disable. */
  watermark?: string;
  /** Logo left of the watermark text; same-origin only. `null` for text only. */
  watermarkLogoUrl?: string | null;
}

/**
 * Composites the live WebGL view onto a fixed 9:16 target canvas: radial
 * backdrop → cover-fit skin → baked-in watermark. Split out of {@link SkinRecorder}
 * so the same per-frame paint feeds either the WebCodecs (frame-exact) or the
 * MediaRecorder (realtime) encoder without duplication.
 *
 * The target canvas is reused across frames and is what the encoders read from,
 * so it inherits the same-origin/taint requirement: the watermark logo must be a
 * bundled asset, and the WebGL source uses `preserveDrawingBuffer: true` so it is
 * safe to sample at any time.
 */
export class FrameCompositor {
  readonly width: number;
  readonly height: number;
  /** The reusable canvas every composited frame is painted onto. */
  readonly target: HTMLCanvasElement;

  private readonly source: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly watermark: string;
  private logo: HTMLImageElement | null = null;
  /** Resolves once the logo has loaded (or failed / none) — awaited by ready(). */
  private logoReady: Promise<void>;
  private backdropFrame: HTMLCanvasElement | null = null;
  private watermarkFrame: HTMLCanvasElement | null = null;

  constructor(source: HTMLCanvasElement, options: FrameCompositorOptions) {
    this.source = source;
    // Force even dimensions — H.264 encoders require macroblock-even sizes and
    // some reject odd width/height outright. 1080x1920 is already even.
    this.width = options.width & ~1;
    this.height = options.height & ~1;
    this.watermark = options.watermark ?? DEFAULT_WATERMARK;

    const target = document.createElement("canvas");
    target.width = this.width;
    target.height = this.height;
    const ctx = target.getContext("2d");
    if (!ctx) throw new RecorderNotSupportedError();
    this.target = target;
    this.ctx = ctx;

    const logoUrl =
      options.watermarkLogoUrl === undefined
        ? DEFAULT_LOGO_URL
        : options.watermarkLogoUrl;
    this.logoReady = loadWatermarkLogo(logoUrl).then((img) => {
      this.logo = img;
    });
  }

  /**
   * Resolves once the watermark logo has loaded — or immediately if none.
   * Bounded by a timeout so a hung asset never blocks a recording. Await this
   * before {@link prerenderStaticLayers} so the very first frame carries the logo.
   */
  async ready(): Promise<void> {
    await Promise.race([
      this.logoReady,
      new Promise<void>((resolve) => setTimeout(resolve, LOGO_LOAD_TIMEOUT_MS)),
    ]);
  }

  /**
   * Bakes the static backdrop and watermark into offscreen canvases once, so
   * {@link composite} only pays for the moving skin view per frame. Call after
   * {@link ready}.
   */
  prerenderStaticLayers(): void {
    const backdrop = document.createElement("canvas");
    backdrop.width = this.width;
    backdrop.height = this.height;
    const backdropCtx = backdrop.getContext("2d");
    if (!backdropCtx) throw new RecorderNotSupportedError();
    this.drawBackdrop(backdropCtx);
    this.backdropFrame = backdrop;

    const watermark = document.createElement("canvas");
    watermark.width = this.width;
    watermark.height = this.height;
    const watermarkCtx = watermark.getContext("2d");
    if (!watermarkCtx) throw new RecorderNotSupportedError();
    drawWatermark(watermarkCtx, this.width, this.height, {
      text: this.watermark,
      logo: this.logo,
    });
    this.watermarkFrame = watermark;
  }

  /** Paints one frame onto {@link target} and returns it: backdrop → skin → watermark. */
  composite(): HTMLCanvasElement {
    const ctx = this.ctx;
    const { width, height } = this;

    if (this.backdropFrame) {
      ctx.drawImage(this.backdropFrame, 0, 0);
    } else {
      this.drawBackdrop(ctx);
    }

    // Cover-fit the live canvas so the vertical frame is full-bleed with the
    // (horizontally centered) model kept in view.
    const sw = this.source.width;
    const sh = this.source.height;
    if (sw > 0 && sh > 0) {
      const scale = Math.max(width / sw, height / sh);
      const dw = sw * scale;
      const dh = sh * scale;
      const dx = (width - dw) / 2;
      const dy = (height - dh) / 2;
      ctx.drawImage(this.source, dx, dy, dw, dh);
    }

    if (this.watermarkFrame) {
      ctx.drawImage(this.watermarkFrame, 0, 0);
    } else {
      drawWatermark(ctx, width, height, {
        text: this.watermark,
        logo: this.logo,
      });
    }

    return this.target;
  }

  private drawBackdrop(ctx: CanvasRenderingContext2D): void {
    // Mirrors the app's radial neutral backdrop so grid/empty environments,
    // whose gradient lives in CSS (not the WebGL canvas), still look right and
    // the exported video is never transparent → black on social platforms.
    const { width, height } = this;
    const dark = isDarkMode();
    const inner = dark ? "#171717" : "#f5f5f5"; // neutral-900 / neutral-100
    const outer = dark ? "#0a0a0a" : "#e5e5e5"; // neutral-950 / neutral-200
    const gradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      0,
      width / 2,
      height / 2,
      Math.hypot(width, height) / 2,
    );
    gradient.addColorStop(0, inner);
    gradient.addColorStop(1, outer);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
}
