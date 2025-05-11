import { omit } from "lodash";
import { useCallback, useEffect, useState } from "react";
import { z, ZodError } from "zod";
import { Renderer } from "../core/Renderer";
import { State, StateShape } from "../core/State";

/**
 * Schema should be on nested level because this how validation is done
 * */
const formSchema = z.object({
  paintColor: z.string(),
  skinIsPocket: z.boolean(),
  objectTranslationX: z
    .number({
      invalid_type_error: "Please enter a valid number",
    })
    .min(-100, "The value cannot be less than -100")
    .max(100, "The value cannot be greater than 100"),
  objectTranslationY: z
    .number({
      invalid_type_error: "Please enter a valid number",
    })
    .min(-100, "The value cannot be less than -100")
    .max(100, "The value cannot be greater than 100"),
  objectTranslationZ: z
    .number({
      invalid_type_error: "Please enter a valid number",
    })
    .min(-100, "The value cannot be less than -100")
    .max(100, "The value cannot be greater than 100"),
  objectRotationX: z.number({
    invalid_type_error: "Please enter a valid number",
  }),
  objectRotationY: z.number({
    invalid_type_error: "Please enter a valid number",
  }),
  objectRotationZ: z.number({
    invalid_type_error: "Please enter a valid number",
  }),
  cameraPhi: z.number({
    invalid_type_error: "Please enter a valid number",
  }),
  cameraTheta: z.number({
    invalid_type_error: "Please enter a valid number",
  }),
  cameraRadius: z
    .number({
      invalid_type_error: "Please enter a valid number",
    })
    .min(0, "Radius must be positive"),
  diffuseLightPositionX: z
    .number({
      invalid_type_error: "Please enter a valid number",
    })
    .min(-200, "The value cannot be less than -200")
    .max(200, "The value cannot be greater than 200"),
  diffuseLightPositionY: z
    .number({
      invalid_type_error: "Please enter a valid number",
    })
    .min(-200, "The value cannot be less than -200")
    .max(200, "The value cannot be greater than 200"),
  diffuseLightPositionZ: z
    .number({
      invalid_type_error: "Please enter a valid number",
    })
    .min(0, "The value cannot be less than 0")
    .max(200, "The value cannot be greater than 200"),
  cameraFieldOfView: z
    .number({
      invalid_type_error: "Please enter a valid number",
    })
    .min(0, "FOV must be positive")
    .max(180, "FOV cannot exceed 180°"),
  cameraSpeed: z
    .number({
      invalid_type_error: "Please enter a valid number",
    })
    .min(0, "Speed must be positive")
    .max(2, "Speed cannot exceed 2"),
  cameraDampingFactor: z
    .number({
      invalid_type_error: "Please enter a valid number",
    })
    .min(0, "Damping must be positive")
    .max(1, "Damping cannot exceed 1"),
  ambientLight: z
    .number({
      invalid_type_error: "Please enter a valid number",
    })
    .min(0, "Ambient light must be positive")
    .max(1, "Ambient light cannot exceed 1"),
  specularStrength: z
    .number({
      invalid_type_error: "Please enter a valid number",
    })
    .min(0, "Specular strength must be positive")
    .max(1, "Specular strength cannot exceed 1"),
  diffuseStrength: z
    .number({
      invalid_type_error: "Please enter a valid number",
    })
    .min(0, "Diffuse strength must be positive")
    .max(1, "Diffuse strength cannot exceed 1"),
  colorPickerActive: z.boolean(),
  paintMode: z.enum(["pixel", "bulk", "eraser"]),
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
    invalid_type_error: "Please enter a valid number",
  }),
  mode: z.enum(["Preview", "Editing"]),
});

export type FormValues = z.infer<typeof formSchema>;

export type FieldErrors = {
  [K in keyof FormValues]?: string;
};

export function useRendererState(renderer: Renderer | null) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [values, setValues] = useState<FormValues>(
    (renderer?.state.toObject() || {}) as FormValues,
  );
  const [undoCount, setUndoCount] = useState(0);
  const [redoCount, setRedoCount] = useState(0);

  useEffect(() => {
    function changeListener(args: State) {
      setUndoCount(args.getUndoCount());
      setRedoCount(args.getRedoCount());
    }

    renderer?.state.addListener(changeListener);
    return () => {
      renderer?.state.removeListener(changeListener);
    };
  }, [renderer]);

  useEffect(() => {
    function changeListener(args: State) {
      setValues(args.toObject());
    }

    renderer?.state.addListener(changeListener);

    return () => {
      renderer?.state.removeListener(changeListener);
    };
  }, [renderer]);

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
        if (!renderer?.state) return;
        const currentArgs = renderer.state.toObject();
        const newArgs = {
          ...omit(currentArgs, [...Object.keys(errors), name]),
          [name]: argsValeue,
        };
        renderer?.state.setAll(newArgs as StateShape, true, origin);
        renderer.state.save();
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
    [renderer?.state],
  );

  return {
    setErrors,
    values,
    errors,
    handleChange,
    undoCount,
    redoCount,
  };
}
