import range from "lodash/range";
import { v4 as uuidv4 } from "uuid";
import { MainProgram } from "./backend/Webgl2Program";
import {
  addV3,
  identityM44,
  M44,
  multiplyM3V3,
  multiplyM44,
  rotateM33,
  scaleVector,
  V2,
  V3,
} from "./maths";
import { MeshMaterial } from "./MeshMaterial";

type MeshMetadata = {
  [key: string]: string | number | Record<string, string | number>;
};

interface BaseMesh {
  readonly uuid: string;
  calculateCentroid(): V3;
  visible: boolean;
}

export class Mesh implements BaseMesh {
  readonly uuid: string;
  readonly name: string;
  public vertices: number[];
  public normals: number[];
  public uvs: number[];
  readonly verticesCount: number;
  public vertexOffset: number = 0;
  readonly metadata: MeshMetadata;
  private transformMatrix = identityM44();
  private parent: MeshGroup;
  // public visible = false;
  public query: WebGLQuery | null = null;
  private _visible = true;
  get visible() {
    return this.parent.visible && this._visible;
  }

  set visible(arg: boolean) {
    this._visible = arg;
  }

  constructor(
    vertices: number[],
    normals: number[],
    uvs: number[],
    parent: MeshGroup,
    name: string,
    metadata?: MeshMetadata,
  ) {
    this.uuid = uuidv4();
    this.vertices = vertices;
    this.normals = normals;
    this.uvs = uvs;
    this.verticesCount = vertices.length / 3;
    this.parent = parent;
    this.name = name;
    this.metadata = metadata || {};
  }
  setVisibility(arg: boolean) {
    this.visible = arg;
  }

  public calculateCentroid(): V3 {
    let x = 0,
      y = 0,
      z = 0;
    const n = this.vertices.length / 3;
    for (let i = 0; i < this.vertices.length; i += 3) {
      x += this.vertices[i];
      y += this.vertices[i + 1];
      z += this.vertices[i + 2];
    }
    return [x / n, y / n, z / n];
  }

  static createPlane(
    position: V3,
    size: V2,
    rotation: V3,
    uvs: number[],
    parent: MeshGroup,
    name: string,
    metadata?: MeshMetadata,
  ) {
    const [width, depth] = size;
    const normalRaw: V3 = [0, 1, 0];
    // prettier-ignore
    const verticesRaw: V3[] = [
      [- width/2, 0, - depth/2],
      [- width/2, 0, + depth/2],
      [+ width/2, 0, - depth/2],
      [- width/2, 0, + depth/2],
      [+ width/2, 0, + depth/2],
      [+ width/2, 0, - depth/2],
    ];
    const rotationMatrix = rotateM33(rotation[0], rotation[1], rotation[2]);
    const normal = multiplyM3V3(rotationMatrix, normalRaw);
    const vertices = verticesRaw.flatMap((vertex) =>
      addV3(multiplyM3V3(rotationMatrix, vertex), position),
    );
    const normals = range(6).flatMap(() => normal);
    return new Mesh(vertices, normals, uvs, parent, name, metadata);
  }

  public setTransformMatrix(matrix: M44) {
    this.transformMatrix = matrix;
  }

  private cachedTransformMatrix: M44 = identityM44();

  public getTransformMatrix(): M44 {
    return (
      this.cachedTransformMatrix ||
      (this.cachedTransformMatrix = multiplyM44(
        this.parent.getTransformMatrix() || identityM44(),
        this.transformMatrix,
      ))
    );
  }

  public getParent(): MeshGroup {
    return this.parent;
  }

  /**
   * Gets the material from the mesh hierarchy, checking ancestors if needed
   * @returns The first material found in the hierarchy, or undefined if no material exists
   */
  public getMaterial(): MeshMaterial | undefined {
    // Mesh doesn't have its own material, so check parent
    return this.parent?.getMaterial();
  }
}

export class MeshGroup implements BaseMesh {
  material?: MeshMaterial;
  readonly uuid: string;
  readonly name: string;
  private parent: Mesh | MeshGroup | null;
  private transformMatrix: M44 = identityM44();
  private meshes: (Mesh | MeshGroup)[] = [];
  public metadata?: MeshMetadata;

  // New properties for batching
  public mergedVertices: number[] = [];
  public mergedNormals: number[] = [];
  public mergedUVs: number[] = [];
  public mergedVerticesBuffer: WebGLBuffer | null = null;
  public mergedNormalsBuffer: WebGLBuffer | null = null;
  public mergedUVsBuffer: WebGLBuffer | null = null;
  public vao: WebGLVertexArrayObject | null = null;

