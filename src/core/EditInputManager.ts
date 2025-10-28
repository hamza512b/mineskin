import { MiSkiEditingRenderer } from "./MineSkinRenderer";

export class EditInputManager {
  private isDrawing = false;
  private touchHitActive = false;
  private touchStart: { x: number; y: number } | null = null;

  private boundOnVisibilityChange = this.onVisibilityChange.bind(this);
  private onVisibilityChange() {
    if (document.hidden) this.onWindowBlur();
  }

  constructor(public renderer: MiSkiEditingRenderer) {}

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
    window.addEventListener("pointerup", this.onPointerUp, true);
    window.addEventListener("blur", this.onWindowBlur);
    document.addEventListener("visibilitychange", this.boundOnVisibilityChange);
    document.addEventListener("keydown", this.onKeyDown);
  }

  private onPointerDown = (e: PointerEvent) => {
    if (!this.renderer.backend.canvas) return;
    const { x, y } = this.getPointerPos(e);
    if (e.pointerType === "touch") {
      // For touch, store initial position.
      this.touchStart = { x, y };
      if (this.renderer.getMeshHitAt(x, y)) this.touchHitActive = true;
    } else {
      // If color picker is active, pick the color and reset.
      if (this.renderer.state.getColorPickerActive()) {
        const picked = this.renderer.pickColor(x, y);
        if (picked) {
          this.renderer.state.setColorPickerActive(false);
        }
        return;
      }
      // If in bulk mode, fill the face with undo/redo transactions.
      if (this.renderer.state.getPaintMode() === "bulk") {
        this.renderer.undoRedoManager?.beginBatch();
        this.renderer.fillFace(x, y);
        this.renderer.undoRedoManager?.endBatch();
        return;
      }

      // Otherwise (pixel or variation mode), proceed as before.
      if (this.renderer.getMeshHitAt(x, y)) {
        this.isDrawing = true;
        this.renderer.backend.canvas.style.cursor = "crosshair";
        this.renderer.undoRedoManager?.beginBatch();
        if (this.renderer.state.getPaintMode() === "eraser") {
          this.renderer.eraseAt(x, y);
        } else if (this.renderer.state.getPaintMode() === "variation") {
          this.renderer.variateAt(x, y);
        } else {
          this.renderer.drawAt(x, y);
        }
        this.renderer.backend.canvas?.setPointerCapture(e.pointerId);
        e.preventDefault();
        return;
      }

      this.isDrawing = false;
      this.renderer.backend.canvas.style.cursor = "grab";
    }
  };

  private onPointerMove = (e: PointerEvent) => {
    const { x, y } = this.getPointerPos(e);
    if (e.pointerType === "touch") {
      // No drawing on touch move.
    } else {
      if (this.isDrawing) {
        if (this.renderer.state.getPaintMode() === "eraser") {
          this.renderer.eraseAt(x, y);
        } else if (this.renderer.state.getPaintMode() === "variation") {
          this.renderer.variateAt(x, y);
        } else {
          this.renderer.drawAt(x, y);
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
    const { x, y } = this.getPointerPos(e);
    if (e.pointerType === "touch") {
      // For touch, check for color picker first.
      if (this.renderer.state.getColorPickerActive()) {
        const picked = this.renderer.pickColor(x, y);
        if (picked) {
          this.renderer.state.setColorPickerActive(false);
        }
      } else if (this.touchHitActive && this.touchStart) {
        const dx = x - this.touchStart.x;
        const dy = y - this.touchStart.y;
        if (dx * dx + dy * dy < 25) {
          if (this.renderer.state.getPaintMode() === "bulk") {
            this.renderer.undoRedoManager?.beginBatch();
            this.renderer.fillFace(x, y);
            this.renderer.undoRedoManager?.endBatch();
          } else {
            this.renderer.undoRedoManager?.beginBatch();
            if (this.renderer.state.getPaintMode() === "eraser") {
              this.renderer.eraseAt(x, y);
            } else if (this.renderer.state.getPaintMode() === "variation") {
              this.renderer.variateAt(x, y);
            } else {
              this.renderer.drawAt(x, y);
            }
            this.renderer.undoRedoManager?.endBatch();
          }
        }
      }
      this.touchHitActive = false;
      this.touchStart = null;
    } else {
      if (this.isDrawing) {
        this.isDrawing = false;
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

  private onWindowBlur = () => {
    if (!this.renderer.backend.canvas) return;
    if (this.isDrawing) {
      this.isDrawing = false;
      this.renderer.undoRedoManager?.endBatch();
      this.renderer.backend.canvas.style.cursor = "grab";
    }
  };

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

  public unmountListeners() {
    if (!this.renderer.backend.canvas) return;
    this.renderer.backend.canvas.removeEventListener(
      "pointerdown",
      this.onPointerDown,
      true,
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
    // I for color picker
    if (e.key === "i") {
      this.renderer.state.setColorPickerActive(true);
    }

    // E for eraser
    if (e.key === "e") {
      this.renderer.state.setColorPickerActive(false);
      this.renderer.state.setPaintMode("eraser");
    }

    // P for pen
    if (e.key === "p") {
      this.renderer.state.setColorPickerActive(false);
      this.renderer.state.setPaintMode("pixel");
    }

    // U for bulk
    if (e.key === "u") {
      this.renderer.state.setColorPickerActive(false);
      this.renderer.state.setPaintMode("bulk");
    }

    // V for variation
    if (e.key === "v") {
      this.renderer.state.setColorPickerActive(false);
      this.renderer.state.setPaintMode("variation");
    }
  };

}
