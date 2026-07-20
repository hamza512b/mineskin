import { V3, normalize, cross, scaleVector, addV3, subtractV3 } from "./maths";

export function createShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader | undefined {
  const shader = gl.createShader(type);
  if (!shader) return;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) return shader;
  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
  return;
}
export function createProgram(
  gl: WebGL2RenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader,
): WebGLProgram | undefined {
  const program = gl.createProgram();
  if (!program) return;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) return program;
  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
  return;
}
export function resizeCanvasToDisplaySize(
  canvas: HTMLCanvasElement,
  multiplier?: number,
) {
  multiplier = multiplier || 1;
  const width = (canvas.clientWidth * multiplier) | 0;
  const height = (canvas.clientHeight * multiplier) | 0;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    return true;
  }
  return false;
}
export function radToDeg(r: number) {
  return (r * 180) / Math.PI;
}
export function degToRad(d: number) {
  return (d * Math.PI) / 180;
}
export function initShaders(
  gl: WebGL2RenderingContext,
  vertexShaderSrc: string,
  fragmentShaderSrc: string,
) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSrc);
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSrc,
  );
  if (!vertexShader || !fragmentShader) throw new Error("Shader Error");
  return createProgram(gl, vertexShader, fragmentShader);
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  hex = hex.replace("#", "");
  return {
    r: parseInt(hex.substring(0, 2), 16) / 255,
    g: parseInt(hex.substring(2, 4), 16) / 255,
    b: parseInt(hex.substring(4, 6), 16) / 255,
  };
}

/**
 * Converts an ImageData object to a data URL for preview purposes
 * @param imageData The ImageData object to convert
 * @param type The MIME type of the image (default: 'image/png')
 * @param quality The image quality for JPEG images (between 0 and 1)
 * @returns A data URL representing the image
 */
export function imageDataToDataURL(
  imageData: ImageData,
  type: string = "image/png",
  quality?: number,
): string {
  // Create a temporary canvas to draw the image data
  const canvas = document.createElement("canvas");
  canvas.width = imageData.width;
  canvas.height = imageData.height;

  // Get the 2D context and put the image data
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  ctx.putImageData(imageData, 0, 0);

  // Convert to data URL
  return canvas.toDataURL(type, quality);
} /**
 * Creates a 3D "tube" representation of a line using triangles, visible from all angles.
 * @param v1 Given start point in 3D space.
 * @param v2 Ending point in 3D space.
 * @param lineWidth Thickness of the line (default: 0.01).
 * @returns Object with vertices, normals, and UVs for rendering.
 */
