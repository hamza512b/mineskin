/**
 * How the offline record loop must feed a given encoder.
 *
 * - `frame-exact`: the encoder assigns each frame an explicit presentation
 *   timestamp (WebCodecs). The loop may run as fast as the CPU allows and the
 *   output is a guaranteed constant frame rate no matter how slow rendering is.
 * - `realtime`: the encoder timestamps frames by wall-clock arrival
 *   (MediaRecorder). The loop must pace itself to real time so the output frame
 *   rate stays close to the target; it can never be slower-than-realtime.
 */
export type EncoderPacing = "frame-exact" | "realtime";

/**
 * A finished recording, ready to be shared or downloaded. This is the contract
 * every consumer downstream of the recorder depends on — the `extension` names
 * the file the OS receives and MUST match the actual container bytes.
 */
export interface RecordedClip {
  blob: Blob;
  /** The negotiated MIME type (e.g. "video/mp4"). Also set as the Blob's type. */
  mimeType: string;
  /** File extension matching the blob — "mp4" on Apple platforms, else "webm". */
  extension: "mp4" | "webm";
  /** Native file URL used when an embedded WebView cannot play a Blob URL. */
  previewUrl?: string;
}

/**
 * Turns composited frames into an encoded video blob. Two implementations back
 * this seam: {@link WebCodecsClipEncoder} (preferred, frame-exact) and
 * {@link MediaRecorderClipEncoder} (fallback, realtime). The compositor and the
 * record loop are encoder-agnostic; only {@link EncoderPacing} tells the loop
 * how to drive it.
 */
export interface ClipEncoder {
  readonly pacing: EncoderPacing;
  /** Container of the finalized blob — drives {@link RecordedClip.extension}. */
  readonly extension: "mp4" | "webm";
  /** Correct, non-empty video MIME for the Blob's type (the share path gates on it). */
  readonly mimeType: string;

  /** Begin encoding. Must be awaited before the first {@link addFrame}. */
  start(): Promise<void>;

  /**
   * Submit the frame currently on the compositor's target canvas. `frameIndex`
   * yields the deterministic presentation timestamp for frame-exact encoders.
   * The returned promise resolves once the encoder can take more work — await it
   * to respect encoder backpressure.
   */
  addFrame(frameIndex: number): Promise<void>;

  /** Flush and mux. Resolves with the clip; rejects only on a real encode failure. */
  finalize(): Promise<RecordedClip>;

  /** Release all resources without producing output (cancel/error path). Idempotent. */
  dispose(): void;
}
