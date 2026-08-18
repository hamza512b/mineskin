import { getRendererState } from "../store";
import { isEnvironmentTransformLocked } from "./environment";
import { V3 } from "./maths";

/**
 * The whole-model transform: where the skin sits in the scene and which way it
 * faces. Unlike a pose, this is not a joint — it moves the model as one piece,
 * outside the part hierarchy — and it is the same value the sidebar's move and
 * turn sliders write, so the gizmo and the sliders are two views of one number.
 *
 * The sliders are the source of truth. This module only reads and writes them,
 * clamped to the range they accept, so a drag can never leave the store holding
 * a value the sliders would flag as an error.
 */

/** Range of the move sliders, in model units. Mirrors `formSchema`. */
const TRANSLATION_LIMIT = 100;

/**
 * Grid the model snaps to while snapping is on, in model units. One unit is one
 * skin pixel, which is the step that actually lines a model up with a reference
 * image or with another skin in a screenshot.
 */
const TRANSLATION_SNAP_STEP = 1;

/** Angle the turn snaps to while snapping is on. Matches the pose's own step. */
const TURN_SNAP_STEP = (15 * Math.PI) / 180;

/** Whether the environment currently pins the model, ignoring the move offsets. */
export function isModelMoveLocked(): boolean {
  return isEnvironmentTransformLocked(getRendererState().environmentPreset);
}

/**
 * The model's offset from the origin, in world axes.
 *
 * The X slider is stored negated — the backend builds the transform with
 * `-objectTranslationX`, so that "move left/right" reads left-to-right on
 * screen — and every caller here works in world axes, so the flip is undone on
 * the way in and redone on the way out rather than leaking out of this file.
 */
export function getModelTranslation(): V3 {
  const state = getRendererState();
  if (isModelMoveLocked()) return [0, 0, 0];
  return [
    -state.objectTranslationX,
    state.objectTranslationY,
    state.objectTranslationZ,
  ];
}

export function setModelTranslation(
  offset: V3,
  options: { snap?: boolean } = {},
): void {
  if (isModelMoveLocked()) return;

  const state = getRendererState();
  const axis = (value: number) =>
    clamp(
      options.snap
        ? Math.round(value / TRANSLATION_SNAP_STEP) * TRANSLATION_SNAP_STEP
        : value,
      TRANSLATION_LIMIT,
    );

  state.setValue("objectTranslationX", axis(-offset[0]));
  state.setValue("objectTranslationY", axis(offset[1]));
  state.setValue("objectTranslationZ", axis(offset[2]));
}

/** Puts the model back at the origin. */
export function resetModelTranslation(): void {
  const state = getRendererState();
  state.setValue("objectTranslationX", 0);
  state.setValue("objectTranslationY", 0);
  state.setValue("objectTranslationZ", 0);
}

/** How far the model is turned on the spot, in radians. */
export function getModelTurn(): number {
  return getRendererState().objectRotationY;
}

/**
 * Turns the model on the spot. Wrapped into the half-turn either side of facing
 * forward, which is the range the sidebar's slider covers: past half a turn the
 * shorter way round is the other direction anyway.
 */
export function setModelTurn(
  angle: number,
  options: { snap?: boolean } = {},
): void {
  const snapped = options.snap
    ? Math.round(angle / TURN_SNAP_STEP) * TURN_SNAP_STEP
    : angle;
  getRendererState().setValue("objectRotationY", wrapAngle(snapped));
}

/**
 * Squares the model back up: no tilt, no turn, no roll.
 *
 * Wider than what the twist drag writes, which only turns. The drag is one axis
 * because that is the gesture; the reset is all three because the promise is
 * that the model ends up upright and facing forward — and a tilt or roll left
 * behind from the sidebar sliders would break exactly that.
 */
export function resetModelRotation(): void {
  const state = getRendererState();
  state.setValue("objectRotationX", 0);
  state.setValue("objectRotationY", 0);
  state.setValue("objectRotationZ", 0);
}

function clamp(value: number, limit: number): number {
  return Math.max(-limit, Math.min(limit, value));
}

function wrapAngle(angle: number): number {
  const turn = Math.PI * 2;
  const wrapped = (((angle + Math.PI) % turn) + turn) % turn;
  return wrapped - Math.PI;
}
