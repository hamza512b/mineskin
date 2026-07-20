const mainVertexShaderSource = `
attribute vec4 a_position;
attribute vec2 a_texcoord;
attribute vec3 a_normal;

uniform mat4 u_matrix;

varying vec2 v_texcoord;
varying vec3 v_normal;
varying vec4 v_position;

void main() {
  gl_Position = u_matrix * a_position;
  v_texcoord = a_texcoord;
  v_normal = a_normal;
  v_position = a_position;
}
`;

const buildMainFragmentShaderSource = (hasDerivatives: boolean) => `${
  hasDerivatives ? "#extension GL_OES_standard_derivatives : enable\n" : ""
}precision mediump float;
${
  hasDerivatives
    ? "#define MS_FWIDTH(x) fwidth(x)"
    : "#define MS_FWIDTH(x) (x - x + 0.005)"
}

varying vec2 v_texcoord;
varying vec3 v_normal;
varying vec4 v_position;

uniform vec3 u_cameraPosition;
uniform vec3 u_diffuseLightPosition;
uniform float u_ambientLight;
uniform float u_specularStrength;
uniform float u_diffuseStrength;
uniform sampler2D u_skinTexture;
uniform bool u_highlight;
uniform vec4 u_tint;
uniform vec3 u_floorColor;
uniform float u_floorDiffuse;
uniform float u_floorSpecular;
uniform float u_directionalLightIntensity;
uniform bool u_gridLines;
uniform vec3 u_gridColor;
uniform float u_gridAlpha;
uniform bool u_gridFloor;
uniform float u_gridCell;
uniform vec3 u_gridColorAxis;
uniform vec3 u_gridColorAxis2;
uniform float u_gridFadeStart;
uniform float u_gridFadeEnd;

float gridMask(vec2 p, float cell) {
  vec2 c = p / cell;
  vec2 d = max(MS_FWIDTH(c), vec2(1e-5));
  vec2 g = abs(fract(c - 0.5) - 0.5) / d;
  return 1.0 - clamp(min(g.x, g.y) - 0.5, 0.0, 1.0);
}

void main() {
  if (u_gridFloor) {
    vec2 P = v_position.xz;
    float line = gridMask(P, u_gridCell);
    float axd = max(MS_FWIDTH(P.y), 1e-5);
    float axisX = 1.0 - clamp(abs(P.y) / axd - 0.5, 0.0, 1.0);
    float axd2 = max(MS_FWIDTH(P.x), 1e-5);
    float axisY = 1.0 - clamp(abs(P.x) / axd2 - 0.5, 0.0, 1.0);

    float a = line * 0.5;
    vec3 col = u_gridColor;
    if (axisX > a) { a = axisX; col = u_gridColorAxis; }
    if (axisY > a) { a = axisY; col = u_gridColorAxis2; }

    float dist = length(v_position.xz);
    a *= (1.0 - smoothstep(u_gridFadeStart, u_gridFadeEnd, dist)) * u_gridAlpha;
    if (a < 0.001) discard;
    gl_FragColor = vec4(col * a, a);
    return;
  }
  if (u_gridLines) {
    gl_FragColor = vec4(u_gridColor * u_gridAlpha, u_gridAlpha);
    return;
  }
  vec3 normal = normalize(v_normal);
  vec3 lightDir = normalize(u_diffuseLightPosition - v_position.xyz);

  float diffuse = max(dot(normal, lightDir), 0.0);
  vec3 viewDir = normalize(u_cameraPosition - v_position.xyz);
  vec3 reflectDir = reflect(-lightDir, normal);
  float specular = pow(max(dot(viewDir, reflectDir), 0.0), 50.0);

  vec4 texelColor = texture2D(u_skinTexture, v_texcoord);
  if (texelColor.a < 0.01) {
    discard;
  }
  float objectDiffuse = u_diffuseStrength;
  float objectSpecular = u_specularStrength;

  float totalDiffuse = diffuse * u_directionalLightIntensity * objectDiffuse;
  float totalSpecular = specular * objectSpecular;

  vec3 litColor = texelColor.rgb * (u_ambientLight + totalDiffuse + totalSpecular);
  gl_FragColor = vec4(litColor * texelColor.a, texelColor.a);
}
`;

