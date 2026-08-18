import { getRendererState } from "../store";
import {
  cross,
  inverse,
  M44,
  multiplyM44,
  multiplyM4V3,
  multiplyV4,
  normalize,
  V3,
} from "./maths";
import type { MeshGroup, MinecraftPart } from "./mesh";
import type { MinecraftSkin } from "./MinecraftSkin";
import type { MiSkiRenderer } from "./MiSkiRenderer";
import { isModelMoveLocked } from "./modelTransform";
import {
  getPartRestOffset,
  getPosePivot,
  POSE_LIMBS,
  POSE_PARTS,
  PoseLimb,
  PosePart,
  resolvePosePartMesh,
} from "./PoseSystem";
import { rotateV3ByQuat } from "./quaternion";

/**
 * Handle radius in CSS pixels. Constant on screen rather than in world units,
 * so a handle stays the same size to grab however far the camera has zoomed.
 */
export const HANDLE_RADIUS_PX = 9;

/** Extra grab slop around the drawn handle, in CSS pixels, per input type. */
export const HANDLE_GRAB_SLOP_PX = { mouse: 5, touch: 14 };

/** What every handle needs to draw itself and be grabbed. */
type PoseHandleBase = {
  /** The moving end: a hand, a foot or the crown of the head. */
  tip: V3;
  /** Handle centre in canvas device pixels, or null when behind the camera. */
  screen: { x: number; y: number } | null;
  /** World length that projects to `HANDLE_RADIUS_PX` at the handle's depth. */
  worldRadius: number;
};

/**
 * One limb's drag handle: a grabbable point at the free end of the part, with
 * the joint it pivots about. Positions are in the space the part hierarchy
 * renders into — the same space `computeRay` returns rays in — so a handle and
 * a pointer ray can be compared without another change of basis.
 */
export type LimbHandle = PoseHandleBase & {
  part: PoseLimb;
  /** The fixed pivot: a shoulder, hip or the neck. */
  joint: V3;
  /** Joint→tip at rest, in the part's local space. Drives the aim solve. */
  restOffset: V3;
};

/**
 * Every handle on screen. The model's is the odd one out, because the torso is
 * not a joint: it hangs off nothing, sits at the model's centre of mass, and
 * moves the whole skin rather than turning any part of it — so it carries no
 * joint and no rest offset, and nothing is drawn linking it to the mesh.
 */
export type PoseHandle =
  | LimbHandle
  | (PoseHandleBase & {
      part: "body";
      /** The model handle hangs off nothing, and turns nothing. */
      joint: null;
      restOffset: null;
    });

/** Shaft length, arrowhead length and drawn thickness of an axis arrow, in CSS pixels. */
const AXIS_SHAFT_PX = 44;
const AXIS_HEAD_PX = 13;
const AXIS_WIDTH_PX = 3;

/** Gap between the limb's tip handle and where its arrows start, in CSS pixels. */
const AXIS_GAP_PX = HANDLE_RADIUS_PX * 1.4;

/** Radius and drawn thickness of a twist ring, in CSS pixels. */
const RING_RADIUS_PX = 52;
const RING_WIDTH_PX = 3;

/** Segments a twist ring is built from, for drawing and for hit testing alike. */
const RING_STEPS = 48;

/** Extra grab slop around an arrow or a ring, in CSS pixels, per input type. */
export const AXIS_GRAB_SLOP_PX = { mouse: 7, touch: 14 };

/**
 * The three directions a drag can be locked to: X across the model, Y up it, Z
 * out through its front. For a limb they are read in the frame its rotation
 * acts in; for the model handle, in the scene's own axes.
 */
export const POSE_AXES = [0, 1, 2] as const;
export type PoseAxis = (typeof POSE_AXES)[number];

const AXIS_COLORS: Record<PoseAxis, [number, number, number]> = {
  0: [0.95, 0.35, 0.38],
  1: [0.42, 0.82, 0.4],
  2: [0.36, 0.6, 0.98],
};

/**
 * What both gizmos have in common: one named axis, and where it acts.
 *
 * Posing goes through these handles and nothing else. A drag on a limb itself
 * would have to guess which of the infinitely many 3D motions a flat pointer
 * movement meant, and its guess changes with the camera; naming the axis first
 * removes the guess, so the pointer only ever decides *how far* along — or how
 * far around — a direction the user already picked.
 *
 * The axis is carried in the space the drag is solved in: the joint's parent
 * for a limb, and the scene's own axes for the model handle, because that is
 * where the sidebar's move and turn values act.
 */
