import { Capacitor, registerPlugin } from "@capacitor/core";
import type { ClipEncoder, RecordedClip } from "./ClipEncoder";

interface NativeVideoEncoderPlugin {
  start(options: {
    width: number;
    height: number;
    fps: number;
    bitrate: number;
  }): Promise<void>;
  addFrame(options: { jpeg: string; frameIndex: number }): Promise<void>;
  finish(): Promise<{ base64: string; uri: string }>;
  cancel(): Promise<void>;
}

const NativeVideoEncoder =
  registerPlugin<NativeVideoEncoderPlugin>("NativeVideoEncoder");

/** AVAssetWriter fallback for Apple native WebViews without web video encoders. */
export class NativeAppleClipEncoder implements ClipEncoder {
  readonly pacing = "frame-exact" as const;
  readonly extension = "mp4" as const;
  readonly mimeType = "video/mp4";
  private started = false;

  static isSupported(): boolean {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "ios";
  }

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly opts: {
      width: number;
      height: number;
      fps: number;
      bitrate: number;
    },
  ) {}

  async start(): Promise<void> {
    await NativeVideoEncoder.start(this.opts);
    this.started = true;
  }

  async addFrame(frameIndex: number): Promise<void> {
    // JPEG keeps bridge traffic far smaller than raw RGBA/PNG. AVAssetWriter
    // assigns the deterministic timestamp supplied by frameIndex.
    const jpeg = this.canvas.toDataURL("image/jpeg", 0.9).split(",", 2)[1];
    await NativeVideoEncoder.addFrame({ jpeg, frameIndex });
  }

  async finalize(): Promise<RecordedClip> {
    const { base64, uri } = await NativeVideoEncoder.finish();
    this.started = false;
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return {
      blob: new Blob([bytes], { type: this.mimeType }),
      mimeType: this.mimeType,
      extension: this.extension,
      // WKWebView on iOS-on-Mac does not reliably load MP4 data from blob:
      // URLs. Capacitor's file URL supports the byte-range requests <video>
      // needs for metadata, seeking, and playback.
      previewUrl: Capacitor.convertFileSrc(uri),
    };
  }

  dispose(): void {
    if (this.started) void NativeVideoEncoder.cancel();
    this.started = false;
  }
}
