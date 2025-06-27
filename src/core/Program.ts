const mainVertexShaderSource = `#version 300 es
in vec4 a_position;
in vec2 a_texcoord;
in vec3 a_normal;

uniform mat4 u_matrix;
uniform mat4 u_shadowMatrix;
uniform bool u_gridLines;

out vec2 v_texcoord;
out vec3 v_normal;
out vec4 v_position;
out vec4 v_shadowCoord;

void main() 
  gl_Position = u_matrix * a_position;
  v_texcoord = a_texcoord;
  v_normal = a_normal;
  v_position = a_position;
  v_shadowCoord = u_shadowMatrix * a_position;
}
`;

const mainFragmentShaderSource = `#version 300 es
precision mediump float;

in vec2 v_texcoord;
in vec3 v_normal;
in vec4 v_position;
in vec4 v_shadowCoord;

uniform vec3 u_cameraPosition;
uniform vec3 u_diffuseLightPosition;
uniform float u_ambientLight;
uniform float u_specularStrength;
uniform float u_diffuseStrength;
uniform sampler2D u_skinTexture;
uniform bool u_useFloorTexture;
uniform vec3 u_floorColor;
uniform float u_floorDiffuse;
uniform float u_floorSpecular;
uniform float u_directionalLightIntensity;
uniform float u_opacity;
out vec4 outColor;

void main() {  
  vec3 normal = normalize(v_normal);
  vec3 lightDir = normalize(u_diffuseLightPosition - v_position.xyz);
  
  float diffuse = max(dot(normal, lightDir), 0.0);
  vec3 viewDir = normalize(u_cameraPosition - v_position.xyz);
  vec3 reflectDir = reflect(-lightDir, normal);
  float specular = pow(max(dot(viewDir, reflectDir), 0.0), 50.0);
  
  vec4 texelColor = u_useFloorTexture ? vec4(u_floorColor, 1.0) : texture(u_skinTexture, v_texcoord);
  float objectDiffuse =  u_useFloorTexture ? u_floorDiffuse : u_diffuseStrength;
  float objectSpecular =  u_useFloorTexture ? u_floorSpecular : u_specularStrength; 

  float totalDiffuse = (diffuse * u_directionalLightIntensity + spotDiffuse * u_spotLightIntensity) * objectDiffuse;
  float totalSpecular = (specular + spotSpecular) * objectSpecular;
  vec4 litColor = vec4(texelColor.rgb * (u_ambientLight + totalDiffuse + totalSpecular), texelColor.a * u_opacity);
  outColor = litColor;
}
`;

class RendererProgram {
  private locations: Record<string, number | WebGLUniformLocation> = {};
  private program: WebGLProgram;
  constructor(
    gl: WebGL2RenderingContext,
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
}

export class MainProgram extends RendererProgram {
  constructor(gl: WebGL2RenderingContext) {
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertexShader, mainVertexShaderSource);
    gl.compileShader(vertexShader);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragmentShader, mainFragmentShaderSource);
    gl.compileShader(fragmentShader);

    super(gl, vertexShader, fragmentShader);

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
      "u_skinTexture",
      gl.getUniformLocation(this.getProgram(), "u_skinTexture")!,
    );

    this.setLocation(
      "u_useFloorTexture",
      gl.getUniformLocation(this.getProgram(), "u_useFloorTexture")!,
    );

    this.setLocation(
      "u_directionalLightIntensity",
      gl.getUniformLocation(this.getProgram(), "u_directionalLightIntensity")!,
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
      "u_opacity",
      gl.getUniformLocation(this.getProgram(), "u_opacity")!,
    );
  }
}
