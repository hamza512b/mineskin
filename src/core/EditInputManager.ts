import { getRendererState } from "../store";
import type { MinecraftSkinMaterial } from "./MeshMaterial";
import { MiSkiEditingRenderer } from "./MiSkiRenderer";

const MULTI_FINGER_TAP_MAX_DURATION_MS = 300;
const MULTI_FINGER_TAP_MAX_MOVEMENT_PX = 12;

type TouchPointer = {
  startX: number;
  startY: number;
};

export class EditInputManager {
  private isDrawing = false;
  private touchHitActive = false;
  private touchStart: { x: number; y: number } | null = null;
  private touchPointers = new Map<number, TouchPointer>();
  private touchGestureStartedAt = 0;
  private touchGestureMaxPointers = 0;
  private touchGestureEligible = false;
  private touchGestureBaseline: MinecraftSkinMaterial | null = null;
  private suppressTouchPainting = false;
  private touchSuppressionResetTimer: ReturnType<typeof setTimeout> | null =
    null;

  private boundOnVisibilityChange = this.onVisibilityChange.bind(this);
  private onVisibilityChange() {
    if (document.hidden) this.onWindowBlur();
  }

  constructor(public renderer: MiSkiEditingRenderer) {}

  // Route a paint event to the active pixel tool. Bulk is excluded — callers
  // handle fillFace separately because it also short-circuits pointer flow.
  private paintAt(x: number, y: number) {
    const state = getRendererState();
    if (state.paintMode === "eraser") {
      this.renderer.eraseAt(x, y);
    } else if (state.paintMode === "variation") {
      this.renderer.variateAt(x, y);
    } else if (state.paintMode === "dither") {
      this.renderer.ditherAt(x, y);
    } else {
      this.renderer.drawAt(x, y);
    }
  }

  public mountListeners() {
    this.renderer.backend.canvas?.addEventListener(
      "pointerdown",
      this.onPointerDown,
    );
    this.renderer.backend.canvas?.addEventListener(
      "pointermove",
      this.onPointerMove,
      true,
    );
    this.renderer.backend.canvas?.addEventListener(
      "pointerup",
      this.onPointerUp,
      true,
    );
    this.renderer.backend.canvas?.addEventListener(
      "pointercancel",
      this.onPointerUp,
      true,
    );
    this.renderer.backend.canvas?.addEventListener(
      "contextmenu",
      this.onContextMenu,
    );
    this.renderer.backend.canvas?.addEventListener(
      "pointerleave",
      this.onPointerLeave,
    );
    window.addEventListener("pointerup", this.onPointerUp, true);
    window.addEventListener("blur", this.onWindowBlur);
    document.addEventListener("visibilitychange", this.boundOnVisibilityChange);
    document.addEventListener("keydown", this.onKeyDown);
  }

