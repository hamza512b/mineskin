export class BackendNotSupportedError extends Error {
  constructor() {
    super("No supported graphics backend found");
    this.name = "BackendNotSupportedError";
  }
}

/**
 * Thrown when the current browser can't record the canvas to a video file —
 * i.e. it lacks `HTMLCanvasElement.captureStream` or `MediaRecorder`. The UI
 * catches this to show a "recording not supported" message rather than failing
 * silently.
 */
export class RecorderNotSupportedError extends Error {
  constructor() {
    super("Video recording is not supported in this browser");
    this.name = "RecorderNotSupportedError";
  }
}
