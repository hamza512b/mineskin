import { getRendererState } from "../store";
import type { HistorySnapshot } from "../store/types";
import { MinecraftSkin } from "./MinecraftSkin";
import { MiSkiRenderer } from "./MiSkiRenderer";

let firstEditTracked = false;

export class UndoRedoManager {
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
    const skin = this.renderer.getMainSkin();
    const state = getRendererState();
    state.beginBatch(skin.material, state.skinIsPocket, state.skinIsDoubleRes);
  }

  public endBatch() {
    const skin = this.renderer.getMainSkin();
    const state = getRendererState();
    state.endBatch(skin.material, state.skinIsPocket, state.skinIsDoubleRes);
    if (!firstEditTracked) {
      firstEditTracked = true;
      window.gtag?.("event", "first_edit", { tool: state.paintMode });
    }
  }

  private async applySnapshot(snapshot: HistorySnapshot) {
    const state = getRendererState();
    const skin = this.renderer.getMainSkin();
    // Determine current resolution from the actual skin material, not the store.
    // The store's undo/redo already updated skinIsDoubleRes before this runs,
    // so checking the store would always match and skip the mesh rebuild.
    const currentIsDoubleRes = skin.material.width === 128;

    if (snapshot.skinIsDoubleRes !== currentIsDoubleRes) {
      // Resolution changed — full mesh rebuild needed
      this.renderer.backend.cleanupMeshGroup(skin);
      this.renderer.removeMesh(skin);

      const newSkin = await MinecraftSkin.create(
        "MainSkin",
        this.renderer.world,
        snapshot.material.clone().imageData,
        undefined,
        snapshot.skinIsDoubleRes,
      );

      this.renderer.addMesh(newSkin);
      this.renderer.backend.bindMeshGroup(newSkin);
      this.renderer.updateMeshVisibility(state);
    } else {
      // Same resolution — just swap material
      skin.material = snapshot.material.clone();
    }
  }

  public async undo() {
    if (this.renderer.getMode() === "Preview") {
      return;
    }
    const state = getRendererState();
    const prev = state.undo();
    if (prev) {
      await this.applySnapshot(prev);
    }
  }

  public async redo() {
    if (this.renderer.getMode() === "Preview") {
      return;
    }
    const state = getRendererState();
    const next = state.redo();
    if (next) {
      await this.applySnapshot(next);
    }
  }

  public mountListeners() {
    document.addEventListener("keydown", this.boundOnKeyDown);

    // Push initial state to undo stack
    const skin = this.renderer.getMainSkin();
    const state = getRendererState();
    state.pushToUndoStack({
      material: skin.material.clone(),
      skinIsPocket: state.skinIsPocket,
      skinIsDoubleRes: state.skinIsDoubleRes,
    });
  }

  public unmountListeners() {
    document.removeEventListener("keydown", this.boundOnKeyDown);
  }

  public reset() {
    getRendererState().clearHistory();
  }
}
