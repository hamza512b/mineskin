import { MinecraftSkinMaterial } from "./MeshMaterial";
import { Renderer } from "./Renderer";

interface Snapshot {
  material: MinecraftSkinMaterial;
  skinIsPocket: boolean;
}

export class Stack<T> {
  private items: T[] = [];
  constructor(private onChange: (count: number) => void) {
    this.notify();
  }
  private notify() {
    this.onChange(this.items.length);
  }
  public push(item: T): void {
    this.items.push(item);
    this.notify();
  }
  public pop(): T | undefined {
    const item = this.items.pop();
    this.notify();
    return item;
  }
  public clear(): void {
    this.items = [];
    this.notify();
  }
  public get count(): number {
    return this.items.length;
  }
  public peek(): T | undefined {
    return this.items[this.items.length - 1];
  }
}

export class UndoRedoManager {
  private undoStack: Stack<Snapshot>;
  private redoStack: Stack<Snapshot>;
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

  constructor(private renderer: Renderer) {
    this.undoStack = new Stack<Snapshot>((count: number) => {
      this.renderer.state.setUndoCount(count - 1);
    });
    this.redoStack = new Stack<Snapshot>((count: number) => {
      this.renderer.state.setRedoCount(count);
    });
  }

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
      this.undoStack.push(snapshot);
      this.redoStack.clear();

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
    if (this.renderer.state.getMode() === "Preview") {
      return;
    }
    if (this.undoStack.count > 1) {
      const current = this.undoStack.pop();
      if (current) this.redoStack.push(current);
      const prev = this.undoStack.peek();
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
    if (this.renderer.state.getMode() === "Preview") {
      return;
    }
    if (this.redoStack.count > 0) {
      const next = this.redoStack.pop();
      if (next) {
        this.undoStack.push(next);
        const material = next.material.clone();
        this.renderer.getMainSkin().material = material;

        this.renderer.state.setSkinIsPocket(next.skinIsPocket, true, "App");
        this.renderer.state.storeSkinImageData(material.imageData, "main_skin");
      }
    }
  }

  public mountListeners() {
    document.addEventListener("keydown", this.boundOnKeyDown);
    this.undoStack.push({
      material: this.renderer.getMainSkin().material.clone(),
      skinIsPocket: this.renderer.state.getSkinIsPocket(),
    });
    this.redoStack.clear();
  }

  public unmountListeners() {
    document.removeEventListener("keydown", this.boundOnKeyDown);
    this.reset();
  }

  public reset() {
    this.undoStack.clear();
    this.redoStack.clear();
  }
}
