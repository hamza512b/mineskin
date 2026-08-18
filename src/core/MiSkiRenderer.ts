import {
  hsvToRgb,
  rgbToHex,
  rgbToHsv,
} from "@/components/ColorPicker/colorUtils";
import { MAX_VARIATION_STEPS, randomInRange } from "@/lib/utils";
import {
  getRendererState,
  subscribeToRenderer,
  type EnvironmentPreset,
  type Layers,
  type Parts,
  type RendererStore,
} from "../store";
import { AnimationSystem } from "./AnimationSystem";
import { Backend } from "./backend/Backend";
import { createBackend } from "./backend/createBackend";
import { downloadFile, type SaveImageLabels } from "./downloadFile";
import { RecorderNotSupportedError } from "./errors";
import {
  DEFAULT_FPS as DEFAULT_RECORDER_FPS,
  SkinRecorder,
  type RecordedClip,
} from "./SkinRecorder";
import { EditInputManager } from "./EditInputManager";
import { identityM44, multiplyM4V3, type M44, type V3 } from "./maths";
import { Mesh, MeshGroup } from "./mesh";
import { MeshImageMaterial, MinecraftSkinMaterial } from "./MeshMaterial";
import { MinecraftSkin } from "./MinecraftSkin";
import {
  buildPoseGizmoGeometry,
  computeAxisHandles,
  computePoseHandles,
  type PoseGizmoGeometry,
} from "./PoseGizmo";
import { PoseInputManager } from "./PoseInputManager";
import { PoseSystem } from "./PoseSystem";
import { multiplyQuat, quatFromEuler } from "./quaternion";
import { computeRay, getMeshAtRay, getMeshsAtRay } from "./rayTracing";
import { Renderer } from "./Renderer";
import { mirrorSkinTexel } from "./skinMirror";
import { UndoRedoManager } from "./UndoManager";

import { createLibraryEntry, getLibraryState } from "../store/libraryStore";

import { sortBy } from "lodash";
import animations from "./animations";
import {
  animateEnvironmentWorld,
  createEnvironmentWorld,
  getEnvironmentCameraFloorY,
} from "./environment";
const DEFAULT_SKIN = "/steve.png";

// Shading snaps to a fixed HSV lattice: brightness moves in whole rungs and
// hue/saturation round to a coarse grid, so repeated strokes reuse a small
// ladder of shades per base color instead of minting a new unique color on
// every pass.
const SHADE_VALUE_STEP = 5; // % brightness per rung
const SHADE_HUE_STEP = 4; // degrees
const SHADE_SAT_STEP = 4; // %

export class MiSkiRenderer extends Renderer {
  public undoRedoManager: UndoRedoManager;
  /**
   * Manual limb pose. Lives on the base renderer, not the preview subclass, so
   * a posed model can also be painted — reaching an armpit or the sole of a
   * foot is the main reason to pose in the first place.
   */
  public poseSystem: PoseSystem;
  public poseInputManager: PoseInputManager;
  private unsubscribe: (() => void) | null = null;
  private environmentMesh: MeshGroup | null = null;
  /** Set while a capture is in flight; see {@link setPoseGizmoSuppressed}. */
  private poseGizmoSuppressed = false;

  constructor(backend: Backend) {
    super(backend);
    this.undoRedoManager = new UndoRedoManager(this);
    this.poseSystem = new PoseSystem();
    this.poseInputManager = new PoseInputManager(this);
  }

  public override mount() {
    super.mount();

    const state = getRendererState();
    this.poseSystem.setupBodyParts(this.getMainSkin(), state.skinIsPocket);
    this.poseSystem.setPose(state.pose);

    // Subscribe to store for visibility and pocket changes
    this.unsubscribe = subscribeToRenderer((state, prevState) => {
      this.onStoreChange(state, prevState);
    });

    // Apply current visibility state immediately — load() may have
    // updated the store before we subscribed, so we'd miss the change.
    this.updateMeshVisibility(getRendererState());

    this.undoRedoManager.mountListeners();
    this.poseInputManager.mountListeners();
  }

  public override unmount() {
    this.poseInputManager.unmountListeners();
    this.poseSystem.dispose();
    // Create a copy of children array to avoid modifying collection while iterating
    const meshesToRemove = [...this.world.getChildren()];
    for (const mesh of meshesToRemove) {
      this.world.removeMesh(mesh);
    }

    // Unsubscribe from store
    this.unsubscribe?.();
    this.unsubscribe = null;

    this.undoRedoManager.unmountListeners();
    super.unmount();
  }

  private onStoreChange(state: RendererStore, prevState: RendererStore) {
    // Handle visibility changes
    if (this.visibilityChanged(state, prevState)) {
      this.updateMeshVisibility(state);
    }

    if (state.environmentPreset !== prevState.environmentPreset) {
      this.applyEnvironment(state.environmentPreset);

      // Clamp camera phi when switching to an environment so the camera
      // isn't already below the ground plane.
      const floorY = getEnvironmentCameraFloorY(state.environmentPreset);
      if (floorY !== null) {
        const ratio = Math.min(1, -floorY / state.cameraRadius);
        const maxPhi = Math.asin(ratio);
        const clamped = Math.max(
          -Math.PI / 2,
          Math.min(state.cameraPhi, maxPhi),
        );
        if (clamped !== state.cameraPhi) {
          state.setValue("cameraPhi", clamped);
        }
      }
    }

    if (state.poseMode !== prevState.poseMode) {
      // `EditInputManager` stops tracking the pointer in pose mode, so it never
      // gets to clear the texel outline it last drew — do it here, or a stale
      // highlight sits on the model for the whole posing session.
      this.hoverHighlight = null;
      this.poseInputManager.clearHover();
      this.poseInputManager.clearSelection();
    }

    // Switching tools deliberately keeps the selection: both tools put a gizmo
    // on the selected part — arrows for move, rings for twist — so the swap is
    // a change of gizmo on the limb being worked on, not a change of limb.

    // The slim and wide arm are different boxes, so the collider has to be
    // pointed at whichever one is on screen or it would test the hidden one.
    if (state.skinIsPocket !== prevState.skinIsPocket) {
      this.poseSystem.setColliderVariant(state.skinIsPocket);
    }

    // Handle pocket change (only when triggered by PocketSwitch)
    // We detect this by checking if skinIsPocket changed and wasn't already processed
    // The origin tracking is now implicit - we only process here if it's from PocketSwitch
  }

  /**
   * Hides the pose gizmo for a capture (screenshot, recorded clip). The overlay
   * is an editing control, not part of the model, so it has no business being
   * baked into an image or a video the user shares.
   */
  public setPoseGizmoSuppressed(suppressed: boolean): void {
    this.poseGizmoSuppressed = suppressed;
  }

  /**
   * Whether the pose gizmo is on screen right now. Input asks the same question
   * the renderer does, because the handles are also the hit targets — an
   * invisible ring the pointer still grabs is worse than no ring at all.
   */
  public isPoseGizmoVisible(): boolean {
    return (
      getRendererState().poseMode &&
      !this.poseGizmoSuppressed &&
      !this.isPlayingClipAnimation()
    );
  }

