import { MiSkiRenderer } from "./MineSkinRenderer";
import { HistorySnapshot as Snapshot } from "./State";

export class UndoRedoManager {
  private batching: boolean = false;
  private batchBaseline: Snapshot | null = null;
  private boundOnKeyDown = (e: KeyboardEvent) => {
    const isMod = e.ctrlKey || e.metaKey; // support Ctrl (Windows/Linux) and Cmd (macOS)
    if (isMod && e.key.toLowerCase() === "z") {
      e.preventDefault();
      if (e.shiftKey) {
        this.redo();
      } else {
        this.undo();
      }
    } else if (isMod && e.key.toLowerCase() === "y") {
      e.preventDefault();
      this.redo();
    }
  };

  constructor(public renderer: MiSkiRenderer) {}

  public beginBatch() {
    if (!this.batching) {
      this.batching = true;
      const skin = this.renderer.getMainSkin();
      this.batchBaseline = {
        material: skin.material.clone(),
        skinIsPocket: this.renderer.state.getSkinIsPocket(),
      };
    }
  }

  public endBatch() {
    if (!this.batching) return;
    const skin = this.renderer.getMainSkin();
    const snapshot: Snapshot = {
      material: skin.material.clone(),
      skinIsPocket: this.renderer.state.getSkinIsPocket(),
    };
    if (
      this.batchBaseline &&
      (!this.areEqual(
        this.batchBaseline.material.imageData,
        skin.material.imageData,
      ) ||
        this.batchBaseline.skinIsPocket !== snapshot.skinIsPocket)
    ) {
      this.renderer.state.undoStack.push(snapshot);
      this.renderer.state.redoStack.clear();

      this.renderer.state.storeSkinImageData(
        snapshot.material.imageData,
        "main_skin",
      );
    }
    this.batching = false;
    this.batchBaseline = null;
  }

  private areEqual(a: ImageData, b: ImageData): boolean {
    if (a.width !== b.width || a.height !== b.height) return false;
    for (let i = 0; i < a.data.length; i++) {
      if (a.data[i] !== b.data[i]) return false;
    }
    return true;
  }

  public undo() {
    if (this.renderer.getMode() === "Preview") {
      return;
    }
    if (this.renderer.state.undoStack.count > 1) {
      const current = this.renderer.state.undoStack.pop();
      if (current) this.renderer.state.redoStack.push(current);
      const prev = this.renderer.state.undoStack.peek();
      if (prev) {
        const material = prev.material.clone();
        this.renderer.getMainSkin().material = material;
        // Update the skinIsPocket flag to match the snapshot.
        this.renderer.state.setSkinIsPocket(prev.skinIsPocket, true, "App");
        this.renderer.state.storeSkinImageData(material.imageData, "main_skin");
      }
    }
  }

  public redo() {
    if (this.renderer.getMode() === "Preview") {
      return;
    }
    if (this.renderer.state.redoStack.count > 0) {
      const next = this.renderer.state.redoStack.pop();
      if (next) {
        this.renderer.state.undoStack.push(next);
        const material = next.material.clone();
        this.renderer.getMainSkin().material = material;

        this.renderer.state.setSkinIsPocket(next.skinIsPocket, true, "App");
        this.renderer.state.storeSkinImageData(material.imageData, "main_skin");
      }
    }
  }

  public mountListeners() {
    document.addEventListener("keydown", this.boundOnKeyDown);
    this.renderer.state.undoStack.push({
      material: this.renderer.getMainSkin().material.clone(),
      skinIsPocket: this.renderer.state.getSkinIsPocket(),
    });
    this.renderer.state.redoStack.clear();
  }

  public unmountListeners() {
    document.removeEventListener("keydown", this.boundOnKeyDown);
  }

  public reset() {
    this.renderer.state.undoStack.clear();
    this.renderer.state.redoStack.clear();
  }
}
