import { MeshGroup } from "../mesh";
import { MeshImageMaterial } from "../MeshMaterial";
import { BaseGlBackend } from "./BaseGlBackend";
import { Webgl1MainProgram } from "./Webgl1Program";

type GPUResources = {
  vao: WebGLVertexArrayObjectOES | null;
  verticesBuffer: WebGLBuffer;
  normalsBuffer: WebGLBuffer;
  uvsBuffer: WebGLBuffer;
};

type HighlightResources = {
  vao: WebGLVertexArrayObjectOES | null;
  verticesBuffer: WebGLBuffer;
  normalsBuffer: WebGLBuffer;
  uvsBuffer: WebGLBuffer;
};

export default class Webgl1Backend extends BaseGlBackend<
  WebGLRenderingContext,
  Webgl1MainProgram,
  GPUResources,
  HighlightResources
> {
  private vaoExt: OES_vertex_array_object | null = null;

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
    const gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
    if (!gl) throw new Error("Could not retrieve WebGL context.");
    this.gl = gl;
    this.vaoExt = gl.getExtension("OES_vertex_array_object");
    // GLSL's `#extension GL_OES_standard_derivatives` directive only takes
    // effect if the extension has been activated on the context first.
    const hasDerivatives =
      gl.getExtension("OES_standard_derivatives") !== null;
    this.mainProgram = new Webgl1MainProgram(gl, hasDerivatives);
  }

  protected uploadTextureData(material: MeshImageMaterial): void {
    const gl = this.gl!;
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      material.imageData,
    );
  }

  private setupAttributes(
    verticesBuffer: WebGLBuffer,
    normalsBuffer: WebGLBuffer,
    uvsBuffer: WebGLBuffer,
  ): void {
    const gl = this.gl!;
    const program = this.mainProgram!;

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
  }

  protected createGpuResources(child: MeshGroup): GPUResources | null {
    const gl = this.gl!;

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

    let vao: WebGLVertexArrayObjectOES | null = null;
    if (this.vaoExt) {
      vao = this.vaoExt.createVertexArrayOES();
      this.vaoExt.bindVertexArrayOES(vao);
      this.setupAttributes(verticesBuffer, normalsBuffer, uvsBuffer);
      this.vaoExt.bindVertexArrayOES(null);
    }

    return { vao, verticesBuffer, normalsBuffer, uvsBuffer };
  }

  protected bindMeshVao(res: GPUResources): void {
    if (this.vaoExt && res.vao) {
      this.vaoExt.bindVertexArrayOES(res.vao);
    } else {
      this.setupAttributes(
        res.verticesBuffer,
        res.normalsBuffer,
        res.uvsBuffer,
      );
    }
  }

  protected unbindMeshVao(res: GPUResources): void {
    if (this.vaoExt && res.vao) this.vaoExt.bindVertexArrayOES(null);
  }

  protected deleteGpuResources(res: GPUResources): void {
    const gl = this.gl!;
    gl.deleteBuffer(res.verticesBuffer);
    gl.deleteBuffer(res.normalsBuffer);
    gl.deleteBuffer(res.uvsBuffer);
    if (this.vaoExt && res.vao) this.vaoExt.deleteVertexArrayOES(res.vao);
  }

  protected ensureHighlightResources(): HighlightResources | null {
    if (this.highlightResources) return this.highlightResources;
    if (!this.vaoExt) return null;
    const gl = this.gl!;

    const vao = this.vaoExt.createVertexArrayOES();
    const verticesBuffer = gl.createBuffer()!;
    const normalsBuffer = gl.createBuffer()!;
    const uvsBuffer = gl.createBuffer()!;

    this.vaoExt.bindVertexArrayOES(vao);
    this.setupAttributes(verticesBuffer, normalsBuffer, uvsBuffer);
    this.vaoExt.bindVertexArrayOES(null);

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
    if (this.vaoExt && res.vao) this.vaoExt.bindVertexArrayOES(res.vao);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected unbindHighlightVao(_res: HighlightResources): void {
    if (this.vaoExt) this.vaoExt.bindVertexArrayOES(null);
  }

  protected deleteHighlightResources(res: HighlightResources): void {
    const gl = this.gl!;
    gl.deleteBuffer(res.verticesBuffer);
    gl.deleteBuffer(res.normalsBuffer);
    gl.deleteBuffer(res.uvsBuffer);
    if (this.vaoExt && res.vao) this.vaoExt.deleteVertexArrayOES(res.vao);
  }
}