  /**
   * True while an animation clip is driving the limbs. Picking a dance switches
   * pose mode off, so this is a backstop rather than the main path: it keeps the
   * handles from flashing over a dancing model for the frame or two between pose
   * mode coming back on and the clip being stopped in response. Overridden by
   * the preview renderer; the editor plays no clips.
   */
  protected isPlayingClipAnimation(): boolean {
    return false;
  }

  /**
   * The pose gizmo overlay for the frame being drawn, or null when there is
   * nothing to show. Built on demand instead of per tick because it depends on
   * the camera matrices, which the backend only settles once the frame starts.
   */
  public getPoseGizmo(): PoseGizmoGeometry | null {
    if (!this.isPoseGizmoVisible()) return null;
    const selected = this.poseInputManager.getSelectedPart();
    return buildPoseGizmoGeometry(this, computePoseHandles(this), {
      highlighted: this.poseInputManager.getHighlightedPart(),
      axisHandles: computeAxisHandles(this, selected),
      activeAxis: this.poseInputManager.getActiveAxis(),
    });
  }

  private visibilityChanged(
    state: RendererStore,
    prevState: RendererStore,
  ): boolean {
    return (
      state.skinIsDoubleRes !== prevState.skinIsDoubleRes ||
      state.skinIsPocket !== prevState.skinIsPocket ||
      state.baseheadVisible !== prevState.baseheadVisible ||
      state.basebodyVisible !== prevState.basebodyVisible ||
      state.baseleftArmVisible !== prevState.baseleftArmVisible ||
      state.baserightArmVisible !== prevState.baserightArmVisible ||
      state.baseleftLegVisible !== prevState.baseleftLegVisible ||
      state.baserightLegVisible !== prevState.baserightLegVisible ||
      state.overlayheadVisible !== prevState.overlayheadVisible ||
      state.overlaybodyVisible !== prevState.overlaybodyVisible ||
      state.overlayleftArmVisible !== prevState.overlayleftArmVisible ||
      state.overlayrightArmVisible !== prevState.overlayrightArmVisible ||
      state.overlayleftLegVisible !== prevState.overlayleftLegVisible ||
      state.overlayrightLegVisible !== prevState.overlayrightLegVisible
    );
  }

  /**
   * Points the pose system at the current skin object and replays the stored
   * pose onto it. Swapping resolution or loading a library entry builds a whole
   * new `MinecraftSkin`, so without this the limbs would snap back to rest.
   */
  public rebindPoseSystem(): void {
    const state = getRendererState();
    this.poseSystem.setupBodyParts(this.getMainSkin(), state.skinIsPocket);
    this.poseSystem.setPose(state.pose);
  }

