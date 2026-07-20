import { M44, multiplyM44, scaleM44, translateM44 } from "./maths";
import { Mesh, MeshGroup, MinecraftPart } from "./mesh";
import { MinecraftSkinMaterial } from "./MeshMaterial";
import type { Layers, Parts, RendererStore } from "../store";

const Z_FIGHTING_OFFSET = 0.01;

/**
 * Generates a rounded triangle on the XZ plane at a given Y level.
 * Returns flat vertex and normal arrays for both top and bottom faces.
 */
function createRoundedTriangle(
  corners: [number, number][], // XZ coordinates
  y: number,
  radius: number,
  arcSegments: number,
): { vertices: number[]; normals: number[] } {
  const n = corners.length;
  const outline: [number, number][] = [];

  for (let i = 0; i < n; i++) {
    const prev = corners[(i + n - 1) % n];
    const curr = corners[i];
    const next = corners[(i + 1) % n];

    const d1x = prev[0] - curr[0],
      d1z = prev[1] - curr[1];
    const d2x = next[0] - curr[0],
      d2z = next[1] - curr[1];
    const l1 = Math.hypot(d1x, d1z),
      l2 = Math.hypot(d2x, d2z);
    const nd1x = d1x / l1,
      nd1z = d1z / l1;
    const nd2x = d2x / l2,
      nd2z = d2z / l2;

    const dp = nd1x * nd2x + nd1z * nd2z;
    const halfAngle = Math.acos(Math.max(-1, Math.min(1, dp))) / 2;
    const r = Math.min(
      radius,
      (l1 / 2) * Math.tan(halfAngle),
      (l2 / 2) * Math.tan(halfAngle),
    );
    const tangentDist = r / Math.tan(halfAngle);

    const tp1: [number, number] = [
      curr[0] + nd1x * tangentDist,
      curr[1] + nd1z * tangentDist,
    ];
    const tp2: [number, number] = [
      curr[0] + nd2x * tangentDist,
      curr[1] + nd2z * tangentDist,
    ];

    const bisX = nd1x + nd2x,
      bisZ = nd1z + nd2z;
    const bisL = Math.hypot(bisX, bisZ);
    const insetDist = r / Math.sin(halfAngle);
    const cx = curr[0] + (bisX / bisL) * insetDist;
    const cz = curr[1] + (bisZ / bisL) * insetDist;

    const startAngle = Math.atan2(tp1[1] - cz, tp1[0] - cx);
    const endAngle = Math.atan2(tp2[1] - cz, tp2[0] - cx);
    let angleDiff = endAngle - startAngle;
    if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
    if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

    for (let s = 0; s <= arcSegments; s++) {
      const angle = startAngle + (angleDiff * s) / arcSegments;
      outline.push([cx + Math.cos(angle) * r, cz + Math.sin(angle) * r]);
    }
  }

  // Centroid
  let centX = 0,
    centZ = 0;
  for (const p of outline) {
    centX += p[0];
    centZ += p[1];
  }
  centX /= outline.length;
  centZ /= outline.length;

  // Triangle fan from centroid — top and bottom faces
  const vertices: number[] = [];
  const normals: number[] = [];
  for (let i = 0; i < outline.length; i++) {
    const p1 = outline[i];
    const p2 = outline[(i + 1) % outline.length];
    // Top face
    vertices.push(centX, y, centZ, p1[0], y, p1[1], p2[0], y, p2[1]);
    normals.push(0, 1, 0, 0, 1, 0, 0, 1, 0);
    // Bottom face
    vertices.push(centX, y, centZ, p2[0], y, p2[1], p1[0], y, p1[1]);
    normals.push(0, -1, 0, 0, -1, 0, 0, -1, 0);
  }
  return { vertices, normals };
}
export class MinecraftSkin extends MeshGroup {
  material: MinecraftSkinMaterial;

