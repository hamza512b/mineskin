import { z } from "zod";
import { MAX_VARIATION_STEPS } from "@/lib/utils";
import type { MinecraftSkinMaterial } from "../core/MeshMaterial";

// Constants
export const FOG_COLOR_LIGHT = "#FFFFFF";
export const FOG_COLOR_DARK = "#1A1D23";
export const FLOOR_COLOR_LIGHT = "#D9E2E9";
export const FLOOR_COLOR_DARK = "#16181D";

// LocalStorage keys
export const OLD_LOCALSTORAGE_KEY = "rendererConfig_editor";
export const CURRENT_LOCALSTORAGE_KEY = "rendererConfig_1";

// Types
export type Parts =
  | "head"
  | "body"
  | "leftArm"
  | "rightArm"
  | "leftLeg"
  | "rightLeg";

export type Layers = "base" | "overlay";

export type PaintMode = "pixel" | "bulk" | "eraser" | "variation" | "dither";

export type EditorMode = "Preview" | "Editing";
export type EnvironmentPreset = "grid" | "empty" | "grassland" | "scifi";

// History snapshot for undo/redo
export interface HistorySnapshot {
  material: MinecraftSkinMaterial;
  skinIsPocket: boolean;
  skinIsDoubleRes: boolean;
}

// Validation schema for form values
export const formSchema = z.object({
  paintColor: z.string(),
  paintAlpha: z
    .number({ error: "Please enter a valid number" })
    .min(0, "Alpha must be at least 0")
    .max(255, "Alpha cannot exceed 255"),
  skinIsPocket: z.boolean(),
  skinIsDoubleRes: z.boolean(),
  objectTranslationX: z
    .number({ error: "Please enter a valid number" })
    .min(-100, "The value cannot be less than -100")
    .max(100, "The value cannot be greater than 100"),
  objectTranslationY: z
    .number({ error: "Please enter a valid number" })
    .min(-100, "The value cannot be less than -100")
    .max(100, "The value cannot be greater than 100"),
  objectTranslationZ: z
    .number({ error: "Please enter a valid number" })
    .min(-100, "The value cannot be less than -100")
    .max(100, "The value cannot be greater than 100"),
  objectRotationX: z.number({ error: "Please enter a valid number" }),
  objectRotationY: z.number({ error: "Please enter a valid number" }),
  objectRotationZ: z.number({ error: "Please enter a valid number" }),
  cameraPhi: z.number({ error: "Please enter a valid number" }),
  cameraTheta: z.number({ error: "Please enter a valid number" }),
  cameraRadius: z
    .number({ error: "Please enter a valid number" })
    .min(0, "Radius must be positive"),
  diffuseLightPositionX: z
    .number({ error: "Please enter a valid number" })
    .min(-10, "The value cannot be less than -10")
    .max(10, "The value cannot be greater than 10"),
  diffuseLightPositionY: z
    .number({ error: "Please enter a valid number" })
    .min(-10, "The value cannot be less than -10")
    .max(10, "The value cannot be greater than 10"),
  diffuseLightPositionZ: z
    .number({ error: "Please enter a valid number" })
    .min(-10, "The value cannot be less than -10")
    .max(10, "The value cannot be greater than 10"),
  cameraFieldOfView: z
    .number({ error: "Please enter a valid number" })
    .min(0, "FOV must be positive")
    .max(180, "FOV cannot exceed 180°"),
  cameraSpeed: z
    .number({ error: "Please enter a valid number" })
    .min(0, "Speed must be positive")
    .max(2, "Speed cannot exceed 2"),
  cameraDampingFactor: z
    .number({ error: "Please enter a valid number" })
    .min(0, "Damping must be positive")
    .max(1, "Damping cannot exceed 1"),
  ambientLight: z
    .number({ error: "Please enter a valid number" })
    .min(0, "Ambient light must be positive")
    .max(1, "Ambient light cannot exceed 1"),
  specularStrength: z
    .number({ error: "Please enter a valid number" })
    .min(0, "Specular strength must be positive")
    .max(1, "Specular strength cannot exceed 1"),
  diffuseStrength: z
    .number({ error: "Please enter a valid number" })
    .min(0, "Diffuse strength must be positive")
    .max(1, "Diffuse strength cannot exceed 1"),
  colorPickerActive: z.boolean(),
  touchDrawMode: z.boolean(),
  paintMode: z.enum(["pixel", "bulk", "eraser", "variation", "dither"]),
  variationIntensity: z
    .number({ error: "Please enter a valid number" })
    .int("Variation intensity must be a whole number")
    .min(1, "Variation intensity must be at least 1")
    .max(
      MAX_VARIATION_STEPS,
      `Variation intensity cannot exceed ${MAX_VARIATION_STEPS}`,
    ),
  bulkPaintRadius: z
    .number({ error: "Please enter a valid number" })
    .min(0, "Bulk paint radius must be positive")
    .max(8, "Bulk paint radius cannot exceed 8"),
  bulkPaintShape: z.enum(["square", "circle"]),
  eraserRadius: z
    .number({ error: "Please enter a valid number" })
    .min(0, "Eraser radius must be positive")
    .max(8, "Eraser radius cannot exceed 8"),
  mirrorPaint: z.boolean(),
  baseheadVisible: z.boolean(),
  basebodyVisible: z.boolean(),
  baseleftArmVisible: z.boolean(),
  baserightArmVisible: z.boolean(),
  baseleftLegVisible: z.boolean(),
  baserightLegVisible: z.boolean(),
  overlayheadVisible: z.boolean(),
  overlaybodyVisible: z.boolean(),
  overlayleftArmVisible: z.boolean(),
  overlayrightArmVisible: z.boolean(),
  overlayleftLegVisible: z.boolean(),
  overlayrightLegVisible: z.boolean(),
  directionalLightIntensity: z.number({ error: "Please enter a valid number" }),
  mode: z.enum(["Preview", "Editing"]),
  gridVisible: z.boolean(),
  floorColor: z.string(),
  environmentPreset: z.enum(["grid", "empty", "grassland", "scifi"]),
});

