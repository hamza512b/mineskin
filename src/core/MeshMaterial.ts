import { hexToRgb } from "./utils";

export type MeshMaterial = object;

export class MeshColorMaterial implements MeshMaterial {
  private red;
  private blue;
  private green;
  private alpha;

  constructor(r: number, g: number, b: number, a: number = 255) {
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

export class MeshImageMaterial implements MeshMaterial {
  private image: ImageData;

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

    this.image = new ImageData(
      initialData || new Uint8ClampedArray(width * height * 4).fill(0),
      width,
      height,
    );
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
    // Clamp rectangle to texture bounds
    const x1 = Math.max(0, Math.min(this.width - 1, x));
    const y1 = Math.max(0, Math.min(this.height - 1, y));
    const x2 = Math.max(0, Math.min(this.width, x + width));
    const y2 = Math.max(0, Math.min(this.height, y + height));

    // Fill the rectangle pixel by pixel
    for (let py = y1; py < y2; py++) {
      for (let px = x1; px < x2; px++) {
        this.setPixel(px, py, r, g, b, a);
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
    this.fill(0, 0, 0, 0);
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
    copy.clearRect(46, 52, 1, 12);
    copy.clearRect(47, 52, 1, 12);
    copy.clearRect(55, 20, 1, 12);
    copy.clearRect(54, 20, 1, 12);
    return copy;
  }

  public convertToClassic() {
    const copy = this.clone();
    copy.fillRect(46, 52, 1, 12, 255, 255, 255);
    copy.fillRect(47, 52, 1, 12, 255, 255, 255);
    copy.fillRect(55, 20, 1, 12, 255, 255, 255);
    copy.fillRect(54, 20, 1, 12, 255, 255, 255);
    return copy;
  }

  public get version() {
    const { data, width } = this.imageData;
    const checkColumn = (x: number, startY: number): boolean => {
      for (let i = 0; i < 12; i++) {
        const y = startY + i;
        const idx = (y * width + x) * 4;
        if (data[idx] || data[idx + 1] || data[idx + 2] || data[idx + 3])
          return false;
      }
      return true;
    };
    if (!checkColumn(46, 52)) {
      return "classic";
    }
    if (!checkColumn(47, 52)) {
      return "classic";
    }
    if (!checkColumn(55, 20)) {
      return "classic";
    }
    if (!checkColumn(54, 20)) {
      return "classic";
    }
    return "slim";
  }

  /**
   * Loads an image from an Image object into the texture
   * @param img The Image object to load
   */
  static createFrom64Image(

    img: HTMLImageElement,
  ): MinecraftSkinMaterial {
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

  static createFrom32Image(
    img: HTMLImageElement,
  ): MinecraftSkinMaterial {
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
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) {
      throw new Error('Could not get 2D context from temporary canvas');
    }
    tempCanvas.width = 64;
    tempCanvas.height = 64;

    // Helper function to crop
    const cropFlipAndPaste = (srcX: number, srcY: number, width: number, height: number, destX: number, destY: number) => {
      tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
      tempCtx.drawImage(img, srcX, srcY, width, height, 0, 0, width, height);
      tempCtx.save();
      tempCtx.scale(-1, 1);
      tempCtx.drawImage(tempCanvas, 0, 0, width, height, -width, 0, width, height);
      tempCtx.restore();
      ctx.drawImage(tempCanvas, 0, 0, width, height, destX, destY, width, height);
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

  static createFromImageData(imageData: ImageData) {
    const width = imageData.width;
    const height = imageData.height;

    // Create a new with the same dimensions and data
    return new MinecraftSkinMaterial(width, height, imageData.data);
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
