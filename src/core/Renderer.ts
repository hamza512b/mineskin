import { State } from "./State";
import { Backend } from "./backend/Backend";
import Webgl2Backend from "./backend/Webgl2Backend";
import { Mesh, MeshGroup } from "./mesh";
import { OrbitControl } from "./orbitControl";

export class Renderer {
  public world: MeshGroup;
  public backend: Backend;
  public orbitControl: OrbitControl;

  protected isMounted: boolean = false;

  private animationFrame: number | null = null;
  public state: State;

  /** last frame time for animation
   */
  private lastFrameTime: number = 0;

  constructor(canvas: HTMLCanvasElement, state: State) {
    this.backend = new Webgl2Backend(canvas);
    this.state = state;
    this.world = new MeshGroup("World");
    this.orbitControl = new OrbitControl(this);
  }

  public mount() {
    if (this.isMounted) return;
    this.isMounted = true;
    this.backend.onStart(this.world, this.state);
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
    this.orbitControl.update();
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

  public addMesh(mesh: MeshGroup | Mesh): void {
    mesh.setParent(this.world);
    this.world.addMesh(mesh);
  }
  public removeMesh(mesh: MeshGroup | Mesh): void {
    mesh.setParent(null);
    this.world.removeMesh(mesh);
  }
}
