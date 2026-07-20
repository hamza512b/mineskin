import { hexToRgb } from "./utils";
import { v4 as uuidv4 } from "uuid";
import { flipSkinTexelFrontBack } from "./skinMirror";

export class MeshMaterial {
  private _uuid: string;

  constructor() {
    this._uuid = uuidv4();
  }

  get uuid(): string {
    return this._uuid;
  }
}

export class MeshColorMaterial extends MeshMaterial {
  private red;
  private blue;
  private green;
  private alpha;

  constructor(r: number, g: number, b: number, a: number = 255) {
    super();
    this.red = r;
    this.green = g;
    this.blue = b;
    this.alpha = a;
  }

  get color() {
    return [this.red, this.blue, this.green, this.alpha];
  }
  setColor(r: number, g: number, b: number, a: number = 255) {
    this.red = r;
    this.green = g;
    this.blue = b;
    this.alpha = a;
  }
}

export class MeshImageMaterial extends MeshMaterial {
  private image: ImageData;
  private _isDirty: boolean = true;

  /**
   * Creates a new MeshTexture with the specified dimensions
   * @param width The width of the texture in pixels
   * @param height The height of the texture in pixels
   * @param initialData Optional initial data to populate the texture
   */
  constructor(
    width: number = 64,
    height: number = 64,
    initialData?: Uint8ClampedArray,
  ) {
    if (initialData && initialData.length !== width * height * 4) {
      throw new Error("Initial data size must match width * height * 4");
    }
    super();

    const data =
      initialData !== undefined
        ? new Uint8ClampedArray(initialData)
        : new Uint8ClampedArray(width * height * 4);
    this.image = new ImageData(data, width, height);
    this._isDirty = true;
  }

  /**
   * Gets the width of the texture
   */
  get width(): number {
    return this.image.width;
  }

  /**
   * Gets the height of the texture
   */
  get height(): number {
    return this.image.height;
  }

  /**
   * Gets the raw ImageData object
   */
  get imageData(): ImageData {
    return this.image;
  }

  /**
   * Checks if the texture data has been modified and needs re-uploading
   */
  get isDirty(): boolean {
    return this._isDirty;
  }

  /**
   * Marks the texture as clean (after it has been uploaded to GPU)
   */
  markClean(): void {
    this._isDirty = false;
  }

  /**
   * Sets a pixel at the specified coordinates with the given color
   * @param x X coordinate (0 to width-1)
   * @param y Y coordinate (0 to height-1)
   * @param r Red component (0-255)
   * @param g Green component (0-255)
   * @param b Blue component (0-255)
   * @param a Alpha component (0-255)
   * @returns True if the pixel was set, false if coordinates were out of bounds
   */
  setPixel(
    x: number,
    y: number,
    r: number,
    g: number,
    b: number,
    a: number = 255,
  ): boolean {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return false;
    }

    const index = (y * this.width + x) * 4;
    const data = this.image.data;

    data[index] = r;
    data[index + 1] = g;
    data[index + 2] = b;
    data[index + 3] = a;

