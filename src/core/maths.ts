// prettier-ignore

/**
 * Matrix and Vector Utilities (Column–Major Layout)
 * --------------------------------------------------
 * This module defines 4×4 (M44) and 3×3 (M33) matrices along with 3D (V3) and 2D (V2) vectors.
 * All matrices are stored in column–major order.
 */

/*===========================================================================
  Type Definitions
============================================================================*/
export type M44 = [
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
  number, number, number, number
];

export type M33 = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

export type V3 = [number, number, number];
export type V2 = [number, number];

/*===========================================================================
    Vector Operations
  ============================================================================*/

export function multiplyV4(m: number[], v: number[]): number[] {
  const res = [];
  for (let i = 0; i < 4; i++) {
    let sum = 0;
    for (let j = 0; j < 4; j++) {
      sum += m[j * 4 + i] * v[j];
    }
    res.push(sum);
  }
  return res;
}

/** Scales a vector by a scalar factor. */
export function scaleVector<T extends number[]>(v: T, k: number): T {
  return v.map((x) => x * k) as T;
}

/** Subtracts vector b from vector a. */
export function subtractV3(a: V3, b: V3): V3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

/** Adds two 3D vectors. */
export function addV3(a: V3, b: V3): V3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

/** Computes the cross product of two 3D vectors. */
export function cross(a: V3, b: V3): V3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

/** Computes the dot product of two 3D vectors. */
export function dot(a: V3, b: V3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

/** Normalizes a 3D vector. Returns [0,0,0] if the vector is too short. */
export function normalize(v: V3): V3 {
  const len = Math.hypot(v[0], v[1], v[2]);
  return len > 0.00001 ? [v[0] / len, v[1] / len, v[2] / len] : [0, 0, 0];
}

/*===========================================================================
    3×3 Matrix Operations (M33)
  ============================================================================*/

/** Returns a 3×3 identity matrix. */
export function identityM33(): M33 {
  return [1, 0, 0, 0, 1, 0, 0, 0, 1];
}

/** Returns a 3×3 rotation matrix around the X axis. */
export function rotateXM33(theta: number): M33 {
  const c = Math.cos(theta),
    s = Math.sin(theta);
  return [1, 0, 0, 0, c, -s, 0, s, c];
}

/** Returns a 3×3 rotation matrix around the Y axis. */
export function rotateYM33(theta: number): M33 {
  const c = Math.cos(theta),
    s = Math.sin(theta);
  return [c, 0, s, 0, 1, 0, -s, 0, c];
}

/** Returns a 3×3 rotation matrix around the Z axis. */
export function rotateZM33(theta: number): M33 {
  const c = Math.cos(theta),
    s = Math.sin(theta);
  return [c, -s, 0, s, c, 0, 0, 0, 1];
}

/**
 * Multiplies two or more 3×3 matrices.
 * The matrices are multiplied in the order given.
 * (i.e. multiplyM33(A, B, C) returns A · B · C)
 */
export function multiplyM33(...matrices: [M33, M33, ...M33[]]): M33 {
  const multiply = (a: M33, b: M33): M33 => {
    return [
      a[0] * b[0] + a[3] * b[1] + a[6] * b[2],
      a[1] * b[0] + a[4] * b[1] + a[7] * b[2],
      a[2] * b[0] + a[5] * b[1] + a[8] * b[2],

      a[0] * b[3] + a[3] * b[4] + a[6] * b[5],
      a[1] * b[3] + a[4] * b[4] + a[7] * b[5],
      a[2] * b[3] + a[5] * b[4] + a[8] * b[5],

      a[0] * b[6] + a[3] * b[7] + a[6] * b[8],
      a[1] * b[6] + a[4] * b[7] + a[7] * b[8],
      a[2] * b[6] + a[5] * b[7] + a[8] * b[8],
    ];
  };
  return matrices.reduce((acc, m) => multiply(acc, m), identityM33());
}

/** Multiplies a 3×3 matrix with a 3D vector. */
export function multiplyM3V3(matrix: M33, vector: V3): V3 {
  return [
    matrix[0] * vector[0] + matrix[3] * vector[1] + matrix[6] * vector[2],
    matrix[1] * vector[0] + matrix[4] * vector[1] + matrix[7] * vector[2],
    matrix[2] * vector[0] + matrix[5] * vector[1] + matrix[8] * vector[2],
  ];
}

/** Returns the transpose of a 3×3 matrix. */
export function transposeM33(m: M33): M33 {
  return [m[0], m[1], m[2], m[3], m[4], m[5], m[6], m[7], m[8]];
}

/** Returns a composite 3×3 rotation matrix from Euler angles (α, β, γ). */
export function rotateM33(alpha: number, beta: number, gamma: number): M33 {
  // The multiplication order here is: Rz · Rx · Ry
  return multiplyM33(rotateZM33(gamma), rotateXM33(alpha), rotateYM33(beta));
}

/*===========================================================================
    4×4 Matrix Operations (M44)
  ============================================================================*/

/** Returns a 4×4 identity matrix. */
export function identityM44(): M44 {
  return [
    1,
    0,
    0,
    0, // Column 0
    0,
    1,
    0,
    0, // Column 1
    0,
    0,
    1,
    0, // Column 2
    0,
    0,
    0,
    1, // Column 3
  ];
}

/**
 * Returns a translation matrix.
 * For a column–major 4×4 matrix, the translation components appear in indices 12–14.
 */
export function translateM44(tx: number, ty: number, tz: number): M44 {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, tx, ty, tz, 1];
}

