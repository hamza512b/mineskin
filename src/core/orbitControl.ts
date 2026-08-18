import { DebouncedFunc, throttle } from "lodash";
import { getRendererState, subscribeToRenderer } from "../store";
import { getEnvironmentCameraFloorY } from "./environment";
import { Renderer } from "./Renderer";

// Frame rate the camera tuning (cameraSpeed / cameraDampingFactor) was authored
// against. update() normalizes every frame to this baseline so orbit speed and
// coast length are identical at 60Hz, 120Hz, 144Hz, etc.
const BASELINE_FPS = 60;

// Upper bound on the per-frame normalization factor. Without it, the first frame
// (lastFrameTime = 0) or a frame after the tab was backgrounded would integrate
// a multi-second dt in one step and teleport the camera.
const MAX_FRAME_STEP = 3;

let firstOrbitTracked = false;

function trackFirstOrbit(input: "mouse" | "touch") {
  if (firstOrbitTracked) return;
  firstOrbitTracked = true;
  window.gtag?.("event", "first_orbit", { input });
}

export class OrbitControl {
  private controlling: boolean = false;
  private cursorEnabled = false;
  private rotateVelocity = [0, 0];
  private zoomVelocity = 0;
  private lastTouchX = 0;
  private lastTouchY = 0;
  private initialPinchDistance: number | null = null;
  private isPinching = false;
  private debouncedSave?: DebouncedFunc<() => void>;
  private unsubscribe?: () => void;

  private boundOnMouseMove = this.onMouseMove.bind(this);
  private boundOnMouseWheel = this.onMouseWheel.bind(this);
  private boundOnTouchStart = this.onTouchStart.bind(this);
  private boundOnTouchMove = this.onTouchMove.bind(this);
  private boundOnTouchEnd = this.onTouchEnd.bind(this);
  private boundOnMouseDown = this.onMouseDown.bind(this);
  private boundOnMouseUp = this.onMouseUp.bind(this);
  private boundOnMouseOut = this.onMouseOut.bind(this);
  private boundOnWindowBlur = this.onWindowBlur.bind(this);

  constructor(private renderer: Renderer) {}

  /** Returns true if the orbit control is currently active and responding to user input. */
  public get isControlling() {
    return this.controlling;
  }

  /** Clears in-flight damping so scripted camera moves start from a stable pose. */
  public resetVelocity() {
    this.controlling = false;
    this.cursorEnabled = false;
    this.rotateVelocity = [0, 0];
    this.zoomVelocity = 0;
    this.initialPinchDistance = null;
    this.isPinching = false;
  }

  /**
   * Halts any in-flight coast (leftover rotate/zoom velocity from a previous
   * fling) so a fresh pointer interaction grabs the camera at rest instead of
   * compounding on top of the old momentum.
   */
  private stopCoast() {
    this.rotateVelocity = [0, 0];
    this.zoomVelocity = 0;
  }

  public mountListeners() {
    this.debouncedSave = throttle(() => {
      getRendererState().save();
    }, 500);

    this.renderer.backend.canvas?.addEventListener(
      "touchstart",
      this.boundOnTouchStart,
      { passive: true },
    );
    this.renderer.backend.canvas?.addEventListener(
      "touchmove",
      this.boundOnTouchMove,
      { passive: false },
    );
    this.renderer.backend.canvas?.addEventListener(
      "touchend",
      this.boundOnTouchEnd,
      { passive: true },
    );
    this.renderer.backend.canvas?.addEventListener(
      "mousedown",
      this.boundOnMouseDown,
      { passive: true },
    );
    this.renderer.backend.canvas?.addEventListener(
      "mousemove",
      this.boundOnMouseMove,
      { passive: true },
    );
    this.renderer.backend.canvas?.addEventListener(
      "mouseup",
      this.boundOnMouseUp,
      { passive: true },
    );
    this.renderer.backend.canvas?.addEventListener(
      "mouseout",
      this.boundOnMouseOut,
      { passive: true },
    );
    this.renderer.backend.canvas?.addEventListener(
      "wheel",
      this.boundOnMouseWheel,
      { passive: true },
    );
    window.addEventListener("blur", this.boundOnWindowBlur, { passive: true });

    // Subscribe to store changes to reset velocity when camera values change externally
    this.unsubscribe = subscribeToRenderer((state, prevState) => {
      // Only reset if change came from outside orbitControl (e.g., from UI)
      if (
        state.cameraPhi !== prevState.cameraPhi ||
        state.cameraTheta !== prevState.cameraTheta ||
        state.cameraRadius !== prevState.cameraRadius
      ) {
        // Check if we're not the ones controlling AND velocities are already near zero
        // (if velocities are non-zero, we're applying damping and shouldn't reset)
        const hasVelocity =
          Math.abs(this.rotateVelocity[0]) > 0.001 ||
          Math.abs(this.rotateVelocity[1]) > 0.001 ||
          Math.abs(this.zoomVelocity) > 0.001;
        if (!this.controlling && !hasVelocity) {
          this.rotateVelocity = [0, 0];
          this.zoomVelocity = 0;
        }
      }
    });
  }

