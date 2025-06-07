import {
  hsvToRgb,
  rgbToHsv,
  sortColors,
} from "@/components/ColorPicker/colorUtils";
import { Backend } from "./backend/Backend";
import { InputManager } from "./InputManager";
import { Mesh, MeshGroup } from "./mesh";
import { MeshImageMaterial, MinecraftSkinMaterial } from "./MeshMaterial";
import { MinecraftSkin } from "./MinecraftSkin";
import { OrbitControl } from "./orbitControl";
import { computeRay, getMeshAtRay } from "./rayTracing";
import { Layers, Parts, State } from "./State";
import { UndoRedoManager } from "./UndoManager";
import { randomInRange } from "@/lib/utils";

const DEFAULT_SKIN = "/steve.png";
export class Renderer {
  public world: MeshGroup;
  backend: Backend;
  private inputManager: InputManager;
  private orbitControl: OrbitControl;
  private animationFrame: number | null = null;

  public undoRedoManager: UndoRedoManager;
  public state: State;

  private constructor(backend: Backend, state: State) {
    this.backend = backend;
    this.state = state;
    this.world = new MeshGroup("World", null);
    this.orbitControl = new OrbitControl(this);
    this.undoRedoManager = new UndoRedoManager(this);
    this.inputManager = new InputManager(this);
  }

  static async create(backend: Backend, state: State) {
    const renderer = new Renderer(backend, state);
    await state.initializeIndexDB();
    const old_skin_base64URL = localStorage.getItem("skin_editor");
    const texture = await state.readSkinImageData("main_skin");

    let skin: MinecraftSkin;
    if (old_skin_base64URL && !texture) {
      skin = await MinecraftSkin.create(
        "MainSkin",
        renderer.world,
        old_skin_base64URL,
      );
      state.setSkinIsPocket(skin.material.version === "slim", true, "App");
    } else {
      skin = await MinecraftSkin.create(
        "MainSkin",
        renderer.world,
        texture || DEFAULT_SKIN,
      );
      state.setSkinIsPocket(skin.material.version === "slim", true, "App");
    }
    renderer.world.addMesh(skin);
    renderer.world.addMesh(
      Mesh.createPlane(
        [0, -18, 0],
        [1000, 1000],
        [0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0],
        renderer.world,
        "floor",
      ),
    );
    return renderer;
  }

  public mount() {
    this.orbitControl.mountListeners();
    this.undoRedoManager.mountListeners();
    this.inputManager.mountListeners();
    this.state.addListener(this.onVisibilityChange.bind(this));
    this.state.addListener(this.onPocketChange.bind(this));
    this.backend.onStart(this.world, this.state);
    this.onVisibilityChange(this.state, "App");
  }

  public unmount() {
    this.orbitControl.unmountListeners();
    this.undoRedoManager.unmountListeners();
    this.inputManager.unmountListeners();

    this.state.removeListener(this.onVisibilityChange.bind(this));
    this.state.removeListener(this.onPocketChange.bind(this));
    this.backend.onEnd();
  }

  getMainSkin(): MinecraftSkin {
    const s = this.world
      .getMeshes()
      .find((grp) => grp.name === "MainSkin") as MinecraftSkin;

    return s;
  }

  public updateCursor(x: number, y: number): void {
    if (!this.backend.attachedCanvas) return;
    if (this.state.getMode() === "Preview") {
      return;
    }
    const ray = computeRay(
      x,
      y,
      this.backend.attachedCanvas.width,
      this.backend.attachedCanvas.height,
      this.backend.getProjectTransformation(),
      this.backend.getViewTransformation(),
      this.backend.getGlobalTransformation(),
    );
    const skinObject = this.getMainSkin();
    const opaqueGroup = skinObject
      .getMeshes()
      .find((g: MeshGroup | Mesh) => g.name === "opaque") as MeshGroup;
    const transparentGroup = skinObject
      .getMeshes()
      .find((g: MeshGroup | Mesh) => g.name === "transparent") as MeshGroup;
    const hitTransparent = transparentGroup
      ? getMeshAtRay(transparentGroup, ray)
      : null;
    const hitOpaque = opaqueGroup ? getMeshAtRay(opaqueGroup, ray) : null;
    let hit = null;
    if (hitTransparent && hitTransparent.mesh.metadata.type === "skinPixel") {
      const part = hitTransparent.mesh;
      if (part.visible) {
        hit = hitTransparent;
      }
    }
    if (!hit && hitOpaque && hitOpaque.mesh.metadata.type === "skinPixel") {
      const part = hitOpaque.mesh;
      if (part.visible) {
        hit = hitOpaque;
      }
    }

    let cursor = hit ? "crosshair" : "grab";
    if (
      !!hitOpaque &&
      !hitTransparent &&
      hit == hitOpaque &&
      this.state.getPaintMode() === "eraser"
    ) {
      cursor = "not-allowed";
    }
    this.backend.attachedCanvas.style.cursor = cursor;
  }

