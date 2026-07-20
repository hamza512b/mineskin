import type { EnvironmentPreset } from "@/store";
import { MeshImageMaterial } from "./MeshMaterial";
import { Mesh, MeshGroup } from "./mesh";
import { addV3, type V3 } from "./maths";

type RGBA = [number, number, number, number];

type FaceColors = {
  top: RGBA;
  bottom: RGBA;
  left: RGBA;
  right: RGBA;
  front: RGBA;
  back: RGBA;
};

const BLOCK_TEXEL_DENSITY = 16;
const BLOCK_TEXTURE_SIZE: [number, number] = [
  4 * BLOCK_TEXEL_DENSITY,
  2 * BLOCK_TEXEL_DENSITY,
];
// Character model is ~32 units tall in this renderer (about 2 Minecraft blocks),
// so a 16-unit block keeps environment proportions close to Minecraft.
const BLOCK_SIZE = 16;
// Center of ground block so its top aligns near the character feet (y ~= -18).
const GROUND_Y = -42;
const GRASSLAND_CLOUD_LAYER_A = "GrasslandCloudLayerA";
const GRASSLAND_CLOUD_LAYER_B = "GrasslandCloudLayerB";
const GRASSLAND_CLOUD_WRAP_WIDTH = BLOCK_SIZE * 64;

const grasslandCloudLayers = new WeakMap<
  MeshGroup,
  { layerA: MeshGroup; layerB: MeshGroup }
>();

type FaceName = keyof FaceColors;
const FACE_OFFSETS: Record<FaceName, [number, number]> = {
  right: [0, BLOCK_TEXEL_DENSITY],
  front: [BLOCK_TEXEL_DENSITY, BLOCK_TEXEL_DENSITY],
  left: [BLOCK_TEXEL_DENSITY * 2, BLOCK_TEXEL_DENSITY],
  back: [BLOCK_TEXEL_DENSITY * 3, BLOCK_TEXEL_DENSITY],
  top: [BLOCK_TEXEL_DENSITY, 0],
  bottom: [BLOCK_TEXEL_DENSITY * 2, 0],
};

type MaterialStyle = "organic" | "bark" | "metal" | "neon";
type TextureFaceSources = {
  top: string;
  bottom?: string;
  side: string;
  front?: string;
  back?: string;
  left?: string;
  right?: string;
  compositeSideOverBottom?: boolean;
  tintStrength?: number;
  tintSeed?: number;
};

const textureImageCache = new Map<string, Promise<ImageData | null>>();

function setPixel(
  material: MeshImageMaterial,
  x: number,
  y: number,
  color: RGBA,
) {
  material.setPixel(x, y, color[0], color[1], color[2], color[3]);
}