  public updateMeshVisibility(state: RendererStore): void {
    const mainSkinInstance = this.getMainSkin();
    if (!mainSkinInstance) return;

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
      mainSkinInstance.onVisibilityChangeFromStore(layer, part, state);
    });
  }

  protected applyEnvironment(preset: EnvironmentPreset): void {
    if (this.environmentMesh) {
      this.backend.cleanupMeshGroup(this.environmentMesh);
      this.removeMesh(this.environmentMesh);
      this.environmentMesh = null;
    }

    const environment = createEnvironmentWorld(preset);
    if (!environment) return;

    this.environmentMesh = environment;
    this.addMesh(environment);
    this.backend.bindMeshGroup(environment);
  }

  public handlePocketSwitch(newIsPocket: boolean): void {
    const skin = this.getMainSkin();
    const state = getRendererState();

    if (newIsPocket) {
      this.undoRedoManager.beginBatch();
      skin.material = skin.material.convertToSlim();
      state.setValue("skinIsPocket", true, "App");
      this.undoRedoManager.endBatch();
    } else {
      this.undoRedoManager.beginBatch();
      skin.material = skin.material.convertToClassic();
      state.setValue("skinIsPocket", false, "App");
      this.undoRedoManager.endBatch();
    }
  }

  public flipFrontToBack(): void {
    const skin = this.getMainSkin();
    const state = getRendererState();

    this.undoRedoManager.beginBatch();
    skin.material = skin.material.flipFrontToBack(state.skinIsPocket);
    this.undoRedoManager.endBatch();

    // Persist the flipped texture to the library so it survives a reload.
    import("../store/libraryStore").then(({ saveActiveSkinToLibrary }) =>
      saveActiveSkinToLibrary(
        skin.material.imageData,
        state.skinIsPocket,
        state.skinIsDoubleRes,
      ),
    );
  }

  public async handleResolutionSwitch(newIsDoubleRes: boolean): Promise<void> {
    const skin = this.getMainSkin();
    const state = getRendererState();

    if (newIsDoubleRes === state.skinIsDoubleRes) return;

    // Scale the texture data
    let newImageData: ImageData;
    if (newIsDoubleRes) {
      newImageData = MinecraftSkinMaterial.upscale64to128(
        skin.material.imageData,
      );
    } else {
      newImageData = MinecraftSkinMaterial.downscale128to64(
        skin.material.imageData,
      );
    }

    // Remove old skin from world and backend
    this.backend.cleanupMeshGroup(skin);
    this.removeMesh(skin);

    // Create new skin with correct resolution
    const newSkin = await MinecraftSkin.create(
      "MainSkin",
      this.world,
      newImageData,
      undefined,
      newIsDoubleRes,
    );

    // Add new skin to world and backend
    this.addMesh(newSkin);
    this.backend.bindMeshGroup(newSkin);
    this.rebindPoseSystem();

    // Update state
    state.setValue("skinIsDoubleRes", newIsDoubleRes, "App");

    // Push to undo stack so the user can undo the resolution change
    state.pushToUndoStack({
      material: newSkin.material.clone(),
      skinIsPocket: state.skinIsPocket,
      skinIsDoubleRes: newIsDoubleRes,
    });

    // Re-apply visibility from store
    this.updateMeshVisibility(state);

    // Save to library
    const { saveActiveSkinToLibrary } = await import("../store/libraryStore");
    saveActiveSkinToLibrary(
      newSkin.material.imageData,
      state.skinIsPocket,
      newIsDoubleRes,
    );
  }

  getMainSkin(): MinecraftSkin {
    const s = this.world
      .getChildren()
      .find((grp) => grp.name === "MainSkin") as MinecraftSkin;

    return s;
  }

  public start(): number {
    if (this.environmentMesh) {
      const state = getRendererState();
      animateEnvironmentWorld(
        this.environmentMesh,
        state.environmentPreset,
        performance.now(),
      );
    }
    const deltaTime = super.start();
    return deltaTime;
  }

  public downloadTexture(name?: string, labels?: SaveImageLabels) {
    const dataUrl = this.getMainSkin().material.toDataUrl();
    downloadFile(dataUrl, name ? `${name}.png` : "texture.png", labels);
  }

  public redo() {
    this.undoRedoManager.redo();
  }

  public undo() {
    this.undoRedoManager.undo();
  }

  reset(): void {
    getRendererState().reset();
    this.undoRedoManager.reset();
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

  public getMeshsHitAt(x: number, y: number) {
    if (!this.backend.canvas) return [];
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
    const hits = getMeshsAtRay(skinObject, ray);
    return sortBy(hits, (hit) => hit.t).filter(
      (h) => h.mesh.metadata.type === "skinPixel",
    );
  }

  public getMode() {
    return this instanceof MiSkiEditingRenderer ? "Editing" : "Preview";
  }

  public async loadSkinFromLibrary(
    skinData: ArrayBuffer,
    isPocket: boolean,
    skinId?: string,
    isDoubleRes: boolean = false,
  ) {
    const dim = isDoubleRes ? 128 : 64;
    const state = getRendererState();
    const currentIsDoubleRes = state.skinIsDoubleRes;

    const needsRebuild =
      isDoubleRes !== currentIsDoubleRes || isPocket !== state.skinIsPocket;

    if (needsRebuild) {
      // Resolution or arm type differs, need to rebuild mesh
      const skin = this.getMainSkin();
      this.backend.cleanupMeshGroup(skin);
      this.removeMesh(skin);

      const imageData = new ImageData(
        new Uint8ClampedArray(skinData),
        dim,
        dim,
      );
      const newSkin = await MinecraftSkin.create(
        "MainSkin",
        this.world,
        imageData,
        undefined,
        isDoubleRes,
      );

      this.addMesh(newSkin);
      this.backend.bindMeshGroup(newSkin);
      this.rebindPoseSystem();
    } else {
      const skin = this.getMainSkin();
      const imageData = new ImageData(
        new Uint8ClampedArray(skinData),
        dim,
        dim,
      );
      skin.material = MinecraftSkinMaterial.createFromImageData(imageData);
    }

    state.setValue("skinIsPocket", isPocket, "App");
    state.setValue("skinIsDoubleRes", isDoubleRes, "App");

    // Re-apply visibility (must use fresh state after setValue calls)
    this.updateMeshVisibility(getRendererState());

    // Try to restore cached undo history for this skin
    if (!skinId || !state.restoreHistory(skinId)) {
      state.clearHistory();
      state.pushToUndoStack({
        material: this.getMainSkin().material.clone(),
        skinIsPocket: isPocket,
        skinIsDoubleRes: isDoubleRes,
      });
    }
  }

  static async setup(canvas: HTMLCanvasElement) {
    const backend = await createBackend(canvas);
    const renderer = new this(backend);
    const state = getRendererState();

    const db = await state.initializeIndexDB();

    // Initialize library store. Pass a reopener so it can recover when the
    // browser force-closes the IndexedDB connection (e.g. iOS bfcache).
    const libState = getLibraryState();
    await libState.initialize(db, () => state.initializeIndexDB());

    // Migration: if library is empty, migrate from old data or create default
    if (getLibraryState().entries.length === 0) {
      const old_skin_base64URL = localStorage.getItem("skin_editor");
      const texture = await state.readSkinImageData("main_skin");

      if (texture) {
        // Migrate existing skin to library
        const isPocket = state.skinIsPocket;
        const entry = createLibraryEntry("My Skin", texture, isPocket);
        await libState.addEntry(entry);
        libState.setActiveSkin(entry.id);
      } else if (old_skin_base64URL) {
        // Migrate from old localStorage skin
        const skin = await MinecraftSkin.create(
          "MainSkin",
          renderer.world,
          old_skin_base64URL,
        );
        const isPocket = skin.material.version === "slim";
        const entry = createLibraryEntry(
          "My Skin",
          skin.material.imageData,
          isPocket,
        );
        await libState.addEntry(entry);
        libState.setActiveSkin(entry.id);

        state.setValue("skinIsPocket", isPocket, "classic");
        renderer.addMesh(skin);
        renderer.backend.bindMeshGroup(skin);
        return renderer;
      } else {
        // Fresh user: create Steve as default
        const steveImg = await new Promise<HTMLImageElement>(
          (resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = DEFAULT_SKIN;
          },
        );
        const steveMat = MinecraftSkinMaterial.createFrom64Image(steveImg);
        const entry = createLibraryEntry("Steve", steveMat.imageData, false);
        await libState.addEntry(entry);
        libState.setActiveSkin(entry.id);
      }
    }

    // Load the active library entry
    const activeEntry = libState.getActiveEntry();
    let skin: MinecraftSkin;

    if (activeEntry) {
      const isDoubleRes = activeEntry.isDoubleRes ?? false;
      const dim = isDoubleRes ? 128 : 64;
      const imageData = new ImageData(
        new Uint8ClampedArray(activeEntry.skinData),
        dim,
        dim,
      );
      skin = await MinecraftSkin.create(
        "MainSkin",
        renderer.world,
        imageData,
        undefined,
        isDoubleRes,
      );
      state.setValue("skinIsPocket", activeEntry.isPocket, "classic");
      state.setValue("skinIsDoubleRes", isDoubleRes, "classic");
    } else {
      skin = await MinecraftSkin.create(
        "MainSkin",
        renderer.world,
        DEFAULT_SKIN,
      );
      state.setValue(
        "skinIsPocket",
        skin.material.version === "slim",
        "classic",
      );
      state.setValue("skinIsDoubleRes", false, "classic");
    }

    renderer.addMesh(skin);
    renderer.backend.bindMeshGroup(skin);
    renderer.applyEnvironment(state.environmentPreset);
    return renderer;
  }
}

export class MiSkiEditingRenderer extends MiSkiRenderer {
  public inputManager: EditInputManager;

  constructor(backend: Backend) {
    super(backend);
    this.inputManager = new EditInputManager(this);
  }

  public override mount() {
    super.mount();
    this.inputManager.mountListeners();
  }

  public override unmount() {
    this.inputManager.unmountListeners();
    super.unmount();
  }

  public pickColor(x: number, y: number) {
    const hits = this.getMeshsHitAt(x, y);
    const material = this.getMainSkin().material;
    if (!material) return;
    const color = hits
      .filter((hit) => hit.mesh.visible)
      .map((hit) =>
        material.getPixel(
          hit.mesh.metadata.u as number,
          hit.mesh.metadata.v as number,
        ),
      )
      .filter((color) => color && color[3] > 0)[0];
    if (!color) return;
    const hex = rgbToHex(color[0], color[1], color[2]);
    const state = getRendererState();
    state.setValue("paintColor", hex, "App");
    state.setValue("paintAlpha", color[3], "App");
    state.save();
    return hex;
  }

