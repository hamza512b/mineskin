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
import { Mesh, MeshGroup } from "../mesh";
import { MeshImageMaterial } from "../MeshMaterial";
import { State } from "../State";
import { resizeCanvasToDisplaySize } from "../utils";
import { Backend } from "./Backend";
import { MainProgram } from "./Webgl2Program";

export default class Webgl2Backend implements Backend {
  private gl: WebGL2RenderingContext;
  private mainProgram: MainProgram;
  public mainTexture!: WebGLTexture;
  private globalTransformation = identityM44();
  private viewTransformation = identityM44();
  private projectTransformation = identityM44();
  private state?: State;
  private meshes?: MeshGroup;
  attachedCanvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.attachedCanvas = canvas;
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
  public onStart(meshes: MeshGroup, state: State) {
    this.meshes = meshes;
    this.state = state;
    this.meshes.compileBuffers(this.gl, this.mainProgram);
    this.mainTexture = this.gl.createTexture()!;
  }
  private renderMeshGroup(meshGroup: MeshGroup): void {
    if (!meshGroup.visible) return;
    if (!meshGroup.vao) {
      console.error("MeshGroup VAO not compiled!");
      return;
    }
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.mainTexture);
    const material = meshGroup.getMaterial();
    if (material instanceof MeshImageMaterial) {
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.mainTexture);
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
    this.gl.bindVertexArray(meshGroup.vao);
    for (const mesh of meshGroup.getMeshes()) {
      if (mesh instanceof Mesh) {
        this.gl.drawArrays(
          this.gl.TRIANGLES,
          mesh.vertexOffset,
          mesh.verticesCount,
        );
      } else if (mesh instanceof MeshGroup) {
        this.renderMeshGroup(mesh);
      }
    }
    this.gl.bindVertexArray(null);
  }
  public onRenderFrame() {
    if (!this.attachedCanvas || !this.meshes || !this.state) return;

    const canvas = this.attachedCanvas;
    resizeCanvasToDisplaySize(canvas);

    const opaqueGroup = this.meshes.findMeshes(
      (g) => g.name === "opaque",
    )[0] as MeshGroup;
    const transparentGroup = this.meshes.findMeshes(
      (g) => g.name === "transparent",
    )[0] as MeshGroup;

    this.gl.enable(this.gl.CULL_FACE);
    this.gl.cullFace(this.gl.BACK);

    const lightPosition: V3 = [
      -this.state.getDiffuseLightPositionX(),
      this.state.getDiffuseLightPositionY(),
      this.state.getDiffuseLightPositionZ(),
    ];

    this.gl.clearColor(0.0, 0.0, 0.0, 0.0);

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    this.gl.viewport(0, 0, canvas.width, canvas.height);
    const aspect = canvas.clientWidth / canvas.clientHeight;
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
    this.gl.depthFunc(this.gl.LEQUAL);
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

    this.renderMeshGroup(opaqueGroup);

    this.gl.uniform1f(
      this.mainProgram.getLocation(
        "u_directionalLightIntensity",
      ) as WebGLUniformLocation,
      this.state.getDirectionalLightIntensity(),
    );
    this.gl.uniform1i(
      this.mainProgram.getLocation("u_useFloorTexture") as WebGLUniformLocation,
      0,
    );
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.depthMask(false);
    this.renderMeshGroup(transparentGroup);
    this.gl.depthMask(true);
    this.gl.disable(this.gl.BLEND);
  }
  public onEnd() {
    if (this.mainProgram) {
      this.mainProgram.unmount();
    }
    if (this.gl && this.mainTexture) {
      this.gl.deleteTexture(this.mainTexture);
    }

    if (this.meshes) this.meshes.cleanup(this.gl);
  }
}