class RendererProgram {
  private locations: Record<string, number | WebGLUniformLocation> = {};
  private program: WebGLProgram;
  constructor(
    private gl: WebGLRenderingContext,
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader,
  ) {
    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    this.program = program;
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      console.error("Vertex shader error:", gl.getShaderInfoLog(vertexShader));
    }
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      console.error(
        "Fragment shader error:",
        gl.getShaderInfoLog(fragmentShader),
      );
    }
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(this.program));
    }
  }

  public getProgram() {
    return this.program;
  }

  public getLocation(name: string) {
    return this.locations[name] as WebGLUniformLocation;
  }

  public setLocation(name: string, location: number | WebGLUniformLocation) {
    this.locations[name] = location;
  }

  public unmount() {
    this.gl.deleteProgram(this.getProgram());
  }
}

export class Webgl1MainProgram extends RendererProgram {
  constructor(gl: WebGLRenderingContext, hasDerivatives: boolean) {
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertexShader, mainVertexShaderSource);
    gl.compileShader(vertexShader);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(
      fragmentShader,
      buildMainFragmentShaderSource(hasDerivatives),
    );
    gl.compileShader(fragmentShader);

    super(gl, vertexShader, fragmentShader);

    this.setLocation(
      "u_gridLines",
      gl.getUniformLocation(this.getProgram(), "u_gridLines")!,
    );

    this.setLocation(
      "u_matrix",
      gl.getUniformLocation(this.getProgram(), "u_matrix")!,
    );

    this.setLocation(
      "u_cameraPosition",
      gl.getUniformLocation(this.getProgram(), "u_cameraPosition")!,
    );

    this.setLocation(
      "u_diffuseLightPosition",
      gl.getUniformLocation(this.getProgram(), "u_diffuseLightPosition")!,
    );

    this.setLocation(
      "u_ambientLight",
      gl.getUniformLocation(this.getProgram(), "u_ambientLight")!,
    );

    this.setLocation(
      "u_specularStrength",
      gl.getUniformLocation(this.getProgram(), "u_specularStrength")!,
    );

    this.setLocation(
      "u_diffuseStrength",
      gl.getUniformLocation(this.getProgram(), "u_diffuseStrength")!,
    );

    this.setLocation(
      "u_floorDiffuse",
      gl.getUniformLocation(this.getProgram(), "u_floorDiffuse")!,
    );

    this.setLocation(
      "u_floorSpecular",
      gl.getUniformLocation(this.getProgram(), "u_floorSpecular")!,
    );

    this.setLocation(
      "u_skinTexture",
      gl.getUniformLocation(this.getProgram(), "u_skinTexture")!,
    );

    this.setLocation(
      "u_highlight",
      gl.getUniformLocation(this.getProgram(), "u_highlight")!,
    );

    this.setLocation(
      "u_directionalLightIntensity",
      gl.getUniformLocation(this.getProgram(), "u_directionalLightIntensity")!,
    );

    this.setLocation(
      "u_tint",
      gl.getUniformLocation(this.getProgram(), "u_tint")!,
    );

    this.setLocation(
      "a_position",
      gl.getAttribLocation(this.getProgram(), "a_position")!,
    );

    this.setLocation(
      "a_texcoord",
      gl.getAttribLocation(this.getProgram(), "a_texcoord")!,
    );

    this.setLocation(
      "a_normal",
      gl.getAttribLocation(this.getProgram(), "a_normal")!,
    );

    this.setLocation(
      "u_floorColor",
      gl.getUniformLocation(this.getProgram(), "u_floorColor")!,
    );

    this.setLocation(
      "u_gridColor",
      gl.getUniformLocation(this.getProgram(), "u_gridColor")!,
    );

    this.setLocation(
      "u_gridAlpha",
      gl.getUniformLocation(this.getProgram(), "u_gridAlpha")!,
    );

    for (const name of [
      "u_gridFloor",
      "u_gridCell",
      "u_gridColorAxis",
      "u_gridColorAxis2",
      "u_gridFadeStart",
      "u_gridFadeEnd",
    ]) {
      this.setLocation(
        name,
        gl.getUniformLocation(this.getProgram(), name)!,
      );
    }
  }
}