    this._isDirty = true;
    return true;
  }

  /**
   * Sets a pixel at the specified coordinates with a hex color string
   * @param x X coordinate (0 to width-1)
   * @param y Y coordinate (0 to height-1)
   * @param hexColor Hex color string (e.g., "#ff0000" for red)
   * @param alpha Alpha component (0-255)
   * @returns True if the pixel was set, false if coordinates were out of bounds
   */
  setPixelHex(
    x: number,
    y: number,
    hexColor: string,
    alpha: number = 255,
  ): boolean {
    const rgb = hexToRgb(hexColor);
    return this.setPixel(
      x,
      y,
      Math.round(rgb.r * 255),
      Math.round(rgb.g * 255),
      Math.round(rgb.b * 255),
      alpha,
    );
  }

  /**
   * Sets a pixel at the specified coordinates with the given color array
   * @param x X coordinate (0 to width-1)
   * @param y Y coordinate (0 to height-1)
   * @param color Array of [r, g, b, a] values (0-255)
   * @returns True if the pixel was set, false if coordinates were out of bounds
   */
  setPixelFromArray(
    x: number,
    y: number,
    color: [number, number, number, number],
  ): boolean {
    return this.setPixel(x, y, color[0], color[1], color[2], color[3]);
  }

  /**
   * Clears a pixel at the specified coordinates (sets it to transparent)
   * @param x X coordinate (0 to width-1)
   * @param y Y coordinate (0 to height-1)
   * @returns True if the pixel was cleared, false if coordinates were out of bounds
   */
  clearPixel(x: number, y: number): boolean {
    return this.setPixel(x, y, 0, 0, 0, 0);
  }

  /**
   * Gets the color of a pixel at the specified coordinates
   * @param x X coordinate (0 to width-1)
   * @param y Y coordinate (0 to height-1)
   * @returns Array of [r, g, b, a] values or null if coordinates were out of bounds
   */
  getPixel(x: number, y: number): [number, number, number, number] | null {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return null;
    }

    const index = (y * this.width + x) * 4;
    const data = this.image.data;

    return [data[index], data[index + 1], data[index + 2], data[index + 3]];
  }

  /**
   * Fills a rectangular area with the specified color
   * @param x X coordinate of the top-left corner
   * @param y Y coordinate of the top-left corner
   * @param width Width of the rectangle
   * @param height Height of the rectangle
   * @param r Red component (0-255)
   * @param g Green component (0-255)
   * @param b Blue component (0-255)
   * @param a Alpha component (0-255)
   */
  fillRect(
    x: number,
    y: number,
    width: number,
    height: number,
    r: number,
    g: number,
    b: number,
    a: number = 255,
  ): void {
    const x0 = Math.max(0, Math.min(this.width - 1, Math.floor(x)));
    const y0 = Math.max(0, Math.min(this.height - 1, Math.floor(y)));
    const x1 = Math.max(0, Math.min(this.width, Math.floor(x + width)));
    const y1 = Math.max(0, Math.min(this.height, Math.floor(y + height)));

    for (let cy = y0; cy < y1; cy++) {
      for (let cx = x0; cx < x1; cx++) {
        this.setPixel(cx, cy, r, g, b, a);
      }
    }
  }

  /**
   * Fills a rectangular area with a hex color
   * @param x X coordinate of the top-left corner
   * @param y Y coordinate of the top-left corner
   * @param width Width of the rectangle
   * @param height Height of the rectangle
   * @param hexColor Hex color string (e.g., "#ff0000" for red)
   * @param alpha Alpha component (0-255)
   */
  fillRectHex(
    x: number,
    y: number,
    width: number,
    height: number,
    hexColor: string,
    alpha: number = 255,
  ): void {
    const rgb = hexToRgb(hexColor);
    this.fillRect(
      x,
      y,
      width,
      height,
      Math.round(rgb.r * 255),
      Math.round(rgb.g * 255),
      Math.round(rgb.b * 255),
      alpha,
    );
  }

  /**
   * Clears a rectangular area (sets pixels to transparent)
   * @param x X coordinate of the top-left corner
   * @param y Y coordinate of the top-left corner
   * @param width Width of the rectangle
   * @param height Height of the rectangle
   */
  clearRect(x: number, y: number, width: number, height: number): void {
    this.fillRect(x, y, width, height, 0, 0, 0, 0);
  }

  /**
   * Fills the entire texture with a single color
   * @param r Red component (0-255)
   * @param g Green component (0-255)
   * @param b Blue component (0-255)
   * @param a Alpha component (0-255)
   */
  fill(r: number, g: number, b: number, a: number = 255): void {
    const data = this.image.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = a;
    }
    this._isDirty = true;
  }

  /**
   * Fills the entire texture with a hex color
   * @param hexColor Hex color string (e.g., "#ff0000" for red)
   * @param alpha Alpha component (0-255)
   */
  fillHex(hexColor: string, alpha: number = 255): void {
    const rgb = hexToRgb(hexColor);
    this.fill(
      Math.round(rgb.r * 255),
      Math.round(rgb.g * 255),
      Math.round(rgb.b * 255),
      alpha,
    );
  }

  /**
   * Clears the entire texture (sets all pixels to transparent)
   */
  clear(): void {
    const data = this.image.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 0;
    }
    this._isDirty = true;
  }

  /**
   * Creates a copy of this texture
   * @returns A new MeshTexture instance with the same data
   */
  clone(): MeshImageMaterial {
    const newData = new Uint8ClampedArray(this.image.data);
    return new MeshImageMaterial(this.width, this.height, newData);
  }

  /**
   * Converts the texture to a PNG data URL
   * @returns A data URL containing a PNG representation of the texture
   */
  toDataUrl(): string {
    // Create a canvas element
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Could not get 2D context from canvas");
    }

    // Set canvas dimensions
    const width = this.width;
    const height = this.height;
    canvas.width = width;
    canvas.height = height;

    // Direct drawing at original size
    ctx.putImageData(this.image, 0, 0);

    // Convert to data URL
    return canvas.toDataURL("image/png");
  }

  /**
   * Loads an image from a URL into the texture
   * @param url The URL of the image to load (can be a data URL)
   * @param resize Whether to resize the texture to match the loaded image dimensions (default: true)
   * @returns A promise that resolves when the image has been loaded
   */
  static async createFromUrl(url: string): Promise<MeshImageMaterial> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        try {
          resolve(this.createFromImage(img.width, img.height, img));
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error(`Failed to load image from URL: ${url}`));
      };

      img.src = url;
    });
  }

  /**
   * Loads an image from an Image object into the texture
   * @param img The Image object to load
   */
  static createFromImage(
    width: number,
    height: number,
    img: HTMLImageElement,
  ): MeshImageMaterial {
    // Create a canvas to draw the image and extract its pixel data
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Could not get 2D context from canvas");
    }

    canvas.width = width;
    canvas.height = height;

    // Draw the image onto the canvas
    ctx.drawImage(img, 0, 0);

    // Get the image data
    const imageData = ctx.getImageData(0, 0, width, height);

    return new MeshImageMaterial(width, height, imageData.data);
  }

  createFromImageData(imageData: ImageData) {
    const width = imageData.width;
    const height = imageData.height;

    // Create a new MeshImageMaterial with the same dimensions and data
    return new MeshImageMaterial(width, height, imageData.data);
  }

  markDirty(): void {
    this._isDirty = true;
  }
}

