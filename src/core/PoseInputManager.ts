import { getRendererState } from "../store";
import {
  cross,
  dot,
  identityM44,
  inverse,
  multiplyM4V3,
  normalize,
  subtractV3,
  V3,
} from "./maths";
import { MinecraftPart } from "./mesh";
import type { MiSkiRenderer } from "./MiSkiRenderer";
import {
  getModelTurn,
  isModelMoveLocked,
  resetModelTranslation,
  resetModelRotation,
  setModelTranslation,
  getModelTranslation,
  setModelTurn,
} from "./modelTransform";
import {
  AXIS_GRAB_SLOP_PX,
  computeAxisHandles,
  computePoseHandles,
  findAxisHandleAt,
  findHandleAt,
  getPoseSpace,
  HANDLE_GRAB_SLOP_PX,
  PoseAxis,
  PoseAxisHandle,
  PoseHandle,
  PoseMoveHandle,
  PoseTwistHandle,
  rotationOnly,
} from "./PoseGizmo";
import {
  getPartTwistAxis,
  isPosePart,
  PoseLimb,
  PosePart,
  resolvePosePartMesh,
} from "./PoseSystem";
import {
  multiplyQuat,
  Quat,
  quatFromAxisAngle,
  quatFromUnitVectors,
  rotateV3ByQuat,
  swingTwistDecompose,
} from "./quaternion";
import { computeRay } from "./rayTracing";

/** Drag distance before a press is treated as a drag rather than a click. */
const DRAG_THRESHOLD_PX = 3;

/** Window in which a second click on the same limb counts as a double-click. */
const DOUBLE_CLICK_MS = 350;

/**
 * Dragging one of the three arrows at a limb's end. The end travels along that
 * one axis and no other, and how far along it goes is *measured* — the pointer
 * ray is intersected with the axis line — rather than inferred from how many
 * pixels the pointer moved in some screen direction.
 *
 * That is the difference that matters when working against a 2D reference: a
 * free drag has to guess which of the infinitely many 3D motions a flat pointer
 * movement meant, and its guess changes with the camera. Here the user names
 * the direction by which arrow they grab, so the same drag means the same thing
 * from any angle.
 */
type AxisDrag = {
  kind: "axis";
  pointerId: number;
  part: PoseLimb;
  axis: PoseAxis;
  mesh: MinecraftPart;
  startX: number;
  startY: number;
  /** Drag direction, in the joint's parent space. */
  localAxis: V3;
  /** The joint, in parent space: the fixed point the limb pivots about. */
  jointLocal: V3;
  /** The limb's end when the drag began, in parent space; the line runs through it. */
  tipLocal: V3;
  /** Twist held constant while the aim is re-solved, so sliding can't spin the limb. */
  twist: Quat;
  /** Direction the end points at rest-plus-twist, the aim solve's `from`. */
  aimFrom: V3;
  /**
   * Offset from where the axis line was grabbed to the limb's end, so the end
   * does not jump to the pointer on the first pixel of the drag.
   */
  grabOffset: number;
  exceededThreshold: boolean;
};

/**
 * Dragging one of the three rings around a limb's joint. The limb turns about
 * that one axis — the roll that sliding an end around can never produce, which
 * is what turns a palm outwards or squares a foot to the ground.
 *
 * Measured the same way the arrows are: the pointer ray meets the ring's plane,
 * and the angle swept from where the drag was grabbed is the angle the joint
 * turns. So the limb stays under the pointer all the way round, at any camera
 * angle, rather than turning by however many pixels a drag happened to travel.
 */
type RotateDrag = {
  kind: "rotate";
  pointerId: number;
  part: PoseLimb;
  axis: PoseAxis;
  mesh: MinecraftPart;
  startX: number;
  startY: number;
  /** The turn axis, in the joint's parent space. */
  localAxis: V3;
  /** The joint, in that space: the centre of the circle the drag sweeps. */
  centerLocal: V3;
  /** Where on that circle the drag was grabbed, as a unit vector from the joint. */
  grabDirection: V3;
  /** Pose of this joint when the drag began; the turn composes onto it. */
  baseRotation: Quat;
  turn: TurnTracker;
  exceededThreshold: boolean;
};