  // Cached bounding box
  private cachedBoundingBox: { min: V3; max: V3 } | null = null;

  constructor(name: string, parent: MeshGroup | null, transformMatrix?: M44) {
    this.uuid = uuidv4();
    this.parent = parent || null;
    this.transformMatrix = transformMatrix || identityM44();
    this.name = name;
  }
  private _visible = true;
  get visible() {
    return !!(this.parent?.visible ?? true) && this._visible;
  }

  set visible(arg: boolean) {
    this._visible = arg;
  }

  public addMesh(mesh: Mesh | MeshGroup) {
    if (this.meshes.some((m) => m.uuid === mesh.uuid)) {
      throw new Error("Mesh already exists in the group");
    }
    this.meshes.push(mesh);
  }

  public removeMesh(mesh: Mesh) {
    this.meshes = this.meshes.filter((m) => m.uuid !== mesh.uuid);
  }

  public getMeshes() {
    return this.meshes;
  }

  public calculateCentroid(): V3 {
    return this.meshes.reduce(
      (acc, mesh) => {
        const c = mesh.calculateCentroid();
        return acc.map((v, i) => v + c[i]);
      },
      [0, 0, 0],
    ) as unknown as V3;
  }

  public calculateBoundingBox(): { min: V3; max: V3 } {
    if (this.cachedBoundingBox) {
      return this.cachedBoundingBox;
    }

    const min: V3 = [Infinity, Infinity, Infinity];
    const max: V3 = [-Infinity, -Infinity, -Infinity];

    for (const mesh of this.meshes) {
      if (mesh instanceof Mesh) {
        // For each vertex in the mesh
        for (let i = 0; i < mesh.vertices.length; i += 3) {
          const x = mesh.vertices[i];
          const y = mesh.vertices[i + 1];
          const z = mesh.vertices[i + 2];

          // Update min and max
          min[0] = Math.min(min[0], x);
          min[1] = Math.min(min[1], y);
          min[2] = Math.min(min[2], z);
          max[0] = Math.max(max[0], x);
          max[1] = Math.max(max[1], y);
          max[2] = Math.max(max[2], z);
        }
      } else if (mesh instanceof MeshGroup) {
        const childBox = mesh.calculateBoundingBox();
        min[0] = Math.min(min[0], childBox.min[0]);
        min[1] = Math.min(min[1], childBox.min[1]);
        min[2] = Math.min(min[2], childBox.min[2]);
        max[0] = Math.max(max[0], childBox.max[0]);
        max[1] = Math.max(max[1], childBox.max[1]);
        max[2] = Math.max(max[2], childBox.max[2]);
      }
    }

    this.cachedBoundingBox = { min, max };
    return this.cachedBoundingBox;
  }

  public setTransformMatrix(matrix: M44) {
    this.transformMatrix = matrix;
    // Invalidate cached values when transform changes
    this.cachedTransformMatrix = identityM44();
    this.cachedBoundingBox = null;
  }

  private cachedTransformMatrix: M44 = identityM44();

  public getTransformMatrix(): M44 {
    return (
      this.cachedTransformMatrix ||
      (this.cachedTransformMatrix = multiplyM44(
        this.parent?.getTransformMatrix() || identityM44(),
        this.transformMatrix,
      ))
    );
  }

