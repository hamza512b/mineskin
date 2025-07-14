import { degToRad } from "./utils";

export const FOG_COLOR_LIGHT = "#FFFFFF";
export const FOG_COLOR_DARK = "#1A1D23";

export const FLOOR_COLOR_LIGHT = "#D9E2E9";
export const FLOOR_COLOR_DARK = "#16181D";

export interface StateShape {
  objectTranslationY: number;
  objectTranslationX: number;
  objectTranslationZ: number;
  objectRotationX: number;
  objectRotationY: number;
  objectRotationZ: number;
  cameraFieldOfView: number;
  cameraPhi: number;
  cameraTheta: number;
  cameraRadius: number;
  cameraSpeed: number;
  cameraDampingFactor: number;
  ambientLight: number;
  diffuseLightPositionX: number;
  diffuseLightPositionY: number;
  diffuseLightPositionZ: number;
  specularStrength: number;
  diffuseStrength: number;
  paintColor: string;
  floorColor: string;
  skinIsPocket: boolean;
  redoCount: number;
  undoCount: number;
  baseheadVisible: boolean;
  basebodyVisible: boolean;
  baseleftArmVisible: boolean;
  baserightArmVisible: boolean;
  baseleftLegVisible: boolean;
  baserightLegVisible: boolean;
  overlayheadVisible: boolean;
  overlaybodyVisible: boolean;
  overlayleftArmVisible: boolean;
  overlayrightArmVisible: boolean;
  overlayleftLegVisible: boolean;
  overlayrightLegVisible: boolean;
  colorPickerActive: boolean;
  paintMode: "pixel" | "bulk" | "eraser" | "variation";
  variationIntensity: number;
  directionalLightIntensity: number;
  mode: "Preview" | "Editing";
  gridVisible: boolean;
}
const old_localstorage_string = "rendererConfig_editor";
const current_localstorage_string = "rendererConfig_1";
const definedWindow = typeof window !== "undefined";

const isInitiallyDark = definedWindow
  ? window.matchMedia("(prefers-color-scheme: dark)").matches
  : false;
export type Parts =
  | "head"
  | "body"
  | "leftArm"
  | "rightArm"
  | "leftLeg"
  | "rightLeg";
export type Layers = "base" | "overlay";

function parseStringState(config: string): StateShape {
  try {
    return JSON.parse(config) as StateShape;
  } catch (error) {
    console.error("Failed to parse state:", error);
    return {} as StateShape;
  }
}
export class State {
  indexDB?: IDBDatabase | null = null;

