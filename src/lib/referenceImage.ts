import { rgbToHex } from "@/components/ColorPicker/colorUtils";

/**
 * Reference images are arbitrary user photos and artwork, not skin textures, so
 * they get their own import pipeline: decode, downscale, re-encode, and derive
 * a palette once at import time. Everything here runs client-side; nothing
 * leaves the device.
 */

/** Longest edge kept for the full-size reference. Photos arrive far larger. */
export const MAX_REFERENCE_DIMENSION = 2048;
/** Longest edge of the filmstrip thumbnail. */
export const THUMBNAIL_DIMENSION = 256;
/** How many references a user may keep. Bounded so IndexedDB quota stays sane. */
export const MAX_REFERENCES = 12;
/** Swatches derived per image. */
export const PALETTE_SIZE = 12;

export const ACCEPTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/heic",
  "image/heif",
];

export function isAcceptedImageType(file: File | Blob): boolean {
  // Files dragged from some sources arrive with an empty type; fall back to the
  // extension when there's a name to read.
  if (file.type) return ACCEPTED_IMAGE_TYPES.includes(file.type.toLowerCase());
  const name = (file as File).name;
  if (!name) return false;
  return /\.(png|jpe?g|webp|gif|avif|heic|heif)$/i.test(name);
}

type DecodedImage = {
  source: CanvasImageSource;
  width: number;
  height: number;
  release: () => void;
};

/**
 * Decode to something drawable. `createImageBitmap` with `imageOrientation` is
 * the only path that applies EXIF rotation, so phone photos land upright; older
 * engines fall through to the option-less call and finally to an <img>, which
 * also covers HEIC on iOS where the platform decoder handles it natively.
 */
async function decodeImage(blob: Blob): Promise<DecodedImage> {
  if (typeof createImageBitmap === "function") {
    for (const options of [
      { imageOrientation: "from-image" } as ImageBitmapOptions,
      undefined,
    ]) {
      try {
        const bitmap = options
          ? await createImageBitmap(blob, options)
          : await createImageBitmap(blob);
        return {
          source: bitmap,
          width: bitmap.width,
          height: bitmap.height,
          release: () => bitmap.close(),
        };
      } catch {
        // Try the next strategy.
      }
    }
  }

  const url = URL.createObjectURL(blob);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Could not decode image"));
      image.src = url;
    });
    return {
      source: img,
      width: img.naturalWidth,
      height: img.naturalHeight,
      release: () => URL.revokeObjectURL(url),
    };
  } catch (err) {
    URL.revokeObjectURL(url);
    throw err;
  }
}

function fitWithin(width: number, height: number, max: number) {
  const scale = Math.min(1, max / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function drawToCanvas(
  image: DecodedImage,
  width: number,
  height: number,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Could not get a 2D context");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image.source, 0, 0, width, height);
  return canvas;
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) =>
    canvas.toBlob((blob) => resolve(blob), type, quality),
  );
}

/**
 * Re-encode to WebP where available. Engines that can't encode a requested type
 * silently hand back PNG, so the result's own type is the only reliable signal:
 * when it isn't WebP, opaque images go to JPEG (far smaller than PNG for
 * photos) and images with alpha keep the lossless PNG.
 */
async function encode(
  canvas: HTMLCanvasElement,
  hasAlpha: boolean,
  quality: number,
): Promise<Blob> {
  const webp = await canvasToBlob(canvas, "image/webp", quality);
  if (webp && webp.type === "image/webp") return webp;
  if (!hasAlpha) {
    const jpeg = await canvasToBlob(canvas, "image/jpeg", quality);
    if (jpeg) return jpeg;
  }
  const png = webp ?? (await canvasToBlob(canvas, "image/png", 1));
  if (!png) throw new Error("Could not encode image");
  return png;
}

function imageHasAlpha(data: Uint8ClampedArray): boolean {
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) return true;
  }
  return false;
}

/**
 * Popularity quantizer: bucket colors onto a coarse RGB grid, then walk buckets
 * most-used-first keeping any that isn't already close to a kept swatch. Same
 * shape as the skin palette in `MiSkiRenderer.getUniqueColors`, but photos hold
 * orders of magnitude more distinct colors, so this quantizes first and merges
 * at a much wider radius to land on a readable number of swatches.
 */
