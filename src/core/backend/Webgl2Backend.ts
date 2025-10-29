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
import { MiSkiEditingRenderer } from "../MiSkiRenderer";
import { Renderer } from "../Renderer";
import { State } from "../State";
import { resizeCanvasToDisplaySize } from "../utils";
import { Backend } from "./Backend";
import { MainProgram } from "./Webgl2Program";

export default class Webgl2Backend implements Backend {
  private _canvasRef: { current: HTMLCanvasElement | null } = { current: null };
  private gl: WebGL2RenderingContext | null = null;
  private mainProgram: MainProgram | null = null;
  private globalTransformation = identityM44();
  private viewTransformation = identityM44();
  private projectTransformation = identityM44();
  private state?: State;
  private meshes?: MeshGroup;
  private materialTextureCache: Map<string, WebGLTexture> = new Map();
  canvas: HTMLCanvasElement | null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const gl = canvas.getContext("webgl2");
    if (!gl) throw new Error("Could not retrieve WebGL 2 context.");
    this.gl = gl;
    this.mainProgram = new MainProgram(this.gl);
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
  public bindMeshGroup(meshGroup: MeshGroup): void {
    if (!this.gl || !this.mainProgram) return;

    // Clean up any existing WebGL resources for this mesh group first
    this.cleanupMeshGroup(meshGroup);

    meshGroup.getChildren().forEach((child) => {
      if (child instanceof MinecraftPart && this.gl && this.mainProgram) {
        child.compileData();
        // Create merged buffers
        const mergedVerticesBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mergedVerticesBuffer);
        this.gl.bufferData(
          this.gl.ARRAY_BUFFER,
          new Float32Array(child.mergedVertices),
          this.gl.STATIC_DRAW,
        );

        const mergedNormalsBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mergedNormalsBuffer);
        this.gl.bufferData(
          this.gl.ARRAY_BUFFER,
          new Float32Array(child.mergedNormals),
          this.gl.STATIC_DRAW,
        );

        const mergedUVsBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mergedUVsBuffer);
        this.gl.bufferData(
          this.gl.ARRAY_BUFFER,
          new Float32Array(child.mergedUVs),
          this.gl.STATIC_DRAW,
        );

        // Store buffer references in the mesh group for proper cleanup
        child.mergedVerticesBuffer = mergedVerticesBuffer;
        child.mergedNormalsBuffer = mergedNormalsBuffer;
        child.mergedUVsBuffer = mergedUVsBuffer;

        // Create and set up a VAO for this group
        const vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(vao);

        // Bind position buffer
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mergedVerticesBuffer);
        this.gl.enableVertexAttribArray(
          this.mainProgram.getLocation("a_position") as number,
        );
        this.gl.vertexAttribPointer(
          this.mainProgram.getLocation("a_position") as number,
          3,
          this.gl.FLOAT,
          false,
          0,
          0,
        );

