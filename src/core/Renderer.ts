import { State } from "./State";
import { Backend } from "./backend/Backend";
import { Mesh, MeshGroup } from "./mesh";
import { OrbitControl } from "./orbitControl";


export class Renderer {
  public world: MeshGroup;
  public backend: Backend;
  public orbitControl: OrbitControl;

  private animationFrame: number | null = null;
  public state: State;

  constructor(backend: Backend, state: State) {
    this.backend = backend;
    this.state = state;
    this.world = new MeshGroup("World");
    this.orbitControl = new OrbitControl(this);
  }

  public mount() {
    this.orbitControl.mountListeners();

    this.backend.onStart(this.world, this.state);
  }

  public unmount() {
    this.orbitControl.unmountListeners();
    this.backend.onEnd();
  }

  public start(): void {
    const loop = () => {
      this.orbitControl.update();
      this.backend.onRenderFrame();
      this.animationFrame = requestAnimationFrame(loop);
    };
    this.animationFrame = requestAnimationFrame(loop);
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
