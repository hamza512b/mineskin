import { DebouncedFunc, throttle } from "lodash";
import { Renderer } from "./Renderer";
import { State } from "./State";

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

  private boundOnMouseMove = this.onMouseMove.bind(this);
  private boundOnMouseWheel = this.onMouseWheel.bind(this);
  private boundOnTouchStart = this.onTouchStart.bind(this);
  private boundOnTouchMove = this.onTouchMove.bind(this);
  private boundOnTouchEnd = this.onTouchEnd.bind(this);
  private boundOnMouseDown = this.onMouseDown.bind(this);
  private boundOnMouseUp = this.onMouseUp.bind(this);
  private boundOnMouseOut = this.onMouseOut.bind(this);
  private boundOnWindowBlur = this.onWindowBlur.bind(this);
  private constantsListener = this.onConstantsChange.bind(this);

  constructor(private renderer: Renderer) {}

  /** Returns true if the orbit control is currently active and responding to user input. */
  public get isControlling() {
    return this.controlling;
  }

  public mountListeners() {
    this.debouncedSave = throttle(() => {
      this.renderer.state.save();
    }, 500);

    this.renderer.backend.canvas?.addEventListener(
      "touchstart",
      this.boundOnTouchStart,
      false,
    );
    this.renderer.backend.canvas?.addEventListener(
      "touchmove",
      this.boundOnTouchMove,
      false,
    );
    this.renderer.backend.canvas?.addEventListener(
      "touchend",
      this.boundOnTouchEnd,
      false,
    );
    this.renderer.backend.canvas?.addEventListener(
      "mousedown",
      this.boundOnMouseDown,
      false,
    );
    this.renderer.backend.canvas?.addEventListener(
      "mousemove",
      this.boundOnMouseMove,
      false,
    );
    this.renderer.backend.canvas?.addEventListener(
      "mouseup",
      this.boundOnMouseUp,
      false,
    );
    this.renderer.backend.canvas?.addEventListener(
      "mouseout",
      this.boundOnMouseOut,
      false,
    );
    this.renderer.backend.canvas?.addEventListener(
      "wheel",
      this.boundOnMouseWheel,
      false,
    );
    window.addEventListener("blur", this.boundOnWindowBlur, false);
    this.renderer.state.addListener(this.constantsListener);
  }

  public unmountListeners() {
    {
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

      // Cancel any pending debounced save operations
      this.debouncedSave?.cancel();
    }
  }

  private getDistanceBetweenTouches(event: TouchEvent): number {
    const dx = event.touches[0].pageX - event.touches[1].pageX;
    const dy = event.touches[0].pageY - event.touches[1].pageY;
    return Math.hypot(dx, dy);
  }

  private rotateLeft(angle: number) {
    this.renderer.state.setCameraTheta(
      this.renderer.state.getCameraTheta() - angle,
      true,
      "orbitControl",
    );
  }

  private rotateTop(angle: number) {
    this.renderer.state.setCameraPhi(
      this.renderer.state.getCameraPhi() + angle,
      true,
      "orbitControl",
    );
  }

  private zoom(distance: number) {
    const currentRadius = this.renderer.state.getCameraRadius();
    const nextValue = currentRadius + distance;
    if (nextValue > 100) {
      this.renderer.state.setCameraRadius(100, true, "orbitControl");
      return;
    }
    if (nextValue < 25) {
      this.renderer.state.setCameraRadius(25, true, "orbitControl");
      return;
    }
    this.renderer.state.setCameraRadius(
      currentRadius + distance,
      true,
      "orbitControl",
    );
  }

  private onMouseMove(event: MouseEvent) {
    if (!this.cursorEnabled) return;
    this.controlling = true;
    this.rotateVelocity[0] += event.movementX;
    this.rotateVelocity[1] -= event.movementY;
  }

  private onMouseWheel(event: WheelEvent) {
    this.zoomVelocity += event.deltaY;
    this.controlling = true;
  }

  private onTouchStart(event: TouchEvent) {
    this.controlling = true;
    if (event.touches.length === 1) {
      this.lastTouchX = event.touches[0].pageX;
      this.lastTouchY = event.touches[0].pageY;
    } else if (event.touches.length === 2) {
      this.isPinching = true;
      this.initialPinchDistance = this.getDistanceBetweenTouches(event);
      this.rotateVelocity = [0, 0];
    }
  }

  private onTouchMove(event: TouchEvent) {
    event.preventDefault();
    if (event.touches.length === 1 && !this.isPinching) {
      const deltaX = event.touches[0].pageX - this.lastTouchX;
      const deltaY = event.touches[0].pageY - this.lastTouchY;
      this.rotateVelocity[0] += deltaX;
      this.rotateVelocity[1] -= deltaY;
      this.lastTouchX = event.touches[0].pageX;
      this.lastTouchY = event.touches[0].pageY;
      this.controlling = true;
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

  private onConstantsChange(
    _constants: State,
    origin: string | undefined,
    value: string,
  ) {
    if (origin === "orbitControl") return;
    if (
      value !== "cameraPhi" &&
      value !== "cameraTheta" &&
      value !== "cameraRadius" &&
      value !== "all"
    )
      return;
    this.rotateVelocity = [0, 0];
    this.zoomVelocity = 0;
    this.controlling = false;
  }

  public update() {
    if (
      Math.abs(this.rotateVelocity[0]) > 0.001 ||
      Math.abs(this.rotateVelocity[1]) > 0.001 ||
      Math.abs(this.zoomVelocity) > 0.001
    ) {
      if (!this.renderer.backend.canvas) return;
      this.rotateVelocity[0] *=
        1 - this.renderer.state.getCameraDampingFactor();
      this.rotateVelocity[1] *=
        1 - this.renderer.state.getCameraDampingFactor();
      this.zoomVelocity *= 1 - this.renderer.state.getCameraDampingFactor();
      this.rotateLeft(
        ((2 * Math.PI * this.rotateVelocity[0]) /
          this.renderer.backend.canvas.clientWidth) *
          this.renderer.state.getCameraSpeed(),
      );
      this.rotateTop(
        ((2 * Math.PI * this.rotateVelocity[1]) /
          this.renderer.backend.canvas.clientHeight) *
          this.renderer.state.getCameraSpeed(),
      );
      this.zoom(this.zoomVelocity * this.renderer.state.getCameraSpeed() * 0.1);

      // save to local storage (debounced)
      this.debouncedSave?.();
    } else {
      this.rotateVelocity = [0, 0];
      this.zoomVelocity = 0;
    }
  }
}
