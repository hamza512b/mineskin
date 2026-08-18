import { useEffect, useRef } from "react";
import { useStore } from "zustand";
import {
  rendererStore,
  getRendererState,
  subscribeToRenderer,
  defaultFormValues,
} from "./rendererStore";

export { BRUSH_INTRO_HINT_KEY } from "./rendererStore";
import type {
  RendererStore,
  FormValues,
  HistorySnapshot,
  FieldErrors,
  Parts,
  Layers,
  PaintMode,
  EditorMode,
  EnvironmentPreset,
} from "./types";

// Re-export types
export type {
  RendererStore,
  FormValues,
  HistorySnapshot,
  FieldErrors,
  Parts,
  Layers,
  PaintMode,
  EditorMode,
  EnvironmentPreset,
};

// Re-export constants
export {
  FOG_COLOR_LIGHT,
  FOG_COLOR_DARK,
  FLOOR_COLOR_LIGHT,
  FLOOR_COLOR_DARK,
  getVisibilityKey,
  getPaintOverlay,
} from "./types";

// Re-export store utilities
export {
  rendererStore,
  getRendererState,
  subscribeToRenderer,
  defaultFormValues,
};

/**
 * React hook for accessing the renderer store with selectors.
 * Uses shallow equality by default for better performance.
 *
 * @example
 * // Select a single value
 * const paintColor = useRendererStore((state) => state.paintColor);
 *
 * @example
 * // Select multiple values (use separate calls or useMemo)
 * const cameraPhi = useRendererStore((state) => state.cameraPhi);
 * const cameraTheta = useRendererStore((state) => state.cameraTheta);
 *
 * @example
 * // Select an action
 * const setValue = useRendererStore((state) => state.setValue);
 */
export function useRendererStore<T>(selector: (state: RendererStore) => T): T {
  return useStore(rendererStore, selector);
}

// Computed selectors for common use cases

/**
 * Get undo count (number of undo steps available)
 */
export const selectUndoCount = (state: RendererStore): number =>
  Math.max(0, state.undoStack.length - 1);

/**
 * Get redo count (number of redo steps available)
 */
export const selectRedoCount = (state: RendererStore): number =>
  state.redoStack.length;

/**
 * Check if any overlay part is visible (for paint overlay logic)
 */
export const selectPaintOverlay = (state: RendererStore): boolean =>
  state.overlayheadVisible ||
  state.overlaybodyVisible ||
  state.overlayleftArmVisible ||
  state.overlayrightArmVisible ||
  state.overlayleftLegVisible ||
  state.overlayrightLegVisible;

/**
 * Get visibility for a specific part
 */
export const selectPartVisibility =
  (layer: Layers, part: Parts) =>
  (state: RendererStore): boolean => {
    const key = `${layer}${part}Visible` as keyof FormValues;
    return state[key] as boolean;
  };

// Legacy compatibility layer - maps old nested structure to flat structure
// This allows gradual migration of components

/**
 * @deprecated Use direct state access instead of state.values.X
 * This is a compatibility layer for gradual migration.
 */
export interface LegacyRendererState {
  state: null; // No longer used
  values: FormValues;
  errors: FieldErrors;
  undoCount: number;
  redoCount: number;
  hasCompletedTutorial: boolean;
  setState: (state: null) => void;
  setValues: (values: FormValues) => void;
  setErrors: (errors: FieldErrors) => void;
  setUndoCount: (count: number) => void;
  setRedoCount: (count: number) => void;
  setHasCompletedTutorial: (completed: boolean) => void;
  handleChange: (
    name: keyof FormValues,
    value: string | number | boolean,
    origin?: string,
  ) => void;
}

/**
 * @deprecated Use useRendererStore directly instead.
 * This hook provides backward compatibility during migration.
 */
export function useLegacyRendererStore<T>(
  selector: (state: LegacyRendererState) => T,
): T {
  return useStore(rendererStore, (state) => {
    // Create legacy-compatible structure
    const legacyState: LegacyRendererState = {
      state: null,
      values: {
        paintColor: state.paintColor,
        paintAlpha: state.paintAlpha,
        skinIsPocket: state.skinIsPocket,
        skinIsDoubleRes: state.skinIsDoubleRes,
        objectTranslationX: state.objectTranslationX,
        objectTranslationY: state.objectTranslationY,
        objectTranslationZ: state.objectTranslationZ,
        objectRotationX: state.objectRotationX,
        objectRotationY: state.objectRotationY,
        objectRotationZ: state.objectRotationZ,
        cameraPhi: state.cameraPhi,
        cameraTheta: state.cameraTheta,
        cameraRadius: state.cameraRadius,
        diffuseLightPositionX: state.diffuseLightPositionX,
        diffuseLightPositionY: state.diffuseLightPositionY,
        diffuseLightPositionZ: state.diffuseLightPositionZ,
        cameraFieldOfView: state.cameraFieldOfView,
        cameraSpeed: state.cameraSpeed,
        cameraDampingFactor: state.cameraDampingFactor,
        ambientLight: state.ambientLight,
        specularStrength: state.specularStrength,
        diffuseStrength: state.diffuseStrength,
        colorPickerActive: state.colorPickerActive,
        touchDrawMode: state.touchDrawMode,
        paintMode: state.paintMode,
        variationIntensity: state.variationIntensity,
        bulkPaintRadius: state.bulkPaintRadius,
        bulkPaintShape: state.bulkPaintShape,
        eraserRadius: state.eraserRadius,
        mirrorPaint: state.mirrorPaint,
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
        directionalLightIntensity: state.directionalLightIntensity,
        mode: state.mode,
        gridVisible: state.gridVisible,
        floorColor: state.floorColor,
        environmentPreset: state.environmentPreset,
        poseMode: state.poseMode,
        poseTool: state.poseTool,
        poseSnap: state.poseSnap,
        poseMirror: state.poseMirror,
        pose: state.pose,
      },
      errors: state.errors,
      undoCount: Math.max(0, state.undoStack.length - 1),
      redoCount: state.redoStack.length,
      hasCompletedTutorial: state.hasCompletedTutorial,
      setState: () => {},
      setValues: (values) => state.setAll(values),
      setErrors: () => {},
      setUndoCount: () => {},
      setRedoCount: () => {},
      setHasCompletedTutorial: state.setHasCompletedTutorial,
      handleChange: (name, value, origin) =>
        state.setValue(name, value as never, origin),
    };
    return selector(legacyState);
  });
}

/**
 * Initializes the renderer state from localStorage.
 * Call this once at app startup in a layout component.
 */
export function useInitRendererState() {
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    // Load state from localStorage
    getRendererState().load();
  }, []);
}