type PoseAxisHandleBase = {
  part: PosePart;
  axis: PoseAxis;
  /** Drag axis, in the space the drag is solved in. */
  localAxis: V3;
  /** The pivot — a joint, or the model's centre — in that same space. */
  jointLocal: V3;
  /** Joint→tip at rest, in the part's local space; null for the model handle. */
  restOffset: V3 | null;
  /** World length of one CSS pixel at the gizmo's depth. */
  worldPerPixel: number;
};

/**
 * One axis arrow, growing out of a limb's free end. Dragging it moves that end
 * along this one direction and no other.
 */
export type PoseMoveHandle = PoseAxisHandleBase & {
  kind: "move";
  /** The limb's end when the arrows were built, in the solve space. */
  tipLocal: V3;
  /** Both ends of the drawn shaft, in the space the gizmo draws in. */
  from: V3;
  to: V3;
  /** Point of the arrowhead. */
  point: V3;
  /** Shaft ends in canvas device pixels; null when behind the camera. */
  screenFrom: { x: number; y: number } | null;
  screenTo: { x: number; y: number } | null;
};

/**
 * One twist ring, drawn around the joint in the plane its axis is normal to.
 * Dragging it turns the part about that axis and no other — the roll that no
 * amount of sliding an end around can produce.
 */
export type PoseTwistHandle = PoseAxisHandleBase & {
  kind: "twist";
  /** Ring vertices in the space the gizmo draws in, as a closed loop. */
  ring: V3[];
  /** The same vertices in canvas device pixels; null where behind the camera. */
  screenRing: ({ x: number; y: number } | null)[];
};

export type PoseAxisHandle = PoseMoveHandle | PoseTwistHandle;

/** A run of triangles sharing one flat colour. */
export type PoseGizmoBatch = {
  offset: number;
  count: number;
  color: [number, number, number];
  alpha: number;
};

export type PoseGizmoGeometry = {
  vertices: number[];
  normals: number[];
  batches: PoseGizmoBatch[];
};

/**
 * Everything the handles and the arrows need to place themselves on screen.
 * Read once per pass rather than per part: the camera does not move within a
 * frame, and rebuilding these matrices five times is five chances to disagree.
 */
type GizmoView = {
  canvas: HTMLCanvasElement;
  skin: MinecraftSkin;
  isSlim: boolean;
  /** projection · view · global. */
  camera: M44;
  /** The model's own place in the scene: what the sidebar's move/turn sliders build. */
  global: M44;
  /** Vertical scale of the projection, for turning pixels back into world units. */
  projectionScaleY: number;
  pixelRatio: number;
};

function getGizmoView(renderer: MiSkiRenderer): GizmoView | null {
  const canvas = renderer.backend.canvas;
  const skin = renderer.getMainSkin();
  if (!canvas || !skin || canvas.width === 0 || canvas.height === 0)
    return null;

  const projection = renderer.backend.getProjectTransformation();
  const global = renderer.backend.getGlobalTransformation();
  return {
    canvas,
    skin,
    isSlim: getRendererState().skinIsPocket,
    camera: multiplyM44(
      projection,
      renderer.backend.getViewTransformation(),
      global,
    ),
    global,
    projectionScaleY: projection[5],
    pixelRatio: canvas.width / (canvas.clientWidth || canvas.width),
  };
}

/**
 * The model's centre of mass, in the space the handles live in.
 *
 * Volume-weighted over the visible parts, and read through each part's current
 * transform, so it is the centre of the model as it actually stands: it follows
 * a posed limb, and it ignores a part the user has hidden. A box's centre is
 * exact under rotation and its volume doesn't change, so this is the true
 * centroid rather than the middle of a bounding box that swells whenever an arm
 * comes up.
 */
function computeModelCenter(view: GizmoView): V3 | null {
  const sum: V3 = [0, 0, 0];
  let mass = 0;

  for (const part of POSE_PARTS) {
    const mesh = resolvePosePartMesh(view.skin, part, view.isSlim);
    if (!mesh || !mesh.visible) continue;

    const { min, max } = mesh.getLocalBounds();
    const volume = (max[0] - min[0]) * (max[1] - min[1]) * (max[2] - min[2]);
    if (!(volume > 0)) continue;

    const center = multiplyM4V3(mesh.getTransformMatrix(), [
      (min[0] + max[0]) / 2,
      (min[1] + max[1]) / 2,
      (min[2] + max[2]) / 2,
    ]);
    for (let axis = 0; axis < 3; axis++) sum[axis] += center[axis] * volume;
    mass += volume;
  }

  if (mass <= 0) return null;
  return [sum[0] / mass, sum[1] / mass, sum[2] / mass];
}

