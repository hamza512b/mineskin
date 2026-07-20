import { V3 } from "../maths";
import { MeshGroup } from "../mesh";
import { MeshImageMaterial } from "../MeshMaterial";
import { BaseGlBackend } from "./BaseGlBackend";
import { MainProgram } from "./Webgl2Program";

type GPUResources = {
  vao: WebGLVertexArrayObject;
  verticesBuffer: WebGLBuffer;
  normalsBuffer: WebGLBuffer;
  uvsBuffer: WebGLBuffer;
};

type HighlightResources = {
  vao: WebGLVertexArrayObject;
  verticesBuffer: WebGLBuffer;
  normalsBuffer: WebGLBuffer;
  uvsBuffer: WebGLBuffer;
};

export default class Webgl2Backend extends BaseGlBackend<
  WebGL2RenderingContext,
  MainProgram,
  GPUResources,
  HighlightResources
> {
  private frameCameraPosition: V3 | null = null;

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
    const gl = canvas.getContext("webgl2", { preserveDrawingBuffer: true });
    if (!gl) throw new Error("Could not retrieve WebGL 2 context.");
    this.gl = gl;
    this.mainProgram = new MainProgram(gl);
  }

  protected onBeforeFrame(cameraPosition: V3): void {
    this.frameCameraPosition = cameraPosition;
  }

  protected shouldCullEnvironmentMeshForCamera(meshGroup: MeshGroup): boolean {
    if (!this.frameCameraPosition || !this.isEnvironmentMesh(meshGroup)) {
      return false;
    }
    const box = meshGroup.calculateBoundingBox();
    const camera = this.frameCameraPosition;
    const padding = 5;
    return (
      camera[0] >= box.min[0] - padding &&
      camera[0] <= box.max[0] + padding &&
      camera[1] >= box.min[1] - padding &&
      camera[1] <= box.max[1] + padding &&
      camera[2] >= box.min[2] - padding &&
      camera[2] <= box.max[2] + padding
    );
  }

  protected uploadTextureData(material: MeshImageMaterial): void {
    const gl = this.gl!;
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      material.width,
      material.height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      material.imageData,
    );
  }

  protected createGpuResources(child: MeshGroup): GPUResources | null {
    const gl = this.gl!;
    const program = this.mainProgram!;

    const verticesBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(child.mergedVertices),
      gl.STATIC_DRAW,
    );

    const normalsBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(child.mergedNormals),
      gl.STATIC_DRAW,
    );

    const uvsBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, uvsBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(child.mergedUVs),
      gl.STATIC_DRAW,
    );

    const vao = gl.createVertexArray()!;
    gl.bindVertexArray(vao);

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.enableVertexAttribArray(program.getLocation("a_position") as number);
    gl.vertexAttribPointer(
      program.getLocation("a_position") as number,
      3,
      gl.FLOAT,
      false,
      0,
      0,
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, uvsBuffer);
    gl.enableVertexAttribArray(program.getLocation("a_texcoord") as number);
    gl.vertexAttribPointer(
      program.getLocation("a_texcoord") as number,
      2,
      gl.FLOAT,
      false,
      0,
      0,
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    gl.enableVertexAttribArray(program.getLocation("a_normal") as number);
    gl.vertexAttribPointer(
      program.getLocation("a_normal") as number,
      3,
      gl.FLOAT,
      false,
      0,
      0,
    );

    gl.bindVertexArray(null);

    return { vao, verticesBuffer, normalsBuffer, uvsBuffer };
  }

  protected bindMeshVao(res: GPUResources): void {
    this.gl!.bindVertexArray(res.vao);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected unbindMeshVao(_res: GPUResources): void {
    this.gl!.bindVertexArray(null);
  }

  protected deleteGpuResources(res: GPUResources): void {
    const gl = this.gl!;
    gl.deleteBuffer(res.verticesBuffer);
    gl.deleteBuffer(res.normalsBuffer);
    gl.deleteBuffer(res.uvsBuffer);
    gl.deleteVertexArray(res.vao);
  }

  protected ensureHighlightResources(): HighlightResources | null {
    if (this.highlightResources) return this.highlightResources;
    const gl = this.gl!;
    const program = this.mainProgram!;

    const vao = gl.createVertexArray()!;
    const verticesBuffer = gl.createBuffer()!;
    const normalsBuffer = gl.createBuffer()!;
    const uvsBuffer = gl.createBuffer()!;

    gl.bindVertexArray(vao);

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.enableVertexAttribArray(program.getLocation("a_position") as number);
    gl.vertexAttribPointer(
      program.getLocation("a_position") as number,
      3,
      gl.FLOAT,
      false,
      0,
      0,
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, uvsBuffer);
    gl.enableVertexAttribArray(program.getLocation("a_texcoord") as number);
    gl.vertexAttribPointer(
      program.getLocation("a_texcoord") as number,
      2,
      gl.FLOAT,
      false,
      0,
      0,
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    gl.enableVertexAttribArray(program.getLocation("a_normal") as number);
    gl.vertexAttribPointer(
      program.getLocation("a_normal") as number,
      3,
      gl.FLOAT,
      false,
      0,
      0,
    );

    gl.bindVertexArray(null);

    this.highlightResources = { vao, verticesBuffer, normalsBuffer, uvsBuffer };
    return this.highlightResources;
  }

  protected uploadHighlightBuffers(
    res: HighlightResources,
    vertices: number[],
    normals: number[],
  ): void {
    const gl = this.gl!;
    gl.bindBuffer(gl.ARRAY_BUFFER, res.verticesBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(vertices),
      gl.DYNAMIC_DRAW,
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, res.normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, res.uvsBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array((vertices.length / 3) * 2),
      gl.DYNAMIC_DRAW,
    );
  }

  protected bindHighlightVao(res: HighlightResources): void {
    this.gl!.bindVertexArray(res.vao);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected unbindHighlightVao(_res: HighlightResources): void {
    this.gl!.bindVertexArray(null);
  }

  protected deleteHighlightResources(res: HighlightResources): void {
    const gl = this.gl!;
    gl.deleteBuffer(res.verticesBuffer);
    gl.deleteBuffer(res.normalsBuffer);
    gl.deleteBuffer(res.uvsBuffer);
    gl.deleteVertexArray(res.vao);
  }
}
