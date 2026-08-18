import { dot, subtractV3, V3 } from "./maths";
import { MinecraftPart } from "./mesh";
import { MinecraftSkin } from "./MinecraftSkin";
import type { Pose, PoseLimb, PosePart } from "./PoseSystem";
import {
  identityQuat,
  mirrorQuat,
  Quat,
  rotateV3ByQuat,
  slerpQuat,
} from "./quaternion";

/**
 * Body parts that take part in collision. The torso is here as an obstacle
 * rather than as a mover: it has no joint to turn on, and its handle moves the
 * whole model together, so it can only be run *into*, never into anything.
 */
type CollisionPart = PosePart;

/**
 * Pairs that are actually tested. Two rules decide what is left out:
 *
 * - A part is never tested against its own parent-adjacent neighbour when the
 *   joint sits *on* the shared face. Rotating a box about a point on a wall
 *   always drives some corner through that wall, so head↔body and leg↔body
 *   would report contact at one degree of movement and freeze the limb.
 * - Everything else that can plausibly meet is tested, including arm↔leg,
 *   which only engages when a leg is raised into an arm.
 */
const COLLISION_PAIRS: ReadonlyArray<readonly [CollisionPart, CollisionPart]> =
  [
    ["leftArm", "body"],
    ["rightArm", "body"],
    ["leftArm", "rightArm"],
    ["leftArm", "head"],
    ["rightArm", "head"],
    ["leftArm", "leftLeg"],
    ["leftArm", "rightLeg"],
    ["rightArm", "leftLeg"],
    ["rightArm", "rightLeg"],
    ["leftLeg", "rightLeg"],
  ];

/** {@link COLLISION_PAIRS} indexed by part, so one limb's tests are one lookup. */
const COLLISION_PARTNERS = ((): Record<CollisionPart, CollisionPart[]> => {
  const partners: Record<CollisionPart, CollisionPart[]> = {
    head: [],
    body: [],
    leftArm: [],
    rightArm: [],
    leftLeg: [],
    rightLeg: [],
  };
  for (const [a, b] of COLLISION_PAIRS) {
    partners[a].push(b);
    partners[b].push(a);
  }
  return partners;
})();

/**
 * How much of a part is excluded from its collider, in model units. The whole
 * model is 8 units across, so a unit here is a quarter of a limb's width.
 *
 * The insets exist because of one awkward fact about this rig: every joint sits
 * *in* the surface of the part next to it. A shoulder lies in the torso's side
 * face, one unit below the arm's own top; the arm's top face is also the head's
 * bottom plane. Rotating a rigid box about a point on a wall always drives some
 * corner through that wall, so on exact geometry an arm cannot leave the T-pose
 * in any direction but two, and the feature reads as broken rather than solid.
 *
 * `joint` trims the collider back along the part's long axis, away from the end
 * it pivots about, so what gets tested is the part of the limb a user is
 * actually aiming — the forearm and the hand — and not the stump that has to
 * clip, exactly as it does in-game.
 *
 * `side` is the remaining clearance off every face. The torso keeps a hair,
 * enough that boxes touching at rest do not read as already colliding; limbs
 * and the head give up more, which is what buys back the ordinary poses (arm
 * forward, back, out to the side, raised in front) whose corners would
 * otherwise catch on a face they already touch. Tuned against those poses on
 * one side and hand-in-the-chest, hand-in-the-head and crossed legs on the
 * other, which all still stop at contact.
 */
const COLLIDER_INSET: Record<CollisionPart, { side: number; joint: number }> = {
  head: { side: 0.5, joint: 0 },
  body: { side: 0.15, joint: 0 },
  leftArm: { side: 0.8, joint: 2.5 },
  rightArm: { side: 0.8, joint: 2.5 },
  leftLeg: { side: 0.8, joint: 2.5 },
  rightLeg: { side: 0.8, joint: 2.5 },
};

