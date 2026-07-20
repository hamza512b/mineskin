import { M44 } from "../maths";
import { MeshGroup } from "../mesh";
import { Renderer } from "../Renderer";

export interface Backend {
  canvas: HTMLCanvasElement | null;
  onStart: (meshes: MeshGroup) => void;
  onEnd: () => void;
  onRenderFrame: (renderer: Renderer) => void;
  getGlobalTransformation: () => M44;
  getViewTransformation: () => M44;
  getProjectTransformation: () => M44;
  bindMeshGroup: (meshGroup: MeshGroup) => void;
  cleanupMeshGroup: (meshGroup: MeshGroup) => void;
  setEnvironmentGridSuppressed: (suppressed: boolean) => void;
  setViewportCenterOffset: (px: number) => void;
  getViewportCenterOffset: () => number;
  setViewportCenterOffsetSuppressed: (suppressed: boolean) => void;
}