  // Base layer parts
  baseHead: MinecraftPart | null = null;
  baseBody: MinecraftPart | null = null;
  baseLeftSlimArm: MinecraftPart | null = null;
  baseRightSlimArm: MinecraftPart | null = null;
  baseLeftArm: MinecraftPart | null = null;
  baseRightArm: MinecraftPart | null = null;
  baseLeftLeg: MinecraftPart | null = null;
  baseRightLeg: MinecraftPart | null = null;

  // Front direction indicator
  frontIndicator: MeshGroup | null = null;
  frontIndicatorOpacity: number = 1;

  setFrontIndicatorTargetOpacity(target: number) {
    // Apply instantly — no fade animation.
    this.frontIndicatorOpacity = target;
  }

  // Overlay layer parts
  overlayHead: MinecraftPart | null = null;
  overlayBody: MinecraftPart | null = null;
  overlayLeftSlimArm: MinecraftPart | null = null;
  overlayRightSlimArm: MinecraftPart | null = null;
  overlayLeftArm: MinecraftPart | null = null;
  overlayRightArm: MinecraftPart | null = null;
  overlayLeftLeg: MinecraftPart | null = null;
  overlayRightLeg: MinecraftPart | null = null;

  private constructor(
    name: string,
    parent: MeshGroup | null,
    material: MinecraftSkinMaterial,
    transformMatrix?: M44,
  ) {
    super(name, transformMatrix);
    this.setParent(parent);
    this.material = material;
  }

