import type {
  BufferTarget,
  CanvasSource,
  Output,
  VideoCodec,
} from "mediabunny";
import type { ClipEncoder, RecordedClip } from "./ClipEncoder";

export interface WebCodecsEncoderOptions {
  width: number;
  height: number;
  fps: number;
  bitrate: number;
}

/**
 * Codecs we'll offline-encode, best-first. `avc` (H.264) is preferred so Apple
 * platforms get a TikTok/Reels-ready MP4 with no transcode and the existing
 * share pipeline is unchanged; VP9/VP8 → WebM covers Chromium builds without an
 * H.264 encoder. Anything else falls back to {@link MediaRecorderClipEncoder}.
 */
const CODEC_PRIORITY: VideoCodec[] = ["avc", "vp9", "vp8"];

/**
 * Frame-exact offline encoder built on WebCodecs via Mediabunny. Each frame is
 * captured from the compositor's canvas and encoded with an explicit
 * presentation timestamp derived from its index, so the muxed clip is a
 * guaranteed constant `fps` regardless of how long rendering takes — this is the
 * whole point of the redesign: "60 Hz no matter what, even if it's slower than
 * real time." Mediabunny handles the VideoFrame → VideoEncoder → mux chain and
 * encoder backpressure internally; `add()` resolves when it's ready for more.
 *
 * Mediabunny is loaded with a dynamic import so it stays out of the initial
 * bundle — a recording is only ever started on an explicit user tap.
 */
export class WebCodecsClipEncoder implements ClipEncoder {
  readonly pacing = "frame-exact" as const;
  readonly extension: "mp4" | "webm";
  readonly mimeType: string;

  private finalized = false;

  private constructor(
    private readonly output: Output,
    private readonly target: BufferTarget,
    private readonly source: CanvasSource,
    private readonly fps: number,
    extension: "mp4" | "webm",
    mimeType: string,
  ) {
    this.extension = extension;
    this.mimeType = mimeType;
  }

  /**
   * Probes for a hardware/software-encodable codec at the requested resolution
   * and returns a ready encoder, or `null` if WebCodecs is unavailable or no
   * candidate codec can be encoded — signalling the caller to fall back.
   */
  static async create(
    canvas: HTMLCanvasElement,
    opts: WebCodecsEncoderOptions,
  ): Promise<WebCodecsClipEncoder | null> {
    if (!("VideoEncoder" in globalThis)) return null;

    let mb: typeof import("mediabunny");
    try {
      mb = await import("mediabunny");
    } catch {
      return null;
    }

    let codec: VideoCodec | null;
    try {
      codec = await mb.getFirstEncodableVideoCodec(CODEC_PRIORITY, {
        width: opts.width,
        height: opts.height,
        bitrate: opts.bitrate,
      });
    } catch {
      return null;
    }
    if (!codec) return null;

    const isAvc = codec === "avc";
    const target = new mb.BufferTarget();
    const format = isAvc
      ? // `in-memory` places the moov atom at the front (fast start) — required
        // for the preview <video> and for iOS Photos/share to accept the file.
        new mb.Mp4OutputFormat({ fastStart: "in-memory" })
      : new mb.WebMOutputFormat();
    const output = new mb.Output({ format, target });
    const source = new mb.CanvasSource(canvas, {
      codec,
      bitrate: opts.bitrate,
    });
    // `frameRate` snaps every sample timestamp to the fps grid, so the output is
    // exactly `fps` even if per-frame timestamps carry float rounding.
    output.addVideoTrack(source, { frameRate: opts.fps });

    return new WebCodecsClipEncoder(
      output,
      target,
      source,
      opts.fps,
      isAvc ? "mp4" : "webm",
      isAvc ? "video/mp4" : "video/webm",
    );
  }

  async start(): Promise<void> {
    await this.output.start();
  }

  async addFrame(frameIndex: number): Promise<void> {
    // Timestamp + duration are in seconds. `add()` captures the current canvas
    // synchronously, then resolves once the encoder can accept more (backpressure).
    await this.source.add(frameIndex / this.fps, 1 / this.fps);
  }

  async finalize(): Promise<RecordedClip> {
    await this.output.finalize();
    this.finalized = true;
    const buffer = this.target.buffer;
    if (!buffer) throw new Error("WebCodecs encoder produced no output buffer");
    return {
      blob: new Blob([buffer], { type: this.mimeType }),
      mimeType: this.mimeType,
      extension: this.extension,
    };
  }

  dispose(): void {
    if (this.finalized) return;
    this.finalized = true;
    // Abandon the in-flight output; swallow because dispose is a teardown path.
    void this.output.cancel().catch(() => {});
  }
}
