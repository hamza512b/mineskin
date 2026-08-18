import { getRendererState } from "../../store";
import {
  identityM44,
  lookAt,
  M44,
  multiplyM33,
  multiplyM3V3,
  multiplyM44,
  project,
  rotateXM33,
  rotateXM44,
  rotateYM33,
  rotateYM44,
  rotateZM44,
  translateM44,
  V3,
} from "../maths";
import { MeshGroup, MinecraftPart } from "../mesh";
import { MeshImageMaterial } from "../MeshMaterial";
import { MinecraftSkin } from "../MinecraftSkin";
import { MiSkiEditingRenderer, MiSkiRenderer } from "../MiSkiRenderer";
import type { PoseGizmoGeometry } from "../PoseGizmo";
import { Renderer } from "../Renderer";
import { resizeCanvasToDisplaySize } from "../utils";
import { Backend } from "./Backend";
import {
  getEnvironmentClearColor,
  isEnvironmentTransformLocked,
} from "../environment";

export interface RendererProgramLike {
  getProgram(): WebGLProgram;
  getLocation(name: string): WebGLUniformLocation;
  unmount(): void;
}

type AnyGl = WebGLRenderingContext | WebGL2RenderingContext;

export abstract class BaseGlBackend<
  TGl extends AnyGl,
  TProgram extends RendererProgramLike,
  TGpuResources,
  THighlightResources,