  public compileBuffers(gl: WebGL2RenderingContext, mainProgram: MainProgram) {
    // Reset merged arrays
    this.mergedVertices = [];
    this.mergedNormals = [];
    this.mergedUVs = [];

    // For each child mesh
    for (const mesh of this.meshes) {
      if (mesh instanceof MeshGroup) {
        // Recursively compile buffers for nested groups
        mesh.compileBuffers(gl, mainProgram);
      } else {
        // Assign the current vertex offset for picking
        mesh.vertexOffset = this.mergedVertices.length / 3;
        // Append the mesh's raw geometry data
        this.mergedVertices.push(...mesh.vertices);
        this.mergedNormals.push(...mesh.normals);
        this.mergedUVs.push(...mesh.uvs);
      }
    }

    // Create merged buffers
    this.mergedVerticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.mergedVerticesBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.mergedVertices),
      gl.STATIC_DRAW,
    );

    this.mergedNormalsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.mergedNormalsBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.mergedNormals),
      gl.STATIC_DRAW,
    );

    this.mergedUVsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.mergedUVsBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.mergedUVs),
      gl.STATIC_DRAW,
    );

    // Create and set up a VAO for this group
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);

    // Bind position buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.mergedVerticesBuffer);
    gl.enableVertexAttribArray(mainProgram.getLocation("a_position") as number);
    gl.vertexAttribPointer(
      mainProgram.getLocation("a_position") as number,
      3,
      gl.FLOAT,
      false,
      0,
      0,
    );

    // Bind uv buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.mergedUVsBuffer);
    gl.enableVertexAttribArray(mainProgram.getLocation("a_texcoord") as number);
    gl.vertexAttribPointer(
      mainProgram.getLocation("a_texcoord") as number,
      2,
      gl.FLOAT,
      false,
      0,
      0,
    );

    // Bind normal buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.mergedNormalsBuffer);
    gl.enableVertexAttribArray(mainProgram.getLocation("a_normal") as number);
    gl.vertexAttribPointer(
      mainProgram.getLocation("a_normal") as number,
      3,
      gl.FLOAT,
      false,
      0,
      0,
    );

    gl.bindVertexArray(null);
  }

  public getParent(): MeshGroup | null {
    return this.parent as MeshGroup | null;
  }

  /**
   * Gets the material from the mesh hierarchy, checking ancestors if needed
   * @returns The first material found in the hierarchy, or undefined if no material exists
   */
  public getMaterial(): MeshMaterial | undefined {
    // First check if this group has a material
    if (this.material) {
      return this.material;
    }

    // If not, check the parent hierarchy
    if (this.parent instanceof MeshGroup) {
      return this.parent.getMaterial();
    }

    // If parent is a Mesh or null, no material is available
    return undefined;
  }

  /**
   * Finds meshes matching the provided condition by traversing the hierarchy
   */
  public findMeshes(
    callback: (mesh: Mesh | MeshGroup) => boolean,
    results: (Mesh | MeshGroup)[] = [],
  ): (Mesh | MeshGroup)[] {
    if (callback(this)) {
      results.push(this);
    }

    for (const mesh of this.meshes) {
      if (mesh instanceof MeshGroup) {
        mesh.findMeshes(callback, results);
      } else if (callback(mesh)) {
        results.push(mesh);
      }
    }

    return results;
  }

  cleanup(gl: WebGL2RenderingContext) {
    if (
      !this.mergedNormals.length ||
      !this.mergedUVs.length ||
      !this.mergedVertices.length
    ) {
      return;
    }

    if (this.mergedVerticesBuffer) gl.deleteBuffer(this.mergedVerticesBuffer);
    if (this.mergedNormalsBuffer) gl.deleteBuffer(this.mergedNormalsBuffer);
    if (this.mergedUVsBuffer) gl.deleteBuffer(this.mergedUVsBuffer);
    if (this.vao) gl.deleteVertexArray(this.vao);
    this.meshes.forEach((child) => {
      if (child instanceof MeshGroup) child.cleanup(gl);
    });

    this.mergedNormals = [];
    this.mergedUVs = [];
    this.mergedVertices = [];
    this.mergedVerticesBuffer = null;
    this.mergedNormalsBuffer = null;
    this.mergedUVsBuffer = null;
    this.vao = null;
  }
}