        // Bind uv buffer
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mergedUVsBuffer);
        this.gl.enableVertexAttribArray(
          this.mainProgram.getLocation("a_texcoord") as number,
        );
        this.gl.vertexAttribPointer(
          this.mainProgram.getLocation("a_texcoord") as number,
          2,
          this.gl.FLOAT,
          false,
          0,
          0,
        );

        // Bind normal buffer
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mergedNormalsBuffer);
        this.gl.enableVertexAttribArray(
          this.mainProgram.getLocation("a_normal") as number,
        );
        this.gl.vertexAttribPointer(
          this.mainProgram.getLocation("a_normal") as number,
          3,
          this.gl.FLOAT,
          false,
          0,
          0,
        );

        this.gl.bindVertexArray(null);
        child.vao = vao;
      } else if (child instanceof MeshGroup) {
        this.bindMeshGroup(child);
      }
    });
  }
  public onStart(meshes: MeshGroup, state: State) {
    this.meshes = meshes;
    this.state = state;
  }
  private renderMeshGroup(
    renderer: Renderer,
    meshGroup: MeshGroup,
    skin: MinecraftSkin,
  ): void {
    if (!meshGroup.visible || !this.gl || !this.mainProgram) return;
    const material = meshGroup.getMaterial();
    if (material instanceof MeshImageMaterial) {
      if (!this.materialTextureCache.has(material.uuid)) {
        this.materialTextureCache.set(material.uuid, this.gl.createTexture()!);
      }
      this.gl.bindTexture(
        this.gl.TEXTURE_2D,
        this.materialTextureCache.get(material.uuid)!,
      );
      if (material.isDirty) {
        this.gl.texImage2D(
          this.gl.TEXTURE_2D,
          0,
          this.gl.RGBA,
          64,
          64,
          0,
          this.gl.RGBA,
          this.gl.UNSIGNED_BYTE,
          material.imageData,
        );
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
        this.gl.texParameteri(
          this.gl.TEXTURE_2D,
          this.gl.TEXTURE_MIN_FILTER,
          this.gl.NEAREST,
        );
        this.gl.texParameteri(
          this.gl.TEXTURE_2D,
          this.gl.TEXTURE_MAG_FILTER,
          this.gl.NEAREST,
        );
        material.markClean();
      }
    }
    const m = multiplyM44(
      this.projectTransformation,
      this.viewTransformation,
      multiplyM44(this.globalTransformation, meshGroup.getTransformMatrix()),
    );
    this.gl.uniformMatrix4fv(
      this.mainProgram.getLocation("u_matrix"),
      false,
      m,
    );

    if (meshGroup.vao) {
      this.gl.bindVertexArray(meshGroup.vao);
      this.gl.drawArrays(this.gl.TRIANGLES, 0, meshGroup.linesOffset);

      if (
        this.state?.getGridVisible() &&
        renderer instanceof MiSkiEditingRenderer &&
        this.shouldRenderGrid(meshGroup, skin)
      ) {
        // Save current depth state
        const currentDepthFunc = this.gl.getParameter(this.gl.DEPTH_FUNC);
        const currentDepthMask = this.gl.getParameter(this.gl.DEPTH_WRITEMASK);

        this.gl.uniform1f(
          this.mainProgram.getLocation("u_gridLines") as WebGLUniformLocation,
          1,
        );

        const lineVertexCount =
          meshGroup.mergedVertices.length / 3 - meshGroup.linesOffset;

        this.gl.drawArrays(
          this.gl.TRIANGLES,
          meshGroup.linesOffset,
          lineVertexCount,
        );

        this.gl.uniform1f(
          this.mainProgram.getLocation("u_gridLines") as WebGLUniformLocation,
          0,
        );

        // Restore previous WebGL state
        this.gl.disable(this.gl.POLYGON_OFFSET_FILL);
        this.gl.depthFunc(currentDepthFunc);
        this.gl.depthMask(currentDepthMask);
      }

      this.gl.bindVertexArray(null);
    } else {
      meshGroup.getChildren().forEach((child) => {
        if (child instanceof MeshGroup) {
          this.renderMeshGroup(renderer, child, skin);
        }
      });
    }
  }
  shouldRenderGrid(part: MeshGroup, skin: MinecraftSkin) {
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
  public onRenderFrame(renderer: Renderer) {
    if (
      !this.canvas ||
      !this.meshes ||
      !this.state ||
      !this.gl ||
      !this.mainProgram
    )
      return;
    const resized = resizeCanvasToDisplaySize(this.canvas);

    const skin = this.meshes.getChildren()[0] as MinecraftSkin;
    const opaqueGroup = this.meshes.findMeshes(
      (g) => g.name === "opaque",
    )[0] as MinecraftPart;
    const transparentGroup = this.meshes.findMeshes(
      (g) => g.name === "transparent",
    )[0] as MinecraftPart;

    this.gl.depthMask(true);
    if (renderer instanceof MiSkiEditingRenderer) {
      this.gl.enable(this.gl.CULL_FACE);
    } else {
      this.gl.disable(this.gl.CULL_FACE);
    }

    const lightPosition: V3 = [
      -this.state.getDiffuseLightPositionX(),
      this.state.getDiffuseLightPositionY(),
      this.state.getDiffuseLightPositionZ(),
    ];

    this.gl.clearColor(0.0, 0.0, 0.0, 0.0);

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    if (resized) {
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    this.projectTransformation = project(
      aspect,
      this.state.getCameraFieldOfView(),
      0.1,
      2000,
    );
    const cameraRotation = multiplyM33(
      rotateYM33(-this.state.getCameraTheta()),
      rotateXM33(-this.state.getCameraPhi()),
    );
    const cameraPosition: V3 = multiplyM3V3(cameraRotation, [
      0,
      0,
      this.state.getCameraRadius(),
    ]);
    const target: V3 = [0, 0, 0];
    const up: V3 = multiplyM3V3(cameraRotation, [0, 1, 0]);
    this.viewTransformation = lookAt(cameraPosition, target, up);
    const objectTransformationMatrix = multiplyM44(
      translateM44(
        -this.state.getObjectTranslationX(),
        this.state.getObjectTranslationY(),
        this.state.getObjectTranslationZ(),
      ),
      rotateXM44(this.state.getObjectRotationX()),
      rotateYM44(this.state.getObjectRotationY()),
      rotateZM44(this.state.getObjectRotationZ()),
    );
    this.globalTransformation = objectTransformationMatrix;

    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LESS);
    this.gl.depthMask(true);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.gl.useProgram(this.mainProgram.getProgram());

    this.gl.uniform1f(
      this.mainProgram.getLocation("u_ambientLight") as WebGLUniformLocation,
      this.state.getAmbientLight(),
    );
    this.gl.uniform1f(
      this.mainProgram.getLocation(
        "u_specularStrength",
      ) as WebGLUniformLocation,
      this.state.getSpecularStrength(),
    );
    this.gl.uniform1f(
      this.mainProgram.getLocation("u_diffuseStrength") as WebGLUniformLocation,
      this.state.getDiffuseStrength(),
    );
    this.gl.uniform3fv(
      this.mainProgram.getLocation(
        "u_diffuseLightPosition",
      ) as WebGLUniformLocation,
      lightPosition,
    );
    this.gl.uniform3fv(
      this.mainProgram.getLocation("u_cameraPosition") as WebGLUniformLocation,
      cameraPosition,
    );

    this.renderMeshGroup(renderer, opaqueGroup, skin);

    this.gl.uniform1f(
      this.mainProgram.getLocation(
        "u_directionalLightIntensity",
      ) as WebGLUniformLocation,
      this.state.getDirectionalLightIntensity(),
    );

    this.renderMeshGroup(renderer, transparentGroup, skin);
  }
  public onEnd() {
    if (this.mainProgram) {
      this.mainProgram.unmount();
    }
    if (this.gl) {
      for (const texture of this.materialTextureCache.values()) {
        this.gl.deleteTexture(texture);
      }
      // Clear the texture cache
      this.materialTextureCache.clear();
    }

    if (this.meshes) this.meshes.cleanup(this.gl);

    this.mainProgram = null;
    this.gl = null;
    this._canvasRef.current = null;
  }

  public cleanupMeshGroup(meshGroup: MeshGroup): void {
    if (!this.gl) return;

    // Clean up material textures for this mesh group
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

    // Recursively clean up child mesh groups
    meshGroup.getChildren().forEach((child) => {
      if (child instanceof MeshGroup) {
        this.cleanupMeshGroup(child);
      }
    });
  }
}