  public getMeshHitAt(
    x: number,
    y: number,
    include: "transparent" | "opaque" | "all" = "all",
  ) {
    if (!this.backend.attachedCanvas) return;
    if (this.state.getMode() === "Preview") {
      return;
    }
    const skinObject = this.getMainSkin();
    const directChildren = skinObject.getMeshes();
    const opaqueGroup = directChildren.find(
      (g: MeshGroup | Mesh) => g.name === "opaque",
    ) as MeshGroup;
    const transparentGroup = directChildren.find(
      (g: MeshGroup | Mesh) => g.name === "transparent",
    ) as MeshGroup;

    const ray = computeRay(
      x,
      y,
      this.backend.attachedCanvas.width,
      this.backend.attachedCanvas.height,
      this.backend.getProjectTransformation(),
      this.backend.getViewTransformation(),
      this.backend.getGlobalTransformation(),
    );
    const hitTransparent = transparentGroup
      ? getMeshAtRay(transparentGroup, ray)
      : null;
    const hitOpaque = opaqueGroup ? getMeshAtRay(opaqueGroup, ray) : null;
    if (
      (include === "transparent" || include === "all") &&
      hitTransparent &&
      hitTransparent.mesh.metadata.type === "skinPixel"
    ) {
      if (hitTransparent.mesh.visible) return hitTransparent;
    }
    if (
      (include === "opaque" || include === "all") &&
      hitOpaque &&
      hitOpaque.mesh.metadata.type === "skinPixel"
    ) {
      if (hitOpaque.mesh.visible) return hitOpaque;
    }
    return null;
  }

  public start(effect: "parallaxEffect" | "none"): void {
    if (effect === "parallaxEffect") {
      this.createParallaxEffect();
    }

    const loop = () => {
      this.orbitControl.update();
      this.backend.onRenderFrame();
      this.animationFrame = requestAnimationFrame(loop);
    };
    this.animationFrame = requestAnimationFrame(loop);
  }

  private createParallaxEffect(): void {
    // Store initial values
    const initialFOV = this.state.getCameraFieldOfView();
    const initialRadius = this.state.getCameraRadius();

    // Create a slightly zoomed out effect by decreasing FOV and increasing radius
    const startFOV = initialFOV * 0.8; // Decrease FOV by 20%
    const startRadius = initialRadius * 1.2; // Increase radius by 20%

    // Set initial values
    this.state.setCameraFieldOfView(startFOV, true, "parallaxEffect");
    this.state.setCameraRadius(startRadius, true, "parallaxEffect");

    // Calculate steps needed for the animation (60 frames per second, animation should be under 1 second)
    const frameCount = 45; // 0.75 seconds at 60fps
    const fovStep = (initialFOV - startFOV) / frameCount;
    const radiusStep = (initialRadius - startRadius) / frameCount;

    let currentFrame = 0;

    const animate = () => {
      if (currentFrame >= frameCount) {
        // Ensure we end with exact target values
        this.state.setCameraFieldOfView(initialFOV, false, "parallaxEffect");
        this.state.setCameraRadius(initialRadius, false, "parallaxEffect");
        return;
      }

      // Update values
      const newFov = this.state.getCameraFieldOfView() + fovStep;
      const newRadius = this.state.getCameraRadius() + radiusStep;

      this.state.setCameraFieldOfView(newFov, false, "parallaxEffect");
      this.state.setCameraRadius(newRadius, true, "parallaxEffect");

      currentFrame++;

      requestAnimationFrame(animate);
    };

    // Start animation on next frame
    requestAnimationFrame(animate);
  }