/**
 * Dragging one of the model handle's arrows. Nothing rotates: the whole skin
 * slides along that scene axis, writing the very offsets the sidebar's move
 * sliders hold — the handle and the sliders are two ways of setting one thing.
 *
 * Solved in scene space, outside the model's own turn, because that is where
 * those offsets act; and *measured* rather than accumulated — every move is
 * taken from where the drag started, so clamping at the end of a slider's range
 * can't ratchet the model, and letting go and grabbing again never drifts.
 */
type ModelMoveDrag = {
  kind: "model-move";
  pointerId: number;
  part: "body";
  startX: number;
  startY: number;
  /** Where the model sat when the drag began, in scene axes. */
  baseOffset: V3;
  /** The handle itself, in scene space: the anchor the travel is measured from. */
  anchor: V3;
  /** The single scene axis the drag is locked to. */
  axis: V3;
  /** How far along that axis the drag first landed. */
  grabAlong: number;
  exceededThreshold: boolean;
};

/** Dragging the model's ring: the whole skin turns on the spot. */
type ModelTurnDrag = {
  kind: "model-turn";
  pointerId: number;
  part: "body";
  startX: number;
  startY: number;
  /** The upright scene axis, and the model's centre on it. */
  axis: V3;
  center: V3;
  grabDirection: V3;
  /** The model's heading when the drag began; the turn is measured from it. */
  baseAngle: number;
  turn: TurnTracker;
  exceededThreshold: boolean;
};

type DragState = AxisDrag | RotateDrag | ModelMoveDrag | ModelTurnDrag;

/**
 * Running total of a ring drag.
 *
 * The angle around a circle only ever reads back as half a turn either way, so
 * a drag carried past that point would jump to the far side. Keeping the last
 * reading and adding the short way round between readings lets a drag keep
 * going in one direction as far as the joint allows.
 */
type TurnTracker = { last: number; total: number };

/**
 * How square-on the axis has to be before its line can be intersected with the
 * pointer ray. Below this the two are near enough parallel that the solve is
 * numerically meaningless — looking straight down an arrow, there is no drag
 * that could tell one point on it from another — so the move is ignored and the
 * limb simply holds still until the user orbits or picks another arrow.
 */
const AXIS_PARALLEL_THRESHOLD = 0.08;

/**
 * How far from edge-on a ring's plane has to be before the pointer ray can be
 * intersected with it. A ring seen exactly edge-on is a line, and where on it a
 * drag landed says nothing about an angle, so the drag holds still instead of
 * flinging the limb.
 */
const RING_EDGE_ON_THRESHOLD = 0.06;

/**
 * Posing. Only active while `poseMode` is on, which is what keeps it from
 * competing with painting and orbiting for the same drag.
 *
 * Posing happens through the gizmo and nowhere else: clicking a limb — or its
 * ring handle — selects it and puts the gizmo on it, and only the gizmo's own
 * handles change the pose. Dragging the limb itself is left to the camera,
 * because a drag across a limb never said which way in 3D it meant, and the
 * answer it guessed changed with every orbit.
 *
 * The active tool picks which gizmo the selected part gets. **Move** puts three
 * arrows on the limb's free end, and dragging one slides that end along that
 * axis alone. **Twist** puts three rings around the joint, and dragging one
 * turns the limb about that axis. Both name the direction before the drag
 * starts, so the same gesture means the same thing from every camera angle.
 *
 * The torso is the exception: it has no joint of its own, so its handle moves
 * the whole model instead — the arrows slide the skin through the scene and the
 * ring turns it on the spot. Both write the sidebar's own move and turn values,
 * not a pose, so the handle and those sliders always show the same number.
 */
export class PoseInputManager {
  private drag: DragState | null = null;
  private lastClick: { part: PosePart; at: number } | null = null;
  private hovered: PosePart | null = null;
  private hoveredAxis: PoseAxis | null = null;
  /**
   * The part whose gizmo is showing. Posing is a per-limb job, and a gizmo on
   * every limb at once would be unreadable, so it follows a deliberate
   * selection rather than the pointer.
   */
  private selected: PosePart | null = null;

  constructor(private renderer: MiSkiRenderer) {}

  public mountListeners() {
    const canvas = this.renderer.backend.canvas;
    if (!canvas) return;
    canvas.addEventListener("pointerdown", this.onPointerDown);
    canvas.addEventListener("pointermove", this.onPointerMove);
    canvas.addEventListener("pointerup", this.onPointerUp);
    canvas.addEventListener("pointercancel", this.onPointerUp);
    window.addEventListener("blur", this.onWindowBlur);
    window.addEventListener("keydown", this.onKeyDown);
  }

