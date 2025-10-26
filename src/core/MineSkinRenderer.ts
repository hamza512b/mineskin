import {
  hsvToRgb,
  rgbToHex,
  rgbToHsv,
  sortColors,
} from "@/components/ColorPicker/colorUtils";
import { randomInRange } from "@/lib/utils";
import { EditInputManager } from "./EditInputManager";
import { MeshImageMaterial, MinecraftSkinMaterial } from "./MeshMaterial";
import { MinecraftSkin } from "./MinecraftSkin";
import { Renderer } from "./Renderer";
import { Layers, Parts, State } from "./State";
import { UndoRedoManager } from "./UndoManager";
import { Mesh, MeshGroup } from "./mesh";
import { AnimationSystem } from "./AnimationSystem";
import { computeRay, getMeshAtRay } from "./rayTracing";

export class MiSkiRenderer extends Renderer {
  public undoRedoManager: UndoRedoManager;
  constructor(state: State) {
    super(state);
    this.undoRedoManager = new UndoRedoManager(this);
  }

  public override mount() {
    super.mount();
    this.state.addListener(this.onVisibilityChange.bind(this));
    this.state.addListener(this.onPocketChange.bind(this));
    this.undoRedoManager.mountListeners();
  }

  public override unmount() {
    super.unmount();
    this.state.removeListener(this.onVisibilityChange.bind(this));
    this.state.removeListener(this.onPocketChange.bind(this));
    this.undoRedoManager.unmountListeners();
  }

  getMainSkin(): MinecraftSkin {
    const s = this.world
      .getChildren()
      .find((grp) => grp.name === "MainSkin") as MinecraftSkin;

    return s;
  }

  public start(effect?: "parallaxEffect"): void {
    if (effect === "parallaxEffect") {
      this.createParallaxEffect();
    }
    super.start();
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
    const frameCount = 45;
    const fovStep = (initialFOV - startFOV) / frameCount;
    const radiusStep = (initialRadius - startRadius) / frameCount;

    let currentFrame = 0;

    const animate = () => {
      if (currentFrame >= frameCount || this.orbitControl.isControlling) {
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
      img.crossOrigin = "";
      img.src = url;
    });
  }

  public redo() {
    this.undoRedoManager.redo();
  }

  public undo() {
    this.undoRedoManager.undo();
  }

  reset(): void {
    this.state.reset();
    this.undoRedoManager.reset();
  }

  protected onPocketChange(constants: State, origin: string | undefined): void {
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

  public getMeshHitAt(x: number, y: number) {
    if (!this.backend.canvas) return;
    const skinObject = this.getMainSkin();

    const ray = computeRay(
      x,
      y,
      this.backend.canvas.width,
      this.backend.canvas.height,
      this.backend.getProjectTransformation(),
      this.backend.getViewTransformation(),
      this.backend.getGlobalTransformation(),
    );
    const hit = getMeshAtRay(skinObject, ray);
    if (!hit) return;
    if (hit.mesh.metadata.type === "skinPixel") {
      return hit;
    }
    return null;
  }

  public getMode() {
    return this instanceof MiSkiEditingRenderer ? "Editing" : "Preview";
  }
}

export class MiSkiEditingRenderer extends MiSkiRenderer {
  public inputManager: EditInputManager;
  constructor(state: State) {
    super(state);
    this.inputManager = new EditInputManager(this);
  }

  public override mount() {
    super.mount();
    this.inputManager.mountListeners();
  }

  public override unmount() {
    super.unmount();
    this.inputManager.unmountListeners();
  }
  public pickColor(x: number, y: number) {
    const hit = this.getMeshHitAt(x, y);
    if (!hit) return false;
    const { u, v } = hit.mesh.metadata;
    let pixel = this.getMainSkin().material.getPixel(u as number, v as number);
    if (!pixel) return;
    const alpha = pixel[3];
    if (alpha === 0) {
      const opaqueHit = this.getMeshHitAt(x, y);
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
    const hit = this.getMeshHitAt(x, y);
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
        const hex = rgbToHex(r, g, b);
        colors.add(hex);
      }
    }

    return sortColors(Array.from(colors));
  }
  public updateCursor(x: number, y: number): void {
    if (!this.backend.canvas) return;
    const ray = computeRay(
      x,
      y,
      this.backend.canvas.width,
      this.backend.canvas.height,
      this.backend.getProjectTransformation(),
      this.backend.getViewTransformation(),
      this.backend.getGlobalTransformation(),
    );
    const skinObject = this.getMainSkin();
    const opaqueGroup = skinObject
      .getChildren()
      .find((g: MeshGroup | Mesh) => g.name === "opaque") as MeshGroup;
    const transparentGroup = skinObject
      .getChildren()
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

    this.backend.canvas.style.cursor = hit ? "crosshair" : "grab";
  }
}

export class MiSkPreviewRenderer extends MiSkiRenderer {
  private animationSystem: AnimationSystem;

  constructor(state: State) {
    super(state);
    this.animationSystem = new AnimationSystem();
  }

  public override mount() {
    super.mount();
    const skin = this.getMainSkin();

    this.animationSystem.setupBodyParts(skin, this.state.getSkinIsPocket());

    // Start with walking animation
    this.playAnimation("walking");
  }

  public override unmount() {
    super.unmount();
    this.animationSystem.dispose();
  }

  /**
   * Play an animation by name
   * @param animationName Name of the animation to play
   */
  public playAnimation(animationName: string): void {
    this.animationSystem.playAnimation(animationName);
  }

  /**
   * Stop the current animation
   */
  public stopAnimation(): void {
    this.animationSystem.stopAnimation();
  }

  /**
   * Pause the current animation
   */
  public pauseAnimation(): void {
    this.animationSystem.pauseAnimation();
  }

  public resumeAnimation(): void {
    this.animationSystem.resumeAnimation();
  }

  /**
   * Set animation speed multiplier
   * @param speed Speed multiplier (1.0 = normal, 2.0 = double speed, etc.)
   */
  public setAnimationSpeed(speed: number): void {
    this.animationSystem.setAnimationSpeed(speed);
  }

  /**
   * Toggle animation playback
   */
  public toggleAnimation(): void {
    if (this.animationSystem.isAnimationPlaying()) {
      this.animationSystem.pauseAnimation();
    } else {
      this.animationSystem.resumeAnimation();
    }
  }

  /**
   * Check if any animation is currently playing
   */
  public isAnimationPlaying(): boolean {
    return this.animationSystem.isAnimationPlaying();
  }

  /**
   * Get the currently playing animation name
   */
  public getCurrentAnimationName(): string | null {
    return this.animationSystem.getCurrentAnimationName();
  }

  /**
   * Get list of available animations
   */
  public getAvailableAnimations(): string[] {
    return this.animationSystem.getAvailableAnimations();
  }

  /**
   * Load animations from a custom URL
   */
  public async loadAnimationsFromUrl(url: string): Promise<void> {
    return this.animationSystem.loadAnimationsFromUrl(url);
  }

  protected override onPocketChange(
    constants: State,
    origin: string | undefined,
  ): void {
    super.onPocketChange(constants, origin);

    this.animationSystem.setupBodyParts(
      this.getMainSkin(),
      constants.getSkinIsPocket(),
    );
  }
}