function clampByte(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function tint(color: RGBA, delta: number): RGBA {
  return [
    clampByte(color[0] + delta),
    clampByte(color[1] + delta),
    clampByte(color[2] + delta),
    color[3],
  ];
}

function createDetailedColor(
  baseColor: RGBA,
  face: FaceName,
  localX: number,
  localY: number,
  style: MaterialStyle,
  seed: number,
): RGBA {
  const noise =
    noise2d(localX + seed * 0.7, localY + seed * 1.3, seed * 11.17) - 0.5;
  const edge =
    localX === 0 ||
    localY === 0 ||
    localX === BLOCK_TEXEL_DENSITY - 1 ||
    localY === BLOCK_TEXEL_DENSITY - 1;

  if (style === "bark") {
    if (face === "top" || face === "bottom") {
      const cx = (BLOCK_TEXEL_DENSITY - 1) / 2;
      const dx = localX - cx;
      const dy = localY - cx;
      const radial = Math.sqrt(dx * dx + dy * dy);
      const ringDelta = Math.sin(radial * 4.2 + seed) * 9;
      return tint(baseColor, ringDelta + noise * 10);
    }
    const stripe = (localX + Math.floor(seed)) % 2 === 0 ? 8 : -8;
    return tint(baseColor, stripe + noise * 8 + (edge ? -7 : 0));
  }

  if (style === "metal") {
    const seam = localX % 2 === 0 || localY % 2 === 0;
    const bolt =
      localX === Math.floor(BLOCK_TEXEL_DENSITY / 2) &&
      localY === Math.floor(BLOCK_TEXEL_DENSITY / 2);
    let delta = seam ? -10 : 5;
    if (bolt) delta += 14;
    return tint(baseColor, delta + noise * 6 + (edge ? -4 : 0));
  }

  if (style === "neon") {
    const cx = Math.floor(BLOCK_TEXEL_DENSITY / 2);
    const cross = localX === cx || localY === cx;
    const corner =
      (localX === 0 || localX === BLOCK_TEXEL_DENSITY - 1) &&
      (localY === 0 || localY === BLOCK_TEXEL_DENSITY - 1);
    let delta = cross ? 24 : 6;
    if (corner) delta -= 12;
    return tint(baseColor, delta + noise * 5);
  }

  // Organic default: subtle grain and edge occlusion.
  let delta = noise * 16 + (edge ? -6 : 0);
  if (face === "top" && noise > 0.19) delta += 8;
  return tint(baseColor, delta);
}

function createBlockMaterial(
  faceColors: FaceColors,
  style: MaterialStyle = "organic",
  seed: number = 0,
): MeshImageMaterial {
  const material = new MeshImageMaterial(
    BLOCK_TEXTURE_SIZE[0],
    BLOCK_TEXTURE_SIZE[1],
  );

  const faces: FaceName[] = ["right", "front", "left", "back", "top", "bottom"];
  for (const face of faces) {
    const [u0, v0] = FACE_OFFSETS[face];
    const baseColor = faceColors[face];
    for (let x = 0; x < BLOCK_TEXEL_DENSITY; x++) {
      for (let y = 0; y < BLOCK_TEXEL_DENSITY; y++) {
        const color = createDetailedColor(baseColor, face, x, y, style, seed);
        setPixel(material, u0 + x, v0 + y, color);
      }
    }
  }

  return material;
}

function loadTextureImageData(url: string): Promise<ImageData | null> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.resolve(null);
  }

  const cached = textureImageCache.get(url);
  if (cached) return cached;

  const loadPromise = new Promise<ImageData | null>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(null);
        return;
      }
      ctx.drawImage(img, 0, 0);
      resolve(ctx.getImageData(0, 0, canvas.width, canvas.height));
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });

  textureImageCache.set(url, loadPromise);
  return loadPromise;
}

function sampleImageData(imageData: ImageData, x: number, y: number): RGBA {
  const px = Math.max(0, Math.min(imageData.width - 1, x));
  const py = Math.max(0, Math.min(imageData.height - 1, y));
  const idx = (py * imageData.width + px) * 4;
  const data = imageData.data;
  return [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]];
}

function paintFaceFromImage(
  material: MeshImageMaterial,
  face: FaceName,
  imageData: ImageData,
  fallbackImageData?: ImageData,
  tintStrength: number = 0,
  tintSeed: number = 0,
) {
  const [u0, v0] = FACE_OFFSETS[face];
  for (let x = 0; x < BLOCK_TEXEL_DENSITY; x++) {
    for (let y = 0; y < BLOCK_TEXEL_DENSITY; y++) {
      const sampleX = Math.floor(
        ((x + 0.5) / BLOCK_TEXEL_DENSITY) * imageData.width,
      );
      const sampleY = Math.floor(
        ((y + 0.5) / BLOCK_TEXEL_DENSITY) * imageData.height,
      );
      const foreground = sampleImageData(imageData, sampleX, sampleY);
      let color: RGBA = foreground;
      if (fallbackImageData && foreground[3] < 255) {
        const bgSampleX = Math.floor(
          ((x + 0.5) / BLOCK_TEXEL_DENSITY) * fallbackImageData.width,
        );
        const bgSampleY = Math.floor(
          ((y + 0.5) / BLOCK_TEXEL_DENSITY) * fallbackImageData.height,
        );
        const background = sampleImageData(fallbackImageData, bgSampleX, bgSampleY);
        const alpha = foreground[3] / 255;
        color = [
          clampByte(foreground[0] * alpha + background[0] * (1 - alpha)),
          clampByte(foreground[1] * alpha + background[1] * (1 - alpha)),
          clampByte(foreground[2] * alpha + background[2] * (1 - alpha)),
          255,
        ];
      }
      if (tintStrength > 0) {
        const tintDelta =
          (noise2d(x + tintSeed * 1.7, y + tintSeed * 0.9, tintSeed * 3.1) - 0.5) *
          2 *
          tintStrength;
        color = [
          clampByte(color[0] + tintDelta),
          clampByte(color[1] + tintDelta),
          clampByte(color[2] + tintDelta),
          color[3],
        ];
      }
      setPixel(
        material,
        u0 + x,
        v0 + y,
        color,
      );
    }
  }
}