  public unmountListeners() {
    const canvas = this.renderer.backend.canvas;
    this.endDrag();
    if (canvas) {
      canvas.removeEventListener("pointerdown", this.onPointerDown);
      canvas.removeEventListener("pointermove", this.onPointerMove);
      canvas.removeEventListener("pointerup", this.onPointerUp);
      canvas.removeEventListener("pointercancel", this.onPointerUp);
    }
    window.removeEventListener("blur", this.onWindowBlur);
    window.removeEventListener("keydown", this.onKeyDown);
  }

  /**
   * The limb the gizmo should light up: the one being dragged, or the one under
   * the pointer. Read by the renderer when it builds the overlay.
   */
  public getHighlightedPart(): PosePart | null {
    return this.drag?.part ?? this.hovered;
  }

  /** The part whose gizmo is on screen. */
  public getSelectedPart(): PosePart | null {
    return this.selected;
  }

  /** The handle being dragged, or the one under the pointer. */
  public getActiveAxis(): PoseAxis | null {
    if (this.drag) {
      return this.drag.kind === "axis" || this.drag.kind === "rotate"
        ? this.drag.axis
        : this.drag.kind === "model-turn"
          ? 1
          : null;
    }
    return this.hoveredAxis;
  }

  /** Drops hover state, e.g. when pose mode is switched off. */
  public clearHover() {
    this.hovered = null;
    this.hoveredAxis = null;
  }

  /** Puts the gizmo away, e.g. when pose mode is switched off. */
  public clearSelection() {
    this.selected = null;
  }

  private onPointerDown = (e: PointerEvent) => {
    // Gated on the gizmo being on screen, not on pose mode alone: while it is
    // hidden (a clip is playing, or a capture is in flight) the handles are
    // still where they were, and grabbing one the user cannot see is worse than
    // having nothing to grab.
    if (!this.renderer.isPoseGizmoVisible()) return;

    const canvas = this.renderer.backend.canvas;
    if (!canvas) return;

    const { x, y } = this.getPointerPos(e);

    // The gizmo first: it is drawn on top of the model, and a handle lying
    // across another limb must not fall through to selecting that limb.
    const axisHandle = this.getAxisHandleAt(x, y, e.pointerType);
    if (axisHandle) {
      const drag = this.beginAxisHandleDrag(axisHandle, e.pointerId, x, y);
      if (drag) {
        this.drag = drag;
        this.lastClick = null;
        this.startGesture(e, canvas);
      }
      return;
    }

    const part =
      this.getHandleAt(x, y, e.pointerType)?.part ??
      (e.pointerType === "touch" ? null : this.getPosePartAt(x, y));
    if (!part) {
      // A press on empty space puts the gizmo away, the way clicking off an
      // object deselects it anywhere else.
      this.clearSelection();
      return;
    }

    // Double-click a limb to send it back to rest — or the model handle to put
    // the whole skin back where it started, which is the same promise.
    const now = performance.now();
    if (
      this.lastClick &&
      this.lastClick.part === part &&
      now - this.lastClick.at < DOUBLE_CLICK_MS
    ) {
      this.lastClick = null;
      if (part === "body") {
        if (getRendererState().poseTool === "twist") resetModelRotation();
        else resetModelTranslation();
      } else {
        this.renderer.poseSystem.resetPart(part);
        this.syncPoseToStore();
      }
      e.preventDefault();
      return;
    }

    this.lastClick = { part, at: now };
    this.selected = part;
    // Deliberately no gesture and no `preventDefault`: a press on a limb only
    // selects it, and the drag that may follow belongs to the camera.
  };

  /** The gesture a gizmo handle starts, which is the tool it was built for. */
  private beginAxisHandleDrag(
    handle: PoseAxisHandle,
    pointerId: number,
    x: number,
    y: number,
  ): DragState | null {
    if (handle.part === "body") {
      return handle.kind === "move"
        ? this.beginModelMoveDrag(handle, pointerId, x, y)
        : this.beginModelTurnDrag(handle, pointerId, x, y);
    }
    return handle.kind === "move"
      ? this.beginAxisDrag(handle, handle.part, pointerId, x, y)
      : this.beginRotateDrag(handle, handle.part, pointerId, x, y);
  }