/**
 * Whether the model handle is on screen at all.
 *
 * The move tool's job for it is the sliders' job, so it goes away exactly when
 * they do: the built environments stand the model on their own ground and
 * ignore the offsets entirely, and a handle that moves nothing is worse than no
 * handle. The twist tool turns the model, which those environments do allow.
 */
function isModelHandleShown(): boolean {
  return getRendererState().poseTool === "twist" || !isModelMoveLocked();
}

/** The whole-model handle: a ring at the centre of mass, attached to nothing. */
function computeModelHandle(view: GizmoView): PoseHandle | null {
  if (!isModelHandleShown()) return null;

  const center = computeModelCenter(view);
  if (!center) return null;

  const { screen, worldPerPixel } = projectPoint(view, center);
  return {
    part: "body",
    joint: null,
    tip: center,
    screen,
    worldRadius: HANDLE_RADIUS_PX * worldPerPixel,
    restOffset: null,
  };
}

/**
 * The group a limb's pose rotation is expressed in — the one the handle
 * positions, the drag axes and the pointer ray all have to agree on. Every part
 * hangs off it, so a limb's rotation is read against its siblings.
 */
export function getPoseSpace(mesh: MinecraftPart): MeshGroup | null {
  return mesh.getParent();
}

/** Projects a point, returning its pixel position and the world-per-pixel scale there. */
function projectPoint(
  view: GizmoView,
  point: V3,
): { screen: { x: number; y: number } | null; worldPerPixel: number } {
  const clip = multiplyV4(view.camera, [point[0], point[1], point[2], 1]);
  const w = clip[3];
  if (w <= 1e-6) return { screen: null, worldPerPixel: 0 };
  return {
    screen: {
      x: ((clip[0] / w) * 0.5 + 0.5) * view.canvas.width,
      y: (0.5 - (clip[1] / w) * 0.5) * view.canvas.height,
    },
    // A pixel offset p maps to ndc 2p/height, and ndc = projectionScaleY *
    // world / w — invert that for the world length one pixel spans.
    worldPerPixel:
      (2 * view.pixelRatio * w) / (view.canvas.height * view.projectionScaleY),
  };
}

/**
 * Where each handle currently is, for both drawing and hit testing. Recomputed
 * per frame and per pointer move rather than cached: it depends on the camera,
 * the pose and which arm variant is showing, and it is only six parts.
 *
 * Handles follow the *pose*, not the mesh. In the preview an animation clip
 * composes on top of the pose, and a handle that swung along with a walk cycle
 * would be a control the user cannot hold still enough to aim.
 */
export function computePoseHandles(renderer: MiSkiRenderer): PoseHandle[] {
  const view = getGizmoView(renderer);
  if (!view) return [];
  const { skin, isSlim } = view;

  const handles: PoseHandle[] = [];

  const modelHandle = computeModelHandle(view);
  if (modelHandle) handles.push(modelHandle);

  for (const part of POSE_LIMBS) {
    const mesh = resolvePosePartMesh(skin, part, isSlim);
    if (!mesh || !mesh.visible) continue;

    const space = getPoseSpace(mesh);
    if (!space) continue;
    const parentMatrix = space.getTransformMatrix();

    const jointLocal = getPosePivot(mesh);
    const restOffset = getPartRestOffset(mesh, part);
    const posedOffset = rotateV3ByQuat(
      renderer.poseSystem.getPartRotation(part),
      restOffset,
    );

    const joint = multiplyM4V3(parentMatrix, jointLocal);
    const tip = multiplyM4V3(parentMatrix, [
      jointLocal[0] + posedOffset[0],
      jointLocal[1] + posedOffset[1],
      jointLocal[2] + posedOffset[2],
    ]);

    const { screen, worldPerPixel } = projectPoint(view, tip);

    handles.push({
      part,
      joint,
      tip,
      screen,
      worldRadius: HANDLE_RADIUS_PX * worldPerPixel,
      restOffset,
    });
  }

  return handles;
}