  // Mirror a texel across the model's center plane when symmetry painting is
  // on. Returns null when symmetry is off, the texel has no counterpart, or
  // it mirrors onto itself.
  private mirrorTexel(u: number, v: number): { u: number; v: number } | null {
    const state = getRendererState();
    if (!state.mirrorPaint) return null;
    const mirrored = mirrorSkinTexel(u, v, {
      scale: state.skinIsDoubleRes ? 2 : 1,
      slim: state.skinIsPocket,
    });
    if (!mirrored || (mirrored.u === u && mirrored.v === v)) return null;
    return mirrored;
  }

  // The texels a paint action touches: the hit texel plus its mirror.
  private paintTargets(u: number, v: number): [number, number][] {
    const mirrored = this.mirrorTexel(u, v);
    return mirrored
      ? [
          [u, v],
          [mirrored.u, mirrored.v],
        ]
      : [[u, v]];
  }

  // Walk up from a texel mesh to the face group that carries the atlas rect
  // for the whole face. Used to clamp radius brushes so they never bleed onto
  // unrelated faces packed next to this one in the atlas.
  private faceUvBounds(
    mesh: Mesh,
  ): { minU: number; minV: number; maxU: number; maxV: number } | null {
    let faceGroup: MeshGroup | null = mesh.getParent();
    while (faceGroup && !faceGroup.metadata?.uvBounds) {
      faceGroup = faceGroup.getParent();
    }
    if (!faceGroup || !faceGroup.metadata?.uvBounds) return null;
    return faceGroup.metadata.uvBounds as {
      minU: number;
      minV: number;
      maxU: number;
      maxV: number;
    };
  }

  // The base layer renders opaque in-game, so translucent paint there would
  // just darken against black. Base-layer texels always take full opacity;
  // only overlay parts (tagged metadata.overlay) honor the picked alpha.
  private paintAlphaFor(mesh: Mesh): number {
    let group: MeshGroup | null = mesh.getParent();
    while (group && !group.metadata?.overlay) {
      group = group.getParent();
    }
    return group ? getRendererState().paintAlpha : 255;
  }

  // Last fillFace target within the current bulk stroke. Drags re-fire at
  // pointer-event rate, and repainting an unchanged target only re-uploads an
  // identical texture — so fillFace skips until the hit moves.
  private lastFillTarget: {
    u: number;
    v: number;
    minU: number;
    minV: number;
  } | null = null;

  // Called at the start of every bulk stroke (drag or tap) so its first
  // fillFace always paints.
  public beginFillStroke(): void {
    this.lastFillTarget = null;
  }

  public fillFace(x: number, y: number): void {
    const hit = this.getMeshHitAt(x, y);
    if (!hit) return;
    const bounds = this.faceUvBounds(hit.mesh);
    if (!bounds) return;
    const { minU, minV, maxU, maxV } = bounds;
    const state = getRendererState();
    const material = this.getMainSkin().material;
    const alpha = this.paintAlphaFor(hit.mesh);
    const radius = state.bulkPaintRadius ?? 0;

    // Sized brushes repaint per texel, whole-face fills per face.
    const hu = hit.mesh.metadata.u as number;
    const hv = hit.mesh.metadata.v as number;
    const prev = this.lastFillTarget;
    if (
      prev &&
      (radius > 0
        ? prev.u === hu && prev.v === hv
        : prev.minU === minU && prev.minV === minV)
    ) {
      return;
    }
    this.lastFillTarget = { u: hu, v: hv, minU, minV };

    if (radius > 0) {
      // Paint a clean disc/square of `radius` texels around the hit texel,
      // clamped to THIS face's atlas rect so it never bleeds onto unrelated
      // faces. Hole-free by construction.
      const isCircle = state.bulkPaintShape === "circle";
      const r2 = (radius + 0.5) * (radius + 0.5);
      for (let pv = minV; pv < maxV; pv++) {
        for (let pu = minU; pu < maxU; pu++) {
          const du = pu - hu;
          const dv = pv - hv;
          const inside = isCircle
            ? du * du + dv * dv <= r2
            : Math.abs(du) <= radius && Math.abs(dv) <= radius;
          if (inside) {
            for (const [tu, tv] of this.paintTargets(pu, pv)) {
              material.setPixelHex(tu, tv, state.paintColor, alpha);
            }
          }
        }
      }
      return;
    }

    const width = maxU - minU;
    const height = maxV - minV;
    material.fillRectHex(minU, minV, width, height, state.paintColor, alpha);
    // Symmetry: fill the mirrored face too. Face rects mirror onto same-size
    // rects, so the two mirrored corners are enough to locate it.
    const cornerA = this.mirrorTexel(minU, minV);
    const cornerB = this.mirrorTexel(maxU - 1, maxV - 1);
    if (cornerA && cornerB) {
      material.fillRectHex(
        Math.min(cornerA.u, cornerB.u),
        Math.min(cornerA.v, cornerB.v),
        width,
        height,
        state.paintColor,
        alpha,
      );
    }
  }

  public drawAt(x: number, y: number): void {
    const hit = this.getMeshHitAt(x, y);
    if (!hit) return;
    const state = getRendererState();
    const material = this.getMainSkin().material;
    const alpha = this.paintAlphaFor(hit.mesh);
    for (const [u, v] of this.paintTargets(
      hit.mesh.metadata.u as number,
      hit.mesh.metadata.v as number,
    )) {
      material.setPixelHex(u, v, state.paintColor, alpha);
    }
  }

  public ditherAt(x: number, y: number): void {
    const hit = this.getMeshHitAt(x, y);
    if (!hit) return;

    const u = hit.mesh.metadata.u as number;
    const v = hit.mesh.metadata.v as number;
    // Checkerboard ink: only even-parity texels take paint, so a stroke
    // leaves a 50% dither of the paint color over what's underneath. Parity
    // is checked on the hit texel only so the mirrored side comes out as a
    // true mirror image of the pattern.
    if ((u + v) % 2 !== 0) return;

    const state = getRendererState();
    const material = this.getMainSkin().material;
    const alpha = this.paintAlphaFor(hit.mesh);
    for (const [tu, tv] of this.paintTargets(u, v)) {
      material.setPixelHex(tu, tv, state.paintColor, alpha);
    }
  }

  public eraseAt(x: number, y: number): void {
    const hit = this.getMeshHitAt(x, y);
    if (!hit) return;
    const material = this.getMainSkin().material;
    const state = getRendererState();
    const radius = state.eraserRadius ?? 0;
    const hu = hit.mesh.metadata.u as number;
    const hv = hit.mesh.metadata.v as number;

    if (radius > 0) {
      // Erase a disc of `radius` texels around the hit, clamped to this face's
      // atlas rect so the brush never punches holes in neighbouring faces.
      const bounds = this.faceUvBounds(hit.mesh);
      const minU = bounds ? bounds.minU : hu - radius;
      const maxU = bounds ? bounds.maxU : hu + radius + 1;
      const minV = bounds ? bounds.minV : hv - radius;
      const maxV = bounds ? bounds.maxV : hv + radius + 1;
      const r2 = (radius + 0.5) * (radius + 0.5);
      for (let pv = minV; pv < maxV; pv++) {
        for (let pu = minU; pu < maxU; pu++) {
          const du = pu - hu;
          const dv = pv - hv;
          if (du * du + dv * dv <= r2) {
            for (const [tu, tv] of this.paintTargets(pu, pv)) {
              material.clearPixel(tu, tv);
            }
          }
        }
      }
      return;
    }

    for (const [u, v] of this.paintTargets(hu, hv)) {
      material.clearPixel(u, v);
    }
  }