  private onPointerDown = (e: PointerEvent) => {
    if (!this.renderer.backend.canvas) return;
    const { x, y } = this.getPointerPos(e);
    if (e.pointerType === "touch") {
      if (this.onTouchPointerDown(e)) {
        e.preventDefault();
        return;
      }
      const state = getRendererState();
      // For touch color picker, pick immediately on touch down
      if (state.colorPickerActive) {
        const picked = this.renderer.pickColor(x, y);
        if (picked) {
          state.setValue("colorPickerActive", false);
        }
        e.preventDefault();
        return;
      }
      // For touch, store initial position.
      this.touchStart = { x, y };
      if (this.renderer.getMeshHitAt(x, y)) {
        this.touchHitActive = true;
        // In draw mode, bulk paints continuously like the pen tool.
        if (state.touchDrawMode && state.paintMode === "bulk") {
          state.setTouchDrawActive(true);
          this.isDrawing = true;
          this.setFrontIndicatorVisible(false);
          this.renderer.backend.canvas.style.cursor = "crosshair";
          this.renderer.undoRedoManager?.beginBatch();
          this.renderer.beginFillStroke();
          this.renderer.fillFace(x, y);
          e.preventDefault();
          return;
        }
        // If touch draw mode is enabled, start drawing immediately like mouse
        if (state.touchDrawMode) {
          this.isDrawing = true;
          this.setFrontIndicatorVisible(false);
          state.setTouchDrawActive(true);
          this.renderer.backend.canvas.style.cursor = "crosshair";
          this.renderer.undoRedoManager?.beginBatch();
          this.paintAt(x, y);
          e.preventDefault();
        }
      }
    } else {
      // If color picker is active, pick the color and reset.
      const state = getRendererState();
      if (state.colorPickerActive) {
        const picked = this.renderer.pickColor(x, y);
        if (picked) {
          state.setValue("colorPickerActive", false);
        }
        return;
      }
      // Bulk mode on desktop "splashes" continuously like the pen.
      if (state.paintMode === "bulk") {
        if (this.renderer.getMeshHitAt(x, y)) {
          this.isDrawing = true;
          this.renderer.hoverHighlight = null;
          this.setFrontIndicatorVisible(false);
          this.renderer.backend.canvas.style.cursor = "crosshair";
          this.renderer.undoRedoManager?.beginBatch();
          this.renderer.beginFillStroke();
          this.renderer.fillFace(x, y);
          this.renderer.backend.canvas?.setPointerCapture(e.pointerId);
          e.preventDefault();
        }
        return;
      }

      // Otherwise (pixel or variation mode), proceed as before.
      if (this.renderer.getMeshHitAt(x, y)) {
        this.isDrawing = true;
        this.renderer.hoverHighlight = null;
        this.setFrontIndicatorVisible(false);
        this.renderer.backend.canvas.style.cursor = "crosshair";
        this.renderer.undoRedoManager?.beginBatch();
        this.paintAt(x, y);
        this.renderer.backend.canvas?.setPointerCapture(e.pointerId);
        e.preventDefault();
        return;
      }

      this.isDrawing = false;
      this.renderer.backend.canvas.style.cursor = "grab";
    }
  };

  private onPointerMove = (e: PointerEvent) => {
    if (e.pointerType === "touch" && this.onTouchPointerMove(e)) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    const { x, y } = this.getPointerPos(e);
    if (e.pointerType === "touch") {
      // Draw on touch move if touch draw mode is enabled
      const state = getRendererState();
      if (state.touchDrawMode && this.isDrawing) {
        if (state.paintMode === "bulk") {
          this.renderer.fillFace(x, y);
        } else {
          this.paintAt(x, y);
        }
        e.preventDefault();
        e.stopPropagation();
      }
    } else {
      if (this.isDrawing) {
        const state = getRendererState();
        if (state.paintMode === "bulk") {
          this.renderer.fillFace(x, y);
        } else {
          this.paintAt(x, y);
        }
        e.preventDefault();
        e.stopPropagation();
      } else {
        this.renderer.updateCursor(x, y);
      }
    }
  };

  private onPointerUp = (e: PointerEvent) => {
    if (!this.renderer.backend.canvas) return;
    if (e.pointerType === "touch" && this.onTouchPointerUp(e)) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    const { x, y } = this.getPointerPos(e);
    if (e.pointerType === "touch") {
      const state = getRendererState();
      if (state.touchDrawMode && this.isDrawing) {
        // End drawing batch for touch draw mode
        this.isDrawing = false;
        this.setFrontIndicatorVisible(true);
        state.setTouchDrawActive(false);
        this.renderer.undoRedoManager?.endBatch();
        this.renderer.backend.canvas.style.cursor = "grab";
        e.preventDefault();
        e.stopPropagation();
      } else if (state.touchDrawMode && state.touchDrawActive) {
        // End touch draw active for instant tools like bucket
        state.setTouchDrawActive(false);
      } else if (this.touchHitActive && this.touchStart) {
        const dx = x - this.touchStart.x;
        const dy = y - this.touchStart.y;
        if (dx * dx + dy * dy < 25) {
          if (state.paintMode === "bulk") {
            this.renderer.undoRedoManager?.beginBatch();
            this.renderer.beginFillStroke();
            this.renderer.fillFace(x, y);
            this.renderer.undoRedoManager?.endBatch();
          } else {
            this.renderer.undoRedoManager?.beginBatch();
            this.paintAt(x, y);
            this.renderer.undoRedoManager?.endBatch();
          }
        }
      }
      this.touchHitActive = false;
      this.touchStart = null;
    } else {
      if (this.isDrawing) {
        this.isDrawing = false;
        this.setFrontIndicatorVisible(true);
        this.renderer.undoRedoManager?.endBatch();
        this.renderer.backend.canvas.style.cursor = "grab";
        if (this.renderer.backend.canvas.hasPointerCapture(e.pointerId)) {
          this.renderer.backend.canvas.releasePointerCapture(e.pointerId);
        }
        e.preventDefault();
        e.stopPropagation();
      }
    }
  };