/**
 * The gizmo for one part, in whichever form the active tool takes: three arrows
 * for **move**, three rings for **twist**. One or the other is the whole of
 * posing — nothing happens from dragging a limb itself.
 *
 * Both sets are built on the *parent's* axes rather than the part's own, so a
 * handle means the same thing however the part has already been rotated: X
 * always runs across the model, Y always up it, Z always out of its chest. A
 * part-local set would rotate as the part moved, and the direction a user aimed
 * at would stop matching the direction they get.
 */
export function computeAxisHandles(
  renderer: MiSkiRenderer,
  part: PosePart | null,
): PoseAxisHandle[] {
  if (!part) return [];
  const view = getGizmoView(renderer);
  if (!view) return [];

  const twisting = getRendererState().poseTool === "twist";
  if (part === "body") {
    return twisting
      ? computeModelTwistHandles(view)
      : computeModelMoveHandles(view);
  }

  const frame = computeLimbFrame(view, renderer, part);
  if (!frame) return [];
  return twisting
    ? computeLimbTwistHandles(view, frame)
    : computeLimbMoveHandles(view, frame);
}

/**
 * What both limb gizmos are built from: the joint they turn about and the free
 * end they turn, in the space the drag is solved in and in the space the gizmo
 * draws in.
 */
type LimbFrame = {
  part: PoseLimb;
  jointLocal: V3;
  tipLocal: V3;
  restOffset: V3;
  /** The joint's parent matrix: the bridge between those two spaces. */
  parentMatrix: M44;
  joint: V3;
  tip: V3;
};

function computeLimbFrame(
  view: GizmoView,
  renderer: MiSkiRenderer,
  part: PoseLimb,
): LimbFrame | null {
  const mesh = resolvePosePartMesh(view.skin, part, view.isSlim);
  if (!mesh || !mesh.visible) return null;
  const space = getPoseSpace(mesh);
  if (!space) return null;
  const parentMatrix = space.getTransformMatrix();

  const jointLocal = getPosePivot(mesh);
  const restOffset = getPartRestOffset(mesh, part);
  const posedOffset = rotateV3ByQuat(
    renderer.poseSystem.getPartRotation(part),
    restOffset,
  );
  const tipLocal: V3 = [
    jointLocal[0] + posedOffset[0],
    jointLocal[1] + posedOffset[1],
    jointLocal[2] + posedOffset[2],
  ];

  return {
    part,
    jointLocal,
    tipLocal,
    restOffset,
    parentMatrix,
    joint: multiplyM4V3(parentMatrix, jointLocal),
    tip: multiplyM4V3(parentMatrix, tipLocal),
  };
}

/** The three axis arrows for one limb, growing out of its free end. */
function computeLimbMoveHandles(
  view: GizmoView,
  frame: LimbFrame,
): PoseAxisHandle[] {
  const { screen, worldPerPixel } = projectPoint(view, frame.tip);
  if (!screen || worldPerPixel <= 0) return [];

  const rotation = rotationOnly(frame.parentMatrix);

  return POSE_AXES.map((axis) => {
    const localAxis = unitAxis(axis);
    const direction = normalize(multiplyM4V3(rotation, localAxis));
    const arrow = buildArrow(view, frame.tip, direction, worldPerPixel);

    return {
      kind: "move" as const,
      part: frame.part,
      axis,
      localAxis,
      tipLocal: frame.tipLocal,
      jointLocal: frame.jointLocal,
      restOffset: frame.restOffset,
      worldPerPixel,
      ...arrow,
    };
  });
}

/**
 * The three twist rings for one limb, drawn around the joint it turns about
 * rather than around its free end — the ring has to sit on the circle the drag
 * actually sweeps, or the turn would not follow the pointer.
 */
function computeLimbTwistHandles(
  view: GizmoView,
  frame: LimbFrame,
): PoseAxisHandle[] {
  const { screen, worldPerPixel } = projectPoint(view, frame.joint);
  if (!screen || worldPerPixel <= 0) return [];

  const rotation = rotationOnly(frame.parentMatrix);

  return POSE_AXES.map((axis) => {
    const localAxis = unitAxis(axis);
    const direction = normalize(multiplyM4V3(rotation, localAxis));

    return {
      kind: "twist" as const,
      part: frame.part,
      axis,
      localAxis,
      jointLocal: frame.jointLocal,
      restOffset: frame.restOffset,
      worldPerPixel,
      ...buildRing(
        view,
        frame.joint,
        direction,
        RING_RADIUS_PX * worldPerPixel,
      ),
    };
  });
}

