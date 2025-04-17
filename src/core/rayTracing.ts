import { sortBy } from "lodash";
import {
  inverse,
  multiplyM44,
  multiplyM4V3,
  multiplyV4,
  subtractV3,
  dot,
  cross,
  normalize,
  V3,
  M44,
} from "./maths";
import { Mesh, MeshGroup } from "./mesh";

type Ray = { origin: V3; direction: V3 };

/** Compute a ray in world space from screen coordinates.
 *  mouseX, mouseY: mouse coordinates in canvas pixels.
 *  projMatrix: your projection matrix.
 *  viewMatrix: your view matrix.
 */
export function computeRay(
  mouseX: number,
  mouseY: number,
  width: number,
  height: number,
  projMatrix: M44,
  viewMatrix: M44,
  globalTransform: M44,
): Ray {
  // Convert mouse position to normalized device coordinates (NDC)
  const ndcX = (mouseX / width) * 2 - 1;
  const ndcY = 1 - (mouseY / height) * 2; // invert y

  // In clip space, set near and far points
  const nearPointClip = [ndcX, ndcY, -1, 1];
  const farPointClip = [ndcX, ndcY, 1, 1];

  // Compute the inverse of the combined projection * view matrix * global transform matrix.
  const projView = multiplyM44(projMatrix, viewMatrix, globalTransform);

  // We need to inverse the matrix because we want to transform the clip space points to world space.
  // We usually did the opposite in the rendering step.
  const invProjView = inverse(projView);

  // Transform clip space points to world space.
  const nearPointWorld4 = multiplyV4(invProjView, nearPointClip);
  const farPointWorld4 = multiplyV4(invProjView, farPointClip);

  // Perform perspective divide.
  const nearPointWorld = nearPointWorld4.map((v, i) =>
    i < 3 ? v / nearPointWorld4[3] : 1,
  ) as V3;
  const farPointWorld = farPointWorld4.map((v, i) =>
    i < 3 ? v / farPointWorld4[3] : 1,
  ) as V3;

  // The ray originates at the near point.
  const origin = nearPointWorld;
  // Direction is from near to far.
  const direction = normalize([
    farPointWorld[0] - nearPointWorld[0],
    farPointWorld[1] - nearPointWorld[1],
    farPointWorld[2] - nearPointWorld[2],
  ]);
  return { origin, direction };
}

/** Standard Möller–Trumbore ray–triangle intersection.
 *  Returns the distance t along the ray if hit; otherwise, null.
 */
export function rayTriangleIntersect(
  orig: V3,
  dir: V3,
  v0: V3,
  v1: V3,
  v2: V3,
): number | null {
  const EPSILON = 1e-6;
  const edge1 = subtractV3(v1, v0);
  const edge2 = subtractV3(v2, v0);
  const h = cross(dir, edge2);
  const a = dot(edge1, h);
  if (Math.abs(a) < EPSILON) return null; // Parallel
  const f = 1 / a;
  const s = subtractV3(orig, v0);
  const u = f * dot(s, h);
  if (u < 0 || u > 1) return null;
  const q = cross(s, edge1);
  const v = f * dot(dir, q);
  if (v < 0 || u + v > 1) return null;
  const t = f * dot(edge2, q);
  return t > EPSILON ? t : null;
}

/** Test ray intersection against a single mesh.
 *  The mesh is assumed to be a plane (with triangles stored in its vertices array).
 *  Returns the smallest positive intersection distance or null.
 */
export function rayIntersectsMesh(mesh: Mesh, ray: Ray): number | null {
  const localTransform = mesh.getTransformMatrix();

  const verts = mesh.vertices; // flat array [x0, y0, z0, x1, y1, z1, ...]
  let tMin = Infinity;
  let hit = false;
  // Each triangle has 3 vertices (9 numbers)
  for (let i = 0; i < verts.length; i += 9) {
    const v0 = multiplyM4V3(localTransform, [
      verts[i],
      verts[i + 1],
      verts[i + 2],
    ]);
    const v1 = multiplyM4V3(localTransform, [
      verts[i + 3],
      verts[i + 4],
      verts[i + 5],
    ]);
    const v2 = multiplyM4V3(localTransform, [
      verts[i + 6],
      verts[i + 7],
      verts[i + 8],
    ]);
    const t = rayTriangleIntersect(ray.origin, ray.direction, v0, v1, v2);
    if (t !== null && t < tMin) {
      tMin = t;
      hit = true;
    }
  }
  return hit ? tMin : null;
}

/** Test ray intersection against an axis-aligned bounding box.
 *  Returns the smallest positive intersection distance or null.
 */
export function rayBoxIntersect(
  ray: Ray,
  box: { min: V3; max: V3 },
): number | null {
  const invDir = [
    1 / ray.direction[0],
    1 / ray.direction[1],
    1 / ray.direction[2],
  ] as V3;

  const t1 = (box.min[0] - ray.origin[0]) * invDir[0];
  const t2 = (box.max[0] - ray.origin[0]) * invDir[0];
  const t3 = (box.min[1] - ray.origin[1]) * invDir[1];
  const t4 = (box.max[1] - ray.origin[1]) * invDir[1];
  const t5 = (box.min[2] - ray.origin[2]) * invDir[2];
  const t6 = (box.max[2] - ray.origin[2]) * invDir[2];

  const tmin = Math.max(
    Math.max(Math.min(t1, t2), Math.min(t3, t4)),
    Math.min(t5, t6),
  );
  const tmax = Math.min(
    Math.min(Math.max(t1, t2), Math.max(t3, t4)),
    Math.max(t5, t6),
  );

  // If tmax < 0, ray is intersecting AABB, but the whole AABB is behind us
  if (tmax < 0) {
    return null;
  }

  // If tmin > tmax, ray doesn't intersect AABB
  if (tmin > tmax) {
    return null;
  }

  return tmin;
}

/** Recursively search an active MeshGroup for the mesh intersected by the ray.
 *  Returns an object containing the mesh and the intersection distance.
 */
export function getMeshsAtRay(
  group: MeshGroup,
  ray: Ray,
): { mesh: Mesh; t: number }[] {
  const hits: { mesh: Mesh; t: number }[] = [];

  // First check if ray intersects with the group's bounding box
  const boundingBox = group.calculateBoundingBox();
  const boxIntersection = rayBoxIntersect(ray, boundingBox);
  if (boxIntersection === null) {
    return hits; // No intersection with bounding box, return empty array
  }

  for (const child of group.getMeshes()) {
    if (child instanceof MeshGroup) {
      const candidate = getMeshsAtRay(child, ray);
      if (candidate) {
        hits.push(...candidate);
      }
    } else if (child instanceof Mesh) {
      const t = rayIntersectsMesh(child, ray);
      if (t !== null) {
        hits.push({ mesh: child, t });
      }
    }
  }
  return hits;
}

export function getMeshAtRay(
  group: MeshGroup,
  ray: { origin: V3; direction: V3 },
) {
  const hits = getMeshsAtRay(group, ray);
  return sortBy(hits, (hit) => hit.t).find((hit) => hit.mesh.visible);
}