function applyInternetTextures(
  material: MeshImageMaterial,
  sources: TextureFaceSources,
) {
  if (typeof window === "undefined") return;

  const faceUrls: Record<FaceName, string> = {
    top: sources.top,
    bottom: sources.bottom ?? sources.top,
    front: sources.front ?? sources.side,
    back: sources.back ?? sources.side,
    left: sources.left ?? sources.side,
    right: sources.right ?? sources.side,
  };

  const uniqueUrls = Array.from(new Set(Object.values(faceUrls)));
  void Promise.all(
    uniqueUrls.map(
      async (url) => [url, await loadTextureImageData(url)] as const,
    ),
  ).then((entries) => {
    const textures = new Map<string, ImageData>();
    for (const [url, imageData] of entries) {
      if (imageData) textures.set(url, imageData);
    }

    (Object.keys(faceUrls) as FaceName[]).forEach((face) => {
      const imageData = textures.get(faceUrls[face]);
      if (!imageData) return;
      const isSideFace =
        face === "front" || face === "back" || face === "left" || face === "right";
      const shouldCompositeSideOverBottom =
        sources.compositeSideOverBottom === true;
      const fallbackImageData = isSideFace && shouldCompositeSideOverBottom
        ? textures.get(faceUrls.bottom)
        : undefined;
      paintFaceFromImage(
        material,
        face,
        imageData,
        fallbackImageData,
        sources.tintStrength ?? 0,
        sources.tintSeed ?? 0,
      );
    });
  });
}

function getDeterministicVariantIndex(
  x: number,
  y: number,
  z: number,
  variantCount: number,
): number {
  if (variantCount <= 1) return 0;
  const hash =
    Math.imul(x, 73856093) ^ Math.imul(y, 19349663) ^ Math.imul(z, 83492791);
  return (hash >>> 0) % variantCount;
}

function blockFaceUVs(
  face: FaceName,
  u0: number,
  v0: number,
  faceW: number,
  faceH: number,
): number[] {
  const tw = BLOCK_TEXTURE_SIZE[0];
  const th = BLOCK_TEXTURE_SIZE[1];
  const t = 0.5; // tweak to avoid edge bleeding
  const l = (u0 + t) / tw;
  const r = (u0 + faceW - t) / tw;
  const top = (v0 + t) / th;
  const bot = (v0 + faceH - t) / th;

  // Each face rotation in addBlock remaps createPlane's vertex positions
  // differently on screen. These UV assignments ensure the texture appears
  // upright when viewed from outside the block.
  // prettier-ignore
  switch (face) {
    case "front":
      return [r,top, r,bot, l,top, r,bot, l,bot, l,top];
    case "back":
      return [r,bot, r,top, l,bot, r,top, l,top, l,bot];
    case "right":
      return [r,bot, l,bot, r,top, l,bot, l,top, r,top];
    case "left":
      return [l,top, r,top, l,bot, r,top, r,bot, l,bot];
    case "top":
      return [l,top, l,bot, r,top, l,bot, r,bot, r,top];
    case "bottom":
      return [l,bot, l,top, r,bot, l,top, r,top, r,bot];
  }
}