> implements Backend {
  protected gl: TGl | null = null;
  protected mainProgram: TProgram | null = null;
  protected globalTransformation = identityM44();
  protected viewTransformation = identityM44();
  protected projectTransformation = identityM44();
  protected meshes?: MeshGroup;
  protected materialTextureCache: Map<string, WebGLTexture> = new Map();
  protected gpuResources: Map<string, TGpuResources> = new Map();
  protected highlightResources: THighlightResources | null = null;
  protected environmentGridSuppressed: boolean = false;

  // Horizontal shift of the projection center, in CSS pixels. The canvas
  // always spans the full screen; when a panel docks over part of it, this
  // recenters the model into the still-visible area instead of shrinking the
  // canvas. Positive shifts the rendered image toward the trailing edge.
  private viewportCenterOffsetPx: number = 0;
  // Cover-fit captures (screenshots, recorded clips) crop the canvas center, so
  // they render the model centered regardless of any docked-panel offset. This
  // forces the effective offset to 0 without touching viewportCenterOffsetPx,
  // so the layout sync can keep updating that field during a multi-second
  // record without the two writers racing — clearing suppression restores the
  // current layout offset, not a stale pre-capture snapshot.
  private viewportCenterOffsetSuppressed: boolean = false;

  private cachedSkin: MinecraftSkin | null = null;
  private cachedOpaqueGroup: MinecraftPart | null = null;
  private cachedTransparentGroup: MinecraftPart | null = null;
  private cachedEnvironmentGroup: MeshGroup | null = null;

  canvas: HTMLCanvasElement | null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  public setEnvironmentGridSuppressed(suppressed: boolean): void {
    this.environmentGridSuppressed = suppressed;
  }

  public setViewportCenterOffset(px: number): void {
    this.viewportCenterOffsetPx = px;
  }

  public getViewportCenterOffset(): number {
    return this.viewportCenterOffsetPx;
  }

  public setViewportCenterOffsetSuppressed(suppressed: boolean): void {
    this.viewportCenterOffsetSuppressed = suppressed;
  }

  getGlobalTransformation(): M44 {
    return this.globalTransformation;
  }
  getViewTransformation(): M44 {
    return this.viewTransformation;
  }
  getProjectTransformation(): M44 {
    return this.projectTransformation;
  }

  public onStart(meshes: MeshGroup): void {
    this.meshes = meshes;
    this.invalidateMeshCache();
  }

  public onEnd(): void {
    if (this.mainProgram) this.mainProgram.unmount();
    if (this.gl) {
      for (const texture of this.materialTextureCache.values()) {
        this.gl.deleteTexture(texture);
      }
      this.materialTextureCache.clear();

      for (const res of this.gpuResources.values()) {
        this.deleteGpuResources(res);
      }
      this.gpuResources.clear();

      if (this.highlightResources) {
        this.deleteHighlightResources(this.highlightResources);
        this.highlightResources = null;
      }
    }

    if (this.meshes) this.meshes.clearCompiledData();

    this.mainProgram = null;
    this.gl = null;
    this.invalidateMeshCache();
  }

  public bindMeshGroup(meshGroup: MeshGroup): void {
    if (!this.gl || !this.mainProgram) return;

    this.invalidateMeshCache();
    this.cleanupMeshGroup(meshGroup);

    meshGroup.getChildren().forEach((child) => {
      if (!(child instanceof MeshGroup)) return;
      const shouldCompile =
        child instanceof MinecraftPart ||
        child.getChildren().some((nested) => !(nested instanceof MeshGroup));
      if (shouldCompile && child.mergedVertices.length === 0) {
        child.compileData();
      }
      if (child.mergedVertices.length > 0) {
        const res = this.createGpuResources(child);
        if (res) this.gpuResources.set(child.uuid, res);
      } else {
        this.bindMeshGroup(child);
      }
    });
  }

  public cleanupMeshGroup(meshGroup: MeshGroup): void {
    if (!this.gl) return;

    this.invalidateMeshCache();

    const material = meshGroup.getMaterial();
    if (
      material instanceof MeshImageMaterial &&
      this.materialTextureCache.has(material.uuid)
    ) {
      const texture = this.materialTextureCache.get(material.uuid);
      if (texture) {
        this.gl.deleteTexture(texture);
        this.materialTextureCache.delete(material.uuid);
      }
    }

    const resources = this.gpuResources.get(meshGroup.uuid);
    if (resources) {
      this.deleteGpuResources(resources);
      this.gpuResources.delete(meshGroup.uuid);
    }

    meshGroup.getChildren().forEach((child) => {
      if (child instanceof MeshGroup) this.cleanupMeshGroup(child);
    });
  }

  public onRenderFrame(renderer: Renderer): void {
    if (!this.canvas || !this.meshes || !this.gl || !this.mainProgram) return;
    const gl = this.gl;
    const program = this.mainProgram;

    const state = getRendererState();
    const resized = resizeCanvasToDisplaySize(this.canvas);

    if (!this.resolveMeshCache() || !this.cachedSkin) return;
    const skin = this.cachedSkin;
    const opaqueGroup = this.cachedOpaqueGroup as MinecraftPart;
    const transparentGroup = this.cachedTransparentGroup as MinecraftPart;
    const environmentGroup = this.cachedEnvironmentGroup ?? undefined;

    gl.depthMask(true);
    gl.disable(gl.CULL_FACE);

    const lightPosition: V3 = [
      -state.diffuseLightPositionX,
      state.diffuseLightPositionY,
      state.diffuseLightPositionZ,
    ];

    const clearColor = getEnvironmentClearColor(state.environmentPreset);
    gl.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    if (resized) gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    this.projectTransformation = project(
      aspect,
      state.cameraFieldOfView,
      0.1,
      2000,
    );
    // Shift the projection horizontally so the model recenters into the
    // visible region while the canvas stays full-screen. A `px` CSS-pixel
    // screen offset maps to an NDC shift of `2*px/width`; it is applied via
    // the z→x term (column-major index 8) so the shift is constant across
    // depth (an off-center frustum) rather than distorting the model.
    const clientWidth = this.canvas.clientWidth;
    const effectiveOffsetPx = this.viewportCenterOffsetSuppressed
      ? 0
      : this.viewportCenterOffsetPx;
    if (effectiveOffsetPx !== 0 && clientWidth > 0) {
      this.projectTransformation[8] = -(2 * effectiveOffsetPx) / clientWidth;
    }
    const cameraRotation = multiplyM33(
      rotateYM33(-state.cameraTheta),
      rotateXM33(-state.cameraPhi),
    );
    const cameraPosition: V3 = multiplyM3V3(cameraRotation, [
      0,
      0,
      state.cameraRadius,
    ]);
    const target: V3 = [0, 0, 0];
    const up: V3 = multiplyM3V3(cameraRotation, [0, 1, 0]);
    this.viewTransformation = lookAt(cameraPosition, target, up);

    this.onBeforeFrame(cameraPosition);

    const envLocked = isEnvironmentTransformLocked(state.environmentPreset);
    this.globalTransformation = multiplyM44(
      translateM44(
        envLocked ? 0 : -state.objectTranslationX,
        envLocked ? 0 : state.objectTranslationY,
        envLocked ? 0 : state.objectTranslationZ,
      ),
      rotateXM44(state.objectRotationX),
      rotateYM44(state.objectRotationY),
      rotateZM44(state.objectRotationZ),
    );

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    gl.depthMask(true);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(
      gl.ONE,
      gl.ONE_MINUS_SRC_ALPHA,
      gl.ONE,
      gl.ONE_MINUS_SRC_ALPHA,
    );
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(program.getProgram());

    gl.uniform1f(program.getLocation("u_gridAlpha"), 1.0);
    gl.uniform1i(program.getLocation("u_gridFloor"), 0);
    gl.uniform1f(program.getLocation("u_ambientLight"), state.ambientLight);
    gl.uniform3fv(program.getLocation("u_diffuseLightPosition"), lightPosition);
    gl.uniform3fv(program.getLocation("u_cameraPosition"), cameraPosition);
    gl.uniform1f(
      program.getLocation("u_directionalLightIntensity"),
      state.directionalLightIntensity,
    );

    const skipEnvironmentForScreenshot =
      this.environmentGridSuppressed && state.environmentPreset === "grid";

    if (environmentGroup && !skipEnvironmentForScreenshot) {
      gl.uniform1f(program.getLocation("u_specularStrength"), 0);
      gl.uniform1f(program.getLocation("u_diffuseStrength"), 1);
      if (state.environmentPreset === "grid") {
        // Unlit procedural Blender-style grid. Double-sided so it stays
        // visible when the camera dips below the floor plane.
        const isDark = document.documentElement.classList.contains("dark");
        gl.uniform1i(program.getLocation("u_gridFloor"), 1);
        gl.uniform1f(program.getLocation("u_gridCell"), 18.0);
        gl.uniform3fv(
          program.getLocation("u_gridColor"),
          isDark ? [0.3, 0.31, 0.34] : [0.5, 0.5, 0.53],
        );
        gl.uniform3fv(
          program.getLocation("u_gridColorAxis"),
          isDark ? [0.81, 0.28, 0.25] : [0.78, 0.26, 0.24],
        );
        gl.uniform3fv(
          program.getLocation("u_gridColorAxis2"),
          isDark ? [0.35, 0.72, 0.36] : [0.3, 0.66, 0.32],
        );
        gl.uniform1f(program.getLocation("u_gridFadeStart"), 60.0);
        gl.uniform1f(program.getLocation("u_gridFadeEnd"), 340.0);
        this.renderMeshGroup(renderer, environmentGroup, skin);
        gl.uniform1i(program.getLocation("u_gridFloor"), 0);
      } else {
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
        this.renderMeshGroup(renderer, environmentGroup, skin);
        gl.disable(gl.CULL_FACE);
      }
    }

    gl.uniform1f(
      program.getLocation("u_specularStrength"),
      state.specularStrength,
    );
    gl.uniform1f(
      program.getLocation("u_diffuseStrength"),
      state.diffuseStrength,
    );

    if (
      renderer instanceof MiSkiEditingRenderer &&
      skin.frontIndicator &&
      skin.frontIndicatorOpacity > 0
    ) {
      gl.uniform1f(program.getLocation("u_gridLines"), 1);
      gl.uniform1f(
        program.getLocation("u_gridAlpha"),
        skin.frontIndicatorOpacity,
      );
      const isDark = document.documentElement.classList.contains("dark");
      gl.uniform3fv(
        program.getLocation("u_gridColor"),
        isDark ? [0.7, 0.7, 0.7] : [0.45, 0.45, 0.45],
      );
      // Draw the arrow after the floor grid but BEFORE the skin, with depth
      // testing enabled so it shares the depth buffer with the skin. The skin
      // then correctly occludes the indicator from every angle (including
      // from below) instead of the indicator being drawn over everything.
      this.renderMeshGroup(renderer, skin.frontIndicator, skin);
      gl.uniform1f(program.getLocation("u_gridLines"), 0);
      gl.uniform1f(program.getLocation("u_gridAlpha"), 1.0);
    }

    this.renderMeshGroup(renderer, opaqueGroup, skin);
    this.renderMeshGroup(renderer, transparentGroup, skin);

    if (renderer instanceof MiSkiEditingRenderer && renderer.hoverHighlight) {
      this.renderHoverHighlight(renderer);
    }

    if (renderer instanceof MiSkiRenderer) {
      const gizmo = renderer.getPoseGizmo();
      if (gizmo) this.renderPoseGizmo(gizmo);
    }
  }

  protected renderMeshGroup(
    renderer: Renderer,
    meshGroup: MeshGroup,
    skin: MinecraftSkin,
  ): void {
    if (!meshGroup.visible || !this.gl || !this.mainProgram) return;
    const gl = this.gl;
    const program = this.mainProgram;

    const material = meshGroup.getMaterial();
    if (material instanceof MeshImageMaterial) {
      let texture = this.materialTextureCache.get(material.uuid);
      if (!texture) {
        texture = gl.createTexture()!;
        this.materialTextureCache.set(material.uuid, texture);
      }
      gl.bindTexture(gl.TEXTURE_2D, texture);
      if (material.isDirty) {
        this.uploadTextureData(material);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        material.markClean();
      }
    }

    const shouldApplySkinTransform = this.isDescendantOf(meshGroup, skin.uuid);
    const localMatrix = meshGroup.getTransformMatrix();
    const m = shouldApplySkinTransform
      ? multiplyM44(
          this.projectTransformation,
          this.viewTransformation,
          this.globalTransformation,
          localMatrix,
        )
      : multiplyM44(
          this.projectTransformation,
          this.viewTransformation,
          localMatrix,
        );
    gl.uniformMatrix4fv(program.getLocation("u_matrix"), false, m);

    const resources = this.gpuResources.get(meshGroup.uuid);
    if (resources) {
      if (this.shouldCullEnvironmentMeshForCamera(meshGroup)) return;

      this.bindMeshVao(resources);
      gl.drawArrays(gl.TRIANGLES, 0, meshGroup.linesOffset);

      const state = getRendererState();
      if (
        state.gridVisible &&
        renderer instanceof MiSkiEditingRenderer &&
        this.shouldRenderGrid(meshGroup, skin)
      ) {
        const gridLinesLoc = program.getLocation("u_gridLines");
        gl.uniform1f(gridLinesLoc, 1);
        const isDark = document.documentElement.classList.contains("dark");
        gl.uniform3fv(
          program.getLocation("u_gridColor"),
          isDark ? [0.8, 0.8, 0.8] : [0.55, 0.55, 0.55],
        );
        const lineVertexCount =
          meshGroup.mergedVertices.length / 3 - meshGroup.linesOffset;
        gl.drawArrays(gl.TRIANGLES, meshGroup.linesOffset, lineVertexCount);
        gl.uniform1f(gridLinesLoc, 0);
      }

      this.unbindMeshVao(resources);
    } else {
      meshGroup.getChildren().forEach((child) => {
        if (child instanceof MeshGroup) {
          this.renderMeshGroup(renderer, child, skin);
        }
      });
    }
  }

  protected renderHoverHighlight(renderer: MiSkiEditingRenderer): void {
    if (!this.gl || !this.mainProgram || !renderer.hoverHighlight) return;
    const gl = this.gl;
    const program = this.mainProgram;

    const { vertices, normals, transform } = renderer.hoverHighlight;
    const res = this.ensureHighlightResources();
    if (!res) return;

    this.uploadHighlightBuffers(res, vertices, normals);

    const m = multiplyM44(
      this.projectTransformation,
      this.viewTransformation,
      multiplyM44(this.globalTransformation, transform),
    );
    gl.uniformMatrix4fv(program.getLocation("u_matrix"), false, m);

    gl.uniform1f(program.getLocation("u_gridLines"), 1);
    const isDark = document.documentElement.classList.contains("dark");
    gl.uniform3fv(
      program.getLocation("u_gridColor"),
      isDark ? [1.0, 1.0, 1.0] : [0.0, 0.0, 0.0],
    );
    gl.uniform1f(program.getLocation("u_gridAlpha"), 0.5);

    this.bindHighlightVao(res);
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 3);
    this.unbindHighlightVao(res);

    gl.uniform1f(program.getLocation("u_gridLines"), 0);
    gl.uniform1f(program.getLocation("u_gridAlpha"), 1.0);
  }

  /**
   * Draws the limb-posing handles. Its geometry already sits in the space the
   * skin's own transforms produce, so only the camera matrices apply.
   *
   * Depth testing is off: a handle has to stay grabbable when the limb it
   * belongs to has swung behind the torso, and a control the model can swallow
   * is a control the user cannot find.
   */
  protected renderPoseGizmo(gizmo: PoseGizmoGeometry): void {
    if (!this.gl || !this.mainProgram) return;
    const gl = this.gl;
    const program = this.mainProgram;

    const res = this.ensureHighlightResources();
    if (!res) return;

    this.uploadHighlightBuffers(res, gizmo.vertices, gizmo.normals);

    const m = multiplyM44(
      this.projectTransformation,
      this.viewTransformation,
      this.globalTransformation,
    );
    gl.uniformMatrix4fv(program.getLocation("u_matrix"), false, m);
    gl.uniform1f(program.getLocation("u_gridLines"), 1);

    gl.disable(gl.DEPTH_TEST);
    gl.depthMask(false);

    this.bindHighlightVao(res);
    for (const batch of gizmo.batches) {
      gl.uniform3fv(program.getLocation("u_gridColor"), batch.color);
      gl.uniform1f(program.getLocation("u_gridAlpha"), batch.alpha);
      gl.drawArrays(gl.TRIANGLES, batch.offset, batch.count);
    }
    this.unbindHighlightVao(res);

    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(true);
    gl.uniform1f(program.getLocation("u_gridLines"), 0);
    gl.uniform1f(program.getLocation("u_gridAlpha"), 1.0);
  }

  protected isDescendantOf(meshGroup: MeshGroup, targetUuid: string): boolean {
    let current: MeshGroup | null = meshGroup;
    while (current) {
      if (current.uuid === targetUuid) return true;
      current = current.getParent();
    }
    return false;
  }

  protected isEnvironmentMesh(meshGroup: MeshGroup): boolean {
    let current: MeshGroup | null = meshGroup;
    while (current) {
      if (current.name === "EnvironmentWorld") return true;
      current = current.getParent();
    }
    return false;
  }

  protected shouldRenderGrid(part: MeshGroup, skin: MinecraftSkin): boolean {
    let current: MeshGroup | null = part;
    let isSkinDescendant = false;
    while (current) {
      if (current.uuid === skin.uuid) {
        isSkinDescendant = true;
        break;
      }
      current = current.getParent();
    }
    if (!isSkinDescendant) return false;
    if (part.name === "frontIndicator") return false;
    if (part.metadata?.overlay) return true;
    switch (part.name) {
      case "head":
        return !skin.overlayHead?.visible;
      case "body":
        return !skin.overlayBody?.visible;
      case "leftLeg":
        return !skin.overlayLeftLeg?.visible;
      case "rightLeg":
        return !skin.overlayRightLeg?.visible;
      case "leftArm":
        return !skin.overlayLeftArm?.visible;
      case "rightArm":
        return !skin.overlayRightArm?.visible;
    }
    return true;
  }

  private invalidateMeshCache(): void {
    this.cachedSkin = null;
    this.cachedOpaqueGroup = null;
    this.cachedTransparentGroup = null;
    this.cachedEnvironmentGroup = null;
  }

  private resolveMeshCache(): boolean {
    if (!this.meshes) return false;
    if (!this.cachedSkin) {
      const skin = this.meshes
        .getChildren()
        .find(
          (group) =>
            group instanceof MinecraftSkin && group.name === "MainSkin",
        ) as MinecraftSkin | undefined;
      if (!skin) return false;
      this.cachedSkin = skin;
      this.cachedOpaqueGroup =
        (skin
          .getChildren()
          .find((g) => g instanceof MeshGroup && g.name === "opaque") as
          MinecraftPart | undefined) ?? null;
      this.cachedTransparentGroup =
        (skin
          .getChildren()
          .find((g) => g instanceof MeshGroup && g.name === "transparent") as
          MinecraftPart | undefined) ?? null;
    }
    if (!this.cachedEnvironmentGroup) {
      this.cachedEnvironmentGroup =
        (this.meshes
          .getChildren()
          .find(
            (group) =>
              group instanceof MeshGroup && group.name === "EnvironmentWorld",
          ) as MeshGroup | undefined) ?? null;
    }
    return true;
  }

  // Hook: receives the camera position once per frame. Default: no-op.
  // WebGL2 overrides this to enable inside-AABB env culling.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onBeforeFrame(_cameraPosition: V3): void {}

  // Hook: per-mesh cull decision used inside renderMeshGroup. Default: never cull.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected shouldCullEnvironmentMeshForCamera(_meshGroup: MeshGroup): boolean {
    return false;
  }

  // GL-version-specific operations.
  protected abstract uploadTextureData(material: MeshImageMaterial): void;
  protected abstract createGpuResources(child: MeshGroup): TGpuResources | null;
  protected abstract bindMeshVao(res: TGpuResources): void;
  protected abstract unbindMeshVao(res: TGpuResources): void;
  protected abstract deleteGpuResources(res: TGpuResources): void;
  protected abstract ensureHighlightResources(): THighlightResources | null;
  protected abstract uploadHighlightBuffers(
    res: THighlightResources,
    vertices: number[],
    normals: number[],
  ): void;
  protected abstract bindHighlightVao(res: THighlightResources): void;
  protected abstract unbindHighlightVao(res: THighlightResources): void;
  protected abstract deleteHighlightResources(res: THighlightResources): void;
}
