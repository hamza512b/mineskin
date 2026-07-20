import type { ClipEncoder, RecordedClip } from "./ClipEncoder";

type ManualCaptureTrack = MediaStreamTrack & { requestFrame: () => void };

export interface MediaRecorderEncoderOptions {
  fps: number;
  bitrate: number;
}

/**
 * MIME types we try, best-first. Safari's MediaRecorder emits real MP4/H.264,
 * so on iOS/macOS we get a share-ready file with no transcode; Chromium falls
 * back to WebM.
 */
const MIME_CANDIDATES: Array<{ mimeType: string; extension: "mp4" | "webm" }> = [
  { mimeType: "video/mp4;codecs=h264", extension: "mp4" },
  { mimeType: "video/mp4", extension: "mp4" },
  { mimeType: "video/webm;codecs=vp9", extension: "webm" },
  { mimeType: "video/webm;codecs=vp8", extension: "webm" },
  { mimeType: "video/webm", extension: "webm" },
];

function pickMimeType(): { mimeType: string; extension: "mp4" | "webm" } {
  for (const candidate of MIME_CANDIDATES) {
    if (MediaRecorder.isTypeSupported(candidate.mimeType)) return candidate;
  }
  // Let the browser choose its default container; assume WebM for the name.
  return { mimeType: "", extension: "webm" };
}

/**
 * Realtime fallback encoder for browsers without WebCodecs. Wraps
 * `canvas.captureStream` + `MediaRecorder`, which timestamps frames by
 * wall-clock arrival — so the record loop paces itself to real time and cannot
 * run slower than real time. Content is still deterministic (the loop drives the
 * animation frame by frame); only the timing is best-effort. This is the legacy
 * pipeline, kept intact for compatibility.
 */
export class MediaRecorderClipEncoder implements ClipEncoder {
  readonly pacing = "realtime" as const;
  readonly extension: "mp4" | "webm";
  readonly mimeType: string;

  private readonly canvas: HTMLCanvasElement;
  private readonly opts: MediaRecorderEncoderOptions;
  private readonly chosen: { mimeType: string; extension: "mp4" | "webm" };
  private recorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private captureTrack: ManualCaptureTrack | null = null;
  private chunks: Blob[] = [];
  private error: Error | null = null;

  static isSupported(canvas: HTMLCanvasElement): boolean {
    return (
      typeof MediaRecorder !== "undefined" &&
      typeof canvas.captureStream === "function"
    );
  }

  constructor(canvas: HTMLCanvasElement, opts: MediaRecorderEncoderOptions) {
    this.canvas = canvas;
    this.opts = opts;
    this.chosen = pickMimeType();
    this.extension = this.chosen.extension;
    this.mimeType = this.chosen.mimeType || "video/webm";
  }

  async start(): Promise<void> {
    const { stream, captureTrack } = this.createCaptureStream();
    this.stream = stream;
    this.captureTrack = captureTrack;
    this.chunks = [];
    try {
      this.recorder = new MediaRecorder(stream, {
        ...(this.chosen.mimeType ? { mimeType: this.chosen.mimeType } : {}),
        videoBitsPerSecond: this.opts.bitrate,
      });
      this.recorder.ondataavailable = (event) => {
        if (event.data.size > 0) this.chunks.push(event.data);
      };
      this.recorder.onerror = (event) => {
        this.error = getRecorderError(event);
      };
      this.recorder.start();
    } catch (e) {
      // `new MediaRecorder`/`start()` can throw (e.g. NotSupportedError) even
      // after isTypeSupported passed. Stop the live capture stream we just
      // opened so the source canvas isn't left captured and the track leaked.
      this.dispose();
      throw e;
    }
  }

  async addFrame(): Promise<void> {
    if (this.error) throw this.error;
    // The frame is already composited onto the captured canvas; explicitly
    // request it so a sparsely-changing canvas still emits a frame.
    this.captureTrack?.requestFrame();
  }

  finalize(): Promise<RecordedClip> {
    return new Promise((resolve, reject) => {
      const recorder = this.recorder;
      if (!recorder) {
        reject(new Error("MediaRecorderClipEncoder.finalize() before start()"));
        return;
      }

      let settled = false;
      const settle = (error: Error | null = this.error) => {
        if (settled) return;
        settled = true;
        const type = this.chosen.mimeType || recorder.mimeType || "video/webm";
        const blob = new Blob(this.chunks, { type });
        this.dispose();
        if (error) {
          reject(error);
          return;
        }
        resolve({ blob, mimeType: type, extension: this.chosen.extension });
      };

      recorder.onstop = () => settle();
      recorder.onerror = (event) => {
        this.error = getRecorderError(event);
        if (recorder.state === "inactive") settle(this.error);
      };

      if (recorder.state === "inactive") {
        settle();
        return;
      }

      try {
        recorder.stop();
      } catch (e) {
        settle(e instanceof Error ? e : new Error(String(e)));
      }
    });
  }

  dispose(): void {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    this.captureTrack = null;
    this.recorder = null;
  }

  private createCaptureStream(): {
    stream: MediaStream;
    captureTrack: ManualCaptureTrack | null;
  } {
    const manualStream = this.canvas.captureStream(0);
    const track = manualStream.getVideoTracks()[0] as
      | (MediaStreamTrack & { requestFrame?: unknown })
      | undefined;
    if (typeof track?.requestFrame === "function") {
      return { stream: manualStream, captureTrack: track as ManualCaptureTrack };
    }

    manualStream.getTracks().forEach((streamTrack) => streamTrack.stop());
    return {
      stream: this.canvas.captureStream(this.opts.fps),
      captureTrack: null,
    };
  }
}

function getRecorderError(event: Event): Error {
  const maybeError = (event as Event & { error?: unknown }).error;
  if (maybeError instanceof Error) return maybeError;
  return new Error("MediaRecorder failed while recording");
}