/**
 * The three arrows on the model handle: one per move slider.
 *
 * They point along the scene's own axes rather than the model's, because that
 * is where the sliders act — the move offsets are applied outside the model's
 * turn, so a model turned to face sideways still travels left when the
 * left/right value goes up. The gizmo draws in the model's space, so each
 * direction is carried back through that turn on the way out; what is stored
 * for the drag stays the plain scene axis.
 */
function computeModelMoveHandles(view: GizmoView): PoseAxisHandle[] {
  if (isModelMoveLocked()) return [];

  const center = computeModelCenter(view);
  if (!center) return [];

  const { screen, worldPerPixel } = projectPoint(view, center);
  if (!screen || worldPerPixel <= 0) return [];

  // The drag intersects the pointer ray with the arrow's line in scene space,
  // so the handle is named there too.
  const centerInScene = multiplyM4V3(view.global, center);
  const sceneToModel = rotationOnly(inverse(view.global));

  return POSE_AXES.map((axis) => {
    const sceneAxis = unitAxis(axis);
    const direction = normalize(multiplyM4V3(sceneToModel, sceneAxis));

    return {
      kind: "move" as const,
      part: "body" as const,
      axis,
      localAxis: sceneAxis,
      tipLocal: centerInScene,
      jointLocal: centerInScene,
      restOffset: null,
      worldPerPixel,
      ...buildArrow(view, center, direction, worldPerPixel),
    };
  });
}

/**
 * The model's one twist ring: the turn on the spot, and nothing else.
 *
 * Only the upright axis gets a ring because only that one is a gesture — tilt
 * and roll stay the sidebar's sliders, where a value that would otherwise be
 * invented by a stray drag can be dialled in deliberately. Same reason the
 * reset squares up all three: the drag is one axis, the promise is upright.
 */
function computeModelTwistHandles(view: GizmoView): PoseAxisHandle[] {
  const center = computeModelCenter(view);
  if (!center) return [];

  const { screen, worldPerPixel } = projectPoint(view, center);
  if (!screen || worldPerPixel <= 0) return [];

  const centerInScene = multiplyM4V3(view.global, center);
  const sceneAxis = unitAxis(1);
  const direction = normalize(
    multiplyM4V3(rotationOnly(inverse(view.global)), sceneAxis),
  );

  return [
    {
      kind: "twist",
      part: "body",
      axis: 1,
      localAxis: sceneAxis,
      jointLocal: centerInScene,
      restOffset: null,
      worldPerPixel,
      ...buildRing(view, center, direction, RING_RADIUS_PX * worldPerPixel),
    },
  ];
}

/** Shaft ends and arrowhead point of one axis arrow, in the gizmo's draw space. */
function buildArrow(
  view: GizmoView,
  origin: V3,
  direction: V3,
  worldPerPixel: number,
) {
  const from = alongAxis(origin, direction, AXIS_GAP_PX * worldPerPixel);
  const to = alongAxis(
    origin,
    direction,
    (AXIS_GAP_PX + AXIS_SHAFT_PX) * worldPerPixel,
  );
  const point = alongAxis(
    origin,
    direction,
    (AXIS_GAP_PX + AXIS_SHAFT_PX + AXIS_HEAD_PX) * worldPerPixel,
  );

  return {
    from,
    to,
    point,
    screenFrom: projectPoint(view, from).screen,
    screenTo: projectPoint(view, to).screen,
  };
}

/**
 * A ring around `center` in the plane `axis` is normal to, closed so that both
 * drawing and hit testing can simply walk consecutive pairs of points.
 */
function buildRing(
  view: GizmoView,
  center: V3,
  axis: V3,
  radius: number,
): { ring: V3[]; screenRing: ({ x: number; y: number } | null)[] } {
  const [u, v] = planeBasis(axis);
  const ring: V3[] = [];
  const screenRing: ({ x: number; y: number } | null)[] = [];

  for (let step = 0; step <= RING_STEPS; step++) {
    const angle = (step / RING_STEPS) * Math.PI * 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const point: V3 = [
      center[0] + (u[0] * cos + v[0] * sin) * radius,
      center[1] + (u[1] * cos + v[1] * sin) * radius,
      center[2] + (u[2] * cos + v[2] * sin) * radius,
    ];
    ring.push(point);
    screenRing.push(projectPoint(view, point).screen);
  }

  return { ring, screenRing };
}