/** Returns a scaling matrix. */
export function scaleM44(sx: number, sy: number, sz: number): M44 {
  return [sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1];
}

/** Returns a 4×4 rotation matrix about the X axis. */
export function rotateXM44(theta: number): M44 {
  const c = Math.cos(theta),
    s = Math.sin(theta);
  // Column–major: first column is [1,0,0,0];
  // second column: [0, c, s, 0]; third: [0, -s, c, 0]
  return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1];
}

/** Returns a 4×4 rotation matrix about the Y axis. */
export function rotateYM44(theta: number): M44 {
  const c = Math.cos(theta),
    s = Math.sin(theta);
  return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1];
}

/** Returns a 4×4 rotation matrix about the Z axis. */
export function rotateZM44(theta: number): M44 {
  const c = Math.cos(theta),
    s = Math.sin(theta);
  return [c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}

/**
 * Returns a composite 4×4 rotation matrix from Euler angles (α, β, γ).
 * The multiplication order is: Rz · Ry · Rx
 */
export function rotateM44(alpha: number, beta: number, gamma: number): M44 {
  return multiplyM44(rotateZM44(gamma), rotateYM44(beta), rotateXM44(alpha));
}

/**
 * Multiplies two or more 4×4 matrices.
 * The matrices are multiplied in the order given (i.e. multiplyM44(A, B, C) returns A · B · C).
 */
export function multiplyM44(...matrices: [M44, M44, ...M44[]]): M44 {
  const multiply = (a: M44, b: M44): M44 => {
    return [
      a[0] * b[0] + a[4] * b[1] + a[8] * b[2] + a[12] * b[3],
      a[1] * b[0] + a[5] * b[1] + a[9] * b[2] + a[13] * b[3],
      a[2] * b[0] + a[6] * b[1] + a[10] * b[2] + a[14] * b[3],
      a[3] * b[0] + a[7] * b[1] + a[11] * b[2] + a[15] * b[3],

      a[0] * b[4] + a[4] * b[5] + a[8] * b[6] + a[12] * b[7],
      a[1] * b[4] + a[5] * b[5] + a[9] * b[6] + a[13] * b[7],
      a[2] * b[4] + a[6] * b[5] + a[10] * b[6] + a[14] * b[7],
      a[3] * b[4] + a[7] * b[5] + a[11] * b[6] + a[15] * b[7],

      a[0] * b[8] + a[4] * b[9] + a[8] * b[10] + a[12] * b[11],
      a[1] * b[8] + a[5] * b[9] + a[9] * b[10] + a[13] * b[11],
      a[2] * b[8] + a[6] * b[9] + a[10] * b[10] + a[14] * b[11],
      a[3] * b[8] + a[7] * b[9] + a[11] * b[10] + a[15] * b[11],

      a[0] * b[12] + a[4] * b[13] + a[8] * b[14] + a[12] * b[15],
      a[1] * b[12] + a[5] * b[13] + a[9] * b[14] + a[13] * b[15],
      a[2] * b[12] + a[6] * b[13] + a[10] * b[14] + a[14] * b[15],
      a[3] * b[12] + a[7] * b[13] + a[11] * b[14] + a[15] * b[15],
    ];
  };
  return matrices.reduce((acc, m) => multiply(acc, m), identityM44());
}

/**
 * Multiplies a 4×4 matrix with a 3D vector (with an implicit w = 1)
 * and performs the homogeneous divide.
 */
export function multiplyM4V3(mat: M44, vec: V3): V3 {
  const x = mat[0] * vec[0] + mat[4] * vec[1] + mat[8] * vec[2] + mat[12];
  const y = mat[1] * vec[0] + mat[5] * vec[1] + mat[9] * vec[2] + mat[13];
  const z = mat[2] * vec[0] + mat[6] * vec[1] + mat[10] * vec[2] + mat[14];
  const w = mat[3] * vec[0] + mat[7] * vec[1] + mat[11] * vec[2] + mat[15];
  if (w !== 0 && w !== 1) {
    const invW = 1 / w;
    return [x * invW, y * invW, z * invW];
  }
  return [x, y, z];
}

/** Returns the transpose of a 4×4 matrix. */
export function transposeM44(m: M44): M44 {
  return [
    m[0],
    m[1],
    m[2],
    m[3],
    m[4],
    m[5],
    m[6],
    m[7],
    m[8],
    m[9],
    m[10],
    m[11],
    m[12],
    m[13],
    m[14],
    m[15],
  ];
}

/**
 * Returns the inverse of a 4×4 matrix.
 * (Based on a common implementation; throws an error if the matrix is singular.)
 */
export function inverse(m: M44): M44 {
  const a00 = m[0],
    a01 = m[1],
    a02 = m[2],
    a03 = m[3],
    a10 = m[4],
    a11 = m[5],
    a12 = m[6],
    a13 = m[7],
    a20 = m[8],
    a21 = m[9],
    a22 = m[10],
    a23 = m[11],
    a30 = m[12],
    a31 = m[13],
    a32 = m[14],
    a33 = m[15];

  const b00 = a00 * a11 - a01 * a10;
  const b01 = a00 * a12 - a02 * a10;
  const b02 = a00 * a13 - a03 * a10;
  const b03 = a01 * a12 - a02 * a11;
  const b04 = a01 * a13 - a03 * a11;
  const b05 = a02 * a13 - a03 * a12;
  const b06 = a20 * a31 - a21 * a30;
  const b07 = a20 * a32 - a22 * a30;
  const b08 = a20 * a33 - a23 * a30;
  const b09 = a21 * a32 - a22 * a31;
  const b10 = a21 * a33 - a23 * a31;
  const b11 = a22 * a33 - a23 * a32;

  const det =
    b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
  if (!det) {
    throw new Error("Matrix is not invertible");
  }
  const invDet = 1.0 / det;

  return [
    (a11 * b11 - a12 * b10 + a13 * b09) * invDet,
    (-a01 * b11 + a02 * b10 - a03 * b09) * invDet,
    (a31 * b05 - a32 * b04 + a33 * b03) * invDet,
    (-a21 * b05 + a22 * b04 - a23 * b03) * invDet,

    (-a10 * b11 + a12 * b08 - a13 * b07) * invDet,
    (a00 * b11 - a02 * b08 + a03 * b07) * invDet,
    (-a30 * b05 + a32 * b02 - a33 * b01) * invDet,
    (a20 * b05 - a22 * b02 + a23 * b01) * invDet,

    (a10 * b10 - a11 * b08 + a13 * b06) * invDet,
    (-a00 * b10 + a01 * b08 - a03 * b06) * invDet,
    (a30 * b04 - a31 * b02 + a33 * b00) * invDet,
    (-a20 * b04 + a21 * b02 - a23 * b00) * invDet,

    (-a10 * b09 + a11 * b07 - a12 * b06) * invDet,
    (a00 * b09 - a01 * b07 + a02 * b06) * invDet,
    (-a30 * b03 + a31 * b01 - a32 * b00) * invDet,
    (a20 * b03 - a21 * b01 + a22 * b00) * invDet,
  ];
}

/**
 * Creates a perspective projection matrix.
 * Uses the standard perspective projection (column–major) with:
 *    f = 1 / tan(fov/2)
 * and maps the z–range [zNear, zFar] into [–1, 1].
 *
 * @param ratio  - Aspect ratio (width/height)
 * @param fov    - Field-of-view (in radians)
 * @param zNear  - Near clipping plane distance
 * @param zFar   - Far clipping plane distance
 */
export function project(
  ratio: number,
  fov: number,
  zNear: number,
  zFar: number,
): M44 {
  const f = 1.0 / Math.tan(fov / 2);
  return [
    f / ratio,
    0,
    0,
    0,
    0,
    f,
    0,
    0,
    0,
    0,
    (zFar + zNear) / (zNear - zFar),
    -1,
    0,
    0,
    (2 * zFar * zNear) / (zNear - zFar),
    0,
  ];
}

export function ortho(
  left: number,
  right: number,
  bottom: number,
  top: number,
  near: number,
  far: number,
): M44 {
  const rl = right - left,
    tb = top - bottom,
    fn = far - near;
  return [
    2 / rl,
    0,
    0,
    0,
    0,
    2 / tb,
    0,
    0,
    0,
    0,
    -2 / fn,
    0,
    -(right + left) / rl,
    -(top + bottom) / tb,
    -(far + near) / fn,
    1,
  ];
}

/**
 * Returns the bias matrix used for shadow mapping.
 * This matrix transforms from normalized device coordinates ([-1,1]) to texture coordinates ([0,1]).
 */
export const biasMatrix: M44 = [
  1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0,
  1.0,
];

/**
 * Creates a view (lookAt) matrix.
 * This is the standard gluLookAt implementation (column–major).
 *
 * @param eye    - The camera position.
 * @param target - The point the camera is looking at.
 * @param up     - The up direction.
 */
export function lookAt(eye: V3, target: V3, up: V3): M44 {
  const f = normalize(subtractV3(target, eye));
  const s = normalize(cross(f, up));
  const u = cross(s, f);

  return [
    s[0],
    u[0],
    -f[0],
    0,
    s[1],
    u[1],
    -f[1],
    0,
    s[2],
    u[2],
    -f[2],
    0,
    -dot(s, eye),
    -dot(u, eye),
    dot(f, eye),
    1,
  ];
}
