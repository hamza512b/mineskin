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
}/**
 * Creates a 3D "tube" representation of a line using triangles, visible from all angles.
 * @param v1 Given start point in 3D space.
 * @param v2 Ending point in 3D space.
 * @param lineWidth Thickness of the line (default: 0.01).
 * @returns Object with vertices, normals, and UVs for rendering.
 */
export function createTriangleLine(
  v1: V3,
  v2: V3,
  lineWidth: number = 0.01): { vertices: number[]; normals: number[]; uvs: number[]; } {
  const direction: V3 = [v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]];
  const length = Math.sqrt(
    direction[0] * direction[0] +
    direction[1] * direction[1] +
    direction[2] * direction[2]
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