/** Two unit vectors spanning the plane an axis is normal to. */
function planeBasis(axis: V3): [V3, V3] {
  // Any seed that isn't near-parallel to the axis will do; picking by the
  // axis's own largest component guarantees the cross product is well defined.
  const seed: V3 = Math.abs(axis[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const u = normalize(cross(seed, axis));
  return [u, normalize(cross(axis, u))];
}

/**
 * The arrow or ring under a pointer, or null. Coordinates in canvas device
 * pixels. A ring is measured against the polyline it is drawn as, so grabbing
 * it means grabbing the line on screen — including the far side, which is the
 * half that reads as "keep turning" once a drag has come most of the way round.
 */
export function findAxisHandleAt(
  handles: PoseAxisHandle[],
  x: number,
  y: number,
  slopPx: number,
  pixelRatio: number,
): PoseAxisHandle | null {
  let best: PoseAxisHandle | null = null;
  let bestDistance = Infinity;

  for (const handle of handles) {
    const width = handle.kind === "move" ? AXIS_WIDTH_PX : RING_WIDTH_PX;
    const tolerance = (width / 2 + slopPx) * pixelRatio;
    const distance =
      handle.kind === "move"
        ? handle.screenFrom && handle.screenTo
          ? distanceToSegment(x, y, handle.screenFrom, handle.screenTo)
          : Infinity
        : distanceToPolyline(x, y, handle.screenRing);
    if (distance > tolerance || distance >= bestDistance) continue;
    bestDistance = distance;
    best = handle;
  }
  return best;
}

/** Closest approach to a chain of projected points, skipping any behind the camera. */
function distanceToPolyline(
  x: number,
  y: number,
  points: ({ x: number; y: number } | null)[],
): number {
  let best = Infinity;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    if (!a || !b) continue;
    best = Math.min(best, distanceToSegment(x, y, a, b));
  }
  return best;
}

function distanceToSegment(
  x: number,
  y: number,
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSq = dx * dx + dy * dy;
  const t =
    lengthSq < 1e-9
      ? 0
      : Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / lengthSq));
  return Math.hypot(a.x + dx * t - x, a.y + dy * t - y);
}

function unitAxis(axis: PoseAxis): V3 {
  return axis === 0 ? [1, 0, 0] : axis === 1 ? [0, 1, 0] : [0, 0, 1];
}

function alongAxis(origin: V3, direction: V3, distance: number): V3 {
  return [
    origin[0] + direction[0] * distance,
    origin[1] + direction[1] * distance,
    origin[2] + direction[2] * distance,
  ];
}

/** The handle under a pointer, or null. Coordinates in canvas device pixels. */
export function findHandleAt(
  handles: PoseHandle[],
  x: number,
  y: number,
  slopPx: number,
  pixelRatio: number,
): PoseHandle | null {
  const radius = (HANDLE_RADIUS_PX + slopPx) * pixelRatio;
  let best: PoseHandle | null = null;
  let bestDistance = radius;

  for (const handle of handles) {
    if (!handle.screen) continue;
    const distance = Math.hypot(handle.screen.x - x, handle.screen.y - y);
    if (distance <= bestDistance) {
      best = handle;
      bestDistance = distance;
    }
  }
  return best;
}

const IDLE_ALPHA = { link: 0.22, ring: 0.5, core: 0.16, joint: 0.4 };
const ACTIVE_ALPHA = { link: 0.5, ring: 1.0, core: 0.55, joint: 0.7 };

/** Warm accent for the handle being hovered or dragged. */
const ACCENT: [number, number, number] = [1.0, 0.66, 0.18];

/**
 * Builds the gizmo overlay: a ring at each limb's free end, a stem back to the
 * joint it pivots about, and a dot on the joint itself. Everything is a
 * camera-facing billboard sized in pixels, so the gizmo reads the same from any
 * orbit angle and at any zoom.
 */