  public variateAt(x: number, y: number): void {
    const hit = this.getMeshHitAt(x, y);
    if (!hit) return;

    const state = getRendererState();
    // variationIntensity is the ceiling on the brightness swing, in whole 5%
    // rungs, always at least 1 — the tool never degrades to a no-op.
    const maxSteps = Math.min(
      MAX_VARIATION_STEPS,
      Math.max(1, Math.round(state.variationIntensity)),
    );

    const u = hit.mesh.metadata.u as number;
    const v = hit.mesh.metadata.v as number;
    const material = this.getMainSkin().material;
    const targets = this.paintTargets(u, v);

    // Get the current pixel color
    const currentColor = material.getPixel(u, v);
    if (!currentColor || currentColor[3] === 0) {
      // If no color or transparent, use the paint color
      const alpha = this.paintAlphaFor(hit.mesh);
      for (const [tu, tv] of targets) {
        material.setPixelHex(tu, tv, state.paintColor, alpha);
      }
      return;
    }

    // Apply variation to the existing color; the mirrored texel receives the
    // same varied color so both sides shade identically.
    const variedColor = this.applyColorVariation(currentColor, maxSteps);
    for (const [tu, tv] of targets) {
      material.setPixel(
        tu,
        tv,
        variedColor[0],
        variedColor[1],
        variedColor[2],
        variedColor[3],
      );
    }
  }

  private applyColorVariation(
    color: [number, number, number, number],
    maxSteps: number,
  ): [number, number, number, number] {
    const hsv = rgbToHsv(color[0], color[1], color[2]);

    // Pick a random magnitude within [1, maxSteps] rungs and a random
    // direction. maxSteps is the intensity-scaled ceiling (see variateAt), so
    // the average strength climbs with intensity while repeated strokes stay
    // organic. The previous mapping (Math.round(3 * intensity)) pinned the
    // whole lower half of the slider to a single rung, so intensity appeared
    // to do nothing.
    const steps = 1 + Math.floor(randomInRange(0, maxSteps));
    const direction = randomInRange(-1, 1) < 0 ? -1 : 1;

    const value = Math.min(
      100,
      Math.max(
        0,
        Math.round(
          (hsv.v + direction * steps * SHADE_VALUE_STEP) / SHADE_VALUE_STEP,
        ) * SHADE_VALUE_STEP,
      ),
    );
    const hue = (Math.round(hsv.h / SHADE_HUE_STEP) * SHADE_HUE_STEP) % 360;
    const sat = Math.min(
      100,
      Math.round(hsv.s / SHADE_SAT_STEP) * SHADE_SAT_STEP,
    );
    const rgb = hsvToRgb(hue, sat, value);
    return [rgb.r, rgb.g, rgb.b, color[3]];
  }