export type FormValues = z.infer<typeof formSchema>;

export type FieldErrors = {
  [K in keyof FormValues]?: string;
};

// Persistable state (saved to localStorage)
export interface PersistableState extends FormValues {
  // Additional computed fields for persistence
  undoCount?: number;
  redoCount?: number;
}

// Full store state including history and UI state
export interface RendererStoreState extends FormValues {
  // Validation errors
  errors: FieldErrors;

  // History state (undo/redo)
  undoStack: HistorySnapshot[];
  redoStack: HistorySnapshot[];
  batchInProgress: boolean;
  batchBaseline: HistorySnapshot | null;

  // Per-skin history cache (in-memory, survives skin switches within a session)
  historyCache: Map<
    string,
    { undoStack: HistorySnapshot[]; redoStack: HistorySnapshot[] }
  >;

  // UI state
  hasCompletedTutorial: boolean;

  // Touch drawing state (runtime flag, not persisted)
  touchDrawActive: boolean;

  // IndexedDB reference
  indexDB: IDBDatabase | null;
}

// Store actions
export interface RendererStoreActions {
  // Single value setter with validation
  setValue: <K extends keyof FormValues>(
    key: K,
    value: FormValues[K],
    origin?: string,
  ) => void;

  // Bulk setter for loading saved state
  setAll: (values: Partial<FormValues>, origin?: string) => void;

  // Error management
  setError: (key: keyof FormValues, error: string | undefined) => void;
  clearErrors: () => void;

  // History actions
  beginBatch: (
    material: MinecraftSkinMaterial,
    skinIsPocket: boolean,
    skinIsDoubleRes: boolean,
  ) => void;
  endBatch: (
    material: MinecraftSkinMaterial,
    skinIsPocket: boolean,
    skinIsDoubleRes: boolean,
  ) => void;
  undo: () => HistorySnapshot | null;
  redo: () => HistorySnapshot | null;
  pushToUndoStack: (snapshot: HistorySnapshot) => void;
  clearHistory: () => void;
  stashHistory: (skinId: string) => void;
  restoreHistory: (skinId: string) => boolean;
  clearCachedHistory: (skinId: string) => void;

  // Persistence
  save: () => void;
  load: () => void;
  reset: () => void;

  // IndexedDB
  initializeIndexDB: () => Promise<IDBDatabase>;
  storeSkinImageData: (data: ImageData, name: string) => Promise<void>;
  readSkinImageData: (name: string) => Promise<ImageData | null>;

  // Tutorial
  setHasCompletedTutorial: (completed: boolean) => void;

  // Touch drawing
  setTouchDrawActive: (active: boolean) => void;
}

// Combined store type
export type RendererStore = RendererStoreState & RendererStoreActions;

// Helper to get visibility key
export function getVisibilityKey(layer: Layers, part: Parts): keyof FormValues {
  return `${layer}${part}Visible` as keyof FormValues;
}

// Helper to check if paint overlay is active
export function getPaintOverlay(state: FormValues): boolean {
  return (
    state.overlayheadVisible ||
    state.overlaybodyVisible ||
    state.overlayleftArmVisible ||
    state.overlayrightArmVisible ||
    state.overlayleftLegVisible ||
    state.overlayrightLegVisible
  );
}
