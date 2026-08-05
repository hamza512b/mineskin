import { createStore } from "zustand/vanilla";
import { z, ZodError } from "zod";
import { throttle } from "lodash";
import {
  RendererStore,
  FormValues,
  HistorySnapshot,
  formSchema,
  FLOOR_COLOR_LIGHT,
  FLOOR_COLOR_DARK,
  OLD_LOCALSTORAGE_KEY,
  CURRENT_LOCALSTORAGE_KEY,
} from "./types";
import { saveActiveSkinToLibrary } from "./libraryStore";
import { MAX_VARIATION_STEPS } from "@/lib/utils";

// Check if window is defined (SSR safety)
const definedWindow = typeof window !== "undefined";

// One-time "your tools moved into the brush slot" hint for returning users.
// Lives here (not in the hint component) because completing the tutorial —
// which now teaches the brush slot — must also mark the hint as seen.
export const BRUSH_INTRO_HINT_KEY = "brush-intro-hint-dismissed";

// Detect initial dark mode from the class set by the blocking script
const isInitiallyDark = definedWindow
  ? document.documentElement.classList.contains("dark")
  : false;

// Convert degrees to radians
function degToRad(d: number): number {
  return (d * Math.PI) / 180;
}

// Default values for all form fields
export const defaultFormValues: FormValues = {
  objectTranslationX: 0,
  objectTranslationY: 0,
  objectTranslationZ: 0,
  objectRotationX: 0,
  objectRotationY: 0,
  objectRotationZ: 0,
  cameraFieldOfView: degToRad(60),
  cameraPhi: 0,
  cameraTheta: 0,
  cameraRadius: 35,
  cameraSpeed: 0.08,
  cameraDampingFactor: 0.1,
  ambientLight: 1,
  diffuseLightPositionX: -10,
  diffuseLightPositionY: 10,
  diffuseLightPositionZ: 10,
  specularStrength: 0.05,
  diffuseStrength: 0.6,
  paintColor: "#000000",
  paintAlpha: 255,
  floorColor: isInitiallyDark ? FLOOR_COLOR_DARK : FLOOR_COLOR_LIGHT,
  skinIsPocket: false,
  skinIsDoubleRes: false,
  colorPickerActive: false,
  touchDrawMode: false,
  paintMode: "pixel",
  variationIntensity: 3,
  bulkPaintRadius: 0,
  bulkPaintShape: "circle",
  eraserRadius: 0,
  mirrorPaint: false,
  directionalLightIntensity: 0.3,
  baseheadVisible: true,
  basebodyVisible: true,
  baseleftArmVisible: true,
  baserightArmVisible: true,
  baseleftLegVisible: true,
  baserightLegVisible: true,
  overlayheadVisible: true,
  overlaybodyVisible: true,
  overlayleftArmVisible: true,
  overlayrightArmVisible: true,
  overlayleftLegVisible: true,
  overlayrightLegVisible: true,
  mode: "Preview",
  gridVisible: false,
  environmentPreset: "grid",
};

// Parse saved state from localStorage
function parseStringState(config: string): Partial<FormValues> {
  try {
    return JSON.parse(config) as Partial<FormValues>;
  } catch (error) {
    console.error("Failed to parse state:", error);
    return {};
  }
}

// Migrate persisted config from older schema versions.
function migrateConfig(config: Partial<FormValues>): Partial<FormValues> {
  let migrated = config;

  // The "plain" environment preset was renamed to "grid"; map it so existing
  // users keep their grid floor.
  if ((migrated.environmentPreset as string) === "plain") {
    migrated = { ...migrated, environmentPreset: "grid" };
  }

  // variationIntensity used to be a 0..1 fraction; it's now a discrete rung
  // count (1..MAX_VARIATION_STEPS). Legacy configs stored fractional values, so
  // rescale those onto the rung ladder. There is no "off" rung anymore, so
  // saved zeros (fractional-era or early rung-era) are bumped to 1.
  const vi = migrated.variationIntensity;
  if (typeof vi === "number" && vi < 1) {
    migrated = {
      ...migrated,
      variationIntensity: Math.max(1, Math.round(vi * MAX_VARIATION_STEPS)),
    };
  }

  return migrated;
}

// Check if two ImageData objects are equal
function areImageDataEqual(a: ImageData, b: ImageData): boolean {
  if (a.width !== b.width || a.height !== b.height) return false;
  for (let i = 0; i < a.data.length; i++) {
    if (a.data[i] !== b.data[i]) return false;
  }
  return true;
}

