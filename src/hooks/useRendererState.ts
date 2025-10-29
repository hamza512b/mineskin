import { omit } from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";
import { z, ZodError } from "zod";
import { initialState, State, StateShape } from "../core/State";

/**
 * Schema should be on nested level because this how validation is done
 * */
const formSchema = z.object({
  paintColor: z.string(),
  skinIsPocket: z.boolean(),
  objectTranslationX: z
    .number({
      error: "Please enter a valid number",
    })
    .min(-100, "The value cannot be less than -100")
    .max(100, "The value cannot be greater than 100"),
  objectTranslationY: z
    .number({
      error: "Please enter a valid number",
    })
    .min(-100, "The value cannot be less than -100")
    .max(100, "The value cannot be greater than 100"),
  objectTranslationZ: z
    .number({
      error: "Please enter a valid number",
    })
    .min(-100, "The value cannot be less than -100")
    .max(100, "The value cannot be greater than 100"),
  objectRotationX: z.number({
    error: "Please enter a valid number",
  }),
  objectRotationY: z.number({
    error: "Please enter a valid number",
  }),
  objectRotationZ: z.number({
    error: "Please enter a valid number",
  }),
  cameraPhi: z.number({
    error: "Please enter a valid number",
  }),
  cameraTheta: z.number({
    error: "Please enter a valid number",
  }),
  cameraRadius: z
    .number({
      error: "Please enter a valid number",
    })
    .min(0, "Radius must be positive"),
  diffuseLightPositionX: z
    .number({
      error: "Please enter a valid number",
    })
    .min(-10, "The value cannot be less than -10")
    .max(10, "The value cannot be greater than 10"),
  diffuseLightPositionY: z
    .number({
      error: "Please enter a valid number",
    })
    .min(-10, "The value cannot be less than -10")
    .max(10, "The value cannot be greater than 10"),
  diffuseLightPositionZ: z
    .number({
      error: "Please enter a valid number",
    })
    .min(-10, "The value cannot be less than -10")
    .max(10, "The value cannot be greater than 10"),
  cameraFieldOfView: z
    .number({
      error: "Please enter a valid number",
    })
    .min(0, "FOV must be positive")
    .max(180, "FOV cannot exceed 180°"),
  cameraSpeed: z
    .number({
      error: "Please enter a valid number",
    })
    .min(0, "Speed must be positive")
    .max(2, "Speed cannot exceed 2"),
  cameraDampingFactor: z
    .number({
      error: "Please enter a valid number",
    })
    .min(0, "Damping must be positive")
    .max(1, "Damping cannot exceed 1"),
  ambientLight: z
    .number({
      error: "Please enter a valid number",
    })
    .min(0, "Ambient light must be positive")
    .max(1, "Ambient light cannot exceed 1"),
  specularStrength: z
    .number({
      error: "Please enter a valid number",
    })
    .min(0, "Specular strength must be positive")
    .max(1, "Specular strength cannot exceed 1"),
  diffuseStrength: z
    .number({
      error: "Please enter a valid number",
    })
    .min(0, "Diffuse strength must be positive")
    .max(1, "Diffuse strength cannot exceed 1"),
  colorPickerActive: z.boolean(),
  paintMode: z.enum(["pixel", "bulk", "eraser", "variation"]),
  variationIntensity: z
    .number({
      error: "Please enter a valid number",
    })
    .min(0, "Variation intensity must be positive")
    .max(1, "Variation intensity cannot exceed 1"),
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
  directionalLightIntensity: z.number({
    error: "Please enter a valid number",
  }),
  mode: z.enum(["Preview", "Editing"]),
  gridVisible: z.boolean(),
});

export type FormValues = z.infer<typeof formSchema>;

export type FieldErrors = {
  [K in keyof FormValues]?: string;
};

export function useRendererState() {
  const currentState = useRef<State | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [values, setValues] = useState<FormValues>(initialState);
  const [undoCount, setUndoCount] = useState(0);
  const [redoCount, setRedoCount] = useState(0);

  useEffect(() => {
    const state = State.load();
    currentState.current = state;
    setValues(state?.toObject() || initialState);
    function changeListener(args: State) {
      setValues(args.toObject());
    }

    state.addListener(changeListener);

    function changeUndoRedoListener(args: State) {
      setUndoCount(args.getUndoCount());
      setRedoCount(args.getRedoCount());
    }

    state.addListener(changeUndoRedoListener);
    return () => {
      state?.removeListener(changeListener);
      state?.removeListener(changeUndoRedoListener);
    };
  }, []);

  const handleChange = useCallback(
    (
      name: keyof FormValues,
      value: string | number | boolean,
      origin = "App",
    ) => {
      const valueSchema = formSchema.shape[name];
      const fieldSchema = z.object({ [name]: valueSchema });
      const argsValeue =
        valueSchema instanceof z.ZodNumber ? Number(value) : value;
      const result = fieldSchema.safeParse({ [name]: argsValeue });
      setValues((prev) => ({ ...prev, [name]: value }));
      if (result.success) {
        if (!currentState.current) return;
        const currentArgs = currentState.current?.toObject();
        const newArgs = {
          ...omit(currentArgs, [...Object.keys(errors), name]),
          [name]: argsValeue,
        };
        currentState.current?.setAll(newArgs as StateShape, true, origin);
        currentState.current?.save();
        setErrors((prev) => omit(prev, [name]));
      } else {
        let error: string | undefined;

        if (result.error instanceof ZodError) {
          error = result.error.issues[0].message;
        }
        setErrors((prev) => ({
          ...prev,
          [name]: error || undefined,
        }));
      }
    },
    [errors],
  );

  return {
    state: currentState.current,
    values,
    errors,
    handleChange,
    undoCount,
    redoCount,
  };
}