export class MinecraftSkinMaterial extends MeshImageMaterial {
  constructor(
    width: number = 64,
    height: number = 64,
    initialData?: Uint8ClampedArray,
  ) {
    super(width, height, initialData);
  }

  public convertToSlim() {
    const copy = this.clone();
    const mul = this.width === 128 ? 2 : 1;
    copy.clearRect(46 * mul, 52 * mul, 1 * mul, 12 * mul);
    copy.clearRect(47 * mul, 52 * mul, 1 * mul, 12 * mul);
    copy.clearRect(55 * mul, 20 * mul, 1 * mul, 12 * mul);
    copy.clearRect(54 * mul, 20 * mul, 1 * mul, 12 * mul);
    return copy;
  }

  public convertToClassic() {
    const copy = this.clone();
    const mul = this.width === 128 ? 2 : 1;
    copy.fillRect(46 * mul, 52 * mul, 1 * mul, 12 * mul, 255, 255, 255);
    copy.fillRect(47 * mul, 52 * mul, 1 * mul, 12 * mul, 255, 255, 255);
    copy.fillRect(55 * mul, 20 * mul, 1 * mul, 12 * mul, 255, 255, 255);
    copy.fillRect(54 * mul, 20 * mul, 1 * mul, 12 * mul, 255, 255, 255);
    return copy;
  }