export function buildPoseGizmoGeometry(
  renderer: MiSkiRenderer,
  handles: PoseHandle[],
  options: {
    /** Lit up because the pointer is on it or dragging it. */
    highlighted: PosePart | null;
    /** Axis arrows for the selected limb, if one is selected. */
    axisHandles: PoseAxisHandle[];
    /** The arrow being dragged or hovered; the others dim out of its way. */
    activeAxis: PoseAxis | null;
  },
): PoseGizmoGeometry | null {
  const { highlighted, axisHandles, activeAxis } = options;
  if (handles.length === 0 && axisHandles.length === 0) return null;

  // view · global maps this space into camera space; for an orthonormal
  // rotation the inverse is the transpose, so its rows are the world directions
  // that map to camera right and up.
  const viewGlobal = multiplyM44(
    renderer.backend.getViewTransformation(),
    renderer.backend.getGlobalTransformation(),
  );
  const right: V3 = normalize([viewGlobal[0], viewGlobal[4], viewGlobal[8]]);
  const up: V3 = normalize([viewGlobal[1], viewGlobal[5], viewGlobal[9]]);
  const forward: V3 = normalize([viewGlobal[2], viewGlobal[6], viewGlobal[10]]);

  const isDark = document.documentElement.classList.contains("dark");
  const neutral: [number, number, number] = isDark
    ? [1, 1, 1]
    : [0.08, 0.09, 0.11];

  const vertices: number[] = [];
  const normals: number[] = [];
  const batches: PoseGizmoBatch[] = [];

  const batch = (
    color: [number, number, number],
    alpha: number,
    append: () => void,
  ) => {
    const offset = vertices.length / 3;
    append();
    const count = vertices.length / 3 - offset;
    if (count > 0) batches.push({ offset, count, color, alpha });
  };

  for (const handle of handles) {
    if (!handle.screen) continue;

    const active = handle.part === highlighted;
    const color = active ? ACCENT : neutral;
    const alpha = active ? ACTIVE_ALPHA : IDLE_ALPHA;
    const r = handle.worldRadius;
    if (r <= 0) continue;

    // The model handle pivots about nothing, so it gets neither the stem nor
    // the dot at its far end: there is no joint to draw them to, and a line
    // running off to one would say the model turns about that point.
    if (handle.joint) {
      const joint = handle.joint;
      batch(color, alpha.link, () =>
        appendStem(
          vertices,
          normals,
          joint,
          handle.tip,
          right,
          up,
          forward,
          r * 0.12,
        ),
      );
      batch(color, alpha.joint, () =>
        appendDisc(vertices, normals, joint, right, up, forward, 0, r * 0.3),
      );
    }
    batch(color, alpha.core, () =>
      appendDisc(vertices, normals, handle.tip, right, up, forward, 0, r * 0.7),
    );
    batch(color, alpha.ring, () =>
      appendDisc(
        vertices,
        normals,
        handle.tip,
        right,
        up,
        forward,
        r * 0.72,
        r,
      ),
    );
  }

  for (const axisHandle of axisHandles) {
    // Whichever handle the gesture is on gets full weight; the others stay
    // visible but recede, so the axis being dragged is never in doubt.
    const active = activeAxis === null || axisHandle.axis === activeAxis;
    const color = AXIS_COLORS[axisHandle.axis];
    const alpha = active ? 0.95 : 0.3;

    if (axisHandle.kind === "twist") {
      const halfWidth = (RING_WIDTH_PX / 2) * axisHandle.worldPerPixel;
      batch(color, alpha, () => {
        for (let i = 1; i < axisHandle.ring.length; i++) {
          appendStem(
            vertices,
            normals,
            axisHandle.ring[i - 1],
            axisHandle.ring[i],
            right,
            up,
            forward,
            halfWidth,
          );
        }
      });
      continue;
    }

    const halfWidth = (AXIS_WIDTH_PX / 2) * axisHandle.worldPerPixel;
    batch(color, alpha, () =>
      appendStem(
        vertices,
        normals,
        axisHandle.from,
        axisHandle.to,
        right,
        up,
        forward,
        halfWidth,
      ),
    );
    batch(color, alpha, () =>
      appendArrowHead(
        vertices,
        normals,
        axisHandle.to,
        axisHandle.point,
        right,
        up,
        forward,
        AXIS_HEAD_PX * 0.32 * axisHandle.worldPerPixel,
      ),
    );
  }

  return batches.length > 0 ? { vertices, normals, batches } : null;
}

const RING_SEGMENTS = 24;