  public unmountListeners() {
    this.renderer.backend.canvas?.removeEventListener(
      "touchstart",
      this.boundOnTouchStart,
    );
    this.renderer.backend.canvas?.removeEventListener(
      "touchmove",
      this.boundOnTouchMove,
    );
    this.renderer.backend.canvas?.removeEventListener(
      "touchend",
      this.boundOnTouchEnd,
    );
    this.renderer.backend.canvas?.removeEventListener(
      "mousedown",
      this.boundOnMouseDown,
    );
    this.renderer.backend.canvas?.removeEventListener(
      "mousemove",
      this.boundOnMouseMove,
    );
    this.renderer.backend.canvas?.removeEventListener(
      "mouseup",
      this.boundOnMouseUp,
    );
    this.renderer.backend.canvas?.removeEventListener(
      "mouseout",
      this.boundOnMouseOut,
    );
    this.renderer.backend.canvas?.removeEventListener(
      "wheel",
      this.boundOnMouseWheel,
    );
    window.removeEventListener("blur", this.boundOnWindowBlur);

    // Unsubscribe from store
    this.unsubscribe?.();

    // Cancel any pending debounced save operations
    this.debouncedSave?.cancel();
  }

  private getDistanceBetweenTouches(event: TouchEvent): number {
    const dx = event.touches[0].pageX - event.touches[1].pageX;
    const dy = event.touches[0].pageY - event.touches[1].pageY;
    return Math.hypot(dx, dy);
  }

  private rotateLeft(angle: number) {
    const state = getRendererState();
    state.setValue("cameraTheta", state.cameraTheta - angle, "orbitControl");
  }

  private rotateTop(angle: number) {
    const state = getRendererState();
    let nextPhi = state.cameraPhi + angle;

    // When an environment is active, clamp the vertical angle so the camera
    // cannot orbit below the ground plane (keeps the skin visible).
    // maxPhi is computed dynamically from the environment's ground elevation
    // and the current zoom radius.
    const floorY = getEnvironmentCameraFloorY(state.environmentPreset);
    if (floorY !== null) {
      // Camera Y = -radius * sin(phi). Stay above floorY:
      //   -radius * sin(phi) > floorY  →  sin(phi) < -floorY / radius
      // Also clamp the lower bound so phi can't wrap past the top of the
      // sphere and re-enter the underground hemisphere from behind.
      const ratio = Math.min(1, -floorY / state.cameraRadius);
      const maxPhi = Math.asin(ratio);
      nextPhi = Math.max(-Math.PI / 2, Math.min(nextPhi, maxPhi));
    }

    state.setValue("cameraPhi", nextPhi, "orbitControl");
  }

  private zoom(distance: number) {
    const state = getRendererState();
    const currentRadius = state.cameraRadius;
    const nextRadius = Math.min(100, Math.max(25, currentRadius + distance));
    state.setValue("cameraRadius", nextRadius, "orbitControl");

    const floorY = getEnvironmentCameraFloorY(state.environmentPreset);
    if (floorY !== null) {
      const ratio = Math.min(1, -floorY / nextRadius);
      const maxPhi = Math.asin(ratio);
      const clamped = Math.max(-Math.PI / 2, Math.min(state.cameraPhi, maxPhi));
      if (clamped !== state.cameraPhi) {
        state.setValue("cameraPhi", clamped, "orbitControl");
      }
    }
  }

  private onMouseMove(event: MouseEvent) {
    if (!this.cursorEnabled) return;
    // A pose gizmo drag owns the gesture — orbiting at the same time would spin
    // the camera out from under the handle the pointer is holding.
    if (getRendererState().poseDragActive) return;
    this.controlling = true;
    this.rotateVelocity[0] += event.movementX;
    this.rotateVelocity[1] -= event.movementY;
    if (event.movementX !== 0 || event.movementY !== 0) {
      trackFirstOrbit("mouse");
    }
  }

  private onMouseWheel(event: WheelEvent) {
    this.zoomVelocity += event.deltaY;
    this.controlling = true;
  }