  async initializeIndexDB() {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("MineskinSkin", 1);
      request.onerror = (event) => {
        console.error("Error opening IndexedDB:", event);
        reject(event);
      };
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.indexDB = db;
        resolve(db);
      };
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        db.createObjectStore("skins", { keyPath: "id" });
      };
    });
  }
  reset(): void {
    this.setAll(new State().toObject(), true, "localStorage");
    this.save();
  }

  async storeSkinImageData(
    skinImageData: ImageData,
    skinImageName: string,
  ): Promise<void> {
    if (!this.indexDB) {
      await this.initializeIndexDB();
    }
    const transaction = this.indexDB!.transaction("skins", "readwrite");
    const store = transaction.objectStore("skins");
    const skinData = {
      id: skinImageName,
      data: skinImageData.data.buffer,
    };
    store.put(skinData);
  }

  async readSkinImageData(skinImageName: string): Promise<ImageData | null> {
    if (!this.indexDB) {
      await this.initializeIndexDB();
    }
    return new Promise((resolve, reject) => {
      const transaction = this.indexDB!.transaction("skins", "readonly");
      const store = transaction.objectStore("skins");
      const request = store.get(skinImageName);
      request.onsuccess = (event) => {
        const result = (event.target as IDBRequest).result;
        if (result) {
          const imageData = new ImageData(
            new Uint8ClampedArray(result.data),
            64,
            64,
          );
          resolve(imageData);
        } else {
          resolve(null);
        }
      };
      request.onerror = (event) => {
        console.error("Error reading skin image data:", event);
        reject(event);
      };
    });
  }

  save() {
    const config = JSON.stringify(this.toObject());
    localStorage.setItem(current_localstorage_string, config);
  }
  static load() {
    const oldConfigString = localStorage.getItem(old_localstorage_string);
    const configString = localStorage.getItem(current_localstorage_string);
    if (oldConfigString && !configString) {
      const oldConfig = parseStringState(oldConfigString);
      const newState = new State();
      const newConfig = newState.toObject();
      for (const key in oldConfig) {
        if (newConfig[key as keyof StateShape] !== undefined) {
          newState.setAll(oldConfig, true, "localStorage");
          return newState;
        }
      }

      localStorage.setItem(
        current_localstorage_string,
        JSON.stringify(newConfig),
      );

      return newState;
    }

    if (!configString) {
      return new State();
    }
    const config = parseStringState(configString);
    const state = new State();
    state.setAll(config, true, "localStorage");
    return state;
  }

  private objectTranslationX = 0;
  private objectTranslationY = 0;
  private objectTranslationZ = 0;
  private objectRotationX = 0;
  private objectRotationY = 0;
  private objectRotationZ = 0;
  private cameraFieldOfView = degToRad(60);
  private cameraPhi = 0;
  private cameraTheta = 0;
  private cameraRadius = 35;
  private cameraSpeed = 0.08;
  private cameraDampingFactor = 0.1;
  private ambientLight = 1;
  private diffuseLightPositionX = -10;
  private diffuseLightPositionY = 10;
  private diffuseLightPositionZ = 10;
  private specularStrength = 0.05;
  private diffuseStrength = 0.6;
  private paintColor = "#000000";
  private floorColor = isInitiallyDark ? FLOOR_COLOR_DARK : FLOOR_COLOR_LIGHT;
  private skinIsPocket = false;
  private undoCount = 0;
  private redoCount = 0;
  private colorPickerActive = false;
  private paintMode = "pixel";
  private variationIntensity = 0.5;
  private directionalLightIntensity = 0.3;
  private baseheadVisible = true;
  private basebodyVisible = true;
  private baseleftArmVisible = true;
  private baserightArmVisible = true;
  private baseleftLegVisible = true;
  private baserightLegVisible = true;
  private overlayheadVisible = true;
  private overlaybodyVisible = true;
  private overlayleftArmVisible = true;
  private overlayrightArmVisible = true;
  private overlayleftLegVisible = true;
  private overlayrightLegVisible = true;
  private mode = "Preview" as "Preview" | "Editing";
  private gridVisible = false;

  private listeners: ((
    constants: State,
    origin: string | undefined,
    value: string,
  ) => void)[] = [];

  private notify(constants: State, origin: string | undefined, value: string) {
    this.listeners.forEach((listener) => listener(constants, origin, value));
  }

  public addListener(
    listener: (
      constants: State,
      origin: string | undefined,
      value: string,
    ) => void,
  ) {
    this.listeners.push(listener);
  }

  public removeListener(
    listener: (
      constants: State,
      origin: string | undefined,
      value: string,
    ) => void,
  ) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  // Getters
  public getObjectTranslationX() {
    return this.objectTranslationX;
  }
  public getObjectTranslationY() {
    return this.objectTranslationY;
  }
  public getObjectTranslationZ() {
    return this.objectTranslationZ;
  }
  public getObjectRotationX() {
    return this.objectRotationX;
  }
  public getObjectRotationY() {
    return this.objectRotationY;
  }
  public getObjectRotationZ() {
    return this.objectRotationZ;
  }
  public getCameraFieldOfView() {
    return this.cameraFieldOfView;
  }
  public getCameraPhi() {
    return this.cameraPhi;
  }
  public getCameraTheta() {
    return this.cameraTheta;
  }
  public getCameraRadius() {
    return this.cameraRadius;
  }
  public getCameraSpeed() {
    return this.cameraSpeed;
  }
  public getCameraDampingFactor() {
    return this.cameraDampingFactor;
  }
  public getAmbientLight() {
    return this.ambientLight;
  }
  public getUndoCount() {
    return this.undoCount;
  }
  public getRedoCount() {
    return this.redoCount;
  }
  public getDiffuseLightPositionX() {
    return this.diffuseLightPositionX;
  }
  public getDiffuseLightPositionY() {
    return this.diffuseLightPositionY;
  }
  public getDiffuseLightPositionZ() {
    return this.diffuseLightPositionZ;
  }
  public getSpecularStrength() {
    return this.specularStrength;
  }
  public getDiffuseStrength() {
    return this.diffuseStrength;
  }
  public getPaintColor() {
    return this.paintColor;
  }
  public getDirectionalLightIntensity() {
    return this.directionalLightIntensity;
  }
  public getGridVisible() {
    return this.gridVisible;
  }
  public getPaintOverlay(): boolean {
    const layers = [
      this.overlayheadVisible,
      this.overlaybodyVisible,
      this.overlayleftArmVisible,
      this.overlayrightArmVisible,
      this.overlayleftLegVisible,
      this.overlayrightLegVisible,
    ];
    // Return true if at least one overlay part is visible
    return layers.some((visible) => visible);
  }
  public getSkinIsPocket() {
    return this.skinIsPocket;
  }
  public getColorPickerActive() {
    return this.colorPickerActive;
  }
  public getPaintMode() {
    return this.paintMode;
  }
  public getVariationIntensity() {
    return this.variationIntensity;
  }
  public getFloorColor() {
    return this.floorColor;
  }
  public getBaseheadVisible() {
    return this.baseheadVisible;
  }
  public getBasebodyVisible() {
    return this.basebodyVisible;
  }
  public getBaseleftArmVisible() {
    return this.baseleftArmVisible;
  }
  public getBaserightArmVisible() {
    return this.baserightArmVisible;
  }
  public getBaseleftLegVisible() {
    return this.baseleftLegVisible;
  }
  public getBaserightLegVisible() {
    return this.baserightLegVisible;
  }
  public getOverlayheadVisible() {
    return this.overlayheadVisible;
  }
  public getOverlaybodyVisible() {
    return this.overlaybodyVisible;
  }
  public getOverlayleftArmVisible() {
    return this.overlayleftArmVisible;
  }
  public getOverlayrightArmVisible() {
    return this.overlayrightArmVisible;
  }
  public getOverlayleftLegVisible() {
    return this.overlayleftLegVisible;
  }
  public getOverlayrightLegVisible() {
    return this.overlayrightLegVisible;
  }

  public getPartVisibility(layer: Layers, part: Parts) {
    if (layer === "base") {
      if (part === "head") {
        return this.baseheadVisible;
      }
      if (part === "body") {
        return this.basebodyVisible;
      }
      if (part === "leftArm") {
        return this.baseleftArmVisible;
      }
      if (part === "rightArm") {
        return this.baserightArmVisible;
      }
      if (part === "leftLeg") {
        return this.baseleftLegVisible;
      }
      if (part === "rightLeg") {
        return this.baserightLegVisible;
      }
    }
    if (layer === "overlay") {
      if (part === "head") {
        return this.overlayheadVisible;
      }
      if (part === "body") {
        return this.overlaybodyVisible;
      }
      if (part === "leftArm") {
        return this.overlayleftArmVisible;
      }
      if (part === "rightArm") {
        return this.overlayrightArmVisible;
      }
      if (part === "leftLeg") {
        return this.overlayleftLegVisible;
      }
      if (part === "rightLeg") {
        return this.overlayrightLegVisible;
      }
    }

    throw new Error("Invalid layer or part");
  }
  public getMode() {
    return this.mode;
  }

  // Setters with an optional notify flag (defaults to true)
  public setObjectTranslationX(
    x: number,
    notify: boolean = true,
    origin?: string,
  ) {
    this.objectTranslationX = x;
    if (notify) this.notify(this, origin, "objectTranslationX");
  }
  public setObjectTranslationY(
    y: number,
    notify: boolean = true,
    origin?: string,
  ) {
    this.objectTranslationY = y;
    if (notify) this.notify(this, origin, "objectTranslationY");
  }
  public setObjectTranslationZ(
    z: number,
    notify: boolean = true,
    origin?: string,
  ) {
    this.objectTranslationZ = z;
    if (notify) this.notify(this, origin, "objectTranslationZ");
  }
  public setObjectRotationX(
    x: number,
    notify: boolean = true,
    origin?: string,
  ) {
    this.objectRotationX = x;
    if (notify) this.notify(this, origin, "objectRotationX");
  }
  public setObjectRotationY(
    y: number,
    notify: boolean = true,
    origin?: string,
  ) {
    this.objectRotationY = y;
    if (notify) this.notify(this, origin, "objectRotationY");
  }
  public setObjectRotationZ(
    z: number,
    notify: boolean = true,
    origin?: string,
  ) {
    this.objectRotationZ = z;
    if (notify) this.notify(this, origin, "objectRotationZ");
  }
  public setCameraFieldOfView(
    fov: number,
    notify: boolean = true,
    origin?: string,
  ) {
    this.cameraFieldOfView = fov;
    if (notify) this.notify(this, origin, "cameraFieldOfView");
  }
  public setCameraPhi(phi: number, notify: boolean = true, origin?: string) {
    this.cameraPhi = phi;
    if (notify) this.notify(this, origin, "cameraPhi");
  }
  public setCameraTheta(
    theta: number,
    notify: boolean = true,
    origin?: string,
  ) {
    this.cameraTheta = theta;
    if (notify) this.notify(this, origin, "cameraTheta");
  }
  public setCameraRadius(
    radius: number,
    notify: boolean = true,
    origin?: string,
  ) {
    this.cameraRadius = radius;
    if (notify) this.notify(this, origin, "cameraRadius");
  }
  public setCameraSpeed(
    speed: number,
    notify: boolean = true,
    origin?: string,
  ) {
    this.cameraSpeed = speed;
    if (notify) this.notify(this, origin, "cameraSpeed");
  }
  public setCameraDampingFactor(
    dampingFactor: number,
    notify: boolean = true,
    origin?: string,
  ) {
    this.cameraDampingFactor = dampingFactor;
    if (notify) this.notify(this, origin, "cameraDampingFactor");
  }
  public setAmbientLight(
    ambientLight: number,
    notify: boolean = true,
    origin?: string,
  ) {
    this.ambientLight = ambientLight;
    if (notify) this.notify(this, origin, "ambientLight");
  }
  public setDiffuseLightPositionX(
    x: number,
    notify: boolean = true,
    origin?: string,
  ) {
    this.diffuseLightPositionX = x;
    if (notify) this.notify(this, origin, "diffuseLightPositionX");
  }
  public setDiffuseLightPositionY(
    y: number,
    notify: boolean = true,
    origin?: string,
  ) {
    this.diffuseLightPositionY = y;
    if (notify) this.notify(this, origin, "diffuseLightPositionY");
  }
  public setDiffuseLightPositionZ(
    z: number,
    notify: boolean = true,
    origin?: string,
  ) {
    this.diffuseLightPositionZ = z;
    if (notify) this.notify(this, origin, "diffuseLightPositionZ");
  }
  public setSpecularStrength(
    strength: number,
    notify: boolean = true,
    origin?: string,
  ) {
    this.specularStrength = strength;
    if (notify) this.notify(this, origin, "specularStrength");
  }
  public setDiffuseStrength(
    strength: number,
    notify: boolean = true,
    origin?: string,
  ) {
    this.diffuseStrength = strength;
    if (notify) this.notify(this, origin, "diffuseStrength");
  }
  public setPaintColor(color: string, notify: boolean = true, origin?: string) {
    this.paintColor = color;
    if (notify) this.notify(this, origin, "paintColor");
  }
  public setFloorColor(color: string, notify: boolean = true, origin?: string) {
    this.floorColor = color;
    if (notify) this.notify(this, origin, "floorColor");
  }
  public setSkinIsPocket(
    skinIsPocket: boolean,
    notify: boolean = true,
    origin?: string,
  ) {
    this.skinIsPocket = skinIsPocket;
    if (notify) this.notify(this, origin, "skinIsPocket");
  }
  public setUndoCount(count: number, notify: boolean = true, origin?: string) {
    this.undoCount = count;
    if (notify) this.notify(this, origin, "undoCount");
  }
  public setRedoCount(count: number, notify: boolean = true, origin?: string) {
    this.redoCount = count;
    if (notify) this.notify(this, origin, "redoCount");
  }

  public setColorPickerActive(
    active: boolean,
    notify: boolean = true,
    origin?: string,
  ) {
    this.colorPickerActive = active;
    if (notify) this.notify(this, origin, "colorPickerActive");
  }
  public setPaintMode(
    mode: "pixel" | "bulk" | "eraser" | "variation",
    notify: boolean = true,
    origin?: string,
  ) {
    this.paintMode = mode;
    if (notify) this.notify(this, origin, "paintMode");
  }
  public setVariationIntensity(
    intensity: number,
    notify: boolean = true,
    origin?: string,
  ) {
    this.variationIntensity = intensity;
    if (notify) this.notify(this, origin, "variationIntensity");
  }

  public setDirectionalLightIntensity(
    value: number,
    notify: boolean = true,
    origin?: string,
  ) {
    this.directionalLightIntensity = value;
    if (notify) this.notify(this, origin, "directionalLightIntensity");
  }

  // toObject returns a plain object representation
  public toObject(): StateShape {
    return {
      objectTranslationX: this.objectTranslationX,
      objectTranslationY: this.objectTranslationY,
      objectTranslationZ: this.objectTranslationZ,
      objectRotationX: this.objectRotationX,
      objectRotationY: this.objectRotationY,
      objectRotationZ: this.objectRotationZ,
      cameraFieldOfView: this.cameraFieldOfView,
      cameraPhi: this.cameraPhi,
      cameraTheta: this.cameraTheta,
      cameraRadius: this.cameraRadius,
      cameraSpeed: this.cameraSpeed,
      cameraDampingFactor: this.cameraDampingFactor,
      ambientLight: this.ambientLight,
      diffuseLightPositionX: this.diffuseLightPositionX,
      diffuseLightPositionY: this.diffuseLightPositionY,
      diffuseLightPositionZ: this.diffuseLightPositionZ,
      specularStrength: this.specularStrength,
      diffuseStrength: this.diffuseStrength,
      paintColor: this.paintColor,
      floorColor: this.floorColor,
      skinIsPocket: this.skinIsPocket,
      redoCount: this.redoCount,
      undoCount: this.undoCount,
      baseheadVisible: this.baseheadVisible,
      basebodyVisible: this.basebodyVisible,
      baseleftArmVisible: this.baseleftArmVisible,
      baserightArmVisible: this.baserightArmVisible,
      baseleftLegVisible: this.baseleftLegVisible,
      baserightLegVisible: this.baserightLegVisible,
      overlayheadVisible: this.overlayheadVisible,
      overlaybodyVisible: this.overlaybodyVisible,
      overlayleftArmVisible: this.overlayleftArmVisible,
      overlayrightArmVisible: this.overlayrightArmVisible,
      overlayleftLegVisible: this.overlayleftLegVisible,
      overlayrightLegVisible: this.overlayrightLegVisible,
      colorPickerActive: this.colorPickerActive,
      variationIntensity: this.variationIntensity,
      paintMode: this.paintMode as "pixel" | "bulk" | "eraser" | "variation",
      directionalLightIntensity: this.directionalLightIntensity,
      mode: this.mode as "Preview" | "Editing",
      gridVisible: this.gridVisible,
    };
  }

  public setAll(
    config: StateShape,
    notify: boolean = true,
    origin?: string,
  ): void {
    this.objectTranslationX = config.objectTranslationX;
    this.objectTranslationY = config.objectTranslationY;
    this.objectTranslationZ = config.objectTranslationZ;
    this.objectRotationX = config.objectRotationX;
    this.objectRotationY = config.objectRotationY;
    this.objectRotationZ = config.objectRotationZ;
    this.cameraFieldOfView = config.cameraFieldOfView;
    this.cameraPhi = config.cameraPhi;
    this.cameraTheta = config.cameraTheta;
    this.cameraRadius = config.cameraRadius;
    this.cameraSpeed = config.cameraSpeed;
    this.cameraDampingFactor = config.cameraDampingFactor;
    this.ambientLight = config.ambientLight;
    this.diffuseLightPositionX = config.diffuseLightPositionX;
    this.diffuseLightPositionY = config.diffuseLightPositionY;
    this.diffuseLightPositionZ = config.diffuseLightPositionZ;
    this.specularStrength = config.specularStrength;
    this.diffuseStrength = config.diffuseStrength;
    this.paintColor = config.paintColor;
    this.floorColor = config.floorColor;
    this.skinIsPocket = config.skinIsPocket;
    this.redoCount = config.redoCount;
    this.undoCount = config.undoCount;
    this.baseheadVisible = config.baseheadVisible;
    this.basebodyVisible = config.basebodyVisible;
    this.baseleftArmVisible = config.baseleftArmVisible;
    this.baserightArmVisible = config.baserightArmVisible;
    this.baseleftLegVisible = config.baseleftLegVisible;
    this.baserightLegVisible = config.baserightLegVisible;
    this.overlayheadVisible = config.overlayheadVisible;
    this.overlaybodyVisible = config.overlaybodyVisible;
    this.overlayleftArmVisible = config.overlayleftArmVisible;
    this.overlayrightArmVisible = config.overlayrightArmVisible;
    this.overlayleftLegVisible = config.overlayleftLegVisible;
    this.overlayrightLegVisible = config.overlayrightLegVisible;
    this.mode = config.mode;
    this.gridVisible = config.gridVisible;

    this.colorPickerActive = config.colorPickerActive;
    this.paintMode = config.paintMode;
    this.variationIntensity = config.variationIntensity ?? 0.5;
    this.directionalLightIntensity = config.directionalLightIntensity;
    if (notify) {
      this.notify(this, origin, "all");
    }
  }
}

export const initialState = new State().toObject();