function addBlock(
  world: MeshGroup,
  name: string,
  position: V3,
  material: MeshImageMaterial,
) {
  const S = BLOCK_SIZE;
  const half = S / 2;
  const D = BLOCK_TEXEL_DENSITY;

  const block = new MeshGroup(name);
  block.setParent(world);
  block.material = material;

  // Front (+Z)
  block.addMesh(
    Mesh.createPlane(
      addV3(position, [0, 0, half]),
      [S, S],
      [-Math.PI / 2, 0, 0],
      blockFaceUVs("front", D, D, D, D),
      block,
      `${name}_front`,
    ),
  );
  // Back (-Z)
  block.addMesh(
    Mesh.createPlane(
      addV3(position, [0, 0, -half]),
      [S, S],
      [Math.PI / 2, 0, 0],
      blockFaceUVs("back", D * 3, D, D, D),
      block,
      `${name}_back`,
    ),
  );
  // Right (-X)
  block.addMesh(
    Mesh.createPlane(
      addV3(position, [-half, 0, 0]),
      [S, S],
      [0, 0, -Math.PI / 2],
      blockFaceUVs("right", 0, D, D, D),
      block,
      `${name}_right`,
    ),
  );
  // Left (+X)
  block.addMesh(
    Mesh.createPlane(
      addV3(position, [half, 0, 0]),
      [S, S],
      [0, 0, Math.PI / 2],
      blockFaceUVs("left", D * 2, D, D, D),
      block,
      `${name}_left`,
    ),
  );
  // Top (+Y)
  block.addMesh(
    Mesh.createPlane(
      addV3(position, [0, half, 0]),
      [S, S],
      [0, 0, 0],
      blockFaceUVs("top", D, 0, D, D),
      block,
      `${name}_top`,
    ),
  );
  // Bottom (-Y)
  block.addMesh(
    Mesh.createPlane(
      addV3(position, [0, -half, 0]),
      [S, S],
      [Math.PI, 0, 0],
      blockFaceUVs("bottom", D * 2, 0, D, D),
      block,
      `${name}_bottom`,
    ),
  );

  world.addMesh(block);
}

function noise2d(x: number, z: number, seed: number): number {
  const v = Math.sin((x + seed) * 12.9898 + (z - seed) * 78.233) * 43758.5453;
  return v - Math.floor(v);
}