  public getUniqueColors(): string[] {
    const skinMesh = this.getMainSkin();
    if (!skinMesh) return [];
    const skinMaterial = skinMesh.getMaterial() as MeshImageMaterial;
    const imageData = skinMaterial.imageData;

    // Count usage per exact color so near-duplicate merging keeps each
    // cluster's dominant shade.
    const counts = new Map<number, number>();
    for (let i = 0; i < imageData.data.length; i += 4) {
      const a = imageData.data[i + 3];
      // Only include non-transparent colors
      if (a === 0) continue;
      const key =
        imageData.data[i] * 0x1000000 +
        imageData.data[i + 1] * 0x10000 +
        imageData.data[i + 2] * 0x100 +
        a;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    // Absorb shading residue: any color within MERGE_DISTANCE (RGBA
    // euclidean) of a more-used color is treated as the same swatch. The
    // radius is well under one shading rung (~13), so deliberate shades
    // survive while stray near-duplicates collapse.
    const MERGE_DISTANCE_SQ = 8 * 8;
    const byUsage = Array.from(counts.keys()).sort(
      (a, b) => counts.get(b)! - counts.get(a)!,
    );
    const kept: [number, number, number, number][] = [];
    for (const key of byUsage) {
      const r = key >>> 24;
      const g = (key >>> 16) & 0xff;
      const b = (key >>> 8) & 0xff;
      const a = key & 0xff;
      const absorbed = kept.some(([kr, kg, kb, ka]) => {
        const dr = kr - r;
        const dg = kg - g;
        const db = kb - b;
        const da = ka - a;
        return dr * dr + dg * dg + db * db + da * da <= MERGE_DISTANCE_SQ;
      });
      if (!absorbed) kept.push([r, g, b, a]);
    }

    // kept is already ordered most-used-first (byUsage drives the merge loop),
    // so return it as-is instead of re-sorting by hue — the palette leads with
    // the colors actually painted most.
    return kept.map(([r, g, b, a]) => rgbToHex(r, g, b, a));
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

    // Hide front indicator when hovering over the skin so it doesn't obstruct drawing
    skinObject.setFrontIndicatorTargetOpacity(hit ? 0 : 1);

    // Update hover highlight border for pixel under cursor; with symmetry on,
    // outline the mirrored texel as well so both stroke targets are visible.
    if (hit) {
      const vertices: number[] = [];
      const normals: number[] = [];
      this.appendTexelBorder(hit.mesh, vertices, normals);
      const mirrored = this.mirrorTexel(
        hit.mesh.metadata.u as number,
        hit.mesh.metadata.v as number,
      );
      if (mirrored) {
        const mirrorMesh = this.getTexelMeshAt(mirrored.u, mirrored.v);
        if (mirrorMesh) this.appendTexelBorder(mirrorMesh, vertices, normals);
      }
      this.hoverHighlight = {
        vertices,
        normals,
        transform: identityM44(),
      };
    } else {
      this.hoverHighlight = null;
    }

    this.backend.canvas.style.cursor = hit ? "crosshair" : "grab";
  }

  // Texel quads indexed by atlas coordinate, per skin instance. Slim and
  // regular arm variants share atlas texels, so entries keep every candidate
  // and lookup picks whichever is currently visible.
  private texelMeshIndex = new WeakMap<MinecraftSkin, Map<number, Mesh[]>>();

  private getTexelMeshAt(u: number, v: number): Mesh | null {
    const skin = this.getMainSkin();
    if (!skin) return null;
    let index = this.texelMeshIndex.get(skin);
    if (!index) {
      index = new Map();
      const gather = (group: MeshGroup) => {
        for (const child of group.getChildren()) {
          if (child instanceof MeshGroup) {
            gather(child);
          } else if (child.metadata.type === "skinPixel") {
            const key =
              ((child.metadata.u as number) << 8) |
              (child.metadata.v as number);
            const list = index!.get(key);
            if (list) {
              list.push(child);
            } else {
              index!.set(key, [child]);
            }
          }
        }
      };
      gather(skin);
      this.texelMeshIndex.set(skin, index);
    }
    const candidates = index.get((u << 8) | v);
    return candidates?.find((mesh) => mesh.visible) ?? null;
  }

  // Append the four border strips outlining a texel quad to the highlight
  // geometry, in world space (the quad's parent transform is baked in so
  // outlines from different body parts can share one draw).
  private appendTexelBorder(
    mesh: Mesh,
    outVertices: number[],
    outNormals: number[],
  ): void {
    const v = mesh.vertices;
    const n = mesh.normals;
    const OFFSET = 0.015;
    const normal = [n[0], n[1], n[2]];

    // Extract quad corners with normal offset to prevent z-fighting
    const BL = [
      v[0] + normal[0] * OFFSET,
      v[1] + normal[1] * OFFSET,
      v[2] + normal[2] * OFFSET,
    ];
    const TL = [
      v[3] + normal[0] * OFFSET,
      v[4] + normal[1] * OFFSET,
      v[5] + normal[2] * OFFSET,
    ];
    const BR = [
      v[6] + normal[0] * OFFSET,
      v[7] + normal[1] * OFFSET,
      v[8] + normal[2] * OFFSET,
    ];
    const TR = [
      v[12] + normal[0] * OFFSET,
      v[13] + normal[1] * OFFSET,
      v[14] + normal[2] * OFFSET,
    ];

    // Compute edge directions and border thickness
    const uLen = Math.hypot(BR[0] - BL[0], BR[1] - BL[1], BR[2] - BL[2]);
    const vLen = Math.hypot(TL[0] - BL[0], TL[1] - BL[1], TL[2] - BL[2]);
    const t = Math.min(uLen, vLen) * 0.12;
    const uDir = [
      (BR[0] - BL[0]) / uLen,
      (BR[1] - BL[1]) / uLen,
      (BR[2] - BL[2]) / uLen,
    ];
    const vDir = [
      (TL[0] - BL[0]) / vLen,
      (TL[1] - BL[1]) / vLen,
      (TL[2] - BL[2]) / vLen,
    ];

    // Inner corners
    const iBL = [
      BL[0] + uDir[0] * t + vDir[0] * t,
      BL[1] + uDir[1] * t + vDir[1] * t,
      BL[2] + uDir[2] * t + vDir[2] * t,
    ];
    const iTL = [
      TL[0] + uDir[0] * t - vDir[0] * t,
      TL[1] + uDir[1] * t - vDir[1] * t,
      TL[2] + uDir[2] * t - vDir[2] * t,
    ];
    const iBR = [
      BR[0] - uDir[0] * t + vDir[0] * t,
      BR[1] - uDir[1] * t + vDir[1] * t,
      BR[2] - uDir[2] * t + vDir[2] * t,
    ];
    const iTR = [
      TR[0] - uDir[0] * t - vDir[0] * t,
      TR[1] - uDir[1] * t - vDir[1] * t,
      TR[2] - uDir[2] * t - vDir[2] * t,
    ];

    // 4 border strips (each = 2 triangles = 6 vertices)
    const borderVertices = [
      ...BL,
      ...iBL,
      ...BR,
      ...BR,
      ...iBL,
      ...iBR, // Bottom
      ...iTL,
      ...TL,
      ...iTR,
      ...iTR,
      ...TL,
      ...TR, // Top
      ...BL,
      ...TL,
      ...iBL,
      ...iBL,
      ...TL,
      ...iTL, // Left
      ...iBR,
      ...iTR,
      ...BR,
      ...BR,
      ...iTR,
      ...TR, // Right
    ];
    const transform = mesh.getParent()?.getTransformMatrix() || identityM44();
    const rotation: M44 = [
      transform[0],
      transform[1],
      transform[2],
      0,
      transform[4],
      transform[5],
      transform[6],
      0,
      transform[8],
      transform[9],
      transform[10],
      0,
      0,
      0,
      0,
      1,
    ];
    const worldNormal = multiplyM4V3(rotation, normal as V3);
    for (let i = 0; i < borderVertices.length; i += 3) {
      const p = multiplyM4V3(transform, [
        borderVertices[i],
        borderVertices[i + 1],
        borderVertices[i + 2],
      ]);
      outVertices.push(p[0], p[1], p[2]);
      outNormals.push(worldNormal[0], worldNormal[1], worldNormal[2]);
    }
  }
}

export class MiSkPreviewRenderer extends MiSkiRenderer {
  private animationSystem: AnimationSystem;
  private pocketChangeUnsubscribe: (() => void) | null = null;
  private recordingControlsAnimationTime = false;

  // Look-at-cursor state
  private _lookAtCursorEnabled = false;
  private cursorNDC: [number, number] = [0, 0];
  private currentHeadRotation: [number, number] = [0, 0]; // [pitch, yaw]
  private boundOnMouseMove: ((e: MouseEvent) => void) | null = null;

  constructor(backend: Backend) {
    super(backend);
    this.animationSystem = new AnimationSystem();
  }

  public override mount() {
    super.mount();
    const skin = this.getMainSkin();
    const state = getRendererState();

    this.animationSystem.setupBodyParts(skin, state.skinIsPocket);
    // Clips animate away from the user's pose rather than from the T-pose.
    this.animationSystem.setPoseSystem(this.poseSystem);

    // Subscribe to pocket/resolution changes for animation system
    this.pocketChangeUnsubscribe = subscribeToRenderer((state, prevState) => {
      if (
        state.skinIsPocket !== prevState.skinIsPocket ||
        state.skinIsDoubleRes !== prevState.skinIsDoubleRes
      ) {
        this.rebindPoseSystem();
        this.animationSystem.setupBodyParts(
          this.getMainSkin(),
          state.skinIsPocket,
        );
      }
    });
  }

  public override unmount() {
    this.disableLookAtCursor();
    this.pocketChangeUnsubscribe?.();
    this.pocketChangeUnsubscribe = null;
    this.animationSystem.dispose();
    super.unmount();
  }

  public override start(): number {
    const deltaTime = super.start();
    if (!this.recordingControlsAnimationTime) {
      this.animationSystem.update(deltaTime);
    }
    if (this._lookAtCursorEnabled) {
      this.applyLookAtCursor(deltaTime);
    }
    return deltaTime;
  }

  public get lookAtCursorEnabled(): boolean {
    return this._lookAtCursorEnabled;
  }

  public enableLookAtCursor(): void {
    if (this._lookAtCursorEnabled) return;
    this._lookAtCursorEnabled = true;
    this.currentHeadRotation = [0, 0];
    this.cursorNDC = [0, 0];
    this.boundOnMouseMove = (e: MouseEvent) => {
      const canvas = this.backend.canvas;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      this.cursorNDC = [
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -(((e.clientY - rect.top) / rect.height) * 2 - 1),
      ];
    };
    this.backend.canvas?.addEventListener("mousemove", this.boundOnMouseMove, {
      passive: true,
    });
  }