/** Which way along local Y the joint sits, so the inset trims the right end. */
const JOINT_END: Record<CollisionPart, 1 | -1 | 0> = {
  head: -1,
  body: 0,
  leftArm: 1,
  rightArm: 1,
  leftLeg: 1,
  rightLeg: 1,
};

/** Iterations of the contact search. 7 lands within ~0.8% of the free arc. */
const CONTACT_SEARCH_STEPS = 7;

/**
 * The limbs an animated frame is solved for, in the order they are visited.
 * Written out rather than imported from `PoseSystem` so this module stays a
 * leaf of it — it already borrows only types from there.
 */
const FRAME_ORDER: readonly PoseLimb[] = [
  "head",
  "leftArm",
  "rightArm",
  "leftLeg",
  "rightLeg",
];

/**
 * Sweeps of {@link FRAME_ORDER} per animated frame. The first sweep solves each
 * limb against the others still at their full clip rotation, which over-corrects
 * whenever two limbs run into each other: both give way, when one giving way
 * would have been enough. The second re-offers every limb its whole arc now that
 * its neighbours have moved, and hands most of that back. A third changes almost
 * nothing and this runs every frame, so it stops at two.
 */
const FRAME_PASSES = 2;

/** Slack in the separating-axis test, to keep touching faces apart. */
const SAT_EPSILON = 1e-4;

/**
 * An oriented box, in the space the body parts share — every part hangs off the
 * same group, so no part-to-part change of basis is needed anywhere here.
 */
type Obb = {
  center: V3;
  /** Unit axes; the box spans ±`half[i]` along `axes[i]`. */
  axes: [V3, V3, V3];
  half: V3;
};

/**
 * The box a part occupies at a given rotation, without touching the mesh.
 *
 * Mirrors `MinecraftPart.updateJointBasedTransform`: a local vertex `v` lands
 * at `position + joint + R · (scale · v − joint)`. Building it here rather than
 * writing the rotation to the mesh and reading its matrix back is what lets the
 * contact search try a dozen candidate rotations per pointer move without ever
 * making the renderer draw one of the rejected ones.
 */
function buildObb(
  mesh: MinecraftPart,
  part: CollisionPart,
  rotation: Quat | null,
): Obb {
  const { min, max } = mesh.getLocalBounds();
  const joint = mesh.jointPosition;
  const position = mesh.position;
  const scale = mesh.scale;
  const inset = COLLIDER_INSET[part];
  const jointEnd = JOINT_END[part];

  const center: V3 = [0, 0, 0];
  const half: V3 = [0, 0, 0];
  for (let axis = 0; axis < 3; axis++) {
    let low = min[axis] * scale[axis];
    let high = max[axis] * scale[axis];

    const side = Math.min(inset.side, (high - low) / 2 - 1e-3);
    low += side;
    high -= side;

    // Trim the stump around the joint, along the part's long (Y) axis only.
    if (axis === 1 && jointEnd !== 0) {
      const trim = Math.min(inset.joint, (high - low) / 2);
      if (jointEnd === 1) high -= trim;
      else low += trim;
    }

    center[axis] = (low + high) / 2;
    half[axis] = Math.max((high - low) / 2, 1e-3);
  }

  const quat = rotation ?? identityQuat();
  const offset = rotateV3ByQuat(quat, [
    center[0] - joint[0],
    center[1] - joint[1],
    center[2] - joint[2],
  ]);

  return {
    center: [
      position[0] + joint[0] + offset[0],
      position[1] + joint[1] + offset[1],
      position[2] + joint[2] + offset[2],
    ],
    axes: [
      rotateV3ByQuat(quat, [1, 0, 0]),
      rotateV3ByQuat(quat, [0, 1, 0]),
      rotateV3ByQuat(quat, [0, 0, 1]),
    ],
    half,
  };
}

