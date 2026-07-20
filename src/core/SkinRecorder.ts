import { RecorderNotSupportedError } from "./errors";
import type { ClipEncoder, EncoderPacing } from "./recorder/ClipEncoder";
import { FrameCompositor } from "./recorder/FrameCompositor";
import { MediaRecorderClipEncoder } from "./recorder/MediaRecorderClipEncoder";
import { NativeAppleClipEncoder } from "./recorder/NativeAppleClipEncoder";
import { WebCodecsClipEncoder } from "./recorder/WebCodecsClipEncoder";

export type { RecordedClip } from "./recorder/ClipEncoder";
import type { RecordedClip } from "./recorder/ClipEncoder";

export interface SkinRecorderOptions {
  /** Output width in px. Default 1080 (9:16 with the default height). */
  width?: number;
  /** Output height in px. Default 1920. */
  height?: number;
  /** Capture frame rate. Default 60. */
  fps?: number;
  /**
   * Watermark text baked into the bottom of every frame. This is the growth
   * mechanism — every shared clip carries attribution. Pass "" to disable.
   */
  watermark?: string;
  /**
   * Logo drawn left of the watermark text. Must be same-origin (a bundled
   * asset) or the capture stream taints and fails. Pass `null` for text only.
   */
  watermarkLogoUrl?: string | null;
  /** Encoder bitrate hint. Default 8 Mbps — plenty for a pixel-art turntable. */
  videoBitsPerSecond?: number;
}

const DEFAULT_WIDTH = 1080;
const DEFAULT_HEIGHT = 1920;
export const DEFAULT_FPS = 60;
const DEFAULT_BITRATE = 8_000_000;

/**
 * Records a source `<canvas>` (the live WebGL view) to a vertical, watermarked
 * 9:16 video. This is a thin facade over two collaborators:
 *
 * - a {@link FrameCompositor} that paints each frame (backdrop + skin + watermark);
 * - a {@link ClipEncoder} chosen at {@link ready} time — {@link WebCodecsClipEncoder}
 *   for a frame-exact, guaranteed-constant-fps offline encode, or the legacy
 *   {@link MediaRecorderClipEncoder} as a realtime fallback.
 *
 * The class does NOT drive the camera, animation, or the frame clock — the
 * caller (see `MiSkiRenderer.recordClip`) owns a deterministic loop that renders
 * frame N, then calls {@link captureFrame} N, so recording is decoupled from
 * wall-clock time: it can run slower than real time on a weak device and still
 * emit a clean 60 fps clip.
 */
export class SkinRecorder {
  readonly width: number;
  readonly height: number;
  readonly fps: number;

  private readonly bitrate: number;
  private readonly compositor: FrameCompositor;
  private encoder: ClipEncoder | null = null;

  constructor(source: HTMLCanvasElement, options: SkinRecorderOptions = {}) {
    this.width = options.width ?? DEFAULT_WIDTH;
    this.height = options.height ?? DEFAULT_HEIGHT;
    this.fps = options.fps ?? DEFAULT_FPS;
    this.bitrate = options.videoBitsPerSecond ?? DEFAULT_BITRATE;
    this.compositor = new FrameCompositor(source, {
      width: this.width,
      height: this.height,
      watermark: options.watermark,
      watermarkLogoUrl: options.watermarkLogoUrl,
    });
  }

  /**
   * Whether this browser can record at all. True if either a frame-exact
   * WebCodecs encoder or the realtime MediaRecorder fallback is available.
   * Sync so `canRecordClip()` can gate the UI up front; the precise codec probe
   * happens in {@link ready}.
   */
  static isSupported(canvas: HTMLCanvasElement): boolean {
    if (typeof document === "undefined") return false;
    return (
      MediaRecorderClipEncoder.isSupported(canvas) ||
      "VideoEncoder" in globalThis ||
      NativeAppleClipEncoder.isSupported()
    );
  }

  /**
   * Loads the watermark logo, prerenders the static layers, and picks the best
   * available encoder. Await this before {@link start}. Throws
   * {@link RecorderNotSupportedError} if no encoder is available.
   */
  async ready(): Promise<void> {
    await this.compositor.ready();
    this.compositor.prerenderStaticLayers();

    const webCodecs = await WebCodecsClipEncoder.create(
      this.compositor.target,
      {
        width: this.compositor.width,
        height: this.compositor.height,
        fps: this.fps,
        bitrate: this.bitrate,
      },
    );
    this.encoder =
      webCodecs ??
      (MediaRecorderClipEncoder.isSupported(this.compositor.target)
        ? new MediaRecorderClipEncoder(this.compositor.target, {
            fps: this.fps,
            bitrate: this.bitrate,
          })
        : NativeAppleClipEncoder.isSupported()
          ? new NativeAppleClipEncoder(this.compositor.target, {
              width: this.compositor.width,
              height: this.compositor.height,
              fps: this.fps,
              bitrate: this.bitrate,
            })
          : null);

    if (!this.encoder) throw new RecorderNotSupportedError();
  }

  /** How the caller's record loop must pace itself for the chosen encoder. */
  get pacing(): EncoderPacing {
    return this.encoder?.pacing ?? "realtime";
  }

  /** Wall-clock interval between frames — used only by the realtime fallback. */
  get frameIntervalMs(): number {
    return 1000 / Math.max(1, this.fps);
  }

  /** Begins encoding. Throws {@link RecorderNotSupportedError} if not ready. */
  async start(): Promise<void> {
    if (!this.encoder) throw new RecorderNotSupportedError();
    await this.encoder.start();
  }

  /**
   * Composites the live source into one frame and submits it to the encoder.
   * The returned promise resolves once the encoder can accept more work —
   * `await` it to respect backpressure.
   */
  async captureFrame(frameIndex: number): Promise<void> {
    if (!this.encoder) throw new RecorderNotSupportedError();
    this.compositor.composite();
    await this.encoder.addFrame(frameIndex);
  }

  /**
   * Stops recording and resolves with the encoded clip. Rejects if called
   * before {@link start}, or if encoding genuinely failed. On any failure the
   * encoder is disposed so the capture resources are always released.
   */
  async stop(): Promise<RecordedClip> {
    const encoder = this.encoder;
    if (!encoder) {
      throw new Error("SkinRecorder.stop() called before start()");
    }
    try {
      return await encoder.finalize();
    } catch (e) {
      encoder.dispose();
      throw e;
    }
  }

  /**
   * Releases the chosen encoder without producing a clip — the failure/cancel
   * path where {@link start} never succeeded, or a recording was aborted so a
   * finalized blob would only be discarded. Skips the expensive flush+mux while
   * still freeing the capture resources. Idempotent and safe to call when no
   * encoder was ever created.
   */
  dispose(): void {
    this.encoder?.dispose();
  }
}