  /** Claims the pointer for the drag that just began. */
  private startGesture(e: PointerEvent, canvas: HTMLCanvasElement) {
    getRendererState().setPoseDragActive(true);
    canvas.setPointerCapture(e.pointerId);
    if (e.pointerType !== "touch") canvas.style.cursor = "grabbing";
    e.preventDefault();
    e.stopPropagation();
  }

  private onPointerMove = (e: PointerEvent) => {
    const drag = this.drag;
    if (!drag || e.pointerId !== drag.pointerId) {
      if (this.renderer.isPoseGizmoVisible()) this.updateHover(e);
      return;
    }

    const { x, y } = this.getPointerPos(e);

    if (!drag.exceededThreshold) {
      if (Math.hypot(x - drag.startX, y - drag.startY) < DRAG_THRESHOLD_PX) {
        return;
      }
      drag.exceededThreshold = true;
      // This gesture is a drag, not a click. Forget the press that started it,
      // so a click landing shortly after doesn't read as a double-click and
      // throw away the pose the user just dialled in.
      this.lastClick = null;
    }

    if (drag.kind === "axis") {
      this.updateAxisDrag(drag, x, y);
    } else if (drag.kind === "rotate") {
      this.updateRotateDrag(drag, x, y);
    } else if (drag.kind === "model-move") {
      this.updateModelMoveDrag(drag, x, y);
    } else {
      this.updateModelTurnDrag(drag, x, y);
    }

    e.preventDefault();
    e.stopPropagation();
  };

  private onPointerUp = (e: PointerEvent) => {
    const drag = this.drag;
    if (!drag || e.pointerId !== drag.pointerId) return;

    const canvas = this.renderer.backend.canvas;
    if (canvas?.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }

    const moved = drag.exceededThreshold;
    const posed = drag.part !== "body";
    this.endDrag();

    if (moved) {
      // The model transform is already in the store — it has to be, the
      // renderer reads it every frame — so only a pose needs writing back.
      if (posed) this.syncPoseToStore();
      e.preventDefault();
      e.stopPropagation();
    }
  };