  private onPointerLeave = () => {
    this.renderer.hoverHighlight = null;
  };

  private onContextMenu = (e: Event) => {
    e.preventDefault();
  };

  private onWindowBlur = () => {
    if (!this.renderer.backend.canvas) return;
    this.resetTouchGesture();
    if (this.isDrawing) {
      this.isDrawing = false;
      this.setFrontIndicatorVisible(true);
      this.renderer.undoRedoManager?.endBatch();
      this.renderer.backend.canvas.style.cursor = "grab";
    }
  };

  private setFrontIndicatorVisible(visible: boolean) {
    const skin = this.renderer.getMainSkin();
    if (skin) {
      skin.setFrontIndicatorTargetOpacity(visible ? 1 : 0);
    }
  }

  private getPointerPos(e: PointerEvent): { x: number; y: number } {
    if (!this.renderer.backend.canvas) return { x: 0, y: 0 };
    const rect = this.renderer.backend.canvas.getBoundingClientRect();
    const scaleX = this.renderer.backend.canvas.width / rect.width;
    const scaleY = this.renderer.backend.canvas.height / rect.height;
    return {
      x: Math.floor((e.clientX - rect.left) * scaleX),
      y: Math.floor((e.clientY - rect.top) * scaleY),
    };
  }

  /**
   * Tracks touch pointers before painting starts so a second or third finger
   * can turn the interaction into an undo/redo tap without leaving behind the
   * pixel painted by the first finger.
   */
  private onTouchPointerDown(e: PointerEvent): boolean {
    if (this.touchPointers.size === 0) {
      if (this.touchSuppressionResetTimer !== null) {
        clearTimeout(this.touchSuppressionResetTimer);
        this.touchSuppressionResetTimer = null;
      }
      this.touchGestureStartedAt = performance.now();
      this.touchGestureMaxPointers = 0;
      this.touchGestureEligible = true;
      this.touchGestureBaseline = this.renderer.getMainSkin().material.clone();
      this.suppressTouchPainting = false;
    }

    this.touchPointers.set(e.pointerId, {
      startX: e.clientX,
      startY: e.clientY,
    });
    this.touchGestureMaxPointers = Math.max(
      this.touchGestureMaxPointers,
      this.touchPointers.size,
    );

    if (
      performance.now() - this.touchGestureStartedAt >
        MULTI_FINGER_TAP_MAX_DURATION_MS ||
      this.touchGestureMaxPointers > 3
    ) {
      this.touchGestureEligible = false;
    }

    if (this.touchPointers.size >= 2 && this.touchGestureEligible) {
      this.suppressTouchPainting = true;
      this.cancelTouchStrokeForGesture();
    }

    return this.suppressTouchPainting;
  }

  private onTouchPointerMove(e: PointerEvent): boolean {
    const pointer = this.touchPointers.get(e.pointerId);
    if (!pointer) return this.suppressTouchPainting;

    const dx = e.clientX - pointer.startX;
    const dy = e.clientY - pointer.startY;
    if (
      dx * dx + dy * dy >
      MULTI_FINGER_TAP_MAX_MOVEMENT_PX * MULTI_FINGER_TAP_MAX_MOVEMENT_PX
    ) {
      this.touchGestureEligible = false;
    }

    return this.suppressTouchPainting;
  }

  private onTouchPointerUp(e: PointerEvent): boolean {
    if (!this.touchPointers.has(e.pointerId)) {
      return this.suppressTouchPainting;
    }

    if (e.type === "pointercancel") {
      this.touchGestureEligible = false;
    } else {
      this.onTouchPointerMove(e);
    }

    this.touchPointers.delete(e.pointerId);
    const wasSuppressed = this.suppressTouchPainting;

    if (this.touchPointers.size === 0) {
      const elapsed = performance.now() - this.touchGestureStartedAt;
      const fingerCount = this.touchGestureMaxPointers;
      const shouldTrigger =
        wasSuppressed &&
        this.touchGestureEligible &&
        elapsed <= MULTI_FINGER_TAP_MAX_DURATION_MS &&
        (fingerCount === 2 || fingerCount === 3);

      if (shouldTrigger) {
        if (fingerCount === 2) {
          void this.renderer.undoRedoManager.undo();
        } else {
          void this.renderer.undoRedoManager.redo();
        }
      }

      this.resetTouchGesture(wasSuppressed);
    }

    return wasSuppressed;
  }