/** A camera-facing disc or annulus. `innerRadius` of 0 gives a filled disc. */
function appendDisc(
  outVertices: number[],
  outNormals: number[],
  center: V3,
  right: V3,
  up: V3,
  normal: V3,
  innerRadius: number,
  outerRadius: number,
): void {
  const point = (angle: number, radius: number): V3 => [
    center[0] + (right[0] * Math.cos(angle) + up[0] * Math.sin(angle)) * radius,
    center[1] + (right[1] * Math.cos(angle) + up[1] * Math.sin(angle)) * radius,
    center[2] + (right[2] * Math.cos(angle) + up[2] * Math.sin(angle)) * radius,
  ];

  for (let i = 0; i < RING_SEGMENTS; i++) {
    const a = (i / RING_SEGMENTS) * Math.PI * 2;
    const b = ((i + 1) / RING_SEGMENTS) * Math.PI * 2;
    const outerA = point(a, outerRadius);
    const outerB = point(b, outerRadius);

    if (innerRadius <= 0) {
      pushTriangle(outVertices, outNormals, center, outerA, outerB, normal);
      continue;
    }
    const innerA = point(a, innerRadius);
    const innerB = point(b, innerRadius);
    pushTriangle(outVertices, outNormals, innerA, outerA, outerB, normal);
    pushTriangle(outVertices, outNormals, innerA, outerB, innerB, normal);
  }
}

/**
 * The triangle capping an axis arrow. Its base is widened perpendicular to the
 * arrow *on screen*, so the head still reads as a head when the axis points
 * nearly at the camera and the shaft has foreshortened to almost nothing.
 */
function appendArrowHead(
  outVertices: number[],
  outNormals: number[],
  base: V3,
  point: V3,
  right: V3,
  up: V3,
  normal: V3,
  halfWidth: number,
): void {
  const offset = screenPerpendicular(base, point, right, up, halfWidth);
  if (!offset) return;

  pushTriangle(
    outVertices,
    outNormals,
    [base[0] - offset[0], base[1] - offset[1], base[2] - offset[2]],
    [base[0] + offset[0], base[1] + offset[1], base[2] + offset[2]],
    point,
    normal,
  );
}

/**
 * A world-space offset that is `halfWidth` long and perpendicular to `from`→`to`
 * as the camera sees it. Null when the segment projects to a point.
 */
function screenPerpendicular(
  from: V3,
  to: V3,
  right: V3,
  up: V3,
  halfWidth: number,
): V3 | null {
  const delta: V3 = [to[0] - from[0], to[1] - from[1], to[2] - from[2]];
  const screenX =
    delta[0] * right[0] + delta[1] * right[1] + delta[2] * right[2];
  const screenY = delta[0] * up[0] + delta[1] * up[1] + delta[2] * up[2];
  const length = Math.hypot(screenX, screenY);
  if (length < 1e-6) return null;

  // Rotate the on-screen direction a quarter turn, then lift it back into world
  // space along the camera's own axes.
  return [
    ((-screenY * right[0] + screenX * up[0]) / length) * halfWidth,
    ((-screenY * right[1] + screenX * up[1]) / length) * halfWidth,
    ((-screenY * right[2] + screenX * up[2]) / length) * halfWidth,
  ];
}

/**
 * A flat ribbon from the joint to the handle. Its width is taken perpendicular
 * to the segment *on screen*, so it stays a visible line even when the limb
 * points nearly at the camera and the segment is foreshortened to almost
 * nothing.
 */
function appendStem(
  outVertices: number[],
  outNormals: number[],
  from: V3,
  to: V3,
  right: V3,
  up: V3,
  normal: V3,
  halfWidth: number,
): void {
  const offset = screenPerpendicular(from, to, right, up, halfWidth);
  if (!offset) return;

  const a: V3 = [from[0] - offset[0], from[1] - offset[1], from[2] - offset[2]];
  const b: V3 = [from[0] + offset[0], from[1] + offset[1], from[2] + offset[2]];
  const c: V3 = [to[0] + offset[0], to[1] + offset[1], to[2] + offset[2]];
  const d: V3 = [to[0] - offset[0], to[1] - offset[1], to[2] - offset[2]];

  pushTriangle(outVertices, outNormals, a, b, c, normal);
  pushTriangle(outVertices, outNormals, a, c, d, normal);
}

function pushTriangle(
  outVertices: number[],
  outNormals: number[],
  a: V3,
  b: V3,
  c: V3,
  normal: V3,
): void {
  outVertices.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
  for (let i = 0; i < 3; i++) {
    outNormals.push(normal[0], normal[1], normal[2]);
  }
}

/** Only the rotation block of a matrix, for carrying directions through it. */
export function rotationOnly(matrix: M44): M44 {
  return [
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
}
