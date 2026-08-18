import { AnimationBodyPart } from "./animations";
import {
  identityM44,
  M44,
  multiplyM44,
  rotateM44,
  translateM44,
  V3,
} from "./maths";
import { MeshGroup, MinecraftPart } from "./mesh";
import { MinecraftSkin } from "./MinecraftSkin";
import { PoseCollider } from "./PoseCollision";
import {
  clampQuatAngle,
  identityQuat,
  isIdentityQuat,
  mirrorQuat,
  multiplyQuat,
  normalizeQuat,
  Quat,
  quatFromAxisAngle,
  quatAngle,
  swingTwistDecompose,
} from "./quaternion";

/**
 * The joints that turn on their own, each one limb's or the head's.
 */
export const POSE_LIMBS = [
  "head",
  "leftArm",
  "rightArm",
  "leftLeg",
  "rightLeg",
] as const;

export type PoseLimb = (typeof POSE_LIMBS)[number];

/**
 * Everything the user can grab, the torso included.
 *
 * The torso is not a joint like the others: it has nothing to rotate against,
 * because every other part hangs off the same group it does. So it doesn't
 * rotate at all — grabbing it moves the whole model through the scene instead,
 * which is the transform the sidebar's move sliders hold. That lives in
 * `modelTransform`, not in a pose: nothing about it is a joint rotation, and
 * the pose stays exactly the set of joints that turn.
 */
export const POSE_PARTS = ["body", ...POSE_LIMBS] as const;

export type PosePart = (typeof POSE_PARTS)[number];

/** Only joints are posed; the torso's handle drives the model transform. */
export type Pose = Partial<Record<PoseLimb, Quat>>;

export function isPosePart(name: string): name is PosePart {
  return (POSE_PARTS as readonly string[]).includes(name);
}

export function isPoseLimb(name: string): name is PoseLimb {
  return (POSE_LIMBS as readonly string[]).includes(name);
}

/**
 * Soft joint limits, in radians. The Minecraft rig has no elbows or knees, so
 * a limb is a single rigid box — past these angles the geometry reads as broken
 * rather than posed. `twistAxis` is the limb's long axis, split out so a twist
 * can be limited far more tightly than a swing.
 */
type JointLimit = {
  maxSwing: number;
  maxTwist: number;
  twistAxis: V3;
};

const JOINT_LIMITS: Record<PoseLimb, JointLimit> = {
  head: {
    maxSwing: (80 * Math.PI) / 180,
    maxTwist: (75 * Math.PI) / 180,
    twistAxis: [0, 1, 0],
  },
  leftArm: {
    maxSwing: (150 * Math.PI) / 180,
    maxTwist: (90 * Math.PI) / 180,
    twistAxis: [0, 1, 0],
  },
  rightArm: {
    maxSwing: (150 * Math.PI) / 180,
    maxTwist: (90 * Math.PI) / 180,
    twistAxis: [0, 1, 0],
  },
  leftLeg: {
    maxSwing: (100 * Math.PI) / 180,
    maxTwist: (45 * Math.PI) / 180,
    twistAxis: [0, 1, 0],
  },
  rightLeg: {
    maxSwing: (100 * Math.PI) / 180,
    maxTwist: (45 * Math.PI) / 180,
    twistAxis: [0, 1, 0],
  },
};

/** The part's own long axis, the one a twist spins about. */
export function getPartTwistAxis(part: PoseLimb): V3 {
  return JOINT_LIMITS[part].twistAxis;
}

/** Left/right pairs, for mirroring a pose across the body. */
const MIRROR_PARTS: Partial<Record<PoseLimb, PoseLimb>> = {
  leftArm: "rightArm",
  rightArm: "leftArm",
  leftLeg: "rightLeg",
  rightLeg: "leftLeg",
};

/** Angular step the pose snaps to when snapping is enabled. */
export const POSE_SNAP_STEP = (15 * Math.PI) / 180;

/** Below this the pose is treated as neutral and snaps back to exactly rest. */
const NEUTRAL_EPSILON = (2 * Math.PI) / 180;

/**
 * Clamps a joint rotation to its limits, twist and swing separately so that a
 * shoulder can swing a long way without also being allowed to spiral.
 */