export function createTriangleLine(
  v1: V3,
  v2: V3,
  lineWidth: number = 0.01,
): { vertices: number[]; normals: number[]; uvs: number[] } {
  const direction: V3 = [v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]];
  const length = Math.sqrt(
    direction[0] * direction[0] +
      direction[1] * direction[1] +
      direction[2] * direction[2],
  );

  if (length === 0) {
    return { vertices: [], normals: [], uvs: [] };
  }

  // Normalize direction
  const normalizedDir: V3 = normalize(direction);

  // Create two perpendicular vectors to make the line visible from all angles
  let perp: V3;

  // Choose initial perpendicular vector
  if (Math.abs(normalizedDir[0]) < 0.9) {
    perp = [1, 0, 0];
  } else {
    perp = [0, 1, 0];
  }

  const cross1: V3 = cross(normalizedDir, perp);

  const normalizedCross1: V3 = normalize(cross1);

  // Second perpendicular (cross of direction and first perpendicular)
  const cross2: V3 = cross(normalizedDir, normalizedCross1);

  const normalizedCross2: V3 = normalize(cross2);

  const halfWidth = lineWidth * 0.5;

  // Create 4 vertices around the line using both perpendicular vectors
  const offset1: V3 = scaleVector(normalizedCross1, halfWidth);
  const offset2: V3 = scaleVector(normalizedCross2, halfWidth);

  // Create vertices for both ends of the line
  const v1_p1: V3 = addV3(v1, offset1);
  const v1_n1: V3 = subtractV3(v1, offset1);
  const v1_p2: V3 = addV3(v1, offset2);
  const v1_n2: V3 = subtractV3(v1, offset2);

  const v2_p1: V3 = addV3(v2, offset1);
  const v2_n1: V3 = subtractV3(v2, offset1);
  const v2_p2: V3 = addV3(v2, offset2);
  const v2_n2: V3 = subtractV3(v2, offset2);

  // Create 4 triangular faces to form a rectangular tube
  const vertices = [
    // Face 1: +perp1 side
    ...v1_p1,
    ...v2_p1,
    ...v1_p2,
    ...v2_p1,
    ...v2_p2,
    ...v1_p2,

    // Face 2: -perp1 side
    ...v1_n1,
    ...v1_n2,
    ...v2_n1,
    ...v2_n1,
    ...v1_n2,
    ...v2_n2,

    // Face 3: +perp2 side
    ...v1_p2,
    ...v2_p2,
    ...v1_n1,
    ...v2_p2,
    ...v2_n1,
    ...v1_n1,

    // Face 4: -perp2 side
    ...v1_p1,
    ...v1_n2,
    ...v2_p1,
    ...v2_p1,
    ...v1_n2,
    ...v2_n2,
  ];

  // Create normals for each face
  const normals = [
    // Face 1 normals
    ...normalizedCross1,
    ...normalizedCross1,
    ...normalizedCross1,
    ...normalizedCross1,
    ...normalizedCross1,
    ...normalizedCross1,

    // Face 2 normals
    ...([
      -normalizedCross1[0],
      -normalizedCross1[1],
      -normalizedCross1[2],
    ] as V3),
    ...([
      -normalizedCross1[0],
      -normalizedCross1[1],
      -normalizedCross1[2],
    ] as V3),
    ...([
      -normalizedCross1[0],
      -normalizedCross1[1],
      -normalizedCross1[2],
    ] as V3),
    ...([
      -normalizedCross1[0],
      -normalizedCross1[1],
      -normalizedCross1[2],
    ] as V3),
    ...([
      -normalizedCross1[0],
      -normalizedCross1[1],
      -normalizedCross1[2],
    ] as V3),
    ...([
      -normalizedCross1[0],
      -normalizedCross1[1],
      -normalizedCross1[2],
    ] as V3),

    // Face 3 normals
    ...normalizedCross2,
    ...normalizedCross2,
    ...normalizedCross2,
    ...normalizedCross2,
    ...normalizedCross2,
    ...normalizedCross2,

    // Face 4 normals
    ...([
      -normalizedCross2[0],
      -normalizedCross2[1],
      -normalizedCross2[2],
    ] as V3),
    ...([
      -normalizedCross2[0],
      -normalizedCross2[1],
      -normalizedCross2[2],
    ] as V3),
    ...([
      -normalizedCross2[0],
      -normalizedCross2[1],
      -normalizedCross2[2],
    ] as V3),
    ...([
      -normalizedCross2[0],
      -normalizedCross2[1],
      -normalizedCross2[2],
    ] as V3),
    ...([
      -normalizedCross2[0],
      -normalizedCross2[1],
      -normalizedCross2[2],
    ] as V3),
    ...([
      -normalizedCross2[0],
      -normalizedCross2[1],
      -normalizedCross2[2],
    ] as V3),
  ];

  // Simple UV coordinates for all faces
  const uvs = [
    // Face 1 UVs
    0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1,
    // Face 2 UVs
    0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1,
    // Face 3 UVs
    0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1,
    // Face 4 UVs
    0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1,
  ];

  return { vertices, normals, uvs };
}

/**
 * Same geometry as createTriangleLine, but writes directly into the supplied
 * arrays — no intermediate V3 allocations, no spread pushes. Used by the
 * mesh-compile hot path where this gets called tens of thousands of times.
 */
