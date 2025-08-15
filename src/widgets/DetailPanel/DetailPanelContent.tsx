import Accordion from "@/components/Accordion/Accordion";
import Button from "@/components/Button";
import Slider from "@/components/Slider/Slider";
import ToggleSwitch from "@/components/ToggleSwtich/ToggleSwtich";
import { FieldErrors, FormValues } from "@/hooks/useRendererState";
import clsx from "clsx";
import React from "react";
import GitHubButton from "react-github-btn";
import { useConfirmation } from "../Confirmation/Confirmation";

export interface DetailPanelProps {
  handleChange: (
    name: keyof FormValues,
    value: FormValues[keyof FormValues],
    origin?: string,
  ) => void;
  errors: FieldErrors;
  className?: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  mode: "Preview" | "Editing";
  exitButton?: React.ReactNode;
  reset: (() => void) | undefined;
  skinIsPocket: boolean;
  diffuseStrength: number;
  specularStrength: number;
  objectTranslationX: number;
  objectTranslationZ: number;
  objectTranslationY: number;
  objectRotationX: number;
  objectRotationY: number;
  objectRotationZ: number;
  cameraFieldOfView: number;
  cameraSpeed: number;
  cameraDampingFactor: number;
  // cameraRadius: number;
  // cameraTheta: number;
  // cameraPhi: number;
  directionalLightIntensity: number;
  ambientLight: number;
  diffuseLightPositionX: number;
  diffuseLightPositionZ: number;
  diffuseLightPositionY: number;
  variationIntensity: number;
}
export const DetailPanelContent: React.FC<DetailPanelProps> = ({
  errors,
  handleChange,
  className,
  exitButton,
  reset,
  mode,
  skinIsPocket,
  diffuseStrength,
  specularStrength,
  objectTranslationX,
  objectTranslationZ,
  objectTranslationY,
  objectRotationX,
  objectRotationY,
  objectRotationZ,
  cameraFieldOfView,
  cameraSpeed,
  cameraDampingFactor,
  // cameraRadius,
  // cameraTheta,
  // cameraPhi,
  directionalLightIntensity,
  ambientLight,
  diffuseLightPositionX,
  diffuseLightPositionZ,
  diffuseLightPositionY,
  variationIntensity,
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
          Settings
        </h3>
        {exitButton}
      </div>

      <fieldset className="mb-4 p-4 border border-slate-700 rounded-lg">
        <legend className="text-lg font-semibold px-2">Mode</legend>
        <ToggleSwitch
          label="Slim mode"
          id="pocket-mode"
          checked={skinIsPocket}
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

      {mode === "Editing" && (
        <Accordion label="Paint">
          <Slider
            label="Variation Tool Intensity"
            value={variationIntensity}
            onChange={(value) => handleChange("variationIntensity", value)}
            max={1}
            min={0.05}
            step={0.01}
            error={errors.variationIntensity}
            editKey="variationIntensity"
          />
        </Accordion>
      )}

      <Accordion label="Skin">
        <Slider
          label="Surface Brightness"
          value={diffuseStrength}
          onChange={(value) => handleChange("diffuseStrength", value)}
          max={1}
          min={0}
          step={0.01}
          error={errors.diffuseStrength}
          editKey="diffuseStrength"
        />

        <Slider
          label="Shine/Glossiness"
          value={specularStrength}
          onChange={(value) => handleChange("specularStrength", value)}
          max={1}
          min={0}
          step={0.01}
          error={errors.specularStrength}
          editKey="specularStrength"
        />

        <hr className="my-4 h-px bg-slate-300 dark:bg-slate-600 w-full border-none" />

        <Slider
          label="Move Left/Right"
          value={objectTranslationX}
          onChange={(value) => handleChange("objectTranslationX", value)}
          error={errors.objectTranslationX}
          max={100}
          min={-100}
          step={0.1}
          formatValue={(v) => `${v.toFixed(1)}`}
          editKey="objectTranslationX"
        />
        <Slider
          label="Move Forward/Back"
          value={objectTranslationZ}
          onChange={(value) => handleChange("objectTranslationZ", value)}
          error={errors.objectTranslationZ}
          max={100}
          min={-100}
          step={0.1}
          formatValue={(v) => `${v.toFixed(1)}`}
          editKey="objectTranslationZ"
        />
        <Slider
          label="Move Up/Down"
          onChange={(value) => handleChange("objectTranslationY", value)}
          error={errors.objectTranslationY}
          value={objectTranslationY}
          max={100}
          min={-100}
          step={0.1}
          formatValue={(v) => `${v.toFixed(1)}`}
          editKey="objectTranslationY"
        />

        <hr className="my-4 h-px bg-slate-300 dark:bg-slate-600 w-full border-none" />

        <Slider
          label="Tilt Up/Down"
          value={objectRotationX}
          onChange={(value) => handleChange("objectRotationX", value)}
          max={Math.PI}
          min={-Math.PI}
          step={0.001}
          editKey="objectRotationX"
        />

        <Slider
          label="Turn Left/Right"
          value={objectRotationY}
          onChange={(value) => handleChange("objectRotationY", value)}
          max={Math.PI}
          min={-Math.PI}
          step={0.001}
          editKey="objectRotationY"
        />

        <Slider
          label="Roll"
          value={objectRotationZ}
          onChange={(value) => handleChange("objectRotationZ", value)}
          max={Math.PI}
          min={-Math.PI}
          step={0.001}
          editKey="objectRotationZ"
        />
      </Accordion>

      <Accordion label="Camera">
        <Slider
          label="Field Of View"
          value={cameraFieldOfView}
          onChange={(value) => handleChange("cameraFieldOfView", value)}
          max={Math.PI - 0.1}
          min={0.4}
          step={0.001}
          error={errors.cameraFieldOfView}
          formatValue={(v) => `${v.toFixed(1)}°`}
          editKey="cameraFieldOfView"
        />

        <Slider
          label="Movement Speed"
          value={cameraSpeed}
          onChange={(value) => handleChange("cameraSpeed", value)}
          max={0.5}
          min={0}
          step={0.001}
          error={errors.cameraSpeed}
          editKey="cameraSpeed"
        />
        <Slider
          label="Damping"
          value={cameraDampingFactor}
          onChange={(value) => handleChange("cameraDampingFactor", value)}
          max={1}
          min={0}
          step={0.001}
          error={errors.cameraDampingFactor}
          editKey="cameraDampingFactor"
        />

        {/* <hr className="my-4 h-px bg-slate-300 dark:bg-slate-600 w-full border-none" /> */}

        {/* <Slider
          label="Zoom Radius"
          value={cameraRadius}
          onChange={(v) => handleChange("cameraRadius", v)}
          min={30}
          max={100}
          step={0.1}
          error={errors.cameraRadius}
        />
        <Slider
          label="Theta angle (ϴ)"
          loop={true}
          value={cameraTheta}
          onChange={(v) => handleChange("cameraTheta", v)}
          min={0}
          max={Math.PI}
          step={0.01}
          formatValue={(v) => `${v.toFixed(1)}°`}
        />

        <Slider
          label="Phi angle (φ)"
          loop={true}
          value={cameraPhi}
          onChange={(v) => handleChange("cameraPhi", v)}
          min={0}
          max={Math.PI}
          step={0.01}
          formatValue={(v) => `${v.toFixed(1)}°`}
        /> */}
      </Accordion>

      <Accordion label="Light">
        <Slider
          label="Main Light"
          value={directionalLightIntensity}
          onChange={(value) => handleChange("directionalLightIntensity", value)}
          max={1}
          min={0}
          step={0.01}
          error={errors.directionalLightIntensity}
          editKey="directionalLightIntensity"
        />

        <Slider
          label="Light Left/Right"
          value={diffuseLightPositionX}
          onChange={(value) => handleChange("diffuseLightPositionX", value)}
          max={10}
          min={-10}
          step={0.1}
          formatValue={(v) => `${v.toFixed(1)}`}
          editKey="diffuseLightPositionX"
        />
        <Slider
          label="Light Up/Down"
          value={diffuseLightPositionY}
          onChange={(value) => handleChange("diffuseLightPositionY", value)}
          max={10}
          min={-10}
          step={0.1}
          formatValue={(v) => `${v.toFixed(1)}`}
          editKey="diffuseLightPositionY"
        />
        <Slider
          label="Light Forward/Back"
          value={diffuseLightPositionZ}
          onChange={(value) => handleChange("diffuseLightPositionZ", value)}
          error={errors.diffuseLightPositionZ}
          max={10}
          min={-10}
          step={0.1}
          formatValue={(v) => `${v.toFixed(1)}`}
          editKey="diffuseLightPositionZ"
        />

        <Slider
          label="Overall Brightness (Ambient Light)"
          value={ambientLight}
          onChange={(value) => handleChange("ambientLight", value)}
          max={1}
          min={0}
          step={0.01}
          error={errors.ambientLight}
          editKey="ambientLight"
        />
      </Accordion>

      <div className="flex flex-col gap-4">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          Need help? File an issue on{" "}
          <a
            href="https://github.com/hamza512b/minskin/issues"
            className="text-blue-600 dark:text-blue-400 hover:underline"
            target="_blank"
            rel="noreferrer"
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
                reset?.();
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