export class MinecraftPart extends MeshGroup {
  constructor(
    size: V3,
    position: V3,
    textureSize: V2,
    uvs: V2,
    name: string,
    parent: MeshGroup | null,
    transformMatrix?: M44,
  ) {
    super(name, parent, transformMatrix);
    const [width, height, depth] = size;
    const cubeCenter: V3 = position;

    type Face = {
      label: string;
      faceCenter: V3;
      uAxis: V3;
      vAxis: V3;
      subdivisionsU: number;
      subdivisionsV: number;
      uvOffset: V2;
      plnaeFace: V3;
    };

    const faces: Face[] = [
      {
        label: "Front",
        faceCenter: addV3(cubeCenter, [0, 0, depth / 2]),
        uAxis: [1, 0, 0],
        vAxis: [0, -1, 0],
        subdivisionsU: width,
        subdivisionsV: height,
        uvOffset: [uvs[0] + depth, uvs[1] + depth],
        plnaeFace: [-Math.PI / 2, 0, 0],
      },
      {
        label: "Back",
        faceCenter: addV3(cubeCenter, [0, 0, -depth / 2]),
        uAxis: [-1, 0, 0],
        vAxis: [0, -1, 0],
        subdivisionsU: width,
        subdivisionsV: height,
        uvOffset: [uvs[0] + depth + width + depth, uvs[1] + depth],
        plnaeFace: [Math.PI / 2, 0, 0],
      },
      {
        label: "Right",
        faceCenter: addV3(cubeCenter, [-width / 2, 0, 0]),
        uAxis: [0, 0, 1],
        vAxis: [0, -1, 0],
        subdivisionsU: depth,
        subdivisionsV: height,
        uvOffset: [uvs[0], uvs[1] + depth],
        plnaeFace: [0, 0, -Math.PI / 2],
      },
      {
        label: "Left",
        faceCenter: addV3(cubeCenter, [width / 2, 0, 0]),
        uAxis: [0, 0, -1],
        vAxis: [0, -1, 0],
        subdivisionsU: depth,
        subdivisionsV: height,
        uvOffset: [uvs[0] + depth + width, uvs[1] + depth],
        plnaeFace: [0, 0, Math.PI / 2],
      },
      {
        label: "Top",
        faceCenter: addV3(cubeCenter, [0, height / 2, 0]),
        uAxis: [1, 0, 0],
        vAxis: [0, 0, 1],
        subdivisionsU: width,
        subdivisionsV: depth,
        uvOffset: [uvs[0] + depth, uvs[1]],
        plnaeFace: [0, 0, 0],
      },
      {
        label: "Bottom",
        faceCenter: addV3(cubeCenter, [0, -height / 2, 0]),
        uAxis: [1, 0, 0],
        vAxis: [0, 0, 1],
        subdivisionsU: width,
        subdivisionsV: depth,
        uvOffset: [uvs[0] + depth + width, uvs[1]],
        plnaeFace: [Math.PI, 0, 0],
      },
    ];

    const meshes: MeshGroup[] = [];
    const tweakNumber = 0.2;
    const textureWidth = textureSize[0];
    const textureHeight = textureSize[1];

    faces.forEach((face) => {
      const faceGroup = new MeshGroup(face.label, this);

      // Store metadata including UV bounds
      faceGroup.metadata = {
        part: this.name,
        faceLabel: face.label,
        uvBounds: {
          minU: face.uvOffset[0],
          minV: face.uvOffset[1],
          maxU: face.uvOffset[0] + face.subdivisionsU,
          maxV: face.uvOffset[1] + face.subdivisionsV,
        },
      };

      for (let i = 0; i < face.subdivisionsU; i++) {
        for (let j = 0; j < face.subdivisionsV; j++) {
          const localX = i + 0.5 - face.subdivisionsU / 2;
          const localY = j + 0.5 - face.subdivisionsV / 2;
          const offset = addV3(
            scaleVector(face.uAxis, localX),
            scaleVector(face.vAxis, localY),
          );
          const worldPos = addV3(face.faceCenter, offset);
          const u = face.uvOffset[0] + i;
          const v = face.uvOffset[1] + j;
          const cellUVs = [
            (u + 1 - tweakNumber) / textureWidth,
            (v + 1 - tweakNumber) / textureHeight,
            (u + 1 - tweakNumber) / textureWidth,
            (v + tweakNumber) / textureHeight,
            (u + tweakNumber) / textureWidth,
            (v + 1 - tweakNumber) / textureHeight,
            (u + 1 - tweakNumber) / textureWidth,
            (v + tweakNumber) / textureHeight,
            (u + tweakNumber) / textureWidth,
            (v + tweakNumber) / textureHeight,
            (u + tweakNumber) / textureWidth,
            (v + 1 - tweakNumber) / textureHeight,
          ];
          const mesh = Mesh.createPlane(
            worldPos,
            [1, 1],
            face.plnaeFace,
            cellUVs,
            faceGroup,
            `${this.name}_${face.label}_${i}_${j}`,
            {
              type: "skinPixel",
              part: this.name,
              u,
              v,
            },
          );
          faceGroup.addMesh(mesh);
        }
      }
      meshes.push(faceGroup);
    });
    meshes.forEach((group) => this.addMesh(group));
  }

  static create(
    size: V3,
    position: V3,
    textureSize: V2,
    uvs: V2,
    name: string,
    parent: MeshGroup | null,
    transformMatrix?: M44,
  ) {
    return new MinecraftPart(
      size,
      position,
      textureSize,
      uvs,
      name,
      parent,
      transformMatrix,
    );
  }
}