  public disableLookAtCursor(): void {
    if (!this._lookAtCursorEnabled) return;
    this._lookAtCursorEnabled = false;
    if (this.boundOnMouseMove) {
      this.backend.canvas?.removeEventListener(
        "mousemove",
        this.boundOnMouseMove,
      );
      this.boundOnMouseMove = null;
    }
    // Reset head rotation — back to the posed rest position, not to neutral.
    const skin = this.getMainSkin();
    if (skin.baseHead) skin.baseHead.rotation = [0, 0, 0];
    if (skin.overlayHead) skin.overlayHead.rotation = [0, 0, 0];
    this.currentHeadRotation = [0, 0];
    this.poseSystem.apply();
  }

  private applyLookAtCursor(deltaTime: number): void {
    const MAX_YAW = 0.6;
    const MAX_PITCH = 0.3;
    const LERP_SPEED = 8;

    const targetYaw = this.cursorNDC[0] * MAX_YAW;
    const targetPitch = -this.cursorNDC[1] * MAX_PITCH;

    const t = Math.min(1, LERP_SPEED * deltaTime);
    this.currentHeadRotation[0] +=
      (targetPitch - this.currentHeadRotation[0]) * t;
    this.currentHeadRotation[1] +=
      (targetYaw - this.currentHeadRotation[1]) * t;

    const rotation: [number, number, number] = [
      this.currentHeadRotation[0],
      this.currentHeadRotation[1],
      0,
    ];

    // Look-at is a delta on top of however the head is posed, so a tilted head
    // still tracks the cursor from its tilted rest position.
    const posedHead = this.poseSystem.getPartRotation("head");
    const composed = multiplyQuat(posedHead, quatFromEuler(...rotation));

    const skin = this.getMainSkin();
    if (skin.baseHead) skin.baseHead.rotationQuat = composed;
    if (skin.overlayHead) skin.overlayHead.rotationQuat = composed;
  }

  public playAnimation(animationName: string): void {
    // The gizmo leaves the screen for the clip, so drop what it was pointing at
    // rather than leaving a stale hover or selection waiting for the clip to end.
    this.poseInputManager.clearHover();
    this.poseInputManager.clearSelection();
    this.animationSystem.playAnimation(animationName);
  }

  public stopAnimation(): void {
    this.animationSystem.stopAnimation();
  }

  public setAnimationSpeed(speed: number): void {
    this.animationSystem.setAnimationSpeed(speed);
  }

  public isAnimationPlaying(): boolean {
    return this.animationSystem.isAnimationPlaying();
  }

  protected override isPlayingClipAnimation(): boolean {
    return this.animationSystem.isAnimationPlaying();
  }

  public getAvailableAnimations(): {
    name: string;
    label: string;
  }[] {
    return animations.map((an) => ({
      name: an.name,
      label: an.label || an.name,
    }));
  }

  /** True when this browser can record the canvas to a video file. */
  public canRecordClip(): boolean {
    return (
      !!this.backend.canvas && SkinRecorder.isSupported(this.backend.canvas)
    );
  }

  /**
   * Records a share-ready vertical clip of the current skin: spins the model a
   * full turn while {@link SkinRecorder} composites the view onto a 9:16
   * backdrop with a baked-in watermark.
   *
   * Animation follows the user's choice: if they've already selected one, the
   * clip uses that; if not, it falls back to a default so the clip still has
   * motion. Either way the camera and animation state are snapshotted and
   * restored afterward, so a default clip animation never lingers on a model
   * the user left un-animated. Pass a `signal` to cancel mid-record — this
   * rejects with an `AbortError` and shares nothing.
   */
  public async recordClip(
    options: {
      durationMs?: number;
      rotations?: number;
      /** Animation to play during the clip; `null` records a static spin. */
      animationName?: string | null;
      watermark?: string;
      onProgress?: (progress: number) => void;
      signal?: AbortSignal;
    } = {},
  ): Promise<RecordedClip> {
    const canvas = this.backend.canvas;
    if (!canvas) throw new RecorderNotSupportedError();

    const rotations = options.rotations ?? 1;

    const state = getRendererState();
    const startTheta = state.cameraTheta;
    const prevPhi = state.cameraPhi;
    const prevRadius = state.cameraRadius;
    // What the user had selected before recording — the state we restore to.
    const prevAnimation = this.animationSystem.getCurrentAnimationName();
    const wasLookAtCursor = this.lookAtCursorEnabled;

    // Record with the user's chosen animation; only fall back to the default
    // when they haven't selected one and the caller didn't specify.
    const clipAnimation =
      options.animationName === undefined
        ? (prevAnimation ?? "walking")
        : options.animationName;
    const durationMs =
      options.durationMs ?? getLoopAlignedClipDurationMs(clipAnimation, 6000);

    const recorder = new SkinRecorder(canvas, {
      watermark: options.watermark,
    });

    let clip: RecordedClip | undefined;
    let recorderStarted = false;
    let loopPaused = false;
    let thrown: unknown;
    let stopError: unknown;
    try {
      // Take exclusive control of rendering: pause the always-on live loop so
      // the offline loop below is the sole caller of onRenderFrame. This removes
      // the wall-clock coupling (concurrent RAF renders, cloud animation, orbit
      // damping, look-at-cursor) that made the old recorder emit laggy,
      // variable-rate clips on slower devices.
      this.orbitControl.resetVelocity();
      if (wasLookAtCursor) this.disableLookAtCursor();
      this.stop();
      loopPaused = true;
      this.recordingControlsAnimationTime = true;
      // Recorded frames are cover-fit assuming a horizontally centered model, so
      // suppress any docked-panel offset for the capture. This overrides the
      // effective offset to 0 without disturbing the layout value the dashboard
      // sync keeps writing, so a resize mid-record can't corrupt the clip and
      // clearing suppression below restores the *current* offset, not a stale one.
      this.backend.setViewportCenterOffsetSuppressed(true);
      // The pose handles are an editing control; a clip records the model, not
      // the tools pointed at it. Suppressed for the whole record rather than
      // relying on the clip animation to hide them, since a caller can record a
      // static spin with no animation at all.
      this.setPoseGizmoSuppressed(true);

      // Wait for the watermark logo + encoder selection before the first frame.
      await recorder.ready();
      if (clipAnimation) this.playAnimation(clipAnimation);
      else this.stopAnimation();
      this.animationSystem.setAnimationTime(0);
      await recorder.start();
      recorderStarted = true;

      await this.runOfflineRecordLoop(recorder, {
        startTheta,
        rotations,
        durationMs,
        clipAnimation,
        onProgress: options.onProgress,
        signal: options.signal,
      });
    } catch (e) {
      thrown = e;
    } finally {
      if (!recorderStarted || options.signal?.aborted) {
        // Nothing to finalize: either start() never succeeded (so no clip is
        // possible) or the user cancelled (the flushed+muxed blob would only be
        // discarded below). Release the encoder directly instead of running the
        // expensive flush+mux — dispose() still frees the capture resources.
        recorder.dispose();
      } else {
        try {
          // Finalize to flush + mux the clip and release capture resources.
          clip = await recorder.stop();
        } catch (e) {
          stopError = e;
        }
      }
      // Restore the state the user left behind. The store writes are always
      // safe, but touching live renderer resources (animation system, canvas
      // listeners, the render loop) is only valid while still mounted — if the
      // renderer was torn down mid-encode, resurrecting them would leak a
      // mousemove listener and revive disposed state (this mirrors the
      // isMounted guard resumeLiveLoop already applies to itself).
      this.recordingControlsAnimationTime = false;
      this.orbitControl.resetVelocity();
      state.setValue("cameraTheta", startTheta, "recorder");
      state.setValue("cameraPhi", prevPhi, "recorder");
      state.setValue("cameraRadius", prevRadius, "recorder");
      // Lift the capture suppression before the live loop resumes so its first
      // frame renders the recentered view using the current layout offset (safe
      // as a plain field write).
      this.backend.setViewportCenterOffsetSuppressed(false);
      this.setPoseGizmoSuppressed(false);
      if (this.isMounted) {
        // Replay the user's prior animation, or stop so a default clip animation
        // doesn't linger on a model they'd left un-animated.
        if (prevAnimation) this.playAnimation(prevAnimation);
        else this.stopAnimation();
        if (wasLookAtCursor) this.enableLookAtCursor();
        // Resume the live loop last, so its first frame renders the restored view.
        if (loopPaused) this.resumeLiveLoop();
      }
    }

    if (thrown) throw thrown;
    // Abort takes precedence over a finalize error so a cancelled recording
    // never surfaces as a confusing encoder failure.
    if (options.signal?.aborted) {
      throw new DOMException("Recording cancelled", "AbortError");
    }
    if (stopError) throw stopError;
    if (!clip) throw new Error("Recording failed before a clip was created");
    return clip;
  }