  /**
   * Returns a copy with every skin box flipped front↔back (reflected across the
   * model's depth center plane): what faced forward now faces backward. Texels
   * outside the skin faces are left untouched. `slim` selects the 3px arm
   * unwrap so the arm faces are remapped at the right width.
   */
  public flipFrontToBack(slim: boolean) {
    const copy = this.clone();
    const src = this.imageData.data;
    const dst = copy.imageData.data;
    const { width, height } = this;
    const scale = width === 128 ? 2 : 1;
    for (let v = 0; v < height; v++) {
      for (let u = 0; u < width; u++) {
        const t = flipSkinTexelFrontBack(u, v, { scale, slim });
        if (!t) continue;
        const s = (v * width + u) * 4;
        const d = (t.v * width + t.u) * 4;
        dst[d] = src[s];
        dst[d + 1] = src[s + 1];
        dst[d + 2] = src[s + 2];
        dst[d + 3] = src[s + 3];
      }
    }
    return copy;
  }

  public get version() {
    const { data, width } = this.imageData;
    const mul = width === 128 ? 2 : 1;
    const colHeight = 12 * mul;
    const checkColumn = (x: number, startY: number): boolean => {
      for (let i = 0; i < colHeight; i++) {
        const y = startY + i;
        const idx = (y * width + x) * 4;
        if (data[idx] || data[idx + 1] || data[idx + 2] || data[idx + 3])
          return false;
      }
      return true;
    };
    if (!checkColumn(46 * mul, 52 * mul)) {
      return "classic";
    }
    if (!checkColumn(47 * mul, 52 * mul)) {
      return "classic";
    }
    if (!checkColumn(55 * mul, 20 * mul)) {
      return "classic";
    }
    if (!checkColumn(54 * mul, 20 * mul)) {
      return "classic";
    }
    return "slim";
  }

  /**
   * Loads an image from an Image object into the texture
   * @param img The Image object to load
   */
  static createFrom64Image(img: HTMLImageElement): MinecraftSkinMaterial {
    // Create a canvas to draw the image and extract its pixel data
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Could not get 2D context from canvas");
    }

    canvas.width = 64;
    canvas.height = 64;

    // Draw the image onto the canvas
    ctx.drawImage(img, 0, 0);

    // Get the image data
    const imageData = ctx.getImageData(0, 0, 64, 64);

