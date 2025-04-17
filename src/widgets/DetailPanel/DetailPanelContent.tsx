import Accordion from "@/components/Accordion/Accordion";
import Button from "@/components/Button";
import Input from "@/components/Input/Input";
import Slider from "@/components/Slider/Slider";
import ToggleSwitch from "@/components/ToggleSwtich/ToggleSwtich";
import { FieldErrors, FormValues } from "@/hooks/useRendererState";
import clsx from "clsx";
import React from "react";
import { useConfirmation } from "../Confirmation/Confirmation";
import GitHubButton from "react-github-btn";

export interface DetailPanelProps {
  handleChange: (
    name: keyof FormValues,
    value: FormValues[keyof FormValues],
    origin?: string,
  ) => void;
  errors: FieldErrors;
  values: FormValues;
  className?: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  mode: "editor" | "preview";
  exitButton?: React.ReactNode;
  reset: () => void;
}
export const DetailPanelContent: React.FC<DetailPanelProps> = ({
  errors,
  handleChange,
  values,
  className,
  exitButton,
  reset,
}) => {
  const { getConfirmation } = useConfirmation();

  return (
    <div
      className={clsx(
        "relative overflow-hidden border bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-transparent dark:border-gray-700 p-5 overflow-y-auto shadow-lg h-full select-none rounded-lg",
        className,
      )}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold dark:text-slate-100 text-slate-900">
          Advanced Settings
        </h3>
        {exitButton}
      </div>

      <fieldset className="mb-4 p-4 border border-slate-700 rounded-lg">
        <legend className="text-lg font-semibold px-2">Mode</legend>
        <ToggleSwitch
          label="Slim mode"
          id="pocket-mode"
          checked={values.skinIsPocket}
          onCheckedChange={(checked) => {
            getConfirmation({
              title: "Change skin mode",
              description:
                "This will change the skin mode to slim mode. This will modify the skin texture.",
              confirmText: "Change",
              cancelText: "Cancel",
            }).then((confirmed) => {
              if (confirmed)
                handleChange("skinIsPocket", checked, "PocketSwitch");
            });
          }}
        />
      </fieldset>

      <Accordion label="Skin">
        <Slider
          label="Diffuse Strength"
          value={values.diffuseStrength}
          onChange={(value) => handleChange("diffuseStrength", value)}
          max={1}
          min={0}
          step={0.01}
          error={errors.diffuseStrength}
        />

        <Slider
          label="Specular Strength"
          value={values.specularStrength}
          onChange={(value) => handleChange("specularStrength", value)}
          max={1}
          min={0}
          step={0.01}
          error={errors.specularStrength}
        />

        <hr className="my-4 h-px bg-slate-300 dark:bg-slate-600 w-full border-none" />

        <Input
          label="Translation X"
          type="number"
          onChange={(e) => handleChange("objectTranslationX", e.target.value)}
          error={errors.objectTranslationX}
          value={values.objectTranslationX}
          step="any"
          max={100}
          min={-100}
        />
        <Input
          label="Translation Y"
          type="number"
          onChange={(e) => handleChange("objectTranslationZ", e.target.value)}
          error={errors.objectTranslationZ}
          value={values.objectTranslationZ}
          step="any"
        />
        <Input
          label="Translation Z"
          type="number"
          onChange={(e) => handleChange("objectTranslationY", e.target.value)}
          error={errors.objectTranslationY}
          value={values.objectTranslationY}
          step="any"
        />

        <hr className="my-4 h-px bg-slate-300 dark:bg-slate-600 w-full border-none" />

        <Slider
          label="Rotation X"
          value={values.objectRotationX}
          onChange={(value) => handleChange("objectRotationX", value)}
          max={Math.PI}
          min={-Math.PI}
          step={0.001}
        />

        <Slider
          label="Rotation Y"
          value={values.objectRotationY}
          onChange={(value) => handleChange("objectRotationY", value)}
          max={Math.PI}
          min={-Math.PI}
          step={0.001}
        />

        <Slider
          label="Rotation Z"
          value={values.objectRotationZ}
          onChange={(value) => handleChange("objectRotationZ", value)}
          max={Math.PI}
          min={-Math.PI}
          step={0.001}
        />
      </Accordion>

      <Accordion label="Camera">
        <Slider
          label="Field Of View"
          value={values.cameraFieldOfView}
          onChange={(value) => handleChange("cameraFieldOfView", value)}
          max={Math.PI - 0.1}
          min={0.4}
          step={0.001}
          error={errors.cameraFieldOfView}
          formatValue={(v) => `${v.toFixed(1)}°`}
        />

        <Slider
          label="Speed"
          value={values.cameraSpeed}
          onChange={(value) => handleChange("cameraSpeed", value)}
          max={0.5}
          min={0}
          step={0.001}
          error={errors.cameraSpeed}
        />
        <Slider
          label="Damping"
          value={values.cameraDampingFactor}
          onChange={(value) => handleChange("cameraDampingFactor", value)}
          max={1}
          min={0}
          step={0.001}
          error={errors.cameraDampingFactor}
        />

        <hr className="my-4 h-px bg-slate-300 dark:bg-slate-600 w-full border-none" />

        <Slider
          label="Zoom Radius"
          value={values.cameraRadius}
          onChange={(v) => handleChange("cameraRadius", v)}
          min={30}
          max={100}
          step={0.1}
          error={errors.cameraRadius}
        />
        <Slider
          label="Theta angle (ϴ)"
          loop={true}
          value={values.cameraTheta}
          onChange={(v) => handleChange("cameraTheta", v)}
          min={0}
          max={Math.PI}
          step={0.01}
          formatValue={(v) => `${v.toFixed(1)}°`}
        />

        <Slider
          label="Phi angle (φ)"
          loop={true}
          value={values.cameraPhi}
          onChange={(v) => handleChange("cameraPhi", v)}
          min={0}
          max={Math.PI}
          step={0.01}
          formatValue={(v) => `${v.toFixed(1)}°`}
        />
      </Accordion>

      <Accordion label="Light">
        <Slider
          label="Directional Light"
          value={values.directionalLightIntensity}
          onChange={(value) => handleChange("directionalLightIntensity", value)}
          max={1}
          min={0}
          step={0.01}
          error={errors.directionalLightIntensity}
        />
        <Slider
          label="Ambient Light"
          value={values.ambientLight}
          onChange={(value) => handleChange("ambientLight", value)}
          max={1}
          min={0}
          step={0.01}
          error={errors.ambientLight}
        />

        <Input
          label="Diffuse Light X"
          type="number"
          onChange={(e) =>
            handleChange("diffuseLightPositionX", e.target.value)
          }
          error={errors.diffuseLightPositionX}
          value={values.diffuseLightPositionX}
          step="any"
        />
        <Input
          label="Diffuse Light Y"
          type="number"
          onChange={(e) =>
            handleChange("diffuseLightPositionZ", e.target.value)
          }
          error={errors.diffuseLightPositionZ}
          value={values.diffuseLightPositionZ}
          step="any"
        />
        <Input
          label="Diffuse Light Z"
          type="number"
          onChange={(e) =>
            handleChange("diffuseLightPositionY", e.target.value)
          }
          error={errors.diffuseLightPositionY}
          value={values.diffuseLightPositionY}
          step="any"
        />
      </Accordion>

      <div className="flex flex-col gap-4">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          Need help? File an issue on{" "}
          <a
            href="https://github.com/hamza512b/minskin/issues"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            GitHub
          </a>
        </div>

        <div className="flex justify-between gap-2 items-center">
          <GitHubButton
            href="https://github.com/hamza512b/mineskin"
            data-color-scheme="no-preference: light; light: light; dark: dark;"
            data-size="large"
            aria-label="Star hamza512b/mineskin on GitHub"
          >
            Star
          </GitHubButton>
          <Button
            variant={"outlined"}
            // disabled={!isDirty}
            onClick={async () => {
              const confirmed = await getConfirmation({
                title: "Reset to defaults",
                description:
                  "Are you sure you want to reset the settings? This will even reset back to the default skin.",
                confirmText: "Confirm",
                cancelText: "Cancel",
              });
              if (confirmed) {
                reset();
              }
            }}
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};