  static async create(
    name: string,
    parent: MeshGroup | null,
    texture: string | ImageData,
    transformMatrix?: M44,
    isDoubleRes: boolean = false,
  ) {
    let material: MinecraftSkinMaterial;
    if (texture instanceof ImageData) {
      material = await MinecraftSkinMaterial.createFromImageData(texture);
    } else {
      material = await MinecraftSkinMaterial.creatFromUrl(texture);
    }
    const mesh = new MinecraftSkin(name, parent, material, transformMatrix);
    const isPocket = mesh.material.version === "slim";
    const opaqueGroup = new MeshGroup("opaque");
    opaqueGroup.setParent(mesh);
    const transparentGroup = new MeshGroup("transparent");
    transparentGroup.setParent(mesh);

    // Resolution multiplier: 1 for 64x64, 2 for 128x128
    const m = isDoubleRes ? 2 : 1;
    const ps = isDoubleRes ? 0.5 : 1.0;
    const ts: [number, number] = [64 * m, 64 * m];

    // Create and store base layer parts
    mesh.baseHead = MinecraftPart.create(
      [8 * m, 8 * m, 8 * m],
      [0, 10 + Z_FIGHTING_OFFSET, 0],
      ts,
      [0 * m, 0 * m],
      "head",
      opaqueGroup,
      undefined,
      undefined,
      [0, 6, 0], // Joint at neck (bottom center of head)
      ps,
    );
    opaqueGroup.addMesh(mesh.baseHead);

    mesh.baseBody = MinecraftPart.create(
      [8 * m, 12 * m, 4 * m],
      [0, 0, 0],
      ts,
      [16 * m, 16 * m],
      "body",
      opaqueGroup,
      undefined,
      undefined,
      [0, 0, 0], // Joint at center
      ps,
    );
    opaqueGroup.addMesh(mesh.baseBody);

    mesh.baseLeftLeg = MinecraftPart.create(
      [4 * m, 12 * m, 4 * m],
      [-2 - Z_FIGHTING_OFFSET, -12 - Z_FIGHTING_OFFSET, 0],
      ts,
      [0 * m, 16 * m],
      "leftLeg",
      opaqueGroup,
      undefined,
      undefined,
      [-2, -6, 0], // Joint at hip (top center of leg)
      ps,
    );
    opaqueGroup.addMesh(mesh.baseLeftLeg);

    mesh.baseRightLeg = MinecraftPart.create(
      [4 * m, 12 * m, 4 * m],
      [2 + Z_FIGHTING_OFFSET, -12 + Z_FIGHTING_OFFSET, 0],
      ts,
      [16 * m, 48 * m],
      "rightLeg",
      opaqueGroup,
      undefined,
      undefined,
      [2, -6, 0], // Joint at hip (top center of leg)
      ps,
    );
    opaqueGroup.addMesh(mesh.baseRightLeg);

    mesh.baseLeftSlimArm = MinecraftPart.create(
      [3 * m, 12 * m, 4 * m],
      [-5.5 - Z_FIGHTING_OFFSET, 0, 0],
      ts,
      [40 * m, 16 * m],
      "leftArm",
      opaqueGroup,
      undefined,
      undefined,
      [-4, 5, 0], // Joint at shoulder
      ps,
    );
    opaqueGroup.addMesh(mesh.baseLeftSlimArm);

    mesh.baseRightSlimArm = MinecraftPart.create(
      [3 * m, 12 * m, 4 * m],
      [5.5 + Z_FIGHTING_OFFSET, 0, 0],
      ts,
      [32 * m, 48 * m],
      "rightArm",
      opaqueGroup,
      undefined,
      undefined,
      [4, 5, 0], // Joint at shoulder
      ps,
    );
    opaqueGroup.addMesh(mesh.baseRightSlimArm);
    mesh.baseLeftArm = MinecraftPart.create(
      [4 * m, 12 * m, 4 * m],
      [-6 - Z_FIGHTING_OFFSET, 0, 0],
      ts,
      [40 * m, 16 * m],
      "leftArm",
      opaqueGroup,
      undefined,
      undefined,
      [-4, 5, 0], // Joint at shoulder
      ps,
    );
    opaqueGroup.addMesh(mesh.baseLeftArm);

    mesh.baseRightArm = MinecraftPart.create(
      [4 * m, 12 * m, 4 * m],
      [6 + Z_FIGHTING_OFFSET, 0, 0],
      ts,
      [32 * m, 48 * m],
      "rightArm",
      opaqueGroup,
      undefined,
      undefined,
      [4, 5, 0], // Joint at shoulder
      ps,
    );
    opaqueGroup.addMesh(mesh.baseRightArm);

    // Create and store overlay layer parts
    mesh.overlayHead = MinecraftPart.create(
      [8 * m, 8 * m, 8 * m],
      [0, 10 + Z_FIGHTING_OFFSET, 0],
      ts,
      [32 * m, 0 * m],
      "head",
      transparentGroup,
      multiplyM44(
        translateM44(0, 10 + Z_FIGHTING_OFFSET, 0),
        scaleM44(9 / 8, 9 / 8, 9 / 8),
        translateM44(0, -10 - Z_FIGHTING_OFFSET, 0),
      ),
      {
        overlay: true,
      },
      [0, 6, 0], // Joint at neck
      ps,
    );
    transparentGroup.addMesh(mesh.overlayHead);

    mesh.overlayBody = MinecraftPart.create(
      [8 * m, 12 * m, 4 * m],
      [0, 0, 0],
      ts,
      [16 * m, 32 * m],
      "body",
      transparentGroup,
      multiplyM44(
        translateM44(0, 0, 0),
        scaleM44(1 + Z_FIGHTING_OFFSET, 1 + Z_FIGHTING_OFFSET, 4.51 / 4),
        translateM44(0, 0, 0),
      ),
      {
        overlay: true,
      },
      [0, 0, 0], // Joint at center
      ps,
    );
    transparentGroup.addMesh(mesh.overlayBody);

    mesh.overlayLeftLeg = MinecraftPart.create(
      [4 * m, 12 * m, 4 * m],
      [-2 - Z_FIGHTING_OFFSET, -12 - Z_FIGHTING_OFFSET, 0],
      ts,
      [0 * m, 32 * m],
      "leftLeg",
      transparentGroup,
      multiplyM44(
        translateM44(-2 - Z_FIGHTING_OFFSET, -12 - Z_FIGHTING_OFFSET, 0),
        scaleM44(4.5 / 4, 12.5 / 12, 4.54 / 4),
        translateM44(2 + Z_FIGHTING_OFFSET, 12 + Z_FIGHTING_OFFSET, 0),
      ),
      {
        overlay: true,
      },
      [-2, -6, 0], // Joint at hip
      ps,
    );
    transparentGroup.addMesh(mesh.overlayLeftLeg);

    mesh.overlayRightLeg = MinecraftPart.create(
      [4 * m, 12 * m, 4 * m],
      [2 + Z_FIGHTING_OFFSET, -12 - Z_FIGHTING_OFFSET, 0],
      ts,
      [0 * m, 48 * m],
      "rightLeg",
      transparentGroup,
      multiplyM44(
        translateM44(2 + Z_FIGHTING_OFFSET, -12 - Z_FIGHTING_OFFSET, 0),
        scaleM44(4.5 / 4, 12.5 / 12, 4.55 / 4),
        translateM44(-2 - Z_FIGHTING_OFFSET, 12 + Z_FIGHTING_OFFSET, 0),
      ),
      {
        overlay: true,
      },
      [2, -6, 0], // Joint at hip
      ps,
    );
    transparentGroup.addMesh(mesh.overlayRightLeg);

    mesh.overlayLeftSlimArm = MinecraftPart.create(
      [3 * m, 12 * m, 4 * m],
      [-5.5 - Z_FIGHTING_OFFSET, 0, 0],
      ts,
      [40 * m, 32 * m],
      "leftArm",
      transparentGroup,
      multiplyM44(
        translateM44(-5.5 - Z_FIGHTING_OFFSET, 0, 0),
        scaleM44(3.5 / 3, 12.5 / 12, 3.5 / 3),
        translateM44(5.5 + Z_FIGHTING_OFFSET, 0, 0),
      ),
      {
        overlay: true,
      },
      [-4, 5, 0], // Joint at shoulder
      ps,
    );
    transparentGroup.addMesh(mesh.overlayLeftSlimArm);

    mesh.overlayRightSlimArm = MinecraftPart.create(
      [3 * m, 12 * m, 4 * m],
      [5.5 + Z_FIGHTING_OFFSET, 0, 0],
      ts,
      [48 * m, 48 * m],
      "rightArm",
      transparentGroup,
      multiplyM44(
        translateM44(5.5 + Z_FIGHTING_OFFSET, 0, 0),
        scaleM44(3.5 / 3, 12.5 / 12, 3.5 / 3),
        translateM44(-5.5 - Z_FIGHTING_OFFSET, 0, 0),
      ),
      {
        overlay: true,
      },
      [4, 5, 0], // Joint at shoulder
      ps,
    );
    transparentGroup.addMesh(mesh.overlayRightSlimArm);
    mesh.overlayLeftArm = MinecraftPart.create(
      [4 * m, 12 * m, 4 * m],
      [-6 - Z_FIGHTING_OFFSET, 0, 0],
      ts,
      [40 * m, 32 * m],
      "leftArm",
      transparentGroup,
      multiplyM44(
        translateM44(-6 - Z_FIGHTING_OFFSET, 0, 0),
        scaleM44(4.5 / 4, 12.5 / 12, 4.5 / 4),
        translateM44(6 + Z_FIGHTING_OFFSET, 0, 0),
      ),
      {
        overlay: true,
      },
      [-4, 5, 0], // Joint at shoulder
      ps,
    );
    transparentGroup.addMesh(mesh.overlayLeftArm);

    mesh.overlayRightArm = MinecraftPart.create(
      [4 * m, 12 * m, 4 * m],
      [6 + Z_FIGHTING_OFFSET, 0, 0],
      ts,
      [48 * m, 48 * m],
      "rightArm",
      transparentGroup,
      multiplyM44(
        translateM44(6 + Z_FIGHTING_OFFSET, 0, 0),
        scaleM44(4.5 / 4, 12.5 / 12, 4.5 / 4),
        translateM44(-6 - Z_FIGHTING_OFFSET, 0, 0),
      ),
      {
        overlay: true,
      },
      [4, 5, 0], // Joint at shoulder
      ps,
    );
    transparentGroup.addMesh(mesh.overlayRightArm);

    mesh.baseLeftSlimArm.visible = isPocket;
    mesh.baseRightSlimArm.visible = isPocket;
    mesh.overlayLeftSlimArm.visible = isPocket;
    mesh.overlayRightSlimArm.visible = isPocket;
    mesh.baseLeftArm.visible = !isPocket;
    mesh.baseRightArm.visible = !isPocket;
    mesh.overlayLeftArm.visible = !isPocket;
    mesh.overlayRightArm.visible = !isPocket;

    mesh.addMesh(transparentGroup);
    mesh.addMesh(opaqueGroup);

    // Front direction indicator triangle (on ground, pointing +Z)
    const frontIndicator = new MeshGroup("frontIndicator");
    frontIndicator.setParent(mesh);
    const { vertices: triVerts, normals: triNorms } = createRoundedTriangle(
      [
        [0, 6], // tip (XZ)
        [-1.5, 3.5], // left base
        [1.5, 3.5], // right base
      ],
      -18.9, // Y level (below feet)
      0.35, // corner radius
      4, // arc segments per corner
    );
    const triUvs = new Array((triVerts.length / 3) * 2).fill(0);
    const triMesh = new Mesh(
      triVerts,
      triNorms,
      triUvs,
      frontIndicator,
      "frontTriangle",
    );
    frontIndicator.addMesh(triMesh);
    frontIndicator.compileData();
    mesh.frontIndicator = frontIndicator;
    mesh.addMesh(frontIndicator);

    return mesh;
  }