    return new MinecraftSkinMaterial(64, 64, imageData.data);
  }

  static createFrom32Image(img: HTMLImageElement): MinecraftSkinMaterial {
    // Create a canvas to draw the image and extract its pixel data
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Could not get 2D context from canvas");
    }

    canvas.width = 64;
    canvas.height = 64;

    // Draw the original image (64x32) onto the canvas (64x64)
    ctx.drawImage(img, 0, 0);

    // Create a temporary canvas for flipping operations
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) {
      throw new Error("Could not get 2D context from temporary canvas");
    }
    tempCanvas.width = 64;
    tempCanvas.height = 64;

    // Helper function to crop
    const cropFlipAndPaste = (
      srcX: number,
      srcY: number,
      width: number,
      height: number,
      destX: number,
      destY: number,
    ) => {
      tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
      tempCtx.drawImage(img, srcX, srcY, width, height, 0, 0, width, height);
      tempCtx.save();
      tempCtx.scale(-1, 1);
      tempCtx.drawImage(
        tempCanvas,
        0,
        0,
        width,
        height,
        -width,
        0,
        width,
        height,
      );
      tempCtx.restore();
      ctx.drawImage(
        tempCanvas,
        0,
        0,
        width,
        height,
        destX,
        destY,
        width,
        height,
      );
    };

    // Apply all crop, flip and paste operations from the ImageMagick script
    cropFlipAndPaste(4, 16, 4, 4, 20, 48);
    cropFlipAndPaste(8, 16, 4, 4, 24, 48);
    cropFlipAndPaste(8, 20, 4, 12, 16, 52);
    cropFlipAndPaste(4, 20, 4, 12, 20, 52);
    cropFlipAndPaste(0, 20, 4, 12, 24, 52);
    cropFlipAndPaste(12, 20, 4, 12, 28, 52);
    cropFlipAndPaste(44, 16, 4, 4, 36, 48);
    cropFlipAndPaste(48, 16, 4, 4, 40, 48);
    cropFlipAndPaste(48, 20, 4, 12, 32, 52);
    cropFlipAndPaste(44, 20, 4, 12, 36, 52);
    cropFlipAndPaste(40, 20, 4, 12, 40, 52);
    cropFlipAndPaste(52, 20, 4, 12, 44, 52);

    // Get the image data
    const imageData = ctx.getImageData(0, 0, 64, 64);

    return new MinecraftSkinMaterial(64, 64, imageData.data);
  }

  static createFrom128Image(img: HTMLImageElement): MinecraftSkinMaterial {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Could not get 2D context from canvas");
    }

    canvas.width = 128;
    canvas.height = 128;

    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, 128, 128);

    return new MinecraftSkinMaterial(128, 128, imageData.data);
  }

  static createFromImageData(imageData: ImageData) {
    const width = imageData.width;
    const height = imageData.height;

    // Create a new with the same dimensions and data
    return new MinecraftSkinMaterial(width, height, imageData.data);
  }

  static upscale64to128(imageData: ImageData): ImageData {
    const result = new ImageData(128, 128);
    const src = imageData.data;
    const dst = result.data;
    for (let y = 0; y < 64; y++) {
      const rowStart = y * 64 * 4;
      const dstRow0 = y * 2 * 128 * 4;
      const dstRow1 = dstRow0 + 128 * 4;
      for (let x = 0; x < 64; x++) {
        const srcIdx = rowStart + x * 4;
        const r = src[srcIdx];
        const g = src[srcIdx + 1];
        const b = src[srcIdx + 2];
        const a = src[srcIdx + 3];
        const dx = x * 2 * 4;
        const p0 = dstRow0 + dx;
        const p1 = p0 + 4;
        const p2 = dstRow1 + dx;
        const p3 = p2 + 4;
        dst[p0] = r; dst[p0 + 1] = g; dst[p0 + 2] = b; dst[p0 + 3] = a;
        dst[p1] = r; dst[p1 + 1] = g; dst[p1 + 2] = b; dst[p1 + 3] = a;
        dst[p2] = r; dst[p2 + 1] = g; dst[p2 + 2] = b; dst[p2 + 3] = a;
        dst[p3] = r; dst[p3 + 1] = g; dst[p3 + 2] = b; dst[p3 + 3] = a;
      }
    }
    return result;
  }

  static downscale128to64(imageData: ImageData): ImageData {
    const result = new ImageData(64, 64);
    const src = imageData.data;
    const dst = result.data;
    for (let y = 0; y < 64; y++) {
      const srcRow = y * 2 * 128 * 4;
      const dstRow = y * 64 * 4;
      for (let x = 0; x < 64; x++) {
        const srcIdx = srcRow + x * 2 * 4;
        const dstIdx = dstRow + x * 4;
        dst[dstIdx] = src[srcIdx];
        dst[dstIdx + 1] = src[srcIdx + 1];
        dst[dstIdx + 2] = src[srcIdx + 2];
        dst[dstIdx + 3] = src[srcIdx + 3];
      }
    }
    return result;
  }

  /**
   * Loads an image from a URL into the texture
   * @param url The URL of the image to load (can be a data URL)
   * @param resize Whether to resize the texture to match the loaded image dimensions (default: true)
   * @returns A promise that resolves when the image has been loaded
   */
  static async createFromUrl(url: string): Promise<MinecraftSkinMaterial> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        try {
          resolve(this.createFrom64Image(img));
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error(`Failed to load image from URL: ${url}`));
      };

      img.src = url;
    });
  }

  static async creatFromUrl(url: string): Promise<MinecraftSkinMaterial> {
    const mskin = await MinecraftSkinMaterial.createFromUrl(url);
    return mskin;
  }

  clone(): MinecraftSkinMaterial {
    const newData = new Uint8ClampedArray(this.imageData.data);
    return new MinecraftSkinMaterial(this.width, this.height, newData);
  }
}
