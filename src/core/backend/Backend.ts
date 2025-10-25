import { M44 } from "../maths";
import { MeshGroup } from "../mesh";
import { State } from "../State";

export interface Backend {
  canvas: HTMLCanvasElement | null;
  onStart: (meshes: MeshGroup, State: State) => void;
  onEnd: () => void;
  onRenderFrame: () => void;
  getGlobalTransformation: () => M44;
  getViewTransformation: () => M44;
  getProjectTransformation: () => M44;
  setCanvas: (canvas: HTMLCanvasElement | null) => void;
  bindMeshGroup: (meshGroup: MeshGroup) => void;
}
