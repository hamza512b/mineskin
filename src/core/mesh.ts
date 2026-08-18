import range from "lodash/range";
import { v4 as uuidv4 } from "uuid";
import { MeshMaterial } from "./MeshMaterial";
import {
  M44,
  V2,
  V3,
  addV3,
  identityM44,
  multiplyM3V3,
  multiplyM44,
  multiplyM4V3,
  rotateM33,
  rotateM44,
  scaleM44,
  scaleVector,
  translateM44,
} from "./maths";
import { appendTriangleLine } from "./meshUtils";
import { Quat, quatToM44 } from "./quaternion";

type MeshMetadata = {
  [key: string]: string | number | boolean | Record<string, string | number>;
};

class Base {
  readonly uuid: string;
  protected parent: MeshGroup | null;

  constructor() {
    this.uuid = uuidv4();
    this.parent = null;
  }

  public getParent(): MeshGroup | null {
    return this.parent;
  }

  public setParent(parent: MeshGroup | null) {
    this.parent = parent;
    this.invalidateTransformCache();
  }

  /**
   * Drops any cached world-space transform on this node and everything under
   * it. World transforms are composed from the whole ancestor chain, so a node
   * whose own transform never changes still goes stale the moment an ancestor
   * moves — posing a limb is exactly that case.
   */
  public invalidateTransformCache(): void {}
}