export function extractPalette(
  imageData: ImageData,
  size: number = PALETTE_SIZE,
): string[] {
  const { data } = imageData;
  // 5 bits per channel: fine enough to separate real hues, coarse enough that
  // sensor noise and JPEG ringing collapse into one bucket.
  const SHIFT = 3;
  const sums = new Map<
    number,
    { r: number; g: number; b: number; count: number }
  >();

  for (let i = 0; i < data.length; i += 4) {
    // Skip transparent pixels and near-transparent edges; they'd otherwise
    // average into muddy swatches nobody picked.
    if (data[i + 3] < 128) continue;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const key =
      ((r >> SHIFT) << 10) | ((g >> SHIFT) << 5) | (b >> SHIFT);
    const bucket = sums.get(key);
    if (bucket) {
      bucket.r += r;
      bucket.g += g;
      bucket.b += b;
      bucket.count++;
    } else {
      sums.set(key, { r, g, b, count: 1 });
    }
  }

  // Average each bucket back to a real color rather than its grid center, so
  // the swatch matches what the user sees in the image.
  const buckets = Array.from(sums.values())
    .map((bucket) => ({
      r: Math.round(bucket.r / bucket.count),
      g: Math.round(bucket.g / bucket.count),
      b: Math.round(bucket.b / bucket.count),
      count: bucket.count,
    }))
    .sort((a, b) => b.count - a.count);

  // Wide enough that a gradient contributes a couple of stops instead of
  // twenty, narrow enough to keep genuinely distinct hues apart.
  const MERGE_DISTANCE_SQ = 48 * 48;
  const kept: { r: number; g: number; b: number }[] = [];
  for (const bucket of buckets) {
    if (kept.length >= size) break;
    const absorbed = kept.some((k) => {
      const dr = k.r - bucket.r;
      const dg = k.g - bucket.g;
      const db = k.b - bucket.b;
      return dr * dr + dg * dg + db * db <= MERGE_DISTANCE_SQ;
    });
    if (!absorbed) kept.push(bucket);
  }

  // A flat image can exhaust its buckets before filling the palette; that's
  // fine, a short palette is honest about what's in the picture.
  return kept.map(({ r, g, b }) => rgbToHex(r, g, b));
}

export interface NormalizedReference {
  blob: Blob;
  thumbBlob: Blob;
  width: number;
  height: number;
  palette: string[];
}

/**
 * Turn an arbitrary user file into the stored form: orientation-corrected,
 * downscaled, re-encoded, with a thumbnail and palette derived up front so the
 * UI never has to quantize on open.
 */
export async function normalizeReferenceImage(
  file: File | Blob,
): Promise<NormalizedReference> {
  const decoded = await decodeImage(file);
  try {
    const full = fitWithin(
      decoded.width,
      decoded.height,
      MAX_REFERENCE_DIMENSION,
    );
    const canvas = drawToCanvas(decoded, full.width, full.height);
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    const fullData = ctx.getImageData(0, 0, full.width, full.height);
    const hasAlpha = imageHasAlpha(fullData.data);

    const thumbSize = fitWithin(
      decoded.width,
      decoded.height,
      THUMBNAIL_DIMENSION,
    );
    const thumbCanvas = drawToCanvas(decoded, thumbSize.width, thumbSize.height);
    const thumbCtx = thumbCanvas.getContext("2d", {
      willReadFrequently: true,
    })!;
    const thumbData = thumbCtx.getImageData(
      0,
      0,
      thumbSize.width,
      thumbSize.height,
    );

    const [blob, thumbBlob] = await Promise.all([
      encode(canvas, hasAlpha, 0.9),
      encode(thumbCanvas, hasAlpha, 0.8),
    ]);

    return {
      blob,
      thumbBlob,
      width: full.width,
      height: full.height,
      // Quantize the thumbnail, not the full image: same palette, ~64x less
      // work, and it keeps import responsive on a phone.
      palette: extractPalette(thumbData),
    };
  } finally {
    decoded.release();
  }
}

export interface ReferenceSource {
  /** Full-resolution canvas, the draw source for the viewport and the loupe. */
  canvas: HTMLCanvasElement;
  /** Its context, kept so picks can read single pixels without a full copy. */
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
}

/** Decode a stored reference into something the viewport can draw and sample. */
export async function loadReferenceSource(
  blob: Blob,
): Promise<ReferenceSource> {
  const decoded = await decodeImage(blob);
  try {
    const canvas = drawToCanvas(decoded, decoded.width, decoded.height);
    // Deliberately no retained ImageData: a full-size copy would double the
    // memory held per open reference (~16 MB at the 2048px cap) to save a
    // 1x1 read per pick, which is already cheap.
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    return {
      canvas,
      ctx,
      width: decoded.width,
      height: decoded.height,
    };
  } finally {
    decoded.release();
  }
}

/**
 * Read one pixel as a hex string. Coordinates are in the image's own pixel
 * space — callers map from display coordinates first, because sampling the
 * scaled element instead of the source would return interpolated colors.
 */
export function samplePixel(
  source: ReferenceSource,
  x: number,
  y: number,
): string | null {
  const px = Math.floor(x);
  const py = Math.floor(y);
  if (px < 0 || py < 0 || px >= source.width || py >= source.height) {
    return null;
  }
  const { data } = source.ctx.getImageData(px, py, 1, 1);
  // Fully transparent pixels carry no color worth picking.
  if (data[3] === 0) return null;
  return rgbToHex(data[0], data[1], data[2]);
}

/** Merge palettes across references, preserving order and dropping repeats. */
export function mergePalettes(palettes: string[][]): string[] {
  const seen = new Set<string>();
  const merged: string[] = [];
  // Round-robin rather than concatenating, so one image with a rich palette
  // can't push every other reference's colors off the end of the strip.
  const longest = palettes.reduce((max, p) => Math.max(max, p.length), 0);
  for (let i = 0; i < longest; i++) {
    for (const palette of palettes) {
      const color = palette[i];
      if (!color || seen.has(color)) continue;
      seen.add(color);
      merged.push(color);
    }
  }
  return merged;
}
