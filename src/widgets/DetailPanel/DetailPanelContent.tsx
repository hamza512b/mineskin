import Accordion from "@/components/Accordion/Accordion";
import Button from "@/components/Button";
import Slider from "@/components/Slider/Slider";
import ToggleSwitch from "@/components/ToggleSwtich/ToggleSwtich";
import { useRendererStore } from "@/hooks/useRendererState";
import clsx from "clsx";
import { useConfirmation } from "../Confirmation/Confirmation";

export interface DetailPanelProps {
  className?: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  exitButton?: React.ReactNode;
  reset: (() => void) | undefined;
  mode: "Editing" | "Preview";
}

export const DetailPanelContent: React.FC<DetailPanelProps> = ({
  className,
  exitButton,
  setOpen,
  mode,
}) => {
  // Use Zustand store with selective subscriptions
  const errors = useRendererStore((state) => state.errors);
  const handleChange = useRendererStore((state) => state.handleChange);
  const skinIsPocket = useRendererStore((state) => state.values.skinIsPocket);
  const diffuseStrength = useRendererStore(
    (state) => state.values.diffuseStrength,
  );
  const specularStrength = useRendererStore(
    (state) => state.values.specularStrength,
  );
  const objectTranslationX = useRendererStore(
    (state) => state.values.objectTranslationX,
  );
  const objectTranslationZ = useRendererStore(
    (state) => state.values.objectTranslationZ,
  );
  const objectTranslationY = useRendererStore(
    (state) => state.values.objectTranslationY,
  );
  const objectRotationX = useRendererStore(
    (state) => state.values.objectRotationX,
  );
  const objectRotationY = useRendererStore(
    (state) => state.values.objectRotationY,
  );
  const objectRotationZ = useRendererStore(
    (state) => state.values.objectRotationZ,
  );
  const cameraFieldOfView = useRendererStore(
    (state) => state.values.cameraFieldOfView,
  );
  const cameraSpeed = useRendererStore((state) => state.values.cameraSpeed);
  const cameraDampingFactor = useRendererStore(
    (state) => state.values.cameraDampingFactor,
  );
  const directionalLightIntensity = useRendererStore(
    (state) => state.values.directionalLightIntensity,
  );
  const ambientLight = useRendererStore((state) => state.values.ambientLight);
  const diffuseLightPositionX = useRendererStore(
    (state) => state.values.diffuseLightPositionX,
  );
  const diffuseLightPositionZ = useRendererStore(
    (state) => state.values.diffuseLightPositionZ,
  );
  const diffuseLightPositionY = useRendererStore(
    (state) => state.values.diffuseLightPositionY,
  );
  const variationIntensity = useRendererStore(
    (state) => state.values.variationIntensity,
  );

  const { getConfirmation } = useConfirmation();
  const setHasCompletedTutorial = useRendererStore(
    (state) => state.setHasCompletedTutorial,
  );

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

      {mode == "Editing" && (
        <Accordion label="Interactive Tutorial">
          <div className="flex flex-col gap-2 -mt-3">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Restart the tutorial to see the onboarding instructions again.
            </p>
            <Button
              variant={"outlined"}
              onClick={async () => {
                setOpen(false);
                setHasCompletedTutorial(false);
              }}
            >
              Restart Tutorial
            </Button>
          </div>
        </Accordion>
      )}

      <div className="flex flex-col gap-4">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          <ul className="mt-4">
            <li className="mb-1">
              If you want to report a bug, you can file an issue on the{" "}
              <a
                href="https://github.com/hamza512b/minskin/issues"
                className="text-blue-600 dark:text-blue-400 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                GitHub Repository
              </a>
              .
            </li>
            <li className="mb-1">
              Or if you prefer, you can join the{" "}
              <a
                href="https://discord.gg/2egvhmqdza"
                className="text-blue-600 dark:text-blue-400 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                Discord server
              </a>
              .
            </li>
          </ul>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
            You can refer to the{" "}
            <a
              href="https://github.com/hamza512b/mineskin/blob/main/USAGE_GUIDE.md"
              target="_blank"
              title="Usage Guide"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              usage guide
            </a>{" "}
            for more information.
          </p>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
            Made with ❤️ by{" "}
            <a
              href="https://hamza.se"
              className="text-blue-600 dark:text-blue-400 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              Hamza
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
