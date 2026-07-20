import { Backend } from "./backend/Backend";
import { Mesh, MeshGroup } from "./mesh";
import { M44 } from "./maths";
import { OrbitControl } from "./orbitControl";

export type HoverHighlight = {
  vertices: number[];
  normals: number[];
  transform: M44;
};

export class Renderer {
  public world: MeshGroup;
  public backend: Backend;
  public orbitControl: OrbitControl;
  public hoverHighlight: HoverHighlight | null = null;

  protected isMounted: boolean = false;

  private animationFrame: number | null = null;

  /** last frame time for animation
   */
  private lastFrameTime: number = 0;

  constructor(backend: Backend) {
    this.backend = backend;
    this.world = new MeshGroup("World");
    this.orbitControl = new OrbitControl(this);
  }

  public mount() {
    if (this.isMounted) return;
    this.isMounted = true;
    this.backend.onStart(this.world);
    this.orbitControl.mountListeners();
  }

  public unmount() {
    this.isMounted = false;
    // Ensure animation is stopped before cleanup to prevent race conditions
    this.stop();
    this.orbitControl.unmountListeners();
    this.backend.onEnd();
  }

  public start(): number {
    if (!this.isMounted) return 0;
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastFrameTime) / 1000;
    this.lastFrameTime = currentTime;
    this.orbitControl.update(deltaTime);
    this.backend.onRenderFrame(this);
    this.animationFrame = requestAnimationFrame(this.start.bind(this));
    return deltaTime;
  }

  public stop(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  /**
   * Restarts the live render loop after it was paused (e.g. during an offline
   * clip recording). Resets the frame clock so the first resumed frame gets a
   * ~0 deltaTime — otherwise the multi-second gap while recording would snap
   * time-based interpolation (animation, look-at-cursor easing) on resume.
   */
  public resumeLiveLoop(): void {
    if (!this.isMounted) return;
    this.lastFrameTime = performance.now();
    this.start();
  }

  public addMesh(mesh: MeshGroup | Mesh): void {
    mesh.setParent(this.world);
    this.world.addMesh(mesh);
  }
  public removeMesh(mesh: MeshGroup | Mesh): void {
    mesh.setParent(null);
    this.world.removeMesh(mesh);
  }
}
