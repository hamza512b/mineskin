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
}