export function appendTriangleLine(
  v1x: number,
  v1y: number,
  v1z: number,
  v2x: number,
  v2y: number,
  v2z: number,
  lineWidth: number,
  outVertices: number[],
  outNormals: number[],
  outUVs: number[],
): void {
  const dx = v2x - v1x;
  const dy = v2y - v1y;
  const dz = v2z - v1z;
  const lenSq = dx * dx + dy * dy + dz * dz;
  if (lenSq === 0) return;
  const invLen = 1 / Math.sqrt(lenSq);
  const ndx = dx * invLen;
  const ndy = dy * invLen;
  const ndz = dz * invLen;

  // Pick an initial perpendicular axis, mirroring createTriangleLine.
  let px: number, py: number, pz: number;
  if (Math.abs(ndx) < 0.9) {
    px = 1;
    py = 0;
    pz = 0;
  } else {
    px = 0;
    py = 1;
    pz = 0;
  }

  // cross1 = normalize(dir × perp)
  let c1x = ndy * pz - ndz * py;
  let c1y = ndz * px - ndx * pz;
  let c1z = ndx * py - ndy * px;
  const c1LenSq = c1x * c1x + c1y * c1y + c1z * c1z;
  if (c1LenSq === 0) return;
  const invC1 = 1 / Math.sqrt(c1LenSq);
  c1x *= invC1;
  c1y *= invC1;
  c1z *= invC1;

  // cross2 = normalize(dir × cross1)
  let c2x = ndy * c1z - ndz * c1y;
  let c2y = ndz * c1x - ndx * c1z;
  let c2z = ndx * c1y - ndy * c1x;
  const c2LenSq = c2x * c2x + c2y * c2y + c2z * c2z;
  if (c2LenSq === 0) return;
  const invC2 = 1 / Math.sqrt(c2LenSq);
  c2x *= invC2;
  c2y *= invC2;
  c2z *= invC2;

  const h = lineWidth * 0.5;
  const o1x = c1x * h;
  const o1y = c1y * h;
  const o1z = c1z * h;
  const o2x = c2x * h;
  const o2y = c2y * h;
  const o2z = c2z * h;

  const v1p1x = v1x + o1x, v1p1y = v1y + o1y, v1p1z = v1z + o1z;
  const v1n1x = v1x - o1x, v1n1y = v1y - o1y, v1n1z = v1z - o1z;
  const v1p2x = v1x + o2x, v1p2y = v1y + o2y, v1p2z = v1z + o2z;
  const v1n2x = v1x - o2x, v1n2y = v1y - o2y, v1n2z = v1z - o2z;

  const v2p1x = v2x + o1x, v2p1y = v2y + o1y, v2p1z = v2z + o1z;
  const v2n1x = v2x - o1x, v2n1y = v2y - o1y, v2n1z = v2z - o1z;
  const v2p2x = v2x + o2x, v2p2y = v2y + o2y, v2p2z = v2z + o2z;
  const v2n2x = v2x - o2x, v2n2y = v2y - o2y, v2n2z = v2z - o2z;

  outVertices.push(
    // Face 1: +perp1 side
    v1p1x, v1p1y, v1p1z,
    v2p1x, v2p1y, v2p1z,
    v1p2x, v1p2y, v1p2z,
    v2p1x, v2p1y, v2p1z,
    v2p2x, v2p2y, v2p2z,
    v1p2x, v1p2y, v1p2z,
    // Face 2: -perp1 side
    v1n1x, v1n1y, v1n1z,
    v1n2x, v1n2y, v1n2z,
    v2n1x, v2n1y, v2n1z,
    v2n1x, v2n1y, v2n1z,
    v1n2x, v1n2y, v1n2z,
    v2n2x, v2n2y, v2n2z,
    // Face 3: +perp2 side
    v1p2x, v1p2y, v1p2z,
    v2p2x, v2p2y, v2p2z,
    v1n1x, v1n1y, v1n1z,
    v2p2x, v2p2y, v2p2z,
    v2n1x, v2n1y, v2n1z,
    v1n1x, v1n1y, v1n1z,
    // Face 4: -perp2 side
    v1p1x, v1p1y, v1p1z,
    v1n2x, v1n2y, v1n2z,
    v2p1x, v2p1y, v2p1z,
    v2p1x, v2p1y, v2p1z,
    v1n2x, v1n2y, v1n2z,
    v2n2x, v2n2y, v2n2z,
  );

  const nc1x = -c1x, nc1y = -c1y, nc1z = -c1z;
  const nc2x = -c2x, nc2y = -c2y, nc2z = -c2z;
  outNormals.push(
    c1x, c1y, c1z, c1x, c1y, c1z, c1x, c1y, c1z,
    c1x, c1y, c1z, c1x, c1y, c1z, c1x, c1y, c1z,
    nc1x, nc1y, nc1z, nc1x, nc1y, nc1z, nc1x, nc1y, nc1z,
    nc1x, nc1y, nc1z, nc1x, nc1y, nc1z, nc1x, nc1y, nc1z,
    c2x, c2y, c2z, c2x, c2y, c2z, c2x, c2y, c2z,
    c2x, c2y, c2z, c2x, c2y, c2z, c2x, c2y, c2z,
    nc2x, nc2y, nc2z, nc2x, nc2y, nc2z, nc2x, nc2y, nc2z,
    nc2x, nc2y, nc2z, nc2x, nc2y, nc2z, nc2x, nc2y, nc2z,
  );

  outUVs.push(
    0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1,
    0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1,
    0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1,
    0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1,
  );
}