export function clampToJointLimit(part: PoseLimb, rotation: Quat): Quat {
  const limit = JOINT_LIMITS[part];
  const { swing, twist } = swingTwistDecompose(rotation, limit.twistAxis);
  return normalizeQuat(
    multiplyQuat(
      clampQuatAngle(swing, limit.maxSwing),
      clampQuatAngle(twist, limit.maxTwist),
    ),
  );
}

/** Rounds a rotation's angle to the nearest `POSE_SNAP_STEP`, keeping its axis. */
export function snapQuat(rotation: Quat): Quat {
  const normalized = normalizeQuat(rotation);
  const angle = quatAngle(normalized);
  const snapped = Math.round(angle / POSE_SNAP_STEP) * POSE_SNAP_STEP;
  if (snapped === 0) return identityQuat();
  const sinHalf = Math.sin(angle / 2);
  if (sinHalf < 1e-8) return identityQuat();
  return quatFromAxisAngle(
    [normalized[0] / sinHalf, normalized[1] / sinHalf, normalized[2] / sinHalf],
    snapped,
  );
}

/**
 * Resolves the base/overlay `MinecraftPart` pair for each animatable part,
 * picking the slim or wide arm variant. Shared with `AnimationSystem` so the
 * two layers never disagree about which meshes a part name refers to.
 */
export function resolveBodyParts(
  skin: MinecraftSkin,
  isSlim: boolean,
): AnimationBodyPart[] {
  return [
    { name: "head", base: skin.baseHead, overlay: skin.overlayHead },
    { name: "body", base: skin.baseBody, overlay: skin.overlayBody },
    {
      name: "leftArm",
      base: isSlim ? skin.baseLeftSlimArm : skin.baseLeftArm,
      overlay: isSlim ? skin.overlayLeftSlimArm : skin.overlayLeftArm,
    },
    {
      name: "rightArm",
      base: isSlim ? skin.baseRightSlimArm : skin.baseRightArm,
      overlay: isSlim ? skin.overlayRightSlimArm : skin.overlayRightArm,
    },
    { name: "leftLeg", base: skin.baseLeftLeg, overlay: skin.overlayLeftLeg },
    {
      name: "rightLeg",
      base: skin.baseRightLeg,
      overlay: skin.overlayRightLeg,
    },
  ];
}

/**
 * Which end of each part's box the drag handle sits on, along the part's long
 * (Y) axis: +1 for the top, -1 for the bottom. Limbs hang from a joint at the
 * top, so their free end is the hand or foot; the head pivots at the neck, so
 * its free end is the crown.
 */
const TIP_END: Record<PoseLimb, 1 | -1> = {
  head: 1,
  leftArm: -1,
  rightArm: -1,
  leftLeg: -1,
  rightLeg: -1,
};

/**
 * The base mesh a pose part is currently drawn with, picking the slim or wide
 * arm variant. The overlay and the hidden arm variant follow whatever this one
 * is posed to, so it stands in for the part everywhere a single transform or
 * set of bounds is needed.
 */
export function resolvePosePartMesh(
  skin: MinecraftSkin,
  part: PosePart,
  isSlim: boolean,
): MinecraftPart | null {
  switch (part) {
    case "body":
      return skin.baseBody;
    case "head":
      return skin.baseHead;
    case "leftArm":
      return isSlim ? skin.baseLeftSlimArm : skin.baseLeftArm;
    case "rightArm":
      return isSlim ? skin.baseRightSlimArm : skin.baseRightArm;
    case "leftLeg":
      return skin.baseLeftLeg;
    case "rightLeg":
      return skin.baseRightLeg;
  }
}

/** The point a limb turns about, in the space its rotation acts in. */
export function getPosePivot(mesh: MinecraftPart): V3 {
  return mesh.jointPosition;
}

/**
 * Vector from a limb's joint to the centre of its free end, at rest and in the
 * part's local space. Read off the geometry rather than hard-coded, so it stays
 * right across slim/wide arms and both texture resolutions.
 *
 * It is not simply a multiple of the Y axis: a shoulder joint sits inboard of
 * the arm it swings, so the offset leans sideways too — which is exactly what
 * makes the hand, not the shoulder, the point that tracks the cursor.
 */