/**
 * Separating-axis test for two oriented boxes: the 3 face normals of each, plus
 * the 9 edge-pair cross products. A single axis with a gap proves they are
 * apart, so the common case — limbs nowhere near each other — exits on the
 * first or second axis.
 */
function obbIntersects(a: Obb, b: Obb): boolean {
  // r[i][j] projects b's axes onto a's; absR adds the epsilon that keeps a
  // near-parallel edge cross from dividing the world by ~0.
  const r: number[][] = [];
  const absR: number[][] = [];
  for (let i = 0; i < 3; i++) {
    r.push([0, 0, 0]);
    absR.push([0, 0, 0]);
    for (let j = 0; j < 3; j++) {
      r[i][j] = dot(a.axes[i], b.axes[j]);
      absR[i][j] = Math.abs(r[i][j]) + SAT_EPSILON;
    }
  }

  const delta = subtractV3(b.center, a.center);
  const t: V3 = [
    dot(delta, a.axes[0]),
    dot(delta, a.axes[1]),
    dot(delta, a.axes[2]),
  ];

  // a's face normals.
  for (let i = 0; i < 3; i++) {
    const ra = a.half[i];
    const rb =
      b.half[0] * absR[i][0] + b.half[1] * absR[i][1] + b.half[2] * absR[i][2];
    if (Math.abs(t[i]) > ra + rb) return false;
  }

  // b's face normals.
  for (let j = 0; j < 3; j++) {
    const ra =
      a.half[0] * absR[0][j] + a.half[1] * absR[1][j] + a.half[2] * absR[2][j];
    const rb = b.half[j];
    if (Math.abs(t[0] * r[0][j] + t[1] * r[1][j] + t[2] * r[2][j]) > ra + rb) {
      return false;
    }
  }

  // The nine edge-edge axes, written out rather than looped: each is a cross
  // product of one axis from each box, and in this basis the terms collapse to
  // the entries of `r`.
  const edges: [ra: number, rb: number, separation: number][] = [
    [
      a.half[1] * absR[2][0] + a.half[2] * absR[1][0],
      b.half[1] * absR[0][2] + b.half[2] * absR[0][1],
      t[2] * r[1][0] - t[1] * r[2][0],
    ],
    [
      a.half[1] * absR[2][1] + a.half[2] * absR[1][1],
      b.half[0] * absR[0][2] + b.half[2] * absR[0][0],
      t[2] * r[1][1] - t[1] * r[2][1],
    ],
    [
      a.half[1] * absR[2][2] + a.half[2] * absR[1][2],
      b.half[0] * absR[0][1] + b.half[1] * absR[0][0],
      t[2] * r[1][2] - t[1] * r[2][2],
    ],
    [
      a.half[0] * absR[2][0] + a.half[2] * absR[0][0],
      b.half[1] * absR[1][2] + b.half[2] * absR[1][1],
      t[0] * r[2][0] - t[2] * r[0][0],
    ],
    [
      a.half[0] * absR[2][1] + a.half[2] * absR[0][1],
      b.half[0] * absR[1][2] + b.half[2] * absR[1][0],
      t[0] * r[2][1] - t[2] * r[0][1],
    ],
    [
      a.half[0] * absR[2][2] + a.half[2] * absR[0][2],
      b.half[0] * absR[1][1] + b.half[1] * absR[1][0],
      t[0] * r[2][2] - t[2] * r[0][2],
    ],
    [
      a.half[0] * absR[1][0] + a.half[1] * absR[0][0],
      b.half[1] * absR[2][2] + b.half[2] * absR[2][1],
      t[1] * r[0][0] - t[0] * r[1][0],
    ],
    [
      a.half[0] * absR[1][1] + a.half[1] * absR[0][1],
      b.half[0] * absR[2][2] + b.half[2] * absR[2][0],
      t[1] * r[0][1] - t[0] * r[1][1],
    ],
    [
      a.half[0] * absR[1][2] + a.half[1] * absR[0][2],
      b.half[0] * absR[2][1] + b.half[1] * absR[2][0],
      t[1] * r[0][2] - t[0] * r[1][2],
    ],
  ];
  for (const [ra, rb, separation] of edges) {
    if (Math.abs(separation) > ra + rb) return false;
  }

  return true;
}