  private onWindowBlur = () => {
    if (!this.drag) return;
    const posed = this.drag.part !== "body";
    this.endDrag();
    if (posed) this.syncPoseToStore();
  };

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Escape") return;
    if (!this.renderer.isPoseGizmoVisible() || !this.selected) return;
    if (this.drag) return;
    this.clearSelection();
  };

  private endDrag() {
    this.drag = null;
    getRendererState().setPoseDragActive(false);
    const canvas = this.renderer.backend.canvas;
    if (canvas) canvas.style.cursor = "default";
  }

  /** Persists the current pose. Called on drag end, not per frame. */
  private syncPoseToStore() {
    getRendererState().setValue("pose", this.renderer.poseSystem.getPose());
  }

  /**
   * Locks a drag to one axis. Everything the solve needs is frozen here: the
   * line the end slides along, and the twist, which is captured once rather
   * than re-derived per move so a long drag cannot let rounding roll the limb.
   */
  private beginAxisDrag(
    handle: PoseMoveHandle,
    part: PoseLimb,
    pointerId: number,
    x: number,
    y: number,
  ): AxisDrag | null {
    const mesh = this.getPartMesh(part);
    if (!mesh || !handle.restOffset) return null;

    const ray = this.getPoseSpaceRay(mesh, x, y);
    if (!ray) return null;

    const grabbed = closestPointOnLine(ray, handle.tipLocal, handle.localAxis);
    if (grabbed === null) return null;

    const rotation = this.renderer.poseSystem.getPartRotation(part);
    const { twist } = swingTwistDecompose(rotation, getPartTwistAxis(part));
    const aimFrom = rotateV3ByQuat(twist, handle.restOffset);
    if (Math.hypot(aimFrom[0], aimFrom[1], aimFrom[2]) < 1e-6) return null;

    return {
      kind: "axis",
      pointerId,
      part,
      axis: handle.axis,
      mesh,
      startX: x,
      startY: y,
      localAxis: handle.localAxis,
      jointLocal: handle.jointLocal,
      tipLocal: handle.tipLocal,
      twist,
      aimFrom,
      // The pointer grabs the arrow somewhere along its shaft, not at the limb's
      // end; carrying that offset keeps the end where it was on the first move.
      grabOffset: grabbed,
      exceededThreshold: false,
    };
  }

  /**
   * Slides the limb's end along the axis the user grabbed.
   *
   * The end cannot actually leave the sphere its joint holds it on, so the
   * point picked out on the axis line is a *target* the limb turns to face.
   * Aiming at it rather than clamping to it keeps the limb tracking smoothly
   * once the target passes out of reach, instead of sticking at arm's length.
   */
  private updateAxisDrag(drag: AxisDrag, x: number, y: number) {
    const ray = this.getPoseSpaceRay(drag.mesh, x, y);
    if (!ray) return;

    const along = closestPointOnLine(ray, drag.tipLocal, drag.localAxis);
    if (along === null) return;

    const distance = along - drag.grabOffset;
    const target: V3 = [
      drag.tipLocal[0] + drag.localAxis[0] * distance - drag.jointLocal[0],
      drag.tipLocal[1] + drag.localAxis[1] * distance - drag.jointLocal[1],
      drag.tipLocal[2] + drag.localAxis[2] * distance - drag.jointLocal[2],
    ];
    if (Math.hypot(target[0], target[1], target[2]) < 1e-6) return;

    const state = getRendererState();
    this.renderer.poseSystem.setPartRotation(
      drag.part,
      multiplyQuat(quatFromUnitVectors(drag.aimFrom, target), drag.twist),
      { snap: state.poseSnap, mirror: state.poseMirror },
    );
  }

  /**
   * Freezes what a ring drag is measured against: the circle's plane, and the
   * spoke the pointer landed on. Everything after is the angle between that
   * spoke and the current one.
   */
  private beginRotateDrag(
    handle: PoseTwistHandle,
    part: PoseLimb,
    pointerId: number,
    x: number,
    y: number,
  ): RotateDrag | null {
    const mesh = this.getPartMesh(part);
    if (!mesh) return null;

    const ray = this.getPoseSpaceRay(mesh, x, y);
    if (!ray) return null;

    const grabDirection = ringDirection(
      ray,
      handle.jointLocal,
      handle.localAxis,
    );
    if (!grabDirection) return null;

    return {
      kind: "rotate",
      pointerId,
      part,
      axis: handle.axis,
      mesh,
      startX: x,
      startY: y,
      localAxis: handle.localAxis,
      centerLocal: handle.jointLocal,
      grabDirection,
      baseRotation: this.renderer.poseSystem.getPartRotation(part),
      turn: { last: 0, total: 0 },
      exceededThreshold: false,
    };
  }

  /**
   * Turns the limb about the ring the user grabbed.
   *
   * Composed on the left of the base rotation, because the axis is named in the
   * joint's parent space — the same frame the arrows use — so a ring means the
   * same direction however the limb is already aimed. The joint's own limits
   * then decide how much of that turn is a swing and how much a twist.
   */
  private updateRotateDrag(drag: RotateDrag, x: number, y: number) {
    const ray = this.getPoseSpaceRay(drag.mesh, x, y);
    if (!ray) return;

    const angle = this.sweep(ray, drag.centerLocal, drag.localAxis, drag);
    if (angle === null) return;

    const state = getRendererState();
    this.renderer.poseSystem.setPartRotation(
      drag.part,
      multiplyQuat(quatFromAxisAngle(drag.localAxis, angle), drag.baseRotation),
      { snap: state.poseSnap, mirror: state.poseMirror },
    );
  }

  /**
   * Freezes what a whole-model slide is measured against: where the model sat,
   * where the handle is, and where along the arrow the pointer landed.
   */
  private beginModelMoveDrag(
    handle: PoseMoveHandle,
    pointerId: number,
    x: number,
    y: number,
  ): ModelMoveDrag | null {
    if (isModelMoveLocked()) return null;

    const ray = this.getSceneRay(x, y);
    if (!ray) return null;

    const along = closestPointOnLine(ray, handle.tipLocal, handle.localAxis);
    if (along === null) return null;

    return {
      kind: "model-move",
      pointerId,
      part: "body",
      startX: x,
      startY: y,
      baseOffset: getModelTranslation(),
      anchor: handle.tipLocal,
      axis: handle.localAxis,
      grabAlong: along,
      exceededThreshold: false,
    };
  }

  /**
   * Slides the model to wherever the pointer has taken the handle.
   *
   * The offset is rebuilt from where the drag began rather than accumulated per
   * move, so a value that clamps at the end of its range walks straight back
   * out when the pointer comes back — the same reason the joint drags do it.
   */
  private updateModelMoveDrag(drag: ModelMoveDrag, x: number, y: number) {
    const ray = this.getSceneRay(x, y);
    if (!ray) return;

    const along = closestPointOnLine(ray, drag.anchor, drag.axis);
    if (along === null) return;

    const distance = along - drag.grabAlong;
    setModelTranslation(
      [
        drag.baseOffset[0] + drag.axis[0] * distance,
        drag.baseOffset[1] + drag.axis[1] * distance,
        drag.baseOffset[2] + drag.axis[2] * distance,
      ],
      { snap: getRendererState().poseSnap },
    );
  }

  private beginModelTurnDrag(
    handle: PoseTwistHandle,
    pointerId: number,
    x: number,
    y: number,
  ): ModelTurnDrag | null {
    const ray = this.getSceneRay(x, y);
    if (!ray) return null;

    const grabDirection = ringDirection(
      ray,
      handle.jointLocal,
      handle.localAxis,
    );
    if (!grabDirection) return null;

    return {
      kind: "model-turn",
      pointerId,
      part: "body",
      startX: x,
      startY: y,
      axis: handle.localAxis,
      center: handle.jointLocal,
      grabDirection,
      baseAngle: getModelTurn(),
      turn: { last: 0, total: 0 },
      exceededThreshold: false,
    };
  }

  /**
   * Turns the model on the spot, by the angle the pointer has swept around its
   * ring. Solved in scene space, outside the model's own turn, because that is
   * the value being written.
   */
  private updateModelTurnDrag(drag: ModelTurnDrag, x: number, y: number) {
    const ray = this.getSceneRay(x, y);
    if (!ray) return;

    const angle = this.sweep(ray, drag.center, drag.axis, drag);
    if (angle === null) return;

    setModelTurn(drag.baseAngle + angle, {
      snap: getRendererState().poseSnap,
    });
  }

  /**
   * How far a ring drag has swept since it began, in radians.
   *
   * Accumulated between readings rather than taken straight from the current
   * spoke, because an angle around a circle only reads back as half a turn
   * either way: without this, carrying a drag past that point would snap the
   * part round to the other side.
   */
  private sweep(
    ray: { origin: V3; direction: V3 },
    center: V3,
    axis: V3,
    drag: { grabDirection: V3; turn: TurnTracker },
  ): number | null {
    const direction = ringDirection(ray, center, axis);
    if (!direction) return null;

    const angle = signedAngle(drag.grabDirection, direction, axis);
    const turn = drag.turn;
    let step = angle - turn.last;
    if (step > Math.PI) step -= Math.PI * 2;
    else if (step < -Math.PI) step += Math.PI * 2;

    turn.last = angle;
    turn.total += step;
    return turn.total;
  }

  /**
   * The pointer ray in scene space — outside the model's own transform, which
   * is exactly the space the move offsets are applied in.
   */
  private getSceneRay(
    x: number,
    y: number,
  ): { origin: V3; direction: V3 } | null {
    const canvas = this.renderer.backend.canvas;
    if (!canvas) return null;

    return computeRay(
      x,
      y,
      canvas.width,
      canvas.height,
      this.renderer.backend.getProjectTransformation(),
      this.renderer.backend.getViewTransformation(),
      identityM44(),
    );
  }

  /** The pointer ray, carried into the space the part's rotation acts in. */
  private getPoseSpaceRay(
    mesh: MinecraftPart,
    x: number,
    y: number,
  ): { origin: V3; direction: V3 } | null {
    const canvas = this.renderer.backend.canvas;
    const parent = getPoseSpace(mesh);
    if (!canvas || !parent) return null;

    const ray = computeRay(
      x,
      y,
      canvas.width,
      canvas.height,
      this.renderer.backend.getProjectTransformation(),
      this.renderer.backend.getViewTransformation(),
      this.renderer.backend.getGlobalTransformation(),
    );

    const invParent = inverse(parent.getTransformMatrix());
    return {
      origin: multiplyM4V3(invParent, ray.origin),
      direction: normalize(
        multiplyM4V3(rotationOnly(invParent), ray.direction),
      ),
    };
  }

  private updateHover(e: PointerEvent) {
    const { x, y } = this.getPointerPos(e);

    const axisHandle = this.getAxisHandleAt(x, y, e.pointerType);
    this.hoveredAxis = axisHandle?.axis ?? null;
    this.hovered = axisHandle
      ? axisHandle.part
      : (this.getHandleAt(x, y, e.pointerType)?.part ??
        (e.pointerType === "touch" ? null : this.getPosePartAt(x, y)));

    if (e.pointerType === "touch") return;
    const canvas = this.renderer.backend.canvas;
    // A gizmo handle is dragged, a limb is only clicked to select it — so they
    // don't get the same cursor.
    if (canvas) {
      canvas.style.cursor = axisHandle
        ? "grab"
        : this.hovered
          ? "pointer"
          : "default";
    }
  }

  /** The gizmo handle under the pointer. Only the selected part has any. */
  private getAxisHandleAt(
    x: number,
    y: number,
    pointerType: string,
  ): PoseAxisHandle | null {
    const canvas = this.renderer.backend.canvas;
    if (!canvas || !this.selected) return null;
    return findAxisHandleAt(
      computeAxisHandles(this.renderer, this.selected),
      x,
      y,
      pointerType === "touch"
        ? AXIS_GRAB_SLOP_PX.touch
        : AXIS_GRAB_SLOP_PX.mouse,
      canvas.width / (canvas.clientWidth || canvas.width),
    );
  }

  private getHandleAt(
    x: number,
    y: number,
    pointerType: string,
  ): PoseHandle | null {
    const canvas = this.renderer.backend.canvas;
    if (!canvas) return null;
    return findHandleAt(
      computePoseHandles(this.renderer),
      x,
      y,
      pointerType === "touch"
        ? HANDLE_GRAB_SLOP_PX.touch
        : HANDLE_GRAB_SLOP_PX.mouse,
      canvas.width / (canvas.clientWidth || canvas.width),
    );
  }

  private getPosePartAt(x: number, y: number): PosePart | null {
    const hit = this.renderer.getMeshHitAt(x, y);
    if (!hit) return null;
    const part = hit.mesh.metadata.part;
    if (typeof part !== "string" || !isPosePart(part)) return null;
    return part;
  }

  private getPointerPos(e: PointerEvent): { x: number; y: number } {
    const canvas = this.renderer.backend.canvas;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.floor((e.clientX - rect.left) * (canvas.width / rect.width)),
      y: Math.floor((e.clientY - rect.top) * (canvas.height / rect.height)),
    };
  }

  private getPartMesh(part: PosePart): MinecraftPart | null {
    return resolvePosePartMesh(
      this.renderer.getMainSkin(),
      part,
      getRendererState().skinIsPocket,
    );
  }
}