function buildGrassland(world: MeshGroup) {
  const grass = createBlockMaterial(
    {
      top: [83, 157, 68, 255],
      bottom: [121, 86, 59, 255],
      left: [95, 128, 60, 255],
      right: [95, 128, 60, 255],
      front: [108, 141, 70, 255],
      back: [108, 141, 70, 255],
    },
    "organic",
    13,
  );
  applyInternetTextures(grass, {
    top: "/textures/environment/grass_top.png",
    bottom: "/textures/environment/dirt.png",
    side: "/textures/environment/grass_side.png",
    compositeSideOverBottom: true,
  });

  const dirtVariants: MeshImageMaterial[] = [];
  const dirtVariantCount = 4;
  for (let variant = 0; variant < dirtVariantCount; variant++) {
    const dirt = createBlockMaterial(
      {
        top: [123, 86, 58, 255],
        bottom: [100, 68, 47, 255],
        left: [113, 79, 53, 255],
        right: [113, 79, 53, 255],
        front: [118, 83, 56, 255],
        back: [118, 83, 56, 255],
      },
      "organic",
      27 + variant * 13,
    );
    applyInternetTextures(dirt, {
      top: "/textures/environment/dirt.png",
      side: "/textures/environment/dirt.png",
      tintStrength: 8,
      tintSeed: 101 + variant * 23,
    });
    dirtVariants.push(dirt);
  }

  const leaves = createBlockMaterial(
    {
      top: [58, 128, 56, 255],
      bottom: [47, 111, 47, 255],
      left: [52, 122, 51, 255],
      right: [52, 122, 51, 255],
      front: [55, 126, 53, 255],
      back: [55, 126, 53, 255],
    },
    "organic",
    41,
  );
  applyInternetTextures(leaves, {
    top: "/textures/environment/leaves.png",
    side: "/textures/environment/leaves.png",
  });

  const wood = createBlockMaterial(
    {
      top: [126, 102, 68, 255],
      bottom: [101, 77, 47, 255],
      left: [116, 90, 57, 255],
      right: [116, 90, 57, 255],
      front: [121, 96, 61, 255],
      back: [121, 96, 61, 255],
    },
    "bark",
    57,
  );
  applyInternetTextures(wood, {
    top: "/textures/environment/wood_top.png",
    bottom: "/textures/environment/wood_top.png",
    side: "/textures/environment/wood_side.png",
  });

  const cloud = createBlockMaterial(
    {
      top: [255, 255, 255, 255],
      bottom: [236, 240, 247, 255],
      left: [245, 247, 252, 255],
      right: [245, 247, 252, 255],
      front: [250, 251, 254, 255],
      back: [250, 251, 254, 255],
    },
    "organic",
    173,
  );

  const span = 9;
  for (let x = -span; x <= span; x++) {
    for (let z = -span; z <= span; z++) {
      const n = noise2d(x, z, 13);
      const dist = Math.hypot(x, z);
      // Keep terrain below the skin body. Center reaches foot level only.
      const hillLayers = dist < 1.25 ? 1 : 0;
      const valleyDrop = n > 0.72 ? 1 : 0;
      const topLevel = GROUND_Y + (hillLayers - valleyDrop) * BLOCK_SIZE;
      const stack = valleyDrop > 0 ? 3 : 2;
      for (let i = 0; i < stack; i++) {
        const y = topLevel - i * BLOCK_SIZE;
        const dirtVariantIndex = getDeterministicVariantIndex(
          x,
          Math.floor(y / BLOCK_SIZE),
          z,
          dirtVariants.length,
        );
        addBlock(
          world,
          i === 0 ? "grassBlock" : "dirtBlock",
          [x * BLOCK_SIZE, y, z * BLOCK_SIZE],
          i === 0 ? grass : dirtVariants[dirtVariantIndex],
        );
      }
    }
  }

  const treeBases: [number, number][] = [
    [-8, -7],
    [8, -6],
    [-7, 8],
    [7, 8],
    [-9, 2],
    [9, 1],
    [-2, -9],
    [2, 9],
  ];

  for (const [tx, tz] of treeBases) {
    const trunkHeight = 3;
    for (let i = 1; i <= trunkHeight; i++) {
      addBlock(
        world,
        "treeTrunk",
        [tx * BLOCK_SIZE, GROUND_Y + i * BLOCK_SIZE, tz * BLOCK_SIZE],
        wood,
      );
    }
    for (let lx = -1; lx <= 1; lx++) {
      for (let lz = -1; lz <= 1; lz++) {
        addBlock(
          world,
          "treeLeaves",
          [
            (tx + lx) * BLOCK_SIZE,
            GROUND_Y + (trunkHeight + 1) * BLOCK_SIZE,
            (tz + lz) * BLOCK_SIZE,
          ],
          leaves,
        );
      }
    }
    addBlock(
      world,
      "treeLeavesTop",
      [
        tx * BLOCK_SIZE,
        GROUND_Y + (trunkHeight + 2) * BLOCK_SIZE,
        tz * BLOCK_SIZE,
      ],
      leaves,
    );
  }

  const cloudY = GROUND_Y + BLOCK_SIZE * 10;
  const cloudWrapBlocks = GRASSLAND_CLOUD_WRAP_WIDTH / BLOCK_SIZE;
  const cloudZHalf = 22;

  // Distribute a handful of cloud "seeds" across the full wrap width so the
  // field looks scattered but tiles seamlessly when the layer scrolls.
  const cloudSeedCount = 12;
  const cloudSeeds: [number, number][] = [];
  for (let i = 0; i < cloudSeedCount; i++) {
    const sx = Math.floor(
      ((i + noise2d(i, 0, 401)) / cloudSeedCount - 0.5) * cloudWrapBlocks,
    );
    const sz = Math.floor((noise2d(i, 1, 503) - 0.5) * cloudZHalf * 2);
    cloudSeeds.push([sx, sz]);
  }

  const createCloudLayer = (name: string, offsetX: number) => {
    const cloudLayer = new MeshGroup(name);
    cloudLayer.setParent(world);
    world.addMesh(cloudLayer);

    for (let i = 0; i < cloudSeeds.length; i++) {
      const [cx, cz] = cloudSeeds[i];
      for (let dx = -2; dx <= 2; dx++) {
        for (let dz = -2; dz <= 2; dz++) {
          const density = noise2d(cx + dx * 0.9, cz + dz * 0.9, 220 + i * 11);
          const keep =
            density > 0.33 || (Math.abs(dx) <= 1 && Math.abs(dz) <= 1);
          if (!keep) continue;

          addBlock(
            cloudLayer,
            "cloudBlock",
            [offsetX + (cx + dx) * BLOCK_SIZE, cloudY, (cz + dz) * BLOCK_SIZE],
            cloud,
          );
        }
      }
    }

    return cloudLayer;
  };

  const layerA = createCloudLayer(GRASSLAND_CLOUD_LAYER_A, 0);
  const layerB = createCloudLayer(
    GRASSLAND_CLOUD_LAYER_B,
    -GRASSLAND_CLOUD_WRAP_WIDTH,
  );
  grasslandCloudLayers.set(world, { layerA, layerB });
}