  private cancelTouchStrokeForGesture() {
    const baseline = this.touchGestureBaseline;
    if (!baseline) return;

    const skin = this.renderer.getMainSkin();
    skin.material = baseline.clone();

    if (this.isDrawing) {
      this.isDrawing = false;
      this.setFrontIndicatorVisible(true);
      getRendererState().setTouchDrawActive(false);
      this.renderer.undoRedoManager.endBatch();
      if (this.renderer.backend.canvas) {
        this.renderer.backend.canvas.style.cursor = "grab";
      }
    }

    this.touchHitActive = false;
    this.touchStart = null;
  }

  private resetTouchGesture(deferSuppressionReset = false) {
    this.touchPointers.clear();
    this.touchGestureStartedAt = 0;
    this.touchGestureMaxPointers = 0;
    this.touchGestureEligible = false;
    this.touchGestureBaseline = null;

    if (this.touchSuppressionResetTimer !== null) {
      clearTimeout(this.touchSuppressionResetTimer);
      this.touchSuppressionResetTimer = null;
    }

    if (deferSuppressionReset) {
      // The same pointerup is observed by both the window and canvas listeners.
      // Keep suppression through the rest of this event dispatch.
      this.touchSuppressionResetTimer = setTimeout(() => {
        this.suppressTouchPainting = false;
        this.touchSuppressionResetTimer = null;
      }, 0);
    } else {
      this.suppressTouchPainting = false;
    }
  }

  public unmountListeners() {
    if (!this.renderer.backend.canvas) return;
    this.resetTouchGesture();
    this.renderer.backend.canvas.removeEventListener(
      "pointerdown",
      this.onPointerDown,
    );
    this.renderer.backend.canvas.removeEventListener(
      "pointermove",
      this.onPointerMove,
      true,
    );
    this.renderer.backend.canvas.removeEventListener(
      "pointerup",
      this.onPointerUp,
      true,
    );
    this.renderer.backend.canvas.removeEventListener(
      "pointercancel",
      this.onPointerUp,
      true,
    );
    this.renderer.backend.canvas.removeEventListener(
      "contextmenu",
      this.onContextMenu,
    );
    this.renderer.backend.canvas.removeEventListener(
      "pointerleave",
      this.onPointerLeave,
    );
    window.removeEventListener("pointerup", this.onPointerUp, true);
    window.removeEventListener("blur", this.onWindowBlur);
    document.removeEventListener(
      "visibilitychange",
      this.boundOnVisibilityChange,
    );
    // Remove keydown listener to prevent memory leak
    document.removeEventListener("keydown", this.onKeyDown);
  }

  private onKeyDown = (e: KeyboardEvent) => {
    // Bare-letter shortcuts: stay out of typing contexts (hex/rename inputs —
    // "d" and "e" are hex digits) and browser/system combos like Cmd+D.
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const target = e.target;
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      (target instanceof HTMLElement && target.isContentEditable)
    ) {
      return;
    }
    const state = getRendererState();

    // I for color picker
    if (e.key === "i") {
      state.setValue("colorPickerActive", true);
    }

    // E for eraser
    if (e.key === "e") {
      state.setValue("colorPickerActive", false);
      state.setValue("paintMode", "eraser");
    }

    // P for pen
    if (e.key === "p") {
      state.setValue("colorPickerActive", false);
      state.setValue("paintMode", "pixel");
    }

    // U for bulk
    if (e.key === "u") {
      state.setValue("colorPickerActive", false);
      state.setValue("paintMode", "bulk");
    }

    // V for variation
    if (e.key === "v") {
      state.setValue("colorPickerActive", false);
      state.setValue("paintMode", "variation");
    }

    // D for dither
    if (e.key === "d") {
      state.setValue("colorPickerActive", false);
      state.setValue("paintMode", "dither");
    }

    // M toggles symmetry (mirror painting)
    if (e.key === "m") {
      state.setValue("mirrorPaint", !state.mirrorPaint);
    }
  };
}
