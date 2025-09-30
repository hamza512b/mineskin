import { M44, multiplyM44, scaleM44, translateM44 } from "./maths";
import { MeshGroup, MinecraftPart } from "./mesh";
import { MinecraftSkinMaterial } from "./MeshMaterial";
import { Layers, Parts, State } from "./State";

const Z_FIGHTING_OFFSET = 0.01;
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
    super(name, parent, transformMatrix);
    this.material = material;
  }

  static async create(
    name: string,
    parent: MeshGroup | null,
    texture: string | ImageData,
    transformMatrix?: M44,
  ) {
    let material: MinecraftSkinMaterial;
    if (texture instanceof ImageData) {
      material = await MinecraftSkinMaterial.createFromImageData(texture);
    } else {
      material = await MinecraftSkinMaterial.creatFromUrl(texture);
    }
    const mesh = new MinecraftSkin(name, parent, material, transformMatrix);
    const isPocket = mesh.material.version === "slim";
    const opaqueGroup = new MeshGroup("opaque", mesh);
    const transparentGroup = new MeshGroup("transparent", mesh);

    // Create and store base layer parts
    mesh.baseHead = MinecraftPart.create(
      [8, 8, 8],
      [0, 10 + Z_FIGHTING_OFFSET, 0],
      [64, 64],
      [0, 0],
      "head",
      opaqueGroup,
    );
    opaqueGroup.addMesh(mesh.baseHead);

    mesh.baseBody = MinecraftPart.create(
      [8, 12, 4],
      [0, 0, 0],
      [64, 64],
      [16, 16],
      "body",
      opaqueGroup,
    );
    opaqueGroup.addMesh(mesh.baseBody);

    mesh.baseLeftLeg = MinecraftPart.create(
      [4, 12, 4],
      [-2 - Z_FIGHTING_OFFSET, -12 - Z_FIGHTING_OFFSET, 0],
      [64, 64],
      [0, 16],
      "leftLeg",
      opaqueGroup,
    );
    opaqueGroup.addMesh(mesh.baseLeftLeg);

    mesh.baseRightLeg = MinecraftPart.create(
      [4, 12, 4],
      [2 + Z_FIGHTING_OFFSET, -12 + Z_FIGHTING_OFFSET, 0],
      [64, 64],
      [16, 48],
      "rightLeg",
      opaqueGroup,
    );
    opaqueGroup.addMesh(mesh.baseRightLeg);

    mesh.baseLeftSlimArm = MinecraftPart.create(
      [3, 12, 4],
      [-5.5 - Z_FIGHTING_OFFSET, 0, 0],
      [64, 64],
      [40, 16],
      "leftArm",
      opaqueGroup,
    );
    opaqueGroup.addMesh(mesh.baseLeftSlimArm);

    mesh.baseRightSlimArm = MinecraftPart.create(
      [3, 12, 4],
      [5.5 + Z_FIGHTING_OFFSET, 0, 0],
      [64, 64],
      [32, 48],
      "rightArm",
      opaqueGroup,
    );
    opaqueGroup.addMesh(mesh.baseRightSlimArm);
    mesh.baseLeftArm = MinecraftPart.create(
      [4, 12, 4],
      [-6 - Z_FIGHTING_OFFSET, 0, 0],
      [64, 64],
      [40, 16],
      "leftArm",
      opaqueGroup,
    );
    opaqueGroup.addMesh(mesh.baseLeftArm);

    mesh.baseRightArm = MinecraftPart.create(
      [4, 12, 4],
      [6 + Z_FIGHTING_OFFSET, 0, 0],
      [64, 64],
      [32, 48],
      "rightArm",
      opaqueGroup,
    );
    opaqueGroup.addMesh(mesh.baseRightArm);

    // Create and store overlay layer parts
    mesh.overlayHead = MinecraftPart.create(
      [8, 8, 8],
      [0, 10 + Z_FIGHTING_OFFSET, 0],
      [64, 64],
      [32, 0],
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
    );
    transparentGroup.addMesh(mesh.overlayHead);

    mesh.overlayBody = MinecraftPart.create(
      [8, 12, 4],
      [0, 0, 0],
      [64, 64],
      [16, 32],
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
    );
    transparentGroup.addMesh(mesh.overlayBody);

    mesh.overlayLeftLeg = MinecraftPart.create(
      [4, 12, 4],
      [-2 - Z_FIGHTING_OFFSET, -12 - Z_FIGHTING_OFFSET, 0],
      [64, 64],
      [0, 32],
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
    );
    transparentGroup.addMesh(mesh.overlayLeftLeg);

    mesh.overlayRightLeg = MinecraftPart.create(
      [4, 12, 4],
      [2 + Z_FIGHTING_OFFSET, -12 - Z_FIGHTING_OFFSET, 0],
      [64, 64],
      [0, 48],
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
    );
    transparentGroup.addMesh(mesh.overlayRightLeg);

    mesh.overlayLeftSlimArm = MinecraftPart.create(
      [3, 12, 4],
      [-5.5 - Z_FIGHTING_OFFSET, 0, 0],
      [64, 64],
      [40, 32],
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
    );
    transparentGroup.addMesh(mesh.overlayLeftSlimArm);

    mesh.overlayRightSlimArm = MinecraftPart.create(
      [3, 12, 4],
      [5.5 + Z_FIGHTING_OFFSET, 0, 0],
      [64, 64],
      [48, 48],
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
    );
    transparentGroup.addMesh(mesh.overlayRightSlimArm);
    mesh.overlayLeftArm = MinecraftPart.create(
      [4, 12, 4],
      [-6 - Z_FIGHTING_OFFSET, 0, 0],
      [64, 64],
      [40, 32],
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
    );
    transparentGroup.addMesh(mesh.overlayLeftArm);

    mesh.overlayRightArm = MinecraftPart.create(
      [4, 12, 4],
      [6 + Z_FIGHTING_OFFSET, 0, 0],
      [64, 64],
      [48, 48],
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
    return mesh;
  }

  public getMeshByName(layer: Layers, name: Parts, state: State) {
    const isPocket = state.getSkinIsPocket();
    if (layer === "base") {
      if (name === "head") return this.baseHead;
      if (name === "body") return this.baseBody;
      if (name === "leftArm")
        return isPocket ? this.baseLeftSlimArm : this.baseLeftArm;
      if (name === "rightArm")
        return isPocket ? this.baseRightSlimArm : this.baseRightArm;
      if (name === "leftLeg") return this.baseLeftLeg;
      if (name === "rightLeg") return this.baseRightLeg;
    } else if (layer === "overlay") {
      if (name === "head") return this.overlayHead;
      if (name === "body") return this.overlayBody;
      if (name === "leftArm")
        return isPocket ? this.overlayLeftSlimArm : this.overlayLeftArm;
      if (name === "rightArm")
        return isPocket ? this.overlayRightSlimArm : this.overlayRightArm;
      if (name === "leftLeg") return this.overlayLeftLeg;
      if (name === "rightLeg") return this.overlayRightLeg;
    }
    throw new Error(`Mesh ${name} not found`);
  }

  public onVisibilityChange(layer: Layers, part: Parts, state: State) {
    const mesh = this.getMeshByName(layer, part, state);

    if (!mesh) return;

    mesh.visible = state.getPartVisibility(layer, part);
  }
}