export function getPartRestOffset(mesh: MinecraftPart, part: PoseLimb): V3 {
  const { min, max } = mesh.getLocalBounds();
  const pivot = getPosePivot(mesh);
  const tipY = TIP_END[part] === 1 ? max[1] : min[1];
  return [
    (min[0] + max[0]) / 2 - pivot[0],
    tipY - pivot[1],
    (min[2] + max[2]) / 2 - pivot[2],
  ];
}

/**
 * Owns the user's manual pose and is the only thing that writes it onto the
 * mesh. Animation clips compose *on top of* whatever this holds — the pose acts
 * as the rest position a clip animates away from — so posing and animating are
 * not mutually exclusive.
 *
 * Both arm variants get written on every apply, not just the visible one, so
 * toggling slim/wide mid-pose doesn't snap an arm back to rest.
 *
 * Only the joints are here. Moving the model as a whole is not a pose — it is
 * the sidebar's own transform, applied outside the part hierarchy — so it lives
 * in `modelTransform` and never touches this.
 */
export class PoseSystem {
  private pose: Pose = {};
  private skin: MinecraftSkin | null = null;
  private onChange?: () => void;
  private collider = new PoseCollider(null, false);
  /**
   * The groups every body part hangs off — one for the opaque layer, one for
   * the overlay. A clip's body track moves the model by moving these.
   */
  private bodyGroups: MeshGroup[] = [];
  /** The body transform of the clip currently playing, if any. */
  private bodyClip: { rotation: V3; position: V3 } | null = null;

  constructor(onChange?: () => void) {
    this.onChange = onChange;
  }

  public setupBodyParts(skin: MinecraftSkin, isSlim: boolean): void {
    this.skin = skin;
    this.collider.rebind(skin, isSlim);

    const groups = new Set<MeshGroup>();
    for (const part of resolveBodyParts(skin, isSlim)) {
      const baseParent = part.base?.getParent();
      const overlayParent = part.overlay?.getParent();
      if (baseParent) groups.add(baseParent);
      if (overlayParent) groups.add(overlayParent);
    }
    this.bodyGroups = [...groups];

    this.apply();
  }

  /** Repoints the collider after a slim/wide arm switch. */
  public setColliderVariant(isSlim: boolean): void {
    this.collider.rebind(this.skin, isSlim);
  }

  public getPose(): Pose {
    const copy: Pose = {};
    for (const part of POSE_LIMBS) {
      const rotation = this.pose[part];
      if (rotation) copy[part] = [...rotation] as Quat;
    }
    return copy;
  }

  public getPartRotation(part: PoseLimb): Quat {
    return this.pose[part] ? ([...this.pose[part]!] as Quat) : identityQuat();
  }

  public hasPose(): boolean {
    return POSE_LIMBS.some((part) => {
      const rotation = this.pose[part];
      return rotation !== undefined && !isIdentityQuat(rotation);
    });
  }

  /**
   * Sets one joint. The rotation is clamped to the joint's limits and collapsed
   * to exactly rest when it lands within a couple of degrees of neutral, so a
   * limb the user dragged back by hand reads as genuinely reset.
   *
   * The joint also stops where the limb meets another body part rather than
   * passing through it. That is not optional: a limb buried in the torso is
   * never what the user was aiming for, and the alternative — letting it pass
   * and flagging it afterwards — asks the user to fix something the editor
   * could simply not do.
   */
  public setPartRotation(
    part: PoseLimb,
    rotation: Quat,
    options: { snap?: boolean; mirror?: boolean } = {},
  ): void {
    let next = clampToJointLimit(part, normalizeQuat(rotation));
    if (options.snap) next = clampToJointLimit(part, snapQuat(next));

    const twin = options.mirror ? MIRROR_PARTS[part] : undefined;

    // Solved against the joint's *current* rotation, which is collision-free by
    // induction, so the arc searched is only ever the last pointer move.
    next = this.collider.resolve({
      part,
      twin,
      from: this.pose[part] ?? identityQuat(),
      to: next,
      pose: this.pose,
    });

    if (quatAngle(next) < NEUTRAL_EPSILON) next = identityQuat();

    this.pose[part] = next;
    if (twin) this.pose[twin] = mirrorQuat(next);

    this.apply();
  }

