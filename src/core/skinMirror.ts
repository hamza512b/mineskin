/**
 * Left↔right mirror mapping for the Minecraft skin texture atlas.
 *
 * Symmetry painting needs, for any texel, the texel on the opposite side of
 * the model's vertical center plane. Every body box unwraps to six
 * axis-aligned rects in the atlas, so this is a pure UV computation: find the
 * face rect containing the texel, flip the horizontal index within the rect,
 * and swap to the counterpart rect (Left↔Right faces, and paired limbs).
 */

type FaceName = "top" | "bottom" | "right" | "front" | "left" | "back";

interface BoxSpec {
  tx: number;
  ty: number;
  w: number;
  h: number;
  d: number;
  /** Index of the box this one mirrors onto; self-mirrored when omitted. */
  pair?: number;
}

export interface MirrorOptions {
  /** Atlas resolution multiplier: 1 for 64×64 skins, 2 for 128×128. */
  scale: number;
  /** Whether arms are the slim (3px wide) variant. */
  slim: boolean;
}

const FACES: FaceName[] = ["top", "bottom", "right", "front", "left", "back"];

// A mirrored Left face lands on the Right face (and vice versa); the other
// four faces stay put and only flip horizontally.
const MIRROR_FACE: Record<FaceName, FaceName> = {
  top: "top",
  bottom: "bottom",
  front: "front",
  back: "back",
  left: "right",
  right: "left",
};

// Box offsets/dims mirror MinecraftSkin.create; left/right naming follows
// that file's convention (its "left" parts sit at negative X).
function buildBoxes(scale: number, slim: boolean): BoxSpec[] {
  const aw = slim ? 3 : 4;
  const boxes: BoxSpec[] = [
    { tx: 0, ty: 0, w: 8, h: 8, d: 8 }, // head
    { tx: 32, ty: 0, w: 8, h: 8, d: 8 }, // head overlay
    { tx: 16, ty: 16, w: 8, h: 12, d: 4 }, // body
    { tx: 16, ty: 32, w: 8, h: 12, d: 4 }, // body overlay
    { tx: 0, ty: 16, w: 4, h: 12, d: 4, pair: 5 }, // left leg
    { tx: 16, ty: 48, w: 4, h: 12, d: 4, pair: 4 }, // right leg
    { tx: 0, ty: 32, w: 4, h: 12, d: 4, pair: 7 }, // left leg overlay
    { tx: 0, ty: 48, w: 4, h: 12, d: 4, pair: 6 }, // right leg overlay
    { tx: 40, ty: 16, w: aw, h: 12, d: 4, pair: 9 }, // left arm
    { tx: 32, ty: 48, w: aw, h: 12, d: 4, pair: 8 }, // right arm
    { tx: 40, ty: 32, w: aw, h: 12, d: 4, pair: 11 }, // left arm overlay
    { tx: 48, ty: 48, w: aw, h: 12, d: 4, pair: 10 }, // right arm overlay
  ];
  if (scale === 1) return boxes;
  return boxes.map((b) => ({
    ...b,
    tx: b.tx * scale,
    ty: b.ty * scale,
    w: b.w * scale,
    h: b.h * scale,
    d: b.d * scale,
  }));
}

const boxCache = new Map<string, BoxSpec[]>();

function getBoxes(scale: number, slim: boolean): BoxSpec[] {
  const key = `${scale}:${slim}`;
  let boxes = boxCache.get(key);
  if (!boxes) {
    boxes = buildBoxes(scale, slim);
    boxCache.set(key, boxes);
  }
  return boxes;
}

// Rect as [x, y, width, height] in atlas texels, standard box unwrap:
// columns [d][w][d][w] = right, front, left, back; top row = top, bottom.
function faceRect(
  b: BoxSpec,
  face: FaceName,
): [number, number, number, number] {
  const { tx, ty, w, h, d } = b;
  switch (face) {
    case "top":
      return [tx + d, ty, w, d];
    case "bottom":
      return [tx + d + w, ty, w, d];
    case "right":
      return [tx, ty + d, d, h];
    case "front":
      return [tx + d, ty + d, w, h];
    case "left":
      return [tx + d + w, ty + d, d, h];
    case "back":
      return [tx + d + w + d, ty + d, w, h];
  }
}

/**
 * Map an atlas texel to its mirror across the model's center plane.
 * Returns null for texels outside every skin face (unused atlas areas).
 */
export function mirrorSkinTexel(
  u: number,
  v: number,
  { scale, slim }: MirrorOptions,
): { u: number; v: number } | null {
  const boxes = getBoxes(scale, slim);
  for (const box of boxes) {
    for (const face of FACES) {
      const [rx, ry, rw, rh] = faceRect(box, face);
      if (u < rx || u >= rx + rw || v < ry || v >= ry + rh) continue;
      const target = box.pair === undefined ? box : boxes[box.pair];
      const [mx, my] = faceRect(target, MIRROR_FACE[face]);
      return { u: mx + (rw - 1 - (u - rx)), v: my + (v - ry) };
    }
  }
  return null;
}

// Front↔back flip = reflection across the model's front-back center plane
// (z → -z), the depth-axis counterpart of the sagittal mirror above. Front and
// back faces of each box swap; left/right/top/bottom stay on their own box.
const FLIP_FB_FACE: Record<FaceName, FaceName> = {
  top: "top",
  bottom: "bottom",
  front: "back",
  back: "front",
  left: "left",
  right: "right",
};

/**
 * Map an atlas texel to its front↔back counterpart across the model's depth
 * center plane. Derived the same way as {@link mirrorSkinTexel}: reflecting
 * z→-z reverses the horizontal (u) axis of every side face (front/back/left/
 * right, whose atlas-horizontal tracks z) and the vertical (v) axis of the
 * top/bottom faces (whose atlas-vertical tracks z), while limbs stay on their
 * own box (unlike the left↔right mirror, this reflection preserves x).
 * Returns null for texels outside every skin face.
 */
export function flipSkinTexelFrontBack(
  u: number,
  v: number,
  { scale, slim }: MirrorOptions,
): { u: number; v: number } | null {
  const boxes = getBoxes(scale, slim);
  for (const box of boxes) {
    for (const face of FACES) {
      const [rx, ry, rw, rh] = faceRect(box, face);
      if (u < rx || u >= rx + rw || v < ry || v >= ry + rh) continue;
      const [mx, my] = faceRect(box, FLIP_FB_FACE[face]);
      const vertical = face === "top" || face === "bottom";
      return vertical
        ? { u: mx + (u - rx), v: my + (rh - 1 - (v - ry)) }
        : { u: mx + (rw - 1 - (u - rx)), v: my + (v - ry) };
    }
  }
  return null;
}