// Create the vanilla Zustand store
const createRendererStore = () =>
  createStore<RendererStore>()((set, get) => {
    // Throttled save function
    const throttledSave = throttle(() => {
      const state = get();
      const persistableState: Partial<FormValues> = {
        objectTranslationX: state.objectTranslationX,
        objectTranslationY: state.objectTranslationY,
        objectTranslationZ: state.objectTranslationZ,
        objectRotationX: state.objectRotationX,
        objectRotationY: state.objectRotationY,
        objectRotationZ: state.objectRotationZ,
        cameraFieldOfView: state.cameraFieldOfView,
        cameraPhi: state.cameraPhi,
        cameraTheta: state.cameraTheta,
        cameraRadius: state.cameraRadius,
        cameraSpeed: state.cameraSpeed,
        cameraDampingFactor: state.cameraDampingFactor,
        ambientLight: state.ambientLight,
        diffuseLightPositionX: state.diffuseLightPositionX,
        diffuseLightPositionY: state.diffuseLightPositionY,
        diffuseLightPositionZ: state.diffuseLightPositionZ,
        specularStrength: state.specularStrength,
        diffuseStrength: state.diffuseStrength,
        paintColor: state.paintColor,
        paintAlpha: state.paintAlpha,
        floorColor: state.floorColor,
        skinIsPocket: state.skinIsPocket,
        skinIsDoubleRes: state.skinIsDoubleRes,
        colorPickerActive: state.colorPickerActive,
        touchDrawMode: state.touchDrawMode,
        paintMode: state.paintMode,
        variationIntensity: state.variationIntensity,
        bulkPaintRadius: state.bulkPaintRadius,
        bulkPaintShape: state.bulkPaintShape,
        eraserRadius: state.eraserRadius,
        mirrorPaint: state.mirrorPaint,
        directionalLightIntensity: state.directionalLightIntensity,
        baseheadVisible: state.baseheadVisible,
        basebodyVisible: state.basebodyVisible,
        baseleftArmVisible: state.baseleftArmVisible,
        baserightArmVisible: state.baserightArmVisible,
        baseleftLegVisible: state.baseleftLegVisible,
        baserightLegVisible: state.baserightLegVisible,
        overlayheadVisible: state.overlayheadVisible,
        overlaybodyVisible: state.overlaybodyVisible,
        overlayleftArmVisible: state.overlayleftArmVisible,
        overlayrightArmVisible: state.overlayrightArmVisible,
        overlayleftLegVisible: state.overlayleftLegVisible,
        overlayrightLegVisible: state.overlayrightLegVisible,
        mode: state.mode,
        gridVisible: state.gridVisible,
        environmentPreset: state.environmentPreset,
      };
      localStorage.setItem(
        CURRENT_LOCALSTORAGE_KEY,
        JSON.stringify(persistableState),
      );
    }, 500);

    // Flush any pending throttled save before the page unloads so we
    // never lose recent state changes (e.g. part-filter toggles).
    if (definedWindow) {
      window.addEventListener("beforeunload", () => {
        throttledSave.flush();
      });
    }

    return {
      // Form values (flat, not nested)
      ...defaultFormValues,

      // Validation errors
      errors: {},

      // History state
      undoStack: [],
      redoStack: [],
      batchInProgress: false,
      batchBaseline: null,
      historyCache: new Map(),

      // UI state
      hasCompletedTutorial: false,

      // Touch drawing state (runtime flag, not persisted)
      touchDrawActive: false,

      // IndexedDB reference
      indexDB: null,

      // Actions

      setValue: (key, value, _origin) => {
        const valueSchema = formSchema.shape[key];
        const fieldSchema = z.object({ [key]: valueSchema });

        // Convert to number if needed
        const parsedValue =
          valueSchema instanceof z.ZodNumber ? Number(value) : value;

        const result = fieldSchema.safeParse({ [key]: parsedValue });

        if (result.success) {
          // Uppercase paint color
          const finalValue =
            key === "paintColor" && typeof parsedValue === "string"
              ? parsedValue.toUpperCase()
              : parsedValue;

          set((state) => {
            const hadError = state.errors[key] !== undefined;
            return {
              [key]: finalValue,
              ...(hadError
                ? { errors: { ...state.errors, [key]: undefined } }
                : null),
            };
          });

          // Auto-save on successful change
          throttledSave();
        } else {
          // Set error
          let error: string | undefined;
          if (result.error instanceof ZodError) {
            error = result.error.issues[0].message;
          }
          set((state) => {
            const errorUnchanged = state.errors[key] === error;
            return {
              [key]: value, // Still set the value for display
              ...(errorUnchanged
                ? null
                : { errors: { ...state.errors, [key]: error } }),
            };
          });
        }
      },

      setAll: (values, _origin) => {
        const updates: Partial<FormValues> = {};

        for (const [key, value] of Object.entries(values)) {
          if (value !== undefined) {
            // Uppercase paint color
            if (key === "paintColor" && typeof value === "string") {
              updates[key as keyof FormValues] = value.toUpperCase() as never;
            } else {
              updates[key as keyof FormValues] = value as never;
            }
          }
        }

        set(updates);
      },

      setError: (key, error) => {
        set((state) => {
          if (state.errors[key] === error) return {};
          return { errors: { ...state.errors, [key]: error } };
        });
      },

      clearErrors: () => {
        set({ errors: {} });
      },

      // History actions
      beginBatch: (material, skinIsPocket, skinIsDoubleRes) => {
        const state = get();
        if (!state.batchInProgress) {
          set({
            batchInProgress: true,
            batchBaseline: {
              material: material.clone(),
              skinIsPocket,
              skinIsDoubleRes,
            },
          });
        }
      },

      endBatch: (material, skinIsPocket, skinIsDoubleRes) => {
        const state = get();
        if (!state.batchInProgress) return;

        const snapshot: HistorySnapshot = {
          material: material.clone(),
          skinIsPocket,
          skinIsDoubleRes,
        };

        const baseline = state.batchBaseline;
        if (
          baseline &&
          (!areImageDataEqual(
            baseline.material.imageData,
            material.imageData,
          ) ||
            baseline.skinIsPocket !== skinIsPocket ||
            baseline.skinIsDoubleRes !== skinIsDoubleRes)
        ) {
          set((state) => ({
            undoStack: [...state.undoStack, snapshot],
            redoStack: [],
            batchInProgress: false,
            batchBaseline: null,
          }));

          saveActiveSkinToLibrary(
            snapshot.material.imageData,
            skinIsPocket,
            skinIsDoubleRes,
          );
        } else {
          set({
            batchInProgress: false,
            batchBaseline: null,
          });
        }
      },

      undo: () => {
        const state = get();
        if (state.undoStack.length > 1) {
          const current = state.undoStack[state.undoStack.length - 1];
          const newUndoStack = state.undoStack.slice(0, -1);
          const prev = newUndoStack[newUndoStack.length - 1];

          set({
            undoStack: newUndoStack,
            redoStack: [...state.redoStack, current],
            skinIsPocket: prev.skinIsPocket,
            skinIsDoubleRes: prev.skinIsDoubleRes,
          });

          saveActiveSkinToLibrary(
            prev.material.imageData,
            prev.skinIsPocket,
            prev.skinIsDoubleRes,
          );

          return prev;
        }
        return null;
      },

      redo: () => {
        const state = get();
        if (state.redoStack.length > 0) {
          const next = state.redoStack[state.redoStack.length - 1];
          const newRedoStack = state.redoStack.slice(0, -1);

          set({
            undoStack: [...state.undoStack, next],
            redoStack: newRedoStack,
            skinIsPocket: next.skinIsPocket,
            skinIsDoubleRes: next.skinIsDoubleRes,
          });

          saveActiveSkinToLibrary(
            next.material.imageData,
            next.skinIsPocket,
            next.skinIsDoubleRes,
          );

          return next;
        }
        return null;
      },

      pushToUndoStack: (snapshot) => {
        set((state) => ({
          undoStack: [...state.undoStack, snapshot],
          redoStack: [],
        }));
      },

      clearHistory: () => {
        set({
          undoStack: [],
          redoStack: [],
          batchInProgress: false,
          batchBaseline: null,
        });
      },

      stashHistory: (skinId) => {
        const state = get();
        state.historyCache.set(skinId, {
          undoStack: state.undoStack.map((s) => ({
            material: s.material.clone(),
            skinIsPocket: s.skinIsPocket,
            skinIsDoubleRes: s.skinIsDoubleRes,
          })),
          redoStack: state.redoStack.map((s) => ({
            material: s.material.clone(),
            skinIsPocket: s.skinIsPocket,
            skinIsDoubleRes: s.skinIsDoubleRes,
          })),
        });
      },

      restoreHistory: (skinId) => {
        const state = get();
        const cached = state.historyCache.get(skinId);
        if (!cached) return false;
        state.historyCache.delete(skinId);
        set({
          undoStack: cached.undoStack.map((s) => ({
            material: s.material.clone(),
            skinIsPocket: s.skinIsPocket,
            skinIsDoubleRes: s.skinIsDoubleRes,
          })),
          redoStack: cached.redoStack.map((s) => ({
            material: s.material.clone(),
            skinIsPocket: s.skinIsPocket,
            skinIsDoubleRes: s.skinIsDoubleRes,
          })),
          batchInProgress: false,
          batchBaseline: null,
        });
        return true;
      },

      clearCachedHistory: (skinId) => {
        get().historyCache.delete(skinId);
      },

      // Persistence
      save: () => {
        throttledSave();
      },

      load: () => {
        if (!definedWindow) return;

        // Try to migrate from old localStorage key
        const oldConfigString = localStorage.getItem(OLD_LOCALSTORAGE_KEY);
        const configString = localStorage.getItem(CURRENT_LOCALSTORAGE_KEY);

        if (oldConfigString && !configString) {
          const oldConfig = parseStringState(oldConfigString);
          set({ ...defaultFormValues, ...migrateConfig(oldConfig) });
          throttledSave();
          return;
        }

        if (configString) {
          const config = parseStringState(configString);
          set({ ...defaultFormValues, ...migrateConfig(config) });
        }

        // Load tutorial state
        try {
          const tutorialState = localStorage.getItem("tutorial-state");
          if (tutorialState) {
            const parsed = JSON.parse(tutorialState);
            if (parsed.state?.hasCompletedTutorial !== undefined) {
              set({ hasCompletedTutorial: parsed.state.hasCompletedTutorial });
            }
          }
        } catch {
          // Ignore parsing errors
        }
      },

      reset: () => {
        set({ ...defaultFormValues });
        throttledSave();
      },

      // IndexedDB
      initializeIndexDB: () => {
        return new Promise<IDBDatabase>((resolve, reject) => {
          const request = indexedDB.open("MineskinSkin", 3);

          request.onerror = (event) => {
            console.error("Error opening IndexedDB:", event);
            reject(event);
          };

          request.onsuccess = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            // Drop the cached handle if the browser closes the connection (e.g.
            // iOS bfcache) or another tab upgrades the schema, so the next call
            // reopens instead of throwing "database connection is closing".
            db.onclose = () => {
              if (get().indexDB === db) set({ indexDB: null });
            };
            db.onversionchange = () => {
              db.close();
              if (get().indexDB === db) set({ indexDB: null });
            };
            set({ indexDB: db });
            resolve(db);
          };

          request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            const oldVersion = (event as IDBVersionChangeEvent).oldVersion;

            if (oldVersion < 1) {
              db.createObjectStore("skins", { keyPath: "id" });
            }
            if (oldVersion < 2) {
              db.createObjectStore("library", { keyPath: "id" });
            }
            if (oldVersion < 3) {
              db.createObjectStore("references", { keyPath: "id" });
            }
          };
        });
      },

      storeSkinImageData: async (data, name) => {
        let { indexDB } = get();
        if (!indexDB) {
          indexDB = await get().initializeIndexDB();
        }

        const transaction = indexDB.transaction("skins", "readwrite");
        const store = transaction.objectStore("skins");
        const skinData = {
          id: name,
          data: data.data.buffer,
        };
        store.put(skinData);
      },

      readSkinImageData: async (name) => {
        let { indexDB } = get();
        if (!indexDB) {
          indexDB = await get().initializeIndexDB();
        }

        return new Promise((resolve, reject) => {
          const transaction = indexDB!.transaction("skins", "readonly");
          const store = transaction.objectStore("skins");
          const request = store.get(name);

          request.onsuccess = (event) => {
            const result = (event.target as IDBRequest).result;
            if (result) {
              const bufLen = result.data.byteLength;
              const dim = bufLen === 128 * 128 * 4 ? 128 : 64;
              const imageData = new ImageData(
                new Uint8ClampedArray(result.data),
                dim,
                dim,
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
      },

      // Tutorial
      setHasCompletedTutorial: (completed) => {
        // The tutorial teaches the brush slot, so the returning-user
        // "tools moved here" hint would be redundant right after it.
        if (definedWindow && completed) {
          try {
            localStorage.setItem(BRUSH_INTRO_HINT_KEY, "true");
          } catch {
            // Ignore errors
          }
        }
        set({ hasCompletedTutorial: completed });
        // Also persist to localStorage for the old tutorial-state format
        if (definedWindow) {
          try {
            const tutorialState = localStorage.getItem("tutorial-state");
            const parsed = tutorialState
              ? JSON.parse(tutorialState)
              : { state: {} };
            parsed.state = { ...parsed.state, hasCompletedTutorial: completed };
            localStorage.setItem("tutorial-state", JSON.stringify(parsed));
          } catch {
            // Ignore errors
          }
        }
      },

      // Touch drawing
      setTouchDrawActive: (active) => {
        set({ touchDrawActive: active });
      },
    };
  });

// In dev, pin the store on globalThis so HMR re-evaluation of this module
// doesn't replace it with a fresh instance and wipe all runtime state.
// Trade-off: edits to store action logic need a manual refresh to apply.
const globalStores = globalThis as unknown as {
  __mineskinRendererStore?: ReturnType<typeof createRendererStore>;
};

export const rendererStore =
  process.env.NODE_ENV === "production"
    ? createRendererStore()
    : (globalStores.__mineskinRendererStore ??= createRendererStore());

// Export getState and subscribe for non-React usage
export const getRendererState = rendererStore.getState;
export const subscribeToRenderer = rendererStore.subscribe;