  /**
   * Runs an animated frame past the same collider a drag goes through, so a
   * clip playing on top of a pose stops where a limb meets another part instead
   * of sweeping through it.
   *
   * `driven` holds the composed pose·clip rotation for the limbs the clip
   * actually animates; the rest are filled in from the pose, because they are
   * still standing in the way of the ones that move. The pose is what a blocked
   * limb falls back to, and it is collision-free by construction — every drag
   * that wrote it was solved against the same tests.
   */
  public resolveAnimationFrame(driven: Pose): Pose {
    const target: Pose = { ...driven };
    for (const part of POSE_LIMBS) {
      if (!target[part]) target[part] = this.getPartRotation(part);
    }
    return this.collider.resolveFrame(target, this.pose);
  }

  /**
   * The body transform of the clip currently playing, or null when none is.
   *
   * A clip moves the body by moving the group every part hangs off. It is held
   * here, rather than written straight onto the groups, so this stays the only
   * thing that writes that matrix — and so stopping a clip restores the pose
   * without a second writer having to know what it was.
   */
  public setBodyClipTransform(
    clip: { rotation: V3; position: V3 } | null,
  ): void {
    this.bodyClip = clip;
    this.writeBody();
  }

  public resetPart(part: PoseLimb): void {
    delete this.pose[part];
    this.apply();
  }

  public reset(): void {
    this.pose = {};
    this.apply();
  }

  /** Replaces the whole pose, e.g. when loading a preset or persisted state. */
  public setPose(pose: Pose): void {
    this.pose = {};
    for (const part of POSE_LIMBS) {
      const rotation = pose[part];
      if (!rotation) continue;
      const clamped = clampToJointLimit(part, normalizeQuat(rotation));
      if (!isIdentityQuat(clamped)) this.pose[part] = clamped;
    }
    this.apply();
  }

  /**
   * Writes the pose onto the mesh. A clip playing over the pose writes its own
   * composed rotation on top of this, frame by frame; this is what the limbs
   * fall back to when it stops.
   */
  public apply(): void {
    if (!this.skin) return;

    this.writeBody();
    for (const part of POSE_LIMBS) {
      this.writePart(part, this.pose[part] ?? null);
    }

    this.onChange?.();
  }

  /**
   * Writes any clip body transform onto the groups holding every body part — so
   * the limbs and the head come with it, each still carrying its own pose.
   */
  private writeBody(): void {
    if (this.bodyGroups.length === 0) return;

    const matrix: M44 = this.bodyClip
      ? multiplyM44(
          translateM44(...this.bodyClip.position),
          rotateM44(...this.bodyClip.rotation),
        )
      : identityM44();

    for (const group of this.bodyGroups) {
      group.setTransformMatrix(matrix);
    }
  }

  private writePart(part: PoseLimb, rotation: Quat | null): void {
    const value = rotation && !isIdentityQuat(rotation) ? rotation : null;

    for (const target of this.partTargets(part)) {
      target.rotationQuat = value;
    }
  }

  /**
   * Every mesh a pose part maps to. Arms return both the slim and wide variant
   * so the hidden one stays in sync.
   */
  private partTargets(part: PoseLimb) {
    const skin = this.skin;
    if (!skin) return [];

    switch (part) {
      case "head":
        return [skin.baseHead, skin.overlayHead].filter((p) => p !== null);
      case "leftArm":
        return [
          skin.baseLeftArm,
          skin.overlayLeftArm,
          skin.baseLeftSlimArm,
          skin.overlayLeftSlimArm,
        ].filter((p) => p !== null);
      case "rightArm":
        return [
          skin.baseRightArm,
          skin.overlayRightArm,
          skin.baseRightSlimArm,
          skin.overlayRightSlimArm,
        ].filter((p) => p !== null);
      case "leftLeg":
        return [skin.baseLeftLeg, skin.overlayLeftLeg].filter(
          (p) => p !== null,
        );
      case "rightLeg":
        return [skin.baseRightLeg, skin.overlayRightLeg].filter(
          (p) => p !== null,
        );
    }
  }

  public dispose(): void {
    this.pose = {};
    this.skin = null;
    this.bodyGroups = [];
    this.bodyClip = null;
  }
}