/**
 * Keeps posed limbs out of each other.
 *
 * The check runs on the base meshes only. Overlays are a scaled-up copy of the
 * same box, so at rest they already overlap the neighbour they sit against —
 * testing them would report contact on an untouched model.
 */
export class PoseCollider {
  private meshes = new Map<CollisionPart, MinecraftPart>();

  constructor(skin: MinecraftSkin | null, isSlim: boolean) {
    this.rebind(skin, isSlim);
  }

  /** Points the collider at a freshly built skin, or at the other arm variant. */
  public rebind(skin: MinecraftSkin | null, isSlim: boolean): void {
    this.meshes.clear();
    if (!skin) return;

    const entries: [CollisionPart, MinecraftPart | null][] = [
      ["head", skin.baseHead],
      ["body", skin.baseBody],
      ["leftArm", isSlim ? skin.baseLeftSlimArm : skin.baseLeftArm],
      ["rightArm", isSlim ? skin.baseRightSlimArm : skin.baseRightArm],
      ["leftLeg", skin.baseLeftLeg],
      ["rightLeg", skin.baseRightLeg],
    ];
    for (const [part, mesh] of entries) {
      if (mesh) this.meshes.set(part, mesh);
    }
  }

  public isReady(): boolean {
    return this.meshes.size > 0;
  }

  /**
   * The furthest point along the arc `from`→`to` at which `moving` (and its
   * mirrored twin, if any) still clears every other part.
   *
   * Stopping at contact rather than rejecting the move outright is what makes a
   * blocked limb feel like it is resting against something: it keeps tracking
   * the pointer right up to the other part, and picks the drag back up the
   * moment the pointer leads it away.
   */
  public resolve(options: {
    part: PoseLimb;
    twin?: PoseLimb;
    from: Quat;
    to: Quat;
    pose: Pose;
  }): Quat {
    const { part, twin, from, to, pose } = options;
    if (!this.isReady()) return to;

    const test = (candidate: Quat) =>
      this.collides(part, twin, candidate, pose);

    if (!test(to)) return to;
    // Already overlapping when the move began — a pose loaded from disk, or a
    // part the mirror twin walked into. Refusing to move would strand the limb;
    // let the user drive it out.
    if (test(from)) return to;

    let free = 0;
    let hit = 1;
    for (let i = 0; i < CONTACT_SEARCH_STEPS; i++) {
      const mid = (free + hit) / 2;
      if (test(slerpQuat(from, to, mid))) hit = mid;
      else free = mid;
    }

    return free <= 0 ? from : slerpQuat(from, to, free);
  }