function buildScifiArena(world: MeshGroup) {
  const metal = createBlockMaterial(
    {
      top: [58, 66, 82, 255],
      bottom: [40, 46, 58, 255],
      left: [50, 58, 73, 255],
      right: [50, 58, 73, 255],
      front: [54, 62, 77, 255],
      back: [54, 62, 77, 255],
    },
    "metal",
    71,
  );
  applyInternetTextures(metal, {
    top: "/textures/environment/metal.png",
    side: "/textures/environment/metal.png",
  });

  const neon = createBlockMaterial(
    {
      top: [34, 224, 255, 255],
      bottom: [15, 107, 125, 255],
      left: [24, 173, 196, 255],
      right: [24, 173, 196, 255],
      front: [27, 195, 219, 255],
      back: [27, 195, 219, 255],
    },
    "neon",
    89,
  );
  applyInternetTextures(neon, {
    top: "/textures/environment/neon.png",
    side: "/textures/environment/neon.png",
  });

  // Make the sci-fi arena feel elevated like the grassland terrain.
  const arenaTopY = GROUND_Y + BLOCK_SIZE;
  // Expand terrain footprint so the arena reads as a broad environment.
  const span = 10;
  for (let x = -span; x <= span; x++) {
    for (let z = -span; z <= span; z++) {
      const isLane = x % 3 === 0 || z % 3 === 0;
      addBlock(
        world,
        isLane ? "neonTile" : "metalTile",
        [x * BLOCK_SIZE, arenaTopY, z * BLOCK_SIZE],
        isLane ? neon : metal,
      );
    }
  }

  const pillarEdge = span - 1;
  const pillarCoords: [number, number][] = [
    [-pillarEdge, -pillarEdge],
    [pillarEdge, -pillarEdge],
    [-pillarEdge, pillarEdge],
    [pillarEdge, pillarEdge],
  ];

  for (const [x, z] of pillarCoords) {
    for (let i = 1; i <= 5; i++) {
      addBlock(
        world,
        "pillar",
        [x * BLOCK_SIZE, arenaTopY + i * BLOCK_SIZE, z * BLOCK_SIZE],
        i % 2 === 0 ? neon : metal,
      );
    }
  }
}