  private onTouchStart(event: TouchEvent) {
    const state = getRendererState();
    // If touch drawing is actively happening, don't start orbit control for single touch
    if (state.touchDrawActive && event.touches.length === 1) {
      return;
    }
    // A finger that landed on a pose handle is posing, not orbiting.
    // `pointerdown` runs before `touchstart`, so the flag is already set here.
    if (state.poseDragActive && event.touches.length === 1) {
      return;
    }
    this.controlling = true;
    // A new touch grabs the camera: kill any coast so the gesture starts fresh.
    this.stopCoast();
    if (event.touches.length === 1) {
      this.lastTouchX = event.touches[0].pageX;
      this.lastTouchY = event.touches[0].pageY;
    } else if (event.touches.length === 2) {
      this.isPinching = true;
      this.initialPinchDistance = this.getDistanceBetweenTouches(event);
    }
  }

  private onTouchMove(event: TouchEvent) {
    const state = getRendererState();
    // If touch drawing is actively happening, don't rotate for single touch
    if (state.touchDrawActive && event.touches.length === 1) {
      return;
    }
    if (state.poseDragActive && event.touches.length === 1) {
      return;
    }
    event.preventDefault();
    if (event.touches.length === 1 && !this.isPinching) {
      const deltaX = event.touches[0].pageX - this.lastTouchX;
      const deltaY = event.touches[0].pageY - this.lastTouchY;
      this.rotateVelocity[0] += deltaX;
      this.rotateVelocity[1] -= deltaY;
      this.lastTouchX = event.touches[0].pageX;
      this.lastTouchY = event.touches[0].pageY;
      this.controlling = true;
      if (deltaX !== 0 || deltaY !== 0) {
        trackFirstOrbit("touch");
      }
    } else if (event.touches.length === 2) {
      const currentPinchDistance = this.getDistanceBetweenTouches(event);
      const pinchDelta =
        currentPinchDistance - (this.initialPinchDistance ?? 0);
      this.zoomVelocity -= pinchDelta * 1.5;
      this.initialPinchDistance = currentPinchDistance;
      this.controlling = true;
    }
  }

  private onTouchEnd(event: TouchEvent) {
    if (event.touches.length < 2) {
      this.isPinching = false;
      if (event.touches.length === 1) {
        this.lastTouchX = event.touches[0].pageX;
        this.lastTouchY = event.touches[0].pageY;
      }
      this.initialPinchDistance = null;
      this.controlling = true;
    }
  }

  private onMouseDown() {
    this.cursorEnabled = true;
    this.controlling = true;
    // A click grabs the camera: kill any coast so this drag starts from rest
    // instead of compounding on the leftover momentum.
    this.stopCoast();
  }

  private onMouseUp() {
    this.cursorEnabled = false;
    this.controlling = false;
  }

  private onMouseOut() {
    this.cursorEnabled = false;
    this.controlling = false;
  }

  private onWindowBlur() {
    this.cursorEnabled = false;
    this.controlling = false;
  }

  public update(deltaTime = 1 / BASELINE_FPS) {
    const state = getRendererState();

    if (
      Math.abs(this.rotateVelocity[0]) > 0.001 ||
      Math.abs(this.rotateVelocity[1]) > 0.001 ||
      Math.abs(this.zoomVelocity) > 0.001
    ) {
      if (!this.renderer.backend.canvas) return;

      // How many baseline (60Hz) frames this real frame represents. At 60Hz this
      // is 1 and the math below is identical to the original per-frame version;
      // at 144Hz it is ~0.42, at 30Hz ~2, keeping speed and coast time constant
      // across refresh rates. Clamped so a huge dt can't teleport the camera.
      const frameStep = Math.min(
        Math.max(deltaTime, 0) * BASELINE_FPS,
        MAX_FRAME_STEP,
      );

      // Apply the current velocity, scaled to this frame's real duration.
      this.rotateLeft(
        ((2 * Math.PI * this.rotateVelocity[0]) /
          this.renderer.backend.canvas.clientWidth) *
          state.cameraSpeed *
          frameStep,
      );
      this.rotateTop(
        ((2 * Math.PI * this.rotateVelocity[1]) /
          this.renderer.backend.canvas.clientHeight) *
          state.cameraSpeed *
          frameStep,
      );
      this.zoom(this.zoomVelocity * state.cameraSpeed * 0.1 * frameStep);

      // Damp per elapsed time rather than per frame so the coast decays over the
      // same wall-clock duration regardless of frame rate.
      const damping = Math.pow(1 - state.cameraDampingFactor, frameStep);
      this.rotateVelocity[0] *= damping;
      this.rotateVelocity[1] *= damping;
      this.zoomVelocity *= damping;

      // save to local storage (debounced)
      this.debouncedSave?.();
    } else {
      this.rotateVelocity = [0, 0];
      this.zoomVelocity = 0;
    }
  }
}