  /**
   * The rotations to draw an animated frame with: the clip's own, except where
   * it would drive a limb through another part, and there the furthest point
   * along the way from the pose to the clip that still clears.
   *
   * A clip is composed onto the user's pose, so the two are authored blind to
   * each other: a wave written for a limb hanging at rest sweeps straight
   * through a torso once that arm has been posed across the chest. Backing the
   * clip off towards the pose keeps as much of the movement as fits and leaves
   * the limb resting against whatever stopped it, which is the same thing a
   * blocked drag does — and it retreats to the pose, never to the T-pose, so a
   * limb that cannot move at all simply holds the position the user gave it.
   *
   * `rest` is the pose the clip animates away from, and is the fallback for any
   * limb with nowhere to go. `target` holds pose·clip per limb; both treat a
   * missing limb as unrotated.
   */
  public resolveFrame(target: Pose, rest: Pose): Pose {
    if (!this.isReady()) return target;

    // Rotations as the solve currently has them, with each part's box cached
    // until that part moves. Every candidate the search tries changes one part,
    // so its neighbours' boxes are built once for the whole frame.
    const current: Partial<Record<CollisionPart, Quat | null>> = {
      body: null,
    };
    for (const part of FRAME_ORDER) current[part] = target[part] ?? null;

    const boxes = new Map<CollisionPart, Obb>();
    const boxOf = (part: CollisionPart): Obb | null => {
      const cached = boxes.get(part);
      if (cached) return cached;
      const mesh = this.meshes.get(part);
      if (!mesh) return null;
      const box = buildObb(mesh, part, current[part] ?? null);
      boxes.set(part, box);
      return box;
    };
    const move = (part: CollisionPart, rotation: Quat | null) => {
      current[part] = rotation;
      boxes.delete(part);
    };
    const hits = (part: CollisionPart): boolean => {
      const box = boxOf(part);
      if (!box) return false;
      for (const partner of COLLISION_PARTNERS[part]) {
        const other = boxOf(partner);
        if (other && obbIntersects(box, other)) return true;
      }
      return false;
    };

    // The frame is clean as authored — the common case, and the reason the
    // whole solve costs six boxes and a handful of axis tests most frames.
    if (!FRAME_ORDER.some(hits)) return target;

    const resolved: Pose = { ...target };
    for (let pass = 0; pass < FRAME_PASSES; pass++) {
      let clean = true;

      for (const part of FRAME_ORDER) {
        const to = target[part];
        if (!to) continue;
        const from = rest[part] ?? identityQuat();

        // Offer the limb its whole arc again: a limb that gave way in an
        // earlier pass has to be able to take the room back once whatever it
        // gave way to has itself moved.
        move(part, to);
        if (!hits(part)) {
          resolved[part] = to;
          continue;
        }
        clean = false;

        let free = 0;
        let hit = 1;
        for (let i = 0; i < CONTACT_SEARCH_STEPS; i++) {
          const mid = (free + hit) / 2;
          move(part, slerpQuat(from, to, mid));
          if (hits(part)) hit = mid;
          else free = mid;
        }

        // `free === 0` means even the first step in was blocked, which leaves
        // the pose itself. It may overlap too — two posed limbs the user has
        // already crossed, say — but it is where the limb sits when the clip
        // stops, so it is the one position that cannot make things worse.
        const settled = free <= 0 ? from : slerpQuat(from, to, free);
        move(part, settled);
        resolved[part] = settled;
      }

      if (clean) break;
    }

    return resolved;
  }

  /** Whether `moving` at `candidate` overlaps any part it is tested against. */
  private collides(
    moving: PoseLimb,
    twin: PoseLimb | undefined,
    candidate: Quat,
    pose: Pose,
  ): boolean {
    for (const [a, b] of COLLISION_PAIRS) {
      const movesA = a === moving || a === twin;
      const movesB = b === moving || b === twin;
      if (!movesA && !movesB) continue;

      const boxA = this.boxFor(a, moving, twin, candidate, pose);
      const boxB = this.boxFor(b, moving, twin, candidate, pose);
      if (!boxA || !boxB) continue;
      if (obbIntersects(boxA, boxB)) return true;
    }
    return false;
  }

  /**
   * The box for one part: the candidate rotation for the part being dragged
   * (mirrored for its twin), and the committed pose for everything else.
   */
  private boxFor(
    part: CollisionPart,
    moving: PoseLimb,
    twin: PoseLimb | undefined,
    candidate: Quat,
    pose: Pose,
  ): Obb | null {
    const mesh = this.meshes.get(part);
    if (!mesh) return null;

    let rotation: Quat | null;
    if (part === moving) rotation = candidate;
    else if (part === twin) rotation = mirrorQuat(candidate);
    else if (part === "body") rotation = null;
    else rotation = pose[part] ?? null;

    return buildObb(mesh, part, rotation);
  }
}
