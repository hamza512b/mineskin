import { M44 } from "../maths";
import { MeshGroup } from "../mesh";
import { Renderer } from "../Renderer";
import { State } from "../State";

export interface Backend {
  canvas: HTMLCanvasElement | null;
  onStart: (meshes: MeshGroup, State: State) => void;
  onEnd: () => void;
  onRenderFrame: (renderer: Renderer) => void;
  getGlobalTransformation: () => M44;
  getViewTransformation: () => M44;
  getProjectTransformation: () => M44;
  bindMeshGroup: (meshGroup: MeshGroup) => void;
  cleanupMeshGroup: (meshGroup: MeshGroup) => void;
}