/**
 * How far along an axis line the pointer ray comes closest to it — the standard
 * closest-approach solve between two lines, which is what turns a 2D pointer
 * position into one number along a direction the user already chose.
 *
 * Null when the two are near enough parallel that no answer means anything.
 */
function closestPointOnLine(
  ray: { origin: V3; direction: V3 },
  point: V3,
  axis: V3,
): number | null {
  const w = subtractV3(point, ray.origin);
  const b = dot(axis, ray.direction);
  const denominator = 1 - b * b;
  if (Math.abs(denominator) < AXIS_PARALLEL_THRESHOLD) return null;

  const along = (b * dot(ray.direction, w) - dot(axis, w)) / denominator;
  return Number.isFinite(along) ? along : null;
}

/**
 * Where the pointer ray meets a ring's plane, as a unit spoke from its centre —
 * the direction the drag is currently holding. Null when the ring is too close
 * to edge-on for that point to mean anything, or when the pointer is dead on
 * the centre, where no direction exists.
 */
function ringDirection(
  ray: { origin: V3; direction: V3 },
  center: V3,
  axis: V3,
): V3 | null {
  const denominator = dot(ray.direction, axis);
  if (Math.abs(denominator) < RING_EDGE_ON_THRESHOLD) return null;

  const t = dot(subtractV3(center, ray.origin), axis) / denominator;
  if (!Number.isFinite(t)) return null;

  const offset: V3 = [
    ray.origin[0] + ray.direction[0] * t - center[0],
    ray.origin[1] + ray.direction[1] * t - center[1],
    ray.origin[2] + ray.direction[2] * t - center[2],
  ];
  const length = Math.hypot(offset[0], offset[1], offset[2]);
  if (length < 1e-6) return null;

  return [offset[0] / length, offset[1] / length, offset[2] / length];
}

/** The angle from one spoke to another, signed about the ring's own axis. */
function signedAngle(from: V3, to: V3, axis: V3): number {
  return Math.atan2(dot(cross(from, to), axis), dot(from, to));
}