// Flat reference grid for the default "grid" environment. It is a single large
// quad at the character's feet; the actual lattice is drawn procedurally in the
// environment shader (see u_gridFloor) so the lines stay a constant pixel width
// and anti-alias correctly at any distance — a Blender-style infinite grid that
// tracks the camera, instead of a static CSS gradient or aliased solid quads.
export const PLAIN_GRID_Y = -19;
// Half-size of the ground quad. Corners must stay inside the camera far plane
// (2000); shader distance-fade hides the edge long before this.
const PLAIN_GRID_HALF_EXTENT = 1200;

function createSolidMaterial(color: RGBA): MeshImageMaterial {
  const material = new MeshImageMaterial(1, 1);
  setPixel(material, 0, 0, color);
  return material;
}

// The shader ignores UVs/texture in grid mode, so a flat set is enough.
const SOLID_PLANE_UVS = new Array(12).fill(0);

function buildPlainGrid(world: MeshGroup) {
  const span = PLAIN_GRID_HALF_EXTENT * 2;

  const grid = new MeshGroup("PlainGrid");
  grid.setParent(world);
  grid.material = createSolidMaterial([255, 255, 255, 255]);
  grid.addMesh(
    Mesh.createPlane(
      [0, PLAIN_GRID_Y, 0],
      [span, span],
      [0, 0, 0],
      SOLID_PLANE_UVS,
      grid,
      "grid_plane",
    ),
  );
  world.addMesh(grid);
}

export function getEnvironmentClearColor(
  preset: EnvironmentPreset,
): [number, number, number, number] {
  switch (preset) {
    case "grassland":
      return [0.56, 0.75, 0.98, 1];
    case "scifi":
      return [0.02, 0.05, 0.09, 1];
    case "grid":
    case "empty":
    default:
      return [0, 0, 0, 0];
  }
}

/**
 * Returns the Y level the camera must stay above for the given environment.
 * This accounts for the top surface of blocks near the viewing area plus a
 * small margin so the camera doesn't skim the surface.
 */
export function getEnvironmentCameraFloorY(
  preset: EnvironmentPreset,
): number | null {
  switch (preset) {
    case "grassland":
      // Ground top surface is at GROUND_Y + BLOCK_SIZE/2 = -34, center hills
      // reach -18. Use -26 to stay comfortably above.
      return GROUND_Y + BLOCK_SIZE;
    case "scifi":
      // Uniform floor top at arenaTopY + BLOCK_SIZE/2 = -18. Margin above.
      return GROUND_Y + BLOCK_SIZE * 2;
    default:
      return null;
  }
}

export function createEnvironmentWorld(
  preset: EnvironmentPreset,
): MeshGroup | null {
  const world = new MeshGroup("EnvironmentWorld");
  world.metadata = { type: "environment" };

  if (preset === "grid") {
    buildPlainGrid(world);
    return world;
  }

  // "empty" renders nothing — a completely blank scene with no grid or terrain.
  if (preset === "empty") {
    return null;
  }

  if (preset === "scifi") {
    buildScifiArena(world);
    return world;
  }

  if (preset === "grassland") {
    buildGrassland(world);
    return world;
  }
  return null;
}

const lastCloudOffset = new WeakMap<MeshGroup, number>();

export function animateEnvironmentWorld(
  world: MeshGroup,
  preset: EnvironmentPreset,
  timeMs: number,
) {
  if (preset !== "grassland") return;

  const layers = grasslandCloudLayers.get(world);
  if (!layers) return;

  const seconds = timeMs / 1000;
  const cycle = 120;
  const progress = (seconds % cycle) / cycle;
  const offset = progress * GRASSLAND_CLOUD_WRAP_WIDTH;

  if (lastCloudOffset.get(world) === offset) return;
  lastCloudOffset.set(world, offset);

  layers.layerA.position = [offset, 0, 0];
  layers.layerB.position = [offset - GRASSLAND_CLOUD_WRAP_WIDTH, 0, 0];
}