  /**
   * Updates visibility for a part based on store state.
   * Used by store subscription pattern (new architecture).
   */
  public onVisibilityChangeFromStore(
    layer: Layers,
    part: Parts,
    storeState: RendererStore,
  ) {
    const isPocket = storeState.skinIsPocket;
    let mesh: MinecraftPart | null = null;

    if (layer === "base") {
      if (part === "head") mesh = this.baseHead;
      else if (part === "body") mesh = this.baseBody;
      else if (part === "leftArm")
        mesh = isPocket ? this.baseLeftSlimArm : this.baseLeftArm;
      else if (part === "rightArm")
        mesh = isPocket ? this.baseRightSlimArm : this.baseRightArm;
      else if (part === "leftLeg") mesh = this.baseLeftLeg;
      else if (part === "rightLeg") mesh = this.baseRightLeg;
    } else if (layer === "overlay") {
      if (part === "head") mesh = this.overlayHead;
      else if (part === "body") mesh = this.overlayBody;
      else if (part === "leftArm")
        mesh = isPocket ? this.overlayLeftSlimArm : this.overlayLeftArm;
      else if (part === "rightArm")
        mesh = isPocket ? this.overlayRightSlimArm : this.overlayRightArm;
      else if (part === "leftLeg") mesh = this.overlayLeftLeg;
      else if (part === "rightLeg") mesh = this.overlayRightLeg;
    }

    if (!mesh) return;

    // Get visibility from store using the visibility key pattern
    const key = `${layer}${part}Visible` as keyof typeof storeState;
    mesh.visible = storeState[key] as boolean;
  }

  /**
   * Updates arm visibility based on pocket (slim) mode from store.
   */
  public updateArmVisibilityFromStore(isPocket: boolean) {
    // Update base layer arms
    if (this.baseLeftSlimArm) this.baseLeftSlimArm.visible = isPocket;
    if (this.baseRightSlimArm) this.baseRightSlimArm.visible = isPocket;
    if (this.baseLeftArm) this.baseLeftArm.visible = !isPocket;
    if (this.baseRightArm) this.baseRightArm.visible = !isPocket;

    // Update overlay layer arms
    if (this.overlayLeftSlimArm) this.overlayLeftSlimArm.visible = isPocket;
    if (this.overlayRightSlimArm) this.overlayRightSlimArm.visible = isPocket;
    if (this.overlayLeftArm) this.overlayLeftArm.visible = !isPocket;
    if (this.overlayRightArm) this.overlayRightArm.visible = !isPocket;
  }
}