  /**
   * Renders the clip one frame at a time. The two encoder pacings drive the
   * clock differently:
   *
   * - frame-exact (WebCodecs): a deterministic, frame-index-driven clock. Every
   *   input (camera angle, animation time) is a pure function of the frame
   *   index, so the output is identical — a guaranteed constant fps — no matter
   *   how long each frame takes to render and encode, even on a slow device.
   * - realtime (MediaRecorder): a wall-clock-driven clock. Frames are
   *   timestamped by arrival, so a fixed frame count would export an over-long,
   *   slow-motion clip whenever a frame can't render within its interval.
   *   Progress is instead derived from elapsed time and the loop stops at
   *   durationMs — the rotation always finishes in ~durationMs and a slow device
   *   simply drops frames.
   */
  private async runOfflineRecordLoop(
    recorder: SkinRecorder,
    o: {
      startTheta: number;
      rotations: number;
      durationMs: number;
      clipAnimation: string | null;
      onProgress?: (progress: number) => void;
      signal?: AbortSignal;
    },
  ): Promise<void> {
    const state = getRendererState();
    const fps = DEFAULT_RECORDER_FPS;
    const frameCount = Math.max(1, Math.round((o.durationMs / 1000) * fps));
    const totalAngle = 2 * Math.PI * o.rotations;
    const clipDurationSeconds = o.durationMs / 1000;
    const animation = o.clipAnimation
      ? animations.find((an) => an.name === o.clipAnimation)
      : undefined;
    const hasAnimation = (animation?.duration ?? 0) > 0;

    // Render one frame with every input (camera angle, animation time) derived
    // purely from loopProgress ∈ [0, 1]. The live loop is paused, so nothing can
    // overwrite the drawing buffer between render and capture.
    const renderFrameAt = (loopProgress: number) => {
      state.setValue(
        "cameraTheta",
        o.startTheta + totalAngle * loopProgress,
        "recorder",
      );
      if (hasAnimation) {
        this.animationSystem.setAnimationTime(
          clipDurationSeconds * loopProgress,
        );
      }
      this.backend.onRenderFrame(this);
    };

    if (recorder.pacing === "realtime") {
      // Realtime encoders (MediaRecorder) timestamp frames by wall-clock
      // arrival, so the clip's length is however long this loop runs. Drive
      // progress off the wall clock and stop at durationMs — a slow device drops
      // frames rather than exporting an over-long, slow-motion clip.
      const frameIntervalMs = recorder.frameIntervalMs;
      const startedAt = performance.now();
      let nextFrameAt = startedAt;
      let frameIndex = 0;
      for (;;) {
        if (o.signal?.aborted) break;
        const loopProgress = Math.min(
          1,
          (performance.now() - startedAt) / o.durationMs,
        );

        renderFrameAt(loopProgress);
        await recorder.captureFrame(frameIndex++);
        o.onProgress?.(loopProgress);

        if (loopProgress >= 1) break;

        // Pace to wall clock so arrival-timestamped frames land near the target
        // rate; when a frame overran its budget `wait` is negative and the next
        // frame renders immediately.
        nextFrameAt += frameIntervalMs;
        const wait = nextFrameAt - performance.now();
        if (wait > 0) await abortableDelay(wait, o.signal);
      }
      return;
    }

    // Frame-exact (WebCodecs): a deterministic, frame-index-driven clock. Each
    // frame carries an explicit presentation timestamp, so the loop runs
    // flat-out and the output is a guaranteed constant fps however slow
    // rendering is.
    for (let i = 0; i < frameCount; i++) {
      if (o.signal?.aborted) break;

      // frame 0 → 0, last frame → 1 - 1/frameCount, so the loop never renders
      // the exact 360° duplicate of frame 0 (keeps a looping clip seamless).
      renderFrameAt(i / frameCount);
      await recorder.captureFrame(i);

      o.onProgress?.((i + 1) / frameCount);

      // Yield via setTimeout(0) — not RAF, which throttles in a backgrounded
      // tab — so React can paint progress and cancellation stays responsive.
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    }
  }
}

function getLoopAlignedClipDurationMs(
  animationName: string | null,
  targetDurationMs: number,
): number {
  if (!animationName) return targetDurationMs;

  const animation = animations.find((an) => an.name === animationName);
  const animationDurationMs = (animation?.duration ?? 0) * 1000;
  if (animationDurationMs <= 0) return targetDurationMs;

  const loops = Math.max(1, Math.round(targetDurationMs / animationDurationMs));
  return animationDurationMs * loops;
}

/**
 * A `setTimeout` that also resolves immediately if the signal aborts, so the
 * realtime record loop's inter-frame wait can be cancelled without delay.
 */
function abortableDelay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal?.aborted) {
      resolve();
      return;
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      resolve();
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}