  public stop(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  public downloadTexture() {
    const dataUrl = this.getMainSkin().material.toDataUrl();
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "texture.png";
    a.click();
  }

  public uploadTexture(setError?: (msg: string) => void) {
    const input = document.createElement("input");
    input.style.display = "none";
    input.type = "file";
    input.accept = "image/png";
    document.body.appendChild(input);
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      document.body.removeChild(input);
      if (!file) return;
      if (
        (file.type && file.type !== "image/png") ||
        (!file.type && !file.name.toLowerCase().endsWith(".png"))
      ) {
        setError?.("Skin must be a PNG image.");
        return;
      }
      try {
        await new Promise((res, rej) => {
          const reader = new FileReader();
          reader.onload = async () => {
            await this.uploadTextureUrl(reader.result as string, setError);
            res(undefined);
          };
          reader.onerror = () => {
            rej(undefined);
          };
          reader.readAsDataURL(file);
        });
      } catch {
        setError?.("Skin upload failed.");
      }
    };
    input.click();
  }
  async uploadTextureUrl(url: string, setError?: (arg0: string) => void) {
    return new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => {
        if (img.width !== 64 || ![32, 64].includes(img.height)) {
          setError?.("Skin dimensions must be 64x64 or 64x32 pixels.");
          return;
        }
        const skin = this.getMainSkin();
        this.undoRedoManager?.beginBatch();

        if (img.height === 64) {
          skin.material = MinecraftSkinMaterial.createFrom64Image(img);
        } else {
          skin.material = MinecraftSkinMaterial.createFrom32Image(img);
        }

        this.state.setSkinIsPocket(
          skin.material.version === "slim",
          true,
          "App",
        );

        this.undoRedoManager?.endBatch();

        res(undefined);
      };
      img.onerror = () => {
        rej(undefined);
      };
      img.src = url;
    });
  }

  public redo() {
    if (!this.undoRedoManager)
      throw new Error("UndoRedoManager not initialized");
    this.undoRedoManager.redo();
  }

  public undo() {
    if (!this.undoRedoManager)
      throw new Error("UndoRedoManager not initialized");
    this.undoRedoManager.undo();
  }

  public pickColor(x: number, y: number) {
    const hit = this.getMeshHitAt(x, y);
    if (!hit) return false;
    const { u, v } = hit.mesh.metadata;
    let pixel = this.getMainSkin().material.getPixel(u as number, v as number);
    if (!pixel) return;
    const alpha = pixel[3];
    if (alpha === 0) {
      const opaqueHit = this.getMeshHitAt(x, y, "opaque");
      if (opaqueHit) {
        pixel = this.getMainSkin().material.getPixel(
          opaqueHit.mesh.metadata.u as number,
          opaqueHit.mesh.metadata.v as number,
        );
        if (!pixel) return;
      }
    }
    const toHex = (n: number) => ("0" + n.toString(16)).slice(-2);
    const color = `#${toHex(pixel[0])}${toHex(pixel[1])}${toHex(pixel[2])}`;
    this.state.setPaintColor(color, true, "App");
    this.state.save();
    return;
  }

  public fillFace(x: number, y: number): void {
    const hit = this.getMeshHitAt(x, y);
    if (!hit) return;
    let faceGroup: MeshGroup | null = hit.mesh.getParent();
    while (faceGroup && !faceGroup.metadata?.uvBounds) {
      faceGroup = faceGroup.getParent();
    }
    if (!faceGroup || !faceGroup.metadata?.uvBounds) return;
    const { minU, minV, maxU, maxV } = faceGroup.metadata.uvBounds as {
      minU: number;
      minV: number;
      maxU: number;
      maxV: number;
    };
    const width = maxU - minU;
    const height = maxV - minV;
    const paintColor = this.state.getPaintColor();
    this.getMainSkin().material.fillRectHex(
      minU,
      minV,
      width,
      height,
      paintColor,
    );
  }

  public drawAt(x: number, y: number): void {
    const hit = this.getMeshHitAt(x, y);
    if (!hit) return;
    const color = this.state.getPaintColor();
    this.getMainSkin().material.setPixelHex(
      hit.mesh.metadata.u as number,
      hit.mesh.metadata.v as number,
      color,
    );
  }

  public eraseAt(x: number, y: number): void {
    const hit = this.getMeshHitAt(x, y, "transparent");
    if (!hit) return;
    this.getMainSkin().material.clearPixel(
      hit.mesh.metadata.u as number,
      hit.mesh.metadata.v as number,
    );
  }

  public variateAt(x: number, y: number): void {
    const hit = this.getMeshHitAt(x, y);
    if (!hit) return;

    const u = hit.mesh.metadata.u as number;
    const v = hit.mesh.metadata.v as number;
    const material = this.getMainSkin().material;

    // Get the current pixel color
    const currentColor = material.getPixel(u, v);
    if (!currentColor || currentColor[3] === 0) {
      // If no color or transparent, use the paint color
      const paintColor = this.state.getPaintColor();
      material.setPixelHex(u, v, paintColor);
      return;
    }

    // Apply variation to the existing color
    const intensity = this.state.getVariationIntensity();
    const variedColor = this.applyColorVariation(currentColor, intensity);
    material.setPixel(
      u,
      v,
      variedColor[0],
      variedColor[1],
      variedColor[2],
      variedColor[3],
    );
  }

  private applyColorVariation(
    color: [number, number, number, number],
    intensity: number,
  ): [number, number, number, number] {
    const hsv = rgbToHsv(color[0], color[1], color[2]);

    const value = hsv.v + hsv.v * 0.15 * intensity * randomInRange(-1, 1);
    const rgb = hsvToRgb(hsv.h, hsv.s, value);
    return [rgb.r, rgb.g, rgb.b, color[3]];
  }

  public getUniqueColors(): string[] {
    const skinMesh = this.getMainSkin();
    if (!skinMesh) return [];
    const skinMaterial = skinMesh.getMaterial() as MeshImageMaterial;
    const imageData = skinMaterial.imageData;

    const colors = new Set<string>();

    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      const a = imageData.data[i + 3];

      // Only include non-transparent colors
      if (a > 0) {
        const hex =
          "#" +
          [r, g, b]
            .map((x) => {
              const hex = x.toString(16);
              return hex.length === 1 ? "0" + hex : hex;
            })
            .join("");
        colors.add(hex.toUpperCase());
      }
    }

    return sortColors(Array.from(colors));
  }

  reset(): void {
    this.state.reset();
    this.uploadTextureUrl(DEFAULT_SKIN);
    this.undoRedoManager.reset();
  }

  private onPocketChange(constants: State, origin: string | undefined): void {
    if (origin !== "PocketSwitch") return;

    const skin = this.getMainSkin();
    if (constants.getSkinIsPocket()) {
      this.undoRedoManager.beginBatch();
      skin.material = skin.material.convertToSlim();
      this.state.setSkinIsPocket(true, true, "App");
      this.undoRedoManager.endBatch();
    } else {
      this.undoRedoManager.beginBatch();
      skin.material = skin.material.convertToClassic();
      this.state.setSkinIsPocket(false, true, "App");
      this.undoRedoManager.endBatch();
    }
  }

  private onVisibilityChange(
    constants: State,
    origin: string | undefined,
  ): void {
    if (origin !== "App") return;

    const mainSkinInstance = this.getMainSkin();
    // Reset all arms
    if (mainSkinInstance.baseLeftArm)
      mainSkinInstance.baseLeftArm.visible = false;
    if (mainSkinInstance.baseLeftSlimArm)
      mainSkinInstance.baseLeftSlimArm.visible = false;
    if (mainSkinInstance.baseRightArm)
      mainSkinInstance.baseRightArm.visible = false;
    if (mainSkinInstance.baseRightSlimArm)
      mainSkinInstance.baseRightSlimArm.visible = false;
    if (mainSkinInstance.overlayLeftArm)
      mainSkinInstance.overlayLeftArm.visible = false;
    if (mainSkinInstance.overlayLeftSlimArm)
      mainSkinInstance.overlayLeftSlimArm.visible = false;
    if (mainSkinInstance.overlayRightArm)
      mainSkinInstance.overlayRightArm.visible = false;
    if (mainSkinInstance.overlayRightSlimArm)
      mainSkinInstance.overlayRightSlimArm.visible = false;

    // Get every part visibility
    (
      [
        ["overlay", "head"],
        ["overlay", "body"],
        ["overlay", "leftLeg"],
        ["overlay", "rightLeg"],
        ["overlay", "leftArm"],
        ["overlay", "rightArm"],
        ["base", "head"],
        ["base", "body"],
        ["base", "leftLeg"],
        ["base", "rightLeg"],
        ["base", "leftArm"],
        ["base", "rightArm"],
      ] as [Layers, Parts][]
    ).forEach(([layer, part]) => {
      mainSkinInstance.onVisibilityChange(layer, part, constants);
    });
  }
}