export class Mesh extends Base {
  readonly name: string;
  public vertices: number[];
  public normals: number[];
  public uvs: number[];
  readonly verticesCount: number;
  public linesCount: number = 0;
  public vertexOffset: number = 0;
  readonly metadata: MeshMetadata;
  private transformMatrix = identityM44();
  private _visible = true;
  get visible() {
    return !!this.parent?.visible && this._visible;
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
    super();
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

  public getNumVertices(): number {
    return this.vertices.length / 3;
  }

  public calculateCentroid(): V3 {
    let x = 0,
      y = 0,
      z = 0;
    const n = this.getNumVertices(); // Reuse!
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
      [- width / 2, 0, - depth / 2],
      [- width / 2, 0, + depth / 2],
      [+ width / 2, 0, - depth / 2],
      [- width / 2, 0, + depth / 2],
      [+ width / 2, 0, + depth / 2],
      [+ width / 2, 0, - depth / 2],
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
    this.invalidateTransformCache();
  }

  private cachedTransformMatrix: M44 | null = null;

  public override invalidateTransformCache(): void {
    this.cachedTransformMatrix = null;
  }

  public getTransformMatrix(): M44 {
    return (
      this.cachedTransformMatrix ||
      (this.cachedTransformMatrix = multiplyM44(
        this.parent?.getTransformMatrix() || identityM44(),
        this.transformMatrix,
      ))
    );
  }

  public getParent(): MeshGroup | null {
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

export class MeshGroup extends Base {
  material?: MeshMaterial;
  readonly name: string;
  private transformMatrix: M44 = identityM44();
  private meshes: (Mesh | MeshGroup)[] = [];
  public metadata?: MeshMetadata;

  // Transform components
  private _position: V3 = [0, 0, 0];
  private _rotation: V3 = [0, 0, 0]; // Euler angles in radians (x, y, z)
  private _scale: V3 = [1, 1, 1];

  // New properties for batching
  public mergedVertices: number[] = [];
  public mergedNormals: number[] = [];
  public mergedUVs: number[] = [];
  public linesOffset: number = 0;

  // Cached bounding box
  private cachedBoundingBox: { min: V3; max: V3 } | null = null;

  constructor(name: string, transformMatrix?: M44) {
    super();
    this.setTransformMatrix(transformMatrix);
    this.name = name;
  }

  private _visible = true;
  get visible() {
    return !!(this.parent?.visible ?? true) && this._visible;
  }

  set visible(arg: boolean) {
    this._visible = arg;
  }

  // Position getters and setters
  get position(): V3 {
    return [...this._position] as V3;
  }

  set position(value: V3) {
    this._position = [...value] as V3;
    this.updateTransformMatrix();
  }

  // Rotation getters and setters (Euler angles in radians)
  get rotation(): V3 {
    return [...this._rotation] as V3;
  }

  set rotation(value: V3) {
    this._rotation = [...value] as V3;
    this.updateTransformMatrix();
  }

  // Scale getters and setters
  get scale(): V3 {
    return [...this._scale] as V3;
  }

  set scale(value: V3) {
    this._scale = [...value] as V3;
    this.updateTransformMatrix();
  }

  /**
   * Updates the transformation matrix from position, rotation, and scale components
   * Order: Translation * Rotation * Scale
   */
  private updateTransformMatrix() {
    const T = translateM44(
      this._position[0],
      this._position[1],
      this._position[2],
    );
    const R = rotateM44(
      this._rotation[0],
      this._rotation[1],
      this._rotation[2],
    );
    const S = scaleM44(this._scale[0], this._scale[1], this._scale[2]);

    this.transformMatrix = multiplyM44(T, R, S);

    // Invalidate cached values when transform changes
    this.invalidateTransformCache();
    this.invalidateAncestorBounds();
  }

  public addMesh(mesh: Mesh | MeshGroup) {
    if (this.meshes.some((m) => m.uuid === mesh.uuid)) {
      throw new Error("Mesh already exists in the group");
    }
    this.meshes.push(mesh);
  }

  public removeMesh(mesh: Mesh | MeshGroup) {
    this.meshes = this.meshes.filter((m) => m.uuid !== mesh.uuid);
  }

  public getChildren() {
    return this.meshes;
  }

  public getNumVertices(): number {
    return this.meshes.reduce((acc, mesh) => acc + mesh.getNumVertices(), 0);
  }

  public calculateCentroid(): V3 {
    let sumX = 0,
      sumY = 0,
      sumZ = 0;
    let totalVerts = 0;

    for (const mesh of this.meshes) {
      const c = mesh.calculateCentroid(); // Recursive!
      const verts = mesh.getNumVertices();
      sumX += c[0] * verts;
      sumY += c[1] * verts;
      sumZ += c[2] * verts;
      totalVerts += verts;
    }

    if (totalVerts === 0) return [0, 0, 0]; // Edge case
    return [sumX / totalVerts, sumY / totalVerts, sumZ / totalVerts];
  }

  /**
   * World-space axis-aligned bounds of everything in this group.
   *
   * Two things here only matter once a group is actually rotated, which is why
   * they went unnoticed while every transform was identity: the AABB of a
   * rotated box is the box over all eight transformed corners, not over the two
   * transformed extremes; and child groups already report world space, so
   * re-applying this group's transform to them would count it twice.
   */
  public calculateBoundingBox(): { min: V3; max: V3 } {
    if (this.cachedBoundingBox) {
      return this.cachedBoundingBox;
    }

    const min: V3 = [Infinity, Infinity, Infinity];
    const max: V3 = [-Infinity, -Infinity, -Infinity];
    const expand = (point: V3) => {
      for (let axis = 0; axis < 3; axis++) {
        if (point[axis] < min[axis]) min[axis] = point[axis];
        if (point[axis] > max[axis]) max[axis] = point[axis];
      }
    };

    // Direct mesh children hold vertices in this group's local space.
    const localMin: V3 = [Infinity, Infinity, Infinity];
    const localMax: V3 = [-Infinity, -Infinity, -Infinity];
    let hasLocalGeometry = false;

    for (const mesh of this.meshes) {
      if (mesh instanceof Mesh) {
        hasLocalGeometry = true;
        for (let i = 0; i < mesh.vertices.length; i += 3) {
          for (let axis = 0; axis < 3; axis++) {
            const value = mesh.vertices[i + axis];
            if (value < localMin[axis]) localMin[axis] = value;
            if (value > localMax[axis]) localMax[axis] = value;
          }
        }
      } else if (mesh instanceof MeshGroup) {
        const childBox = mesh.calculateBoundingBox();
        if (!Number.isFinite(childBox.min[0])) continue; // empty subtree
        expand(childBox.min);
        expand(childBox.max);
      }
    }

    if (hasLocalGeometry) {
      const localTransform = this.getTransformMatrix();
      for (let corner = 0; corner < 8; corner++) {
        expand(
          multiplyM4V3(localTransform, [
            corner & 1 ? localMax[0] : localMin[0],
            corner & 2 ? localMax[1] : localMin[1],
            corner & 4 ? localMax[2] : localMin[2],
          ]),
        );
      }
    }

    this.cachedBoundingBox = { min, max };
    return this.cachedBoundingBox;
  }

  /**
   * Directly sets the transformation matrix, bypassing position/rotation/scale properties.
   * Note: This does not update the position, rotation, and scale properties.
   * Use the position, rotation, scale setters for component-based transforms.
   */
  public setTransformMatrix(matrix: M44 | undefined) {
    this.transformMatrix = matrix || identityM44();
    // Invalidate cached values when transform changes
    this.invalidateTransformCache();
    this.invalidateAncestorBounds();
  }

  private cachedTransformMatrix: M44 | null = null;

  /**
   * Clears this subtree's cached world transforms and bounds. Descendants cache
   * the full parent chain, so moving this group invalidates all of them — this
   * is what keeps ray-picking (which walks down to the individual pixel meshes)
   * agreeing with what the renderer draws after a part is posed or animated.
   */
  public override invalidateTransformCache(): void {
    this.cachedTransformMatrix = null;
    this.cachedBoundingBox = null;
    for (const child of this.meshes) {
      child.invalidateTransformCache();
    }
  }

  /** A moved child changes every ancestor's bounds, but not their transforms. */
  private invalidateAncestorBounds(): void {
    let ancestor = this.parent;
    while (ancestor) {
      ancestor.cachedBoundingBox = null;
      ancestor = ancestor.parent;
    }
  }

  public getTransformMatrix(): M44 {
    return (
      this.cachedTransformMatrix ||
      (this.cachedTransformMatrix = multiplyM44(
        this.parent?.getTransformMatrix() || identityM44(),
        this.transformMatrix,
      ))
    );
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

  clearCompiledData() {
    this.mergedVertices = [];
    this.mergedNormals = [];
    this.mergedUVs = [];
    this.meshes.forEach((child) => {
      if (child instanceof MeshGroup) child.clearCompiledData();
    });
  }

  public compileData() {
    // Reset merged arrays
    this.mergedVertices = [];
    this.mergedNormals = [];
    this.mergedUVs = [];

    function gatherMeshes(meshGroup: MeshGroup, out: Mesh[]): Mesh[] {
      for (const mesh of meshGroup.getChildren()) {
        if (mesh instanceof Mesh) {
          out.push(mesh);
        } else if (mesh instanceof MeshGroup) {
          gatherMeshes(mesh, out);
        }
      }
      return out;
    }

    const meshes: Mesh[] = [];
    gatherMeshes(this, meshes);

    const mv = this.mergedVertices;
    const mn = this.mergedNormals;
    const mu = this.mergedUVs;

    for (const mesh of meshes) {
      mesh.vertexOffset = mv.length / 3;
      const vs = mesh.vertices;
      const ns = mesh.normals;
      const us = mesh.uvs;
      for (let k = 0; k < vs.length; k++) mv.push(vs[k]);
      for (let k = 0; k < ns.length; k++) mn.push(ns[k]);
      for (let k = 0; k < us.length; k++) mu.push(us[k]);
    }

    this.linesOffset = mv.length / 3;
    const cubeCenter = this.calculateCentroid();

    // Render lines outside of the cube. moveMatrix is translate × uniformScale ×
    // translate, so each row picks a single axis — we only need its diagonal +
    // translation components, avoiding a full 4x4 multiply per vertex.
    const s = 1.01;
    const tx = cubeCenter[0] * (1 - s);
    const ty = cubeCenter[1] * (1 - s);
    const tz = cubeCenter[2] * (1 - s);

    // Bucket of unique transformed vertices for the current mesh.
    const ux: number[] = [];
    const uy: number[] = [];
    const uz: number[] = [];

    // Dedupe edges across cells: interior grid edges are otherwise emitted by
    // both adjacent quads, producing overlapping tubes for no visual benefit.
    const seenEdges = new Set<string>();

    for (const mesh of meshes) {
      ux.length = 0;
      uy.length = 0;
      uz.length = 0;

      const verts = mesh.vertices;
      for (let i = 0; i < verts.length; i += 3) {
        const vx = verts[i] * s + tx;
        const vy = verts[i + 1] * s + ty;
        const vz = verts[i + 2] * s + tz;
        let exists = false;
        for (let j = 0; j < ux.length; j++) {
          if (ux[j] === vx && uy[j] === vy && uz[j] === vz) {
            exists = true;
            break;
          }
        }
        if (!exists) {
          ux.push(vx);
          uy.push(vy);
          uz.push(vz);
        }
      }

      const n = ux.length;
      for (let i = 0; i < n; i++) {
        const v1x = ux[i];
        const v1y = uy[i];
        const v1z = uz[i];
        for (let j = i + 1; j < n; j++) {
          const v2x = ux[j];
          const v2y = uy[j];
          const v2z = uz[j];

          const sameCoords =
            (v1x === v2x ? 1 : 0) +
            (v1y === v2y ? 1 : 0) +
            (v1z === v2z ? 1 : 0);
          if (sameCoords !== 2) continue;

          // Canonical key — order endpoints so a shared edge hashes the same
          // regardless of which adjacent cell encounters it first.
          let a1x: number, a1y: number, a1z: number;
          let a2x: number, a2y: number, a2z: number;
          if (
            v1x < v2x ||
            (v1x === v2x && (v1y < v2y || (v1y === v2y && v1z < v2z)))
          ) {
            a1x = v1x; a1y = v1y; a1z = v1z;
            a2x = v2x; a2y = v2y; a2z = v2z;
          } else {
            a1x = v2x; a1y = v2y; a1z = v2z;
            a2x = v1x; a2y = v1y; a2z = v1z;
          }
          const key = `${a1x},${a1y},${a1z}|${a2x},${a2y},${a2z}`;
          if (seenEdges.has(key)) continue;
          seenEdges.add(key);

          appendTriangleLine(v1x, v1y, v1z, v2x, v2y, v2z, 0.025, mv, mn, mu);
        }
      }
    }
  }
}

export class MinecraftPart extends MeshGroup {
  private _jointPosition: V3 = [0, 0, 0];
  private _partRotation: V3 = [0, 0, 0];
  private _rotationQuat: Quat | null = null;

  constructor(
    size: V3,
    position: V3,
    textureSize: V2,
    uvs: V2,
    name: string,
    transformMatrix?: M44,
    jointPosition?: V3,
    pixelSize: number = 1.0,
  ) {
    super(name);
    if (jointPosition) {
      this._jointPosition = [...jointPosition] as V3;
    }
    const [width, height, depth] = size;

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
        faceCenter: addV3(position, [0, 0, depth * pixelSize / 2]),
        uAxis: [1, 0, 0],
        vAxis: [0, -1, 0],
        subdivisionsU: width,
        subdivisionsV: height,
        uvOffset: [uvs[0] + depth, uvs[1] + depth],
        plnaeFace: [-Math.PI / 2, 0, 0],
      },
      {
        label: "Back",
        faceCenter: addV3(position, [0, 0, -depth * pixelSize / 2]),
        uAxis: [-1, 0, 0],
        vAxis: [0, -1, 0],
        subdivisionsU: width,
        subdivisionsV: height,
        uvOffset: [uvs[0] + depth + width + depth, uvs[1] + depth],
        plnaeFace: [Math.PI / 2, 0, 0],
      },
      {
        label: "Right",
        faceCenter: addV3(position, [-width * pixelSize / 2, 0, 0]),
        uAxis: [0, 0, 1],
        vAxis: [0, -1, 0],
        subdivisionsU: depth,
        subdivisionsV: height,
        uvOffset: [uvs[0], uvs[1] + depth],
        plnaeFace: [0, 0, -Math.PI / 2],
      },
      {
        label: "Left",
        faceCenter: addV3(position, [width * pixelSize / 2, 0, 0]),
        uAxis: [0, 0, -1],
        vAxis: [0, -1, 0],
        subdivisionsU: depth,
        subdivisionsV: height,
        uvOffset: [uvs[0] + depth + width, uvs[1] + depth],
        plnaeFace: [0, 0, Math.PI / 2],
      },
      {
        label: "Top",
        faceCenter: addV3(position, [0, height * pixelSize / 2, 0]),
        uAxis: [1, 0, 0],
        vAxis: [0, 0, 1],
        subdivisionsU: width,
        subdivisionsV: depth,
        uvOffset: [uvs[0] + depth, uvs[1]],
        plnaeFace: [0, 0, 0],
      },
      {
        label: "Bottom",
        faceCenter: addV3(position, [0, -height * pixelSize / 2, 0]),
        uAxis: [1, 0, 0],
        vAxis: [0, 0, 1],
        subdivisionsU: width,
        subdivisionsV: depth,
        uvOffset: [uvs[0] + depth + width, uvs[1]],
        plnaeFace: [Math.PI, 0, 0],
      },
    ];

    const meshes: MeshGroup[] = [];
    const tweakNumber = 0.5; // this prevent rendering on the edges
    const textureWidth = textureSize[0];
    const textureHeight = textureSize[1];

    faces.forEach((face) => {
      const faceGroup = new MeshGroup(face.label);
      faceGroup.setParent(this);

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
          const localX = (i + 0.5 - face.subdivisionsU / 2) * pixelSize;
          const localY = (j + 0.5 - face.subdivisionsV / 2) * pixelSize;
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
            [pixelSize, pixelSize],
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

    // Bake in the transform matrix to the mesh group
    if (transformMatrix) {
      this.applyTransformToVertices(transformMatrix);
    }
  }

  private cachedLocalBounds: { min: V3; max: V3 } | null = null;

  /**
   * Axis-aligned bounds of the part's own geometry, in the part's local space —
   * the same space `jointPosition` is expressed in, and unaffected by the
   * part's rotation. `calculateBoundingBox` cannot answer this: it bakes in the
   * world transform and transforms only the two corners, which stops meaning
   * anything once the part is posed.
   *
   * Vertices are built once and never move (posing only changes the transform),
   * so the result is cached on first use.
   */
  public getLocalBounds(): { min: V3; max: V3 } {
    if (this.cachedLocalBounds) return this.cachedLocalBounds;

    const min: V3 = [Infinity, Infinity, Infinity];
    const max: V3 = [-Infinity, -Infinity, -Infinity];

    const visit = (group: MeshGroup) => {
      for (const child of group.getChildren()) {
        if (child instanceof MeshGroup) {
          visit(child);
          continue;
        }
        for (let i = 0; i < child.vertices.length; i += 3) {
          for (let axis = 0; axis < 3; axis++) {
            const value = child.vertices[i + axis];
            if (value < min[axis]) min[axis] = value;
            if (value > max[axis]) max[axis] = value;
          }
        }
      }
    };
    visit(this);

    if (!Number.isFinite(min[0])) {
      this.cachedLocalBounds = { min: [0, 0, 0], max: [0, 0, 0] };
    } else {
      this.cachedLocalBounds = { min, max };
    }
    return this.cachedLocalBounds;
  }

  get jointPosition(): V3 {
    return [...this._jointPosition] as V3;
  }

  set jointPosition(value: V3) {
    this._jointPosition = [...value] as V3;
  }

  /**
   * Setting Euler angles drops any quaternion override, so the animation
   * system and look-at-cursor keep working exactly as before.
   */
  override set rotation(value: V3) {
    this._partRotation = [...value] as V3;
    this._rotationQuat = null;
    this.updateJointBasedTransform();
  }

  override get rotation(): V3 {
    return [...this._partRotation] as V3;
  }

  /**
   * Rotation as a quaternion, bypassing the fixed Z·Y·X Euler order. Interactive
   * posing uses this so a drag never hits gimbal lock. `null` falls back to the
   * Euler triple.
   */
  set rotationQuat(value: Quat | null) {
    this._rotationQuat = value ? ([...value] as Quat) : null;
    this.updateJointBasedTransform();
  }

  get rotationQuat(): Quat | null {
    return this._rotationQuat ? ([...this._rotationQuat] as Quat) : null;
  }

  override set position(value: V3) {
    super.position = value;
    this.updateJointBasedTransform();
  }

  override get position(): V3 {
    return super.position;
  }

  override set scale(value: V3) {
    super.scale = value;
    this.updateJointBasedTransform();
  }

  override get scale(): V3 {
    return super.scale;
  }

  private updateJointBasedTransform() {
    // For joint-based rotation, we need to:
    // 1. Translate to joint position
    // 2. Apply rotation
    // 3. Translate back
    // 4. Apply position and scale
    
    const jointTranslate = translateM44(
      this._jointPosition[0],
      this._jointPosition[1], 
      this._jointPosition[2]
    );
    
    const jointTranslateInverse = translateM44(
      -this._jointPosition[0],
      -this._jointPosition[1],
      -this._jointPosition[2]
    );
    
    const rotation = this._rotationQuat
      ? quatToM44(this._rotationQuat)
      : rotateM44(
          this._partRotation[0],
          this._partRotation[1],
          this._partRotation[2]
        );

    const currentPosition = super.position;
    const currentScale = super.scale;
    
    const position = translateM44(
      currentPosition[0],
      currentPosition[1],
      currentPosition[2]
    );
    
    const scale = scaleM44(currentScale[0], currentScale[1], currentScale[2]);

    // Combine: Position * JointTranslate * Rotation * JointTranslateInverse * Scale
    const newMatrix = multiplyM44(
      position,
      jointTranslate,
      rotation,
      jointTranslateInverse,
      scale
    );

    super.setTransformMatrix(newMatrix);
  }

  /**
   * Recursively applies a transformation matrix directly to all vertices and normals in the mesh hierarchy
   */
  private applyTransformToVertices(matrix: M44) {
    // Extract the 3x3 rotation/scale part for transforming normals
    const rotationMatrix: M44 = [
      matrix[0],
      matrix[1],
      matrix[2],
      0,
      matrix[4],
      matrix[5],
      matrix[6],
      0,
      matrix[8],
      matrix[9],
      matrix[10],
      0,
      0,
      0,
      0,
      1,
    ];

    const transformMeshGroup = (group: MeshGroup) => {
      for (const child of group.getChildren()) {
        if (child instanceof Mesh) {
          // Transform vertices
          for (let i = 0; i < child.vertices.length; i += 3) {
            const vertex: V3 = [
              child.vertices[i],
              child.vertices[i + 1],
              child.vertices[i + 2],
            ];
            const transformedVertex = multiplyM4V3(matrix, vertex);
            child.vertices[i] = transformedVertex[0];
            child.vertices[i + 1] = transformedVertex[1];
            child.vertices[i + 2] = transformedVertex[2];
          }

          // Transform normals (using the rotation part only)
          for (let i = 0; i < child.normals.length; i += 3) {
            const normal: V3 = [
              child.normals[i],
              child.normals[i + 1],
              child.normals[i + 2],
            ];
            const transformedNormal = multiplyM4V3(rotationMatrix, normal);
            child.normals[i] = transformedNormal[0];
            child.normals[i + 1] = transformedNormal[1];
            child.normals[i + 2] = transformedNormal[2];
          }
        } else if (child instanceof MeshGroup) {
          // Recursively transform child groups
          transformMeshGroup(child);
        }
      }
    };

    transformMeshGroup(this);
  }

  static create(
    size: V3,
    position: V3,
    textureSize: V2,
    uvs: V2,
    name: string,
    parent: MeshGroup | null,
    transformMatrix?: M44,
    metadata?: MeshMetadata,
    jointPosition?: V3,
    pixelSize: number = 1.0,
  ) {
    const part = new MinecraftPart(
      size,
      position,
      textureSize,
      uvs,
      name,
      transformMatrix,
      jointPosition,
      pixelSize,
    );
    part.setParent(parent);
    part.metadata = { ...part.metadata, ...metadata };
    return part;
  }
}
